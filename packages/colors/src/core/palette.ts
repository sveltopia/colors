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
import { generateScaleAPCA } from './generate.js';
import { analyzeBrandColors } from './analyze.js';
import type { Scale, TuningProfile, OklchColor } from '../types.js';

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
 * Create a synthetic parent color for a non-anchored hue.
 * Applies tuning profile adjustments to the baseline.
 *
 * Key insight: We apply hueShift to ALL hues (not just anchored ones).
 * This is the "retuning the whole guitar" concept - if your brand orange
 * is 2° warmer than Radix, your entire palette should be 2° warmer.
 * This creates cohesive brand temperature across all colors.
 *
 * @param baselineHue - The baseline hue definition
 * @param tuning - The tuning profile to apply
 * @returns Hex color to use as parent for scale generation
 */
function createTunedParent(
	baselineHue: number,
	baselineChroma: number,
	tuning: TuningProfile
): string {
	// Apply tuning adjustments - hueShift applies globally for brand cohesion
	const tunedHue = (baselineHue + tuning.hueShift + 360) % 360;
	const tunedChroma = baselineChroma * tuning.chromaMultiplier;

	// Step 9 lightness is around 0.62-0.68 for most Radix colors
	// Apply lightness shift from tuning
	const baseLightness = 0.65;
	const tunedLightness = Math.max(0.3, Math.min(0.8, baseLightness + tuning.lightnessShift));

	const oklch = clampOklch({
		l: tunedLightness,
		c: tunedChroma,
		h: tunedHue
	});

	return toHex(oklch);
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
	const slotToAnchor: Record<string, { hex: string; step: number }> = {};
	for (const [hex, info] of Object.entries(tuningProfile.anchors)) {
		slotToAnchor[info.slot] = { hex, step: info.step };
	}

	const scales: Record<string, Scale> = {};
	const anchoredSlots: string[] = [];

	// Generate scale for each baseline hue
	for (const hueKey of HUE_KEYS) {
		const baseline = BASELINE_HUES[hueKey];
		let parentColor: string;
		let anchorStep: number | undefined;

		if (slotToAnchor[hueKey]) {
			// This slot is anchored to a brand color - use it with smart step placement
			const anchor = slotToAnchor[hueKey];
			parentColor = anchor.hex;
			anchorStep = anchor.step;
			anchoredSlots.push(hueKey);
		} else {
			// Not anchored - create tuned parent from baseline
			parentColor = createTunedParent(baseline.hue, baseline.referenceChroma, tuningProfile);
			anchorStep = 9; // Default anchor step for tuned colors
		}

		// Generate the 12-step scale with appropriate anchor step and hue type
		const generatedScale = generateScaleAPCA({ parentColor, anchorStep, hueKey });
		scales[hueKey] = toScale(generatedScale.steps);
	}

	return {
		scales,
		meta: {
			tuningProfile,
			inputColors: brandColors,
			generatedAt: new Date().toISOString(),
			anchoredSlots,
			customSlots: [] // Future: handle non-snapping brand colors
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
