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
import { BASELINE_HUES, HUE_KEYS } from './hues.js';
import {
	generateScaleAPCA,
	RADIX_REFERENCE_CHROMAS,
	RADIX_LIGHTNESS_CURVES
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
 * @returns Hex color to use as parent for scale generation
 */
function createTunedParent(
	hueKey: string,
	baselineHue: number,
	tuning: TuningProfile
): string {
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

	const radixChroma = RADIX_REFERENCE_CHROMAS[hueKey] ?? 0.15;
	const tunedChroma = radixChroma * clampedMultiplier;

	// Apply hueShift for brand cohesion - but NOT to neutrals
	// At very low chroma (~0.01-0.02), even small hue shifts change
	// the perceived tint disproportionately (e.g., Slate becomes Mauve-like)
	const effectiveHueShift = isNeutral ? 0 : tuning.hueShift;
	const tunedHue = (baselineHue + effectiveHueShift + 360) % 360;

	// CRITICAL: Use Radix step 9 lightness for this hue to avoid gamut clipping!
	// Yellow at L=0.65 loses 30% chroma when converted to sRGB.
	// Yellow at L=0.918 (Radix step 9) preserves full chroma.
	// This ensures the parent color has the correct chroma after sRGB conversion.
	const lightnessCurve = RADIX_LIGHTNESS_CURVES[hueKey];
	const radixStep9Lightness = lightnessCurve ? lightnessCurve[8] : 0.65; // index 8 = step 9

	const oklch = clampOklch({
		l: radixStep9Lightness,
		c: tunedChroma,
		h: tunedHue
	});

	return toHex(oklch);
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
 * @param customRow - Custom row info from analysis
 * @param tuning - Tuning profile (for hueShift on neon rows)
 * @returns Generated scale
 */
function generateCustomRowScale(customRow: CustomRowInfo, tuning: TuningProfile): Scale {
	// Determine effective hue shift based on reason:
	// - low-chroma (pastel): DON'T apply hueShift (too delicate)
	// - high-chroma (neon): DO apply hueShift (robust enough)
	// - hue-gap: DON'T apply hueShift (brand's distinct hue is the defining feature)
	const effectiveHueShift = customRow.reason === 'high-chroma' ? tuning.hueShift : 0;

	// Get the nearest slot's step-9 lightness for proper gamut handling
	const nearestHue = customRow.nearestSlot;
	const lightnessCurve = RADIX_LIGHTNESS_CURVES[nearestHue];
	const step9Lightness = lightnessCurve ? lightnessCurve[8] : 0.65;

	// Create a synthetic parent with the brand's actual chroma (not clamped!)
	// This is the key difference from standard generation
	const syntheticParent = toHex(
		clampOklch({
			l: step9Lightness,
			c: customRow.oklch.c, // Use actual brand chroma
			h: (customRow.oklch.h + effectiveHueShift + 360) % 360
		})
	);

	// Generate scale using the custom parent and nearest slot's curves
	const generatedScale = generateScaleAPCA({
		parentColor: syntheticParent,
		anchorStep: customRow.anchorStep,
		hueKey: nearestHue, // Use nearest hue's curves for shape
		useFullCurve: false // Respect brand's actual values at anchor
	});

	const scale = toScale(generatedScale.steps);

	// Replace anchor step with exact brand hex
	scale[customRow.anchorStep as keyof Scale] = customRow.originalHex;

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
export function generateLightPalette(options: GeneratePaletteOptions): LightPalette {
	const { brandColors } = options;

	// Get or calculate tuning profile
	const tuningProfile = options.tuningProfile ?? analyzeBrandColors(brandColors);

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
			parentColor = createTunedParent(hueKey, baseline.hue, tuningProfile);
			anchorStep = 9;
			// Synthetic parent: use Radix lightness curve for ALL steps
			// This is critical for bright hues (yellow/lime) where step 9 should be LIGHTER
			useFullCurve = true;
		}

		// Generate the 12-step scale with appropriate anchor step and hue type
		const generatedScale = generateScaleAPCA({ parentColor, anchorStep, hueKey, useFullCurve });
		const scale = toScale(generatedScale.steps);

		// For anchored slots: replace generated anchor step with exact brand hex
		// This ensures brand colors appear exactly as provided, not approximated
		if (slotToAnchor[hueKey]) {
			const anchor = slotToAnchor[hueKey];
			const generatedHex = scale[anchor.step as keyof Scale];
			const brandHex = anchor.hex;

			// Validate the algorithm produced something close (within tolerance)
			// If wildly different, it indicates an algorithm problem
			const generated = toOklch(generatedHex);
			const brand = toOklch(brandHex);
			if (generated && brand) {
				const deltaL = Math.abs(generated.l - brand.l);
				const deltaC = Math.abs(generated.c - brand.c);
				// Allow small differences from rounding, but flag large ones
				if (deltaL > 0.05 || deltaC > 0.05) {
					console.warn(
						`Anchor validation warning: ${hueKey} step ${anchor.step} ` +
							`differs significantly from brand color. ` +
							`Generated: ${generatedHex}, Brand: ${brandHex}`
					);
				}
			}

			// Always use exact brand hex for anchor step
			scale[anchor.step as keyof Scale] = brandHex;
		}

		scales[hueKey] = scale;
	}

	// Generate custom row scales for out-of-bounds chroma colors
	const customSlots: string[] = [];
	if (tuningProfile.customRows && tuningProfile.customRows.length > 0) {
		for (const customRow of tuningProfile.customRows) {
			const scale = generateCustomRowScale(customRow, tuningProfile);
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
