/**
 * Multi-format Color Export (CSS + JSON)
 *
 * Exports palettes in formats compatible with Radix Colors output:
 * - Solid scale (sRGB hex)
 * - Alpha variants (for overlays, borders, shadows)
 * - P3 wide gamut with @supports
 * - Semantic tokens (contrast, surface, indicator, track)
 */

import { oklch, formatHex, rgb, p3, formatCss } from 'culori';
import type { Palette, Scale, OklchColor } from '../types.js';
import { ensureAccessibility } from './validate.js';

// =============================================================================
// Canonical Hue Ordering (Radix order: grays first, then color wheel)
// =============================================================================

/**
 * Radix-compatible hue order for consistent output.
 * Grays first, then color wheel from red through yellow.
 */
const CANONICAL_HUE_ORDER = [
	'gray',
	'mauve',
	'slate',
	'sage',
	'olive',
	'sand',
	'tomato',
	'red',
	'ruby',
	'crimson',
	'pink',
	'plum',
	'purple',
	'violet',
	'iris',
	'indigo',
	'blue',
	'cyan',
	'teal',
	'jade',
	'green',
	'grass',
	'bronze',
	'gold',
	'brown',
	'orange',
	'amber',
	'yellow',
	'lime',
	'mint',
	'sky'
];

/**
 * Sort scale keys to match Radix canonical order.
 * Custom hues (e.g., 'custom-xyz') are appended at the end.
 */
export function sortScaleKeys(keys: string[]): string[] {
	return [...keys].sort((a, b) => {
		const aIndex = CANONICAL_HUE_ORDER.indexOf(a);
		const bIndex = CANONICAL_HUE_ORDER.indexOf(b);

		// Both in canonical order: sort by index
		if (aIndex !== -1 && bIndex !== -1) {
			return aIndex - bIndex;
		}
		// Only a is canonical: a comes first
		if (aIndex !== -1) return -1;
		// Only b is canonical: b comes first
		if (bIndex !== -1) return 1;
		// Neither canonical (custom hues): alphabetical
		return a.localeCompare(b);
	});
}

// =============================================================================
// Types
// =============================================================================

export interface CSSExportOptions {
	/** CSS selector for light mode (default: ':root') */
	lightSelector?: string;
	/** CSS selector for dark mode (default: '.dark, .dark-theme') */
	darkSelector?: string;
	/** Include alpha variants (default: true) */
	includeAlpha?: boolean;
	/** Include P3 wide gamut block (default: true) */
	includeP3?: boolean;
	/** Include semantic tokens (default: true) */
	includeSemantic?: boolean;
	/** Specific scales to export (default: all) */
	scales?: string[];
	/** Custom prefix for CSS variables (default: none, uses scale name) */
	prefix?: string;
	/** Export only light mode, dark mode, or both (default: 'both') */
	mode?: 'light' | 'dark' | 'both';
}

export interface JSONExportOptions {
	/** Specific scales to export (default: all) */
	scales?: string[];
	/** Include alpha variants (default: true) */
	includeAlpha?: boolean;
	/** Include P3 values (default: true) */
	includeP3?: boolean;
	/** Include semantic tokens (default: true) */
	includeSemantic?: boolean;
}

export interface ColorFormats {
	hex: string;
	oklch: string;
	p3: string;
}

export interface AlphaColorFormats {
	hex: string; // 8-digit hex with alpha
	p3: string; // color(display-p3 r g b / a)
}

export interface SemanticTokens {
	contrast: string;
	surface: string;
	indicator: string;
	track: string;
}

// =============================================================================
// Alpha Color Calculation (ported from Radix)
// =============================================================================

/**
 * Blend alpha calculation - matches browser's actual alpha compositing behavior.
 * Important: browsers round each channel separately, not the final result.
 */
function blendAlpha(
	foreground: number,
	alpha: number,
	background: number,
	round = true
): number {
	if (round) {
		return Math.round(background * (1 - alpha)) + Math.round(foreground * alpha);
	}
	return background * (1 - alpha) + foreground * alpha;
}

/**
 * Calculate an alpha color that blends to the same visual result as the target.
 *
 * The algorithm:
 * - Takes target color + background color
 * - Computes RGBA that blends to same visual result
 * - Handles both sRGB (0-255) and P3 (0-1) precision
 *
 * Ported from Radix Colors: generateRadixColors.tsx
 *
 * @param targetRgb - Target RGB values (0-1 range)
 * @param backgroundRgb - Background RGB values (0-1 range)
 * @param rgbPrecision - Precision for RGB (255 for sRGB, 1 for P3)
 * @param alphaPrecision - Precision for alpha (255 for sRGB, 1000 for P3)
 * @param targetAlpha - Optional forced alpha value
 * @returns [R, G, B, A] in 0-1 range
 */
export function getAlphaColor(
	targetRgb: number[],
	backgroundRgb: number[],
	rgbPrecision: number,
	alphaPrecision: number,
	targetAlpha?: number
): readonly [number, number, number, number] {
	const [tr, tg, tb] = targetRgb.map((c) => Math.round(c * rgbPrecision));
	const [br, bg, bb] = backgroundRgb.map((c) => Math.round(c * rgbPrecision));

	if (
		tr === undefined ||
		tg === undefined ||
		tb === undefined ||
		br === undefined ||
		bg === undefined ||
		bb === undefined
	) {
		throw Error('Color is undefined');
	}

	// Decide whether to lighten or darken the background
	// If at least one channel of target is lighter than background, we lighten
	let desiredRgb = 0;
	if (tr > br || tg > bg || tb > bb) {
		desiredRgb = rgbPrecision;
	}

	const alphaR = (tr - br) / (desiredRgb - br);
	const alphaG = (tg - bg) / (desiredRgb - bg);
	const alphaB = (tb - bb) / (desiredRgb - bb);

	const isPureGray = [alphaR, alphaG, alphaB].every((alpha) => alpha === alphaR);

	// Pure grays don't need precision gymnastics - cleaner output
	if (!targetAlpha && isPureGray) {
		const V = desiredRgb / rgbPrecision;
		return [V, V, V, alphaR] as const;
	}

	const clampRgb = (n: number) => (isNaN(n) ? 0 : Math.min(rgbPrecision, Math.max(0, n)));
	const clampA = (n: number) => (isNaN(n) ? 0 : Math.min(alphaPrecision, Math.max(0, n)));
	const maxAlpha = targetAlpha ?? Math.max(alphaR, alphaG, alphaB);

	const A = clampA(Math.ceil(maxAlpha * alphaPrecision)) / alphaPrecision;
	let R = clampRgb(((br * (1 - A) - tr) / A) * -1);
	let G = clampRgb(((bg * (1 - A) - tg) / A) * -1);
	let B = clampRgb(((bb * (1 - A) - tb) / A) * -1);

	R = Math.ceil(R);
	G = Math.ceil(G);
	B = Math.ceil(B);

	const blendedR = blendAlpha(R, A, br);
	const blendedG = blendAlpha(G, A, bg);
	const blendedB = blendAlpha(B, A, bb);

	// Correct for rounding errors in light mode (darkening)
	if (desiredRgb === 0) {
		if (tr <= br && tr !== blendedR) {
			R = tr > blendedR ? R + 1 : R - 1;
		}
		if (tg <= bg && tg !== blendedG) {
			G = tg > blendedG ? G + 1 : G - 1;
		}
		if (tb <= bb && tb !== blendedB) {
			B = tb > blendedB ? B + 1 : B - 1;
		}
	}

	// Correct for rounding errors in dark mode (lightening)
	if (desiredRgb === rgbPrecision) {
		if (tr >= br && tr !== blendedR) {
			R = tr > blendedR ? R + 1 : R - 1;
		}
		if (tg >= bg && tg !== blendedG) {
			G = tg > blendedG ? G + 1 : G - 1;
		}
		if (tb >= bb && tb !== blendedB) {
			B = tb > blendedB ? B + 1 : B - 1;
		}
	}

	// Convert back to 0-1 values
	return [R / rgbPrecision, G / rgbPrecision, B / rgbPrecision, A] as const;
}

/**
 * Get alpha color for sRGB (8-bit precision)
 */
export function getAlphaColorSrgb(
	targetHex: string,
	backgroundHex: string,
	targetAlpha?: number
): readonly [number, number, number, number] {
	const target = rgb(targetHex);
	const background = rgb(backgroundHex);

	if (!target || !background) {
		throw Error('Invalid color');
	}

	return getAlphaColor(
		[target.r, target.g, target.b],
		[background.r, background.g, background.b],
		255,
		255,
		targetAlpha
	);
}

/**
 * Get alpha color for P3 (high precision)
 *
 * Uses 1000 for RGB precision to maintain fractional accuracy in the 0-1 range.
 * P3 colors are output with 4 decimal places, so 1000 provides sufficient precision.
 */
export function getAlphaColorP3(
	targetHex: string,
	backgroundHex: string,
	targetAlpha?: number
): readonly [number, number, number, number] {
	const target = p3(targetHex);
	const background = p3(backgroundHex);

	if (!target || !background) {
		throw Error('Invalid color');
	}

	return getAlphaColor(
		[target.r, target.g, target.b],
		[background.r, background.g, background.b],
		1000, // High precision for P3's 0-1 range (not 1!)
		1000,
		targetAlpha
	);
}

// =============================================================================
// Color Formatting Utilities
// =============================================================================

/**
 * Format OKLCH for CSS: oklch(54.3% 0.1913 266.8)
 * Uses percentage for lightness, 4 decimal places for C and H
 */
export function formatOklchCss(hex: string): string {
	const color = oklch(hex);
	if (!color) return 'oklch(0% 0 0)';

	const l = ((color.l ?? 0) * 100).toFixed(1);
	const c = (color.c ?? 0).toFixed(4);
	const h = (color.h ?? 0).toFixed(1);

	return `oklch(${l}% ${c} ${h})`;
}

/**
 * Format color for P3: color(display-p3 r g b)
 */
export function formatP3Css(hex: string): string {
	const color = p3(hex);
	if (!color) return 'color(display-p3 0 0 0)';

	const r = (color.r ?? 0).toFixed(4);
	const g = (color.g ?? 0).toFixed(4);
	const b = (color.b ?? 0).toFixed(4);

	return `color(display-p3 ${r} ${g} ${b})`;
}

/**
 * Format alpha color as 8-digit hex
 */
export function formatAlphaHex(r: number, g: number, b: number, a: number): string {
	const toHex = (n: number) =>
		Math.round(n * 255)
			.toString(16)
			.padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b)}${toHex(a)}`;
}

/**
 * Format alpha color for P3: color(display-p3 r g b / a)
 */
export function formatAlphaP3(r: number, g: number, b: number, a: number): string {
	return `color(display-p3 ${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)} / ${a.toFixed(3)})`;
}

// =============================================================================
// Semantic Token Calculations
// =============================================================================

/**
 * Determine contrast color (white or dark) based on step 9 lightness.
 * Uses APCA-like logic: if step 9 is light, use dark text; otherwise white.
 */
export function getContrastColor(step9Hex: string): string {
	const color = oklch(step9Hex);
	if (!color) return '#fff';

	// If step 9 is bright (L > 0.6), use dark text
	if ((color.l ?? 0) > 0.6) {
		// Return a dark color with slight chroma matching the hue
		const c = Math.max(0.04, (color.c ?? 0) * 0.08);
		const darkColor = { mode: 'oklch' as const, l: 0.25, c, h: color.h ?? 0 };
		return formatHex(darkColor) ?? '#1a1a1a';
	}

	return '#fff';
}

/**
 * Calculate surface color: step 1 with alpha overlay.
 * Light mode: 80% opacity, Dark mode: 50% opacity
 */
export function getSurfaceColor(step1Hex: string, mode: 'light' | 'dark'): string {
	const alpha = mode === 'light' ? 0.8 : 0.5;
	const color = rgb(step1Hex);
	if (!color) return step1Hex;

	// Return as 8-digit hex with alpha
	const toHex = (n: number) =>
		Math.round((n ?? 0) * 255)
			.toString(16)
			.padStart(2, '0');
	const alphaHex = Math.round(alpha * 255)
		.toString(16)
		.padStart(2, '0');

	return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}${alphaHex}`;
}

/**
 * Get all semantic tokens for a scale
 */
export function getSemanticTokens(scale: Scale, mode: 'light' | 'dark'): SemanticTokens {
	return {
		contrast: getContrastColor(scale[9]),
		surface: getSurfaceColor(scale[1], mode),
		indicator: scale[9],
		track: scale[9]
	};
}

// =============================================================================
// CSS Export
// =============================================================================

/**
 * Export palette as CSS custom properties.
 *
 * Output structure matches Radix Colors:
 * - Solid scale (sRGB hex)
 * - Alpha variants
 * - P3 wide gamut in @supports block
 * - Semantic tokens
 */
export function exportCSS(palette: Palette, options: CSSExportOptions = {}): string {
	// Apply accessibility safeguard before export
	const safePalette = ensureAccessibility(palette);

	const {
		lightSelector = ':root',
		darkSelector = '.dark, .dark-theme',
		includeAlpha = true,
		includeP3 = true,
		includeSemantic = true,
		scales,
		prefix,
		mode = 'both'
	} = options;

	const lines: string[] = [];

	// Determine which scales to export (sorted in canonical Radix order)
	const getScaleKeys = (modeScales: Record<string, Scale>) => {
		const allKeys = Object.keys(modeScales);
		const filtered = scales ? allKeys.filter((k) => scales.includes(k)) : allKeys;
		return sortScaleKeys(filtered);
	};

	// Generate CSS for a single mode
	const generateModeCSS = (
		modeScales: Record<string, Scale>,
		selector: string,
		colorMode: 'light' | 'dark'
	): string[] => {
		const result: string[] = [];
		const scaleKeys = getScaleKeys(modeScales);
		const background = colorMode === 'light' ? '#ffffff' : '#000000';

		result.push(`${selector} {`);

		for (const scaleName of scaleKeys) {
			const scale = modeScales[scaleName];
			const varPrefix = prefix ? `${prefix}${scaleName}` : scaleName;

			// Solid scale (sRGB hex)
			for (let step = 1; step <= 12; step++) {
				const hex = scale[step as keyof Scale];
				result.push(`  --${varPrefix}-${step}: ${hex};`);
			}

			// Alpha variants
			if (includeAlpha) {
				result.push('');
				for (let step = 1; step <= 12; step++) {
					const hex = scale[step as keyof Scale];
					const [r, g, b, a] = getAlphaColorSrgb(hex, background);
					const alphaHex = formatAlphaHex(r, g, b, a);
					result.push(`  --${varPrefix}-a${step}: ${alphaHex};`);
				}
			}

			// Semantic tokens
			if (includeSemantic) {
				result.push('');
				const tokens = getSemanticTokens(scale, colorMode);
				result.push(`  --${varPrefix}-contrast: ${tokens.contrast};`);
				result.push(`  --${varPrefix}-surface: ${tokens.surface};`);
				result.push(`  --${varPrefix}-indicator: ${tokens.indicator};`);
				result.push(`  --${varPrefix}-track: ${tokens.track};`);
			}

			result.push('');
		}

		result.push('}');

		return result;
	};

	// Generate P3 CSS for a single mode
	const generateP3CSS = (
		modeScales: Record<string, Scale>,
		selector: string,
		colorMode: 'light' | 'dark'
	): string[] => {
		const result: string[] = [];
		const scaleKeys = getScaleKeys(modeScales);
		const background = colorMode === 'light' ? '#ffffff' : '#000000';

		result.push(`    ${selector} {`);

		for (const scaleName of scaleKeys) {
			const scale = modeScales[scaleName];
			const varPrefix = prefix ? `${prefix}${scaleName}` : scaleName;

			// Solid scale (OKLCH)
			for (let step = 1; step <= 12; step++) {
				const hex = scale[step as keyof Scale];
				result.push(`      --${varPrefix}-${step}: ${formatOklchCss(hex)};`);
			}

			// Alpha variants (P3)
			if (includeAlpha) {
				result.push('');
				for (let step = 1; step <= 12; step++) {
					const hex = scale[step as keyof Scale];
					const [r, g, b, a] = getAlphaColorP3(hex, background);
					result.push(`      --${varPrefix}-a${step}: ${formatAlphaP3(r, g, b, a)};`);
				}
			}

			// Semantic tokens (P3)
			if (includeSemantic) {
				result.push('');
				const tokens = getSemanticTokens(scale, colorMode);
				result.push(`      --${varPrefix}-contrast: ${tokens.contrast};`);
				// Surface with P3
				const surfaceP3 = formatP3Css(scale[1]);
				const surfaceAlpha = colorMode === 'light' ? '0.8' : '0.5';
				result.push(
					`      --${varPrefix}-surface: ${surfaceP3.replace(')', ` / ${surfaceAlpha})`)};`
				);
				result.push(`      --${varPrefix}-indicator: ${formatOklchCss(tokens.indicator)};`);
				result.push(`      --${varPrefix}-track: ${formatOklchCss(tokens.track)};`);
			}

			result.push('');
		}

		result.push('    }');

		return result;
	};

	// Generate light mode CSS
	if (mode === 'light' || mode === 'both') {
		lines.push(...generateModeCSS(safePalette.light, lightSelector, 'light'));
		lines.push('');
	}

	// Generate dark mode CSS
	if (mode === 'dark' || mode === 'both') {
		lines.push(...generateModeCSS(safePalette.dark, darkSelector, 'dark'));
		lines.push('');
	}

	// Generate P3 wide gamut block
	if (includeP3) {
		lines.push('@supports (color: color(display-p3 1 1 1)) {');
		lines.push('  @media (color-gamut: p3) {');

		if (mode === 'light' || mode === 'both') {
			lines.push(...generateP3CSS(safePalette.light, lightSelector, 'light'));
		}

		if (mode === 'dark' || mode === 'both') {
			lines.push(...generateP3CSS(safePalette.dark, darkSelector, 'dark'));
		}

		lines.push('  }');
		lines.push('}');
	}

	return lines.join('\n');
}

// =============================================================================
// JSON Export
// =============================================================================

export interface JSONScale {
	[step: string]: ColorFormats;
}

export interface JSONAlphaScale {
	[step: string]: AlphaColorFormats;
}

export interface BrandColorInfo {
	/** Original hex value input by user */
	hex: string;
	/** Hue slot this color anchors to */
	hue: string;
	/** Step where brand color is anchored (1-12) */
	anchorStep: number;
	/** True if this is a custom row (out-of-bounds chroma/hue) */
	isCustomRow: boolean;
	/** Reason for custom row, if applicable */
	customRowReason?: 'low-chroma' | 'high-chroma' | 'hue-gap' | 'extreme-lightness';
}

export interface JSONOutput {
	light: Record<string, JSONScale>;
	dark: Record<string, JSONScale>;
	lightA?: Record<string, JSONAlphaScale>;
	darkA?: Record<string, JSONAlphaScale>;
	semantic?: {
		light: Record<string, SemanticTokens>;
		dark: Record<string, SemanticTokens>;
	};
	_meta: {
		generatedAt: string;
		inputColors: string[];
		scales: string[];
		/**
		 * Rich brand color information for semantic token mapping.
		 * First item is the primary brand color (recommended for --accent-* alias).
		 */
		brandColors: BrandColorInfo[];
		/**
		 * Tuning profile applied to generate this palette.
		 */
		tuning: {
			hueShift: number;
			chromaMultiplier: number;
			lightnessShift: number;
		};
	};
}

/**
 * Export palette as structured JSON with multiple color formats.
 */
export function exportJSON(palette: Palette, options: JSONExportOptions = {}): JSONOutput {
	// Apply accessibility safeguard before export
	const safePalette = ensureAccessibility(palette);

	const { scales, includeAlpha = true, includeP3 = true, includeSemantic = true } = options;

	// Determine which scales to export (sorted in canonical Radix order)
	const getScaleKeys = (modeScales: Record<string, Scale>) => {
		const allKeys = Object.keys(modeScales);
		const filtered = scales ? allKeys.filter((k) => scales.includes(k)) : allKeys;
		return sortScaleKeys(filtered);
	};

	const lightKeys = getScaleKeys(safePalette.light);
	const darkKeys = getScaleKeys(safePalette.dark);

	// Build scale data for a mode
	const buildScaleData = (scale: Scale): JSONScale => {
		const result: JSONScale = {};
		for (let step = 1; step <= 12; step++) {
			const hex = scale[step as keyof Scale];
			result[step] = {
				hex,
				oklch: formatOklchCss(hex),
				p3: includeP3 ? formatP3Css(hex) : ''
			};
		}
		return result;
	};

	// Build alpha scale data for a mode
	const buildAlphaScaleData = (scale: Scale, mode: 'light' | 'dark'): JSONAlphaScale => {
		const result: JSONAlphaScale = {};
		const background = mode === 'light' ? '#ffffff' : '#000000';

		for (let step = 1; step <= 12; step++) {
			const hex = scale[step as keyof Scale];
			const [r, g, b, a] = getAlphaColorSrgb(hex, background);
			const alphaHex = formatAlphaHex(r, g, b, a);

			let p3Value = '';
			if (includeP3) {
				const [pr, pg, pb, pa] = getAlphaColorP3(hex, background);
				p3Value = formatAlphaP3(pr, pg, pb, pa);
			}

			result[step] = {
				hex: alphaHex,
				p3: p3Value
			};
		}
		return result;
	};

	// Build brand color info from tuning profile
	const brandColors: BrandColorInfo[] = [];
	const { anchors, customRows } = palette._meta.tuningProfile;

	// Process each input color to get its brand info
	for (const hex of palette._meta.inputColors) {
		const anchorInfo = anchors[hex];
		if (anchorInfo) {
			// Check if this is a custom row
			const customRowInfo = customRows?.find((cr) => cr.originalHex === hex);
			brandColors.push({
				hex,
				hue: anchorInfo.slot,
				anchorStep: anchorInfo.step,
				isCustomRow: !!anchorInfo.isCustomRow,
				customRowReason: customRowInfo?.reason
			});
		}
	}

	// Build output
	const output: JSONOutput = {
		light: {},
		dark: {},
		_meta: {
			generatedAt: new Date().toISOString(),
			inputColors: palette._meta.inputColors,
			scales: [...new Set([...lightKeys, ...darkKeys])],
			brandColors,
			tuning: {
				hueShift: palette._meta.tuningProfile.hueShift,
				chromaMultiplier: palette._meta.tuningProfile.chromaMultiplier,
				lightnessShift: palette._meta.tuningProfile.lightnessShift
			}
		}
	};

	// Solid scales
	for (const key of lightKeys) {
		output.light[key] = buildScaleData(safePalette.light[key]);
	}
	for (const key of darkKeys) {
		output.dark[key] = buildScaleData(safePalette.dark[key]);
	}

	// Alpha scales
	if (includeAlpha) {
		output.lightA = {};
		output.darkA = {};
		for (const key of lightKeys) {
			output.lightA[key] = buildAlphaScaleData(safePalette.light[key], 'light');
		}
		for (const key of darkKeys) {
			output.darkA[key] = buildAlphaScaleData(safePalette.dark[key], 'dark');
		}
	}

	// Semantic tokens
	if (includeSemantic) {
		output.semantic = {
			light: {},
			dark: {}
		};
		for (const key of lightKeys) {
			output.semantic.light[key] = getSemanticTokens(safePalette.light[key], 'light');
		}
		for (const key of darkKeys) {
			output.semantic.dark[key] = getSemanticTokens(safePalette.dark[key], 'dark');
		}
	}

	return output;
}
