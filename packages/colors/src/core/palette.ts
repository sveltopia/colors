/**
 * Full Palette Generation
 *
 * Generates a complete 31-hue palette from brand colors.
 * Each hue gets a 12-step scale using APCA targeting.
 *
 * Key concepts:
 * - Anchored hues: Brand colors map directly to their nearest slot
 * - Tuned hues: Non-anchor hues get tuning profile applied
 * - Custom slots: Brand colors that don't snap get their own slot (future)
 */

import { toOklch, toHex, clampOklch } from '../utils/oklch.js';
import { BASELINE_HUES, HUE_KEYS, findClosestHueWithDistance } from './hues.js';
import {
	generateScaleAPCA,
	RADIX_REFERENCE_CHROMAS,
	RADIX_LIGHTNESS_CURVES,
	RADIX_REFERENCE_CHROMAS_DARK,
	RADIX_LIGHTNESS_CURVES_DARK,
	RADIX_HUE_CURVES_DARK,
	BRIGHT_HUES,
	type ColorMode
} from './generate.js';
import { analyzeBrandColors } from './analyze.js';
import type { Scale, TuningProfile, CustomRowInfo } from '../types.js';

/**
 * Options for palette generation
 */
export interface GeneratePaletteOptions {
	/** Brand colors to analyze (1-7 hex strings) */
	brandColors: string[];
	/** Override tuning profile (if not provided, will be calculated from brandColors) */
	tuningProfile?: TuningProfile;
	/** Color mode: 'light' (default) or 'dark' */
	mode?: ColorMode;
}

/**
 * Light mode palette result
 */
export interface LightPalette {
	/** Scales keyed by hue name (e.g., 'red', 'orange', 'blue') */
	scales: Record<string, Scale>;
	/** Metadata about generation */
	meta: {
		tuningProfile: TuningProfile;
		inputColors: string[];
		generatedAt: string;
		/** Which hue slots are anchored to brand colors */
		anchoredSlots: string[];
		/** Custom slots created for non-snapping brand colors */
		customSlots: string[];
	};
}

/**
 * Convert a GeneratedScale (with steps array) to a Scale (with numbered keys)
 */
function toScale(steps: Array<{ step: number; hex: string }>): Scale {
	const scale: Partial<Scale> = {};
	for (const step of steps) {
		scale[step.step as keyof Scale] = step.hex;
	}
	return scale as Scale;
}

/**
 * Chroma multiplier bounds for non-anchored rows.
 *
 * Floor (0.5x): Prevents palette destruction from very low chroma brands.
 * Saddle Brown (0.59x) and Muddy Olive (0.51x) produced beautiful palettes,
 * so 0.5x is the sweet spot where adaptation is intentional, not destructive.
 *
 * Ceiling (1.3x): Allows more brand adaptation while preventing gamut clipping.
 * Higher values cause sRGB clipping in saturated hues (orange, red),
 * resulting in unwanted hue shifts (e.g., orange → red).
 */
const MIN_CHROMA_MULTIPLIER = 0.5;
const MAX_CHROMA_MULTIPLIER = 1.3;

/**
 * Maximum chroma multiplier for neutral/tinted-neutral rows.
 * Neutrals have very low chroma (~0.01-0.02), so even small boosts
 * cause disproportionate hue shifts. Using 1.0 (no boost) preserves
 * the subtle tint character of Slate, Mauve, Olive, etc.
 */
const MAX_NEUTRAL_CHROMA_MULTIPLIER = 1.0;

/**
 * Neutral hue keys that get special chroma handling.
 * These have very low reference chroma and irregular hue curves.
 */
const NEUTRAL_HUES = new Set(['gray', 'mauve', 'slate', 'sage', 'olive', 'sand']);

/**
 * Create a synthetic parent color for a non-anchored hue.
 * Uses Radix reference values as baseline, with brand tuning applied as deltas.
 *
 * Key insight: We apply hueShift to ALL hues (not just anchored ones).
 * This is the "retuning the whole guitar" concept - if your brand orange
 * is 2° warmer than Radix, your entire palette should be 2° warmer.
 * This creates cohesive brand temperature across all colors.
 *
 * IMPORTANT: chromaMultiplier is capped to prevent gamut clipping artifacts.
 * High chroma values (e.g., 1.35x) cause sRGB clipping in saturated hues,
 * resulting in unwanted hue shifts (orange becomes redder).
 *
 * @param hueKey - The hue name (e.g., 'yellow', 'cyan')
 * @param baselineHue - The baseline hue angle
 * @param tuning - The tuning profile to apply
 * @param mode - Color mode ('light' or 'dark')
 * @returns Hex color to use as parent for scale generation
 */
function createTunedParent(
	hueKey: string,
	baselineHue: number,
	tuning: TuningProfile,
	mode: ColorMode = 'light'
): string {
	// Select curves based on mode
	const refChromas = mode === 'dark' ? RADIX_REFERENCE_CHROMAS_DARK : RADIX_REFERENCE_CHROMAS;
	const lightnessCurves = mode === 'dark' ? RADIX_LIGHTNESS_CURVES_DARK : RADIX_LIGHTNESS_CURVES;

	// Use Radix reference chroma as baseline (this is the "trust Radix" approach)
	// Apply different bounds for neutrals vs chromatic hues
	const isNeutral = NEUTRAL_HUES.has(hueKey);

	// Clamp chroma multiplier to safe range
	// Neutrals: no boost (1.0x cap) - they're too sensitive to chroma changes
	// Chromatic: [0.5x, 1.3x] - allows meaningful adaptation without extremes
	let clampedMultiplier: number;
	if (isNeutral) {
		clampedMultiplier = Math.min(tuning.chromaMultiplier, MAX_NEUTRAL_CHROMA_MULTIPLIER);
	} else {
		clampedMultiplier = Math.max(
			MIN_CHROMA_MULTIPLIER,
			Math.min(tuning.chromaMultiplier, MAX_CHROMA_MULTIPLIER)
		);
	}

	const radixChroma = refChromas[hueKey] ?? 0.15;
	const tunedChroma = radixChroma * clampedMultiplier;

	// For dark mode, use the dark mode Radix hue as baseline instead of light mode BASELINE_HUES.
	// This is critical because some neutrals have significantly different hues in dark mode:
	// - Slate: light 277.70° vs dark 262.34° = 15.36° difference
	// - Sand: light 106.68° vs dark 97.45° = 9.23° difference
	// Using light mode baseline in dark mode would cause synthetic parents to mismatch
	// the dark Radix curves, triggering unwanted tuning for neutrals.
	let effectiveBaselineHue = baselineHue;
	if (mode === 'dark' && RADIX_HUE_CURVES_DARK[hueKey]) {
		effectiveBaselineHue = RADIX_HUE_CURVES_DARK[hueKey][8]; // step 9 (index 8)
	}

	// Apply hueShift for brand cohesion - but NOT to neutrals
	// At very low chroma (~0.01-0.02), even small hue shifts change
	// the perceived tint disproportionately (e.g., Slate becomes Mauve-like)
	const effectiveHueShift = isNeutral ? 0 : tuning.hueShift;
	const tunedHue = (effectiveBaselineHue + effectiveHueShift + 360) % 360;

	// CRITICAL: Use Radix step 9 lightness for this hue to avoid gamut clipping!
	// Yellow at L=0.65 loses 30% chroma when converted to sRGB.
	// Yellow at L=0.918 (Radix step 9) preserves full chroma.
	// This ensures the parent color has the correct chroma after sRGB conversion.
	const lightnessCurve = lightnessCurves[hueKey];
	const radixStep9Lightness = lightnessCurve ? lightnessCurve[8] : 0.65; // index 8 = step 9

	const oklch = clampOklch({
		l: radixStep9Lightness,
		c: tunedChroma,
		h: tunedHue
	});

	return toHex(oklch);
}

/**
 * Find the closest non-bright hue slot for a given hue angle.
 * Used to get monotonic lightness curves for high-chroma custom rows.
 *
 * Bright hues (yellow, lime, amber, mint, sky) have non-monotonic lightness
 * curves where step 9 is LIGHTER than step 8. This is intentional for their
 * natural pastel-ish appearance, but breaks high-chroma colors that need
 * step 800 dark enough for white text contrast.
 *
 * @param hue - OKLCH hue angle
 * @returns Closest non-bright hue slot key
 */
function findClosestNonBrightSlot(hue: number): string {
	let closestKey = 'cyan'; // Default fallback
	let closestDistance = Infinity;

	for (const [key, def] of Object.entries(BASELINE_HUES)) {
		// Skip bright hues and neutrals
		if (BRIGHT_HUES.has(key) || def.category === 'neutral') continue;

		const distance = Math.min(Math.abs(hue - def.hue), 360 - Math.abs(hue - def.hue));

		if (distance < closestDistance) {
			closestDistance = distance;
			closestKey = key;
		}
	}

	return closestKey;
}

/**
 * Recalculate anchor step using a specific hue's lightness curve.
 * Used when switching from a bright hue curve to a non-bright curve.
 *
 * @param lightness - OKLCH lightness value
 * @param hueKey - Hue key for curve lookup
 * @param mode - Color mode
 * @returns Best-fit step number (1-12)
 */
function recalculateAnchorStep(lightness: number, hueKey: string, mode: ColorMode): number {
	const curves = mode === 'dark' ? RADIX_LIGHTNESS_CURVES_DARK : RADIX_LIGHTNESS_CURVES;
	const curve = curves[hueKey];

	if (!curve) return 9; // Fallback

	let bestStep = 9;
	let bestDiff = Infinity;

	for (let i = 0; i < curve.length; i++) {
		const diff = Math.abs(lightness - curve[i]);
		if (diff < bestDiff) {
			bestDiff = diff;
			bestStep = i + 1; // Steps are 1-indexed
		}
	}

	return bestStep;
}

/**
 * Generate a scale for a custom row (out-of-bounds chroma color).
 *
 * Key differences from standard scale generation:
 * - Uses the brand color's actual chroma (no clamping)
 * - Uses Radix curves from the nearest slot for shape
 * - Pastel colors skip hueShift (too delicate)
 * - Neon colors apply hueShift (robust enough to handle it)
 * - Hue-gap colors skip hueShift (brand's distinct hue is the whole point)
 *
 * IMPORTANT: For high-chroma colors, if the nearest slot is a "bright hue"
 * (yellow, lime, amber, mint, sky), we use the next closest non-bright slot's
 * curves instead. Bright hues have non-monotonic lightness curves (step 9
 * lighter than step 8) which makes step 800 unusable for buttons.
 *
 * @param customRow - Custom row info from analysis
 * @param tuning - Tuning profile (for hueShift on neon rows)
 * @param mode - Color mode ('light' or 'dark')
 * @returns Generated scale
 */
function generateCustomRowScale(
	customRow: CustomRowInfo,
	tuning: TuningProfile,
	mode: ColorMode = 'light'
): Scale {
	// Select curves based on mode
	const lightnessCurves = mode === 'dark' ? RADIX_LIGHTNESS_CURVES_DARK : RADIX_LIGHTNESS_CURVES;

	// Determine effective hue shift based on reason:
	// - low-chroma (pastel): DON'T apply hueShift (too delicate)
	// - high-chroma (neon): DO apply hueShift (robust enough)
	// - hue-gap: DON'T apply hueShift (brand's distinct hue is the defining feature)
	const effectiveHueShift = customRow.reason === 'high-chroma' ? tuning.hueShift : 0;

	// Determine which slot's curves to use for lightness progression
	// For high-chroma colors: if nearest slot is a bright hue, find alternative
	// This prevents neon colors from getting non-monotonic curves that make
	// step 800 unusable for buttons (too light for white text contrast)
	let curveSlot = customRow.nearestSlot;
	let anchorStep = customRow.anchorStep;

	if (customRow.reason === 'high-chroma' && BRIGHT_HUES.has(curveSlot)) {
		curveSlot = findClosestNonBrightSlot(customRow.oklch.h);
		// CRITICAL: Recalculate anchor step using the new curve's lightness values
		// The original anchor was calculated using bright-hue curves where step 9
		// is light (L≈0.86). With monotonic curves, step 9 is dark (L≈0.66),
		// so a light brand color should anchor at a lighter step (e.g., step 5-6)
		anchorStep = recalculateAnchorStep(customRow.oklch.l, curveSlot, mode);
	}

	// Get the curve slot's anchor step lightness for proper gamut handling
	const lightnessCurve = lightnessCurves[curveSlot];
	const anchorLightness = lightnessCurve ? lightnessCurve[anchorStep - 1] : 0.65;

	// Create a synthetic parent with the brand's actual chroma (not clamped!)
	// This is the key difference from standard generation
	const syntheticParent = toHex(
		clampOklch({
			l: anchorLightness,
			c: customRow.oklch.c, // Use actual brand chroma
			h: (customRow.oklch.h + effectiveHueShift + 360) % 360
		})
	);

	// Generate scale using the custom parent and curve slot's curves
	const generatedScale = generateScaleAPCA({
		parentColor: syntheticParent,
		anchorStep: anchorStep,
		hueKey: curveSlot, // Use curve slot's curves for shape (may differ from nearest)
		useFullCurve: false, // Respect brand's actual values at anchor
		mode
	});

	const scale = toScale(generatedScale.steps);

	// Replace anchor step with exact brand hex
	scale[anchorStep as keyof Scale] = customRow.originalHex;

	return scale;
}

/**
 * Generate a complete light-mode palette from brand colors.
 *
 * Algorithm:
 * 1. Analyze brand colors to get tuning profile
 * 2. For each baseline hue:
 *    - If it's an anchor (brand color maps here): use brand color as parent
 *    - If not: create synthetic parent with tuning applied
 * 3. Generate 12-step scale for each hue
 *
 * @param options - Generation options with brand colors
 * @returns Complete light mode palette with 31 hues × 12 steps
 */
export function generatePalette(options: GeneratePaletteOptions): LightPalette {
	const { brandColors, mode = 'light' } = options;

	// Get or calculate tuning profile (mode-aware for correct anchor step placement)
	const tuningProfile = options.tuningProfile ?? analyzeBrandColors(brandColors, mode);

	// Invert anchors map: slot -> { hex, step }
	// Only include standard anchors (skip custom rows)
	const slotToAnchor: Record<string, { hex: string; step: number }> = {};
	for (const [hex, info] of Object.entries(tuningProfile.anchors)) {
		if (!info.isCustomRow) {
			slotToAnchor[info.slot] = { hex, step: info.step };
		}
	}

	const scales: Record<string, Scale> = {};
	const anchoredSlots: string[] = [];

	// Generate scale for each baseline hue
	for (const hueKey of HUE_KEYS) {
		const baseline = BASELINE_HUES[hueKey];
		let parentColor: string;
		let anchorStep: number | undefined;

		// Track whether this is a real brand anchor or synthetic parent
		let useFullCurve = false;

		if (slotToAnchor[hueKey]) {
			// This slot is anchored to a brand color - use it with smart step placement
			const anchor = slotToAnchor[hueKey];
			parentColor = anchor.hex;
			anchorStep = anchor.step;
			anchoredSlots.push(hueKey);
			// Brand anchor: use parent's actual lightness at anchor step
			useFullCurve = false;
		} else {
			// Not anchored - create tuned parent from Radix baseline
			// Parent provides hue and chroma (from Radix reference); lightness comes from Radix curve
			parentColor = createTunedParent(hueKey, baseline.hue, tuningProfile, mode);
			anchorStep = 9;
			// Synthetic parent: use Radix lightness curve for ALL steps
			// This is critical for bright hues (yellow/lime) where step 9 should be LIGHTER
			useFullCurve = true;
		}

		// Generate the 12-step scale with appropriate anchor step and hue type
		// Pass global tuning so anchored rows that are "nearly Radix" still get uniform brand shift
		const generatedScale = generateScaleAPCA({
			parentColor,
			anchorStep,
			hueKey,
			useFullCurve,
			globalTuning: {
				hueShift: tuningProfile.hueShift,
				chromaMultiplier: tuningProfile.chromaMultiplier
			},
			mode
		});
		const scale = toScale(generatedScale.steps);

		// For anchored slots: replace generated anchor step with exact brand hex
		// This ensures brand colors appear exactly as provided, not approximated
		if (slotToAnchor[hueKey]) {
			const anchor = slotToAnchor[hueKey];
			const generatedHex = scale[anchor.step as keyof Scale];
			const brandHex = anchor.hex;

			// Validate the algorithm produced something close (within tolerance)
			// Always use exact brand hex for anchor step
			scale[anchor.step as keyof Scale] = brandHex;
		}

		scales[hueKey] = scale;
	}

	// Generate custom row scales for out-of-bounds chroma colors
	const customSlots: string[] = [];
	if (tuningProfile.customRows && tuningProfile.customRows.length > 0) {
		for (const customRow of tuningProfile.customRows) {
			const scale = generateCustomRowScale(customRow, tuningProfile, mode);
			scales[customRow.rowKey] = scale;
			customSlots.push(customRow.rowKey);
			anchoredSlots.push(customRow.rowKey);
		}
	}

	return {
		scales,
		meta: {
			tuningProfile,
			inputColors: brandColors,
			generatedAt: new Date().toISOString(),
			anchoredSlots,
			customSlots
		}
	};
}

/**
 * Get statistics about a generated palette
 */
export function getPaletteStats(palette: LightPalette): {
	totalHues: number;
	totalColors: number;
	anchoredHues: number;
	customHues: number;
} {
	const hueCount = Object.keys(palette.scales).length;
	return {
		totalHues: hueCount,
		totalColors: hueCount * 12,
		anchoredHues: palette.meta.anchoredSlots.length,
		customHues: palette.meta.customSlots.length
	};
}
