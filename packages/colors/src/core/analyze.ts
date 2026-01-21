/**
 * Brand Color Analysis
 *
 * Analyzes input brand colors to extract a "tuning profile" that describes
 * how the brand deviates from baseline expectations. This profile is then
 * applied to generate the full palette.
 *
 * Key concept: SNAP THRESHOLD (10°)
 * - If brand color is within 10° of a Radix slot → snap to that slot
 * - If beyond 10° → generate custom row to preserve brand color integrity
 */

import { toOklch } from '../utils/oklch.js';
import type { OklchColor, TuningProfile, AnchorInfo, CustomRowInfo } from '../types.js';
import { BASELINE_HUES, findClosestHueWithDistance, SNAP_THRESHOLD } from './hues.js';
import { RADIX_LIGHTNESS_CURVES, RADIX_LIGHTNESS_CURVES_DARK, type ColorMode } from './generate.js';

/**
 * Chroma ratio thresholds for triggering custom row generation.
 *
 * FLOOR (0.5x): Colors below this are extremely desaturated (pastels).
 *   Example: Pastel Pink #FFD1DC has ~0.25x chroma ratio.
 *
 * CEILING (1.3x): Colors above this are extremely saturated (neons).
 *   Example: Neon Green #39FF14 has ~1.95x chroma ratio.
 *
 * Note: These match the clamp values in palette.ts MIN/MAX_CHROMA_MULTIPLIER
 */
export const CHROMA_RATIO_FLOOR = 0.5;
export const CHROMA_RATIO_CEILING = 1.3;

/**
 * Maximum allowed lightness gap between input color and matched step.
 * Colors exceeding this threshold trigger custom row generation.
 *
 * 0.10 chosen because:
 * - Radix steps are typically ~0.05-0.10 apart in lightness
 * - 0.10 catches colors that don't fit well into any step
 * - Combined with semantic check for better detection
 */
export const LIGHTNESS_GAP_THRESHOLD = 0.10;

/**
 * Minimum chroma for "high chroma" classification.
 * Colors above this threshold are considered vibrant/saturated.
 * Used for semantic step validation (hero vs text steps).
 */
export const HIGH_CHROMA_THRESHOLD = 0.12;

/**
 * Steps where high-chroma colors are semantically WRONG.
 * - Steps 1-3: Background steps (should be very low chroma)
 * - Step 12: High-contrast text (should be low chroma)
 *
 * Step 11 ("low-contrast text") can have moderate chroma for accent text.
 * Steps 4-10 are OK for various chroma levels (UI elements, accents).
 */
export const SEMANTIC_MISMATCH_STEPS = new Set([1, 2, 3, 12]);

/**
 * Radix lightness targets for each step (1-12) - LIGHT MODE.
 * Used to find best-fit anchor step for any input color.
 * Light mode: Step 1 is lightest, Step 12 is darkest.
 */
const RADIX_LIGHTNESS_TARGETS_LIGHT = [
	0.993, // Step 1
	0.981, // Step 2
	0.959, // Step 3
	0.931, // Step 4
	0.897, // Step 5
	0.858, // Step 6
	0.805, // Step 7
	0.732, // Step 8
	0.66, // Step 9 (typical hero position)
	0.632, // Step 10
	0.561, // Step 11
	0.332 // Step 12
];

/**
 * Radix lightness targets for each step (1-12) - DARK MODE.
 * Dark mode: Step 1 is darkest, Step 12 is lightest.
 * Extracted from Radix dark mode gray scale.
 */
const RADIX_LIGHTNESS_TARGETS_DARK = [
	0.168, // Step 1 (darkest background)
	0.211, // Step 2
	0.265, // Step 3
	0.313, // Step 4
	0.354, // Step 5
	0.398, // Step 6
	0.464, // Step 7
	0.529, // Step 8
	0.561, // Step 9 (hero position - similar L to light mode)
	0.600, // Step 10
	0.771, // Step 11
	0.946 // Step 12 (lightest text)
];

/**
 * Determine the best anchor step for a color based on its lightness.
 * Uses best-fit matching against per-hue Radix lightness curves.
 *
 * This allows anchoring at ANY step (1-12), not just 9 or 12.
 *
 * Light mode examples:
 * - L ≈ 0.66 → Step 9 (standard hero)
 * - L ≈ 0.33 → Step 12 (dark text)
 * - L ≈ 0.99 → Step 1 (lightest background)
 *
 * Dark mode examples (inverted progression):
 * - L ≈ 0.56 → Step 9 (hero position)
 * - L ≈ 0.95 → Step 12 (light text)
 * - L ≈ 0.17 → Step 1 (darkest background)
 *
 * @param lightness - OKLCH lightness value (0-1)
 * @param slot - Hue slot name for per-hue curve lookup (optional)
 * @param mode - Color mode ('light' or 'dark')
 * @returns Best-fit step number (1-12)
 */
export function suggestAnchorStep(
	lightness: number,
	slot?: string,
	mode: ColorMode = 'light'
): number {
	// Select curves based on mode
	const lightnessCurves = mode === 'dark' ? RADIX_LIGHTNESS_CURVES_DARK : RADIX_LIGHTNESS_CURVES;
	const defaultTargets =
		mode === 'dark' ? RADIX_LIGHTNESS_TARGETS_DARK : RADIX_LIGHTNESS_TARGETS_LIGHT;

	// Use per-hue lightness curve if available, otherwise fall back to generic
	const lightnessCurve = slot ? lightnessCurves[slot] : null;
	const targets = lightnessCurve || defaultTargets;

	let bestStep = 9;
	let bestDiff = Infinity;

	for (let i = 0; i < targets.length; i++) {
		const target = targets[i];
		const diff = Math.abs(lightness - target);

		if (diff < bestDiff) {
			bestDiff = diff;
			bestStep = i + 1; // Steps are 1-indexed
		}
	}

	return bestStep;
}

/**
 * Get the expected lightness for a specific step in a hue's scale.
 * Uses mode-appropriate Radix lightness curves.
 *
 * @param step - Step number (1-12)
 * @param hueKey - Hue slot name for per-hue curve lookup
 * @param mode - Color mode ('light' or 'dark')
 * @returns Expected OKLCH lightness value
 */
export function getExpectedLightnessForStep(
	step: number,
	hueKey: string,
	mode: ColorMode = 'light'
): number {
	const lightnessCurves = mode === 'dark' ? RADIX_LIGHTNESS_CURVES_DARK : RADIX_LIGHTNESS_CURVES;
	const defaultTargets =
		mode === 'dark' ? RADIX_LIGHTNESS_TARGETS_DARK : RADIX_LIGHTNESS_TARGETS_LIGHT;

	const curve = lightnessCurves[hueKey];
	const targets = curve || defaultTargets;

	// Step is 1-indexed, array is 0-indexed
	const index = Math.max(0, Math.min(11, step - 1));
	return targets[index];
}

/** Result of analyzing a single brand color */
export interface ColorAnalysis {
	/** Original input hex */
	input: string;
	/** Parsed OKLCH values */
	oklch: OklchColor;
	/** Closest baseline hue slot */
	slot: string;
	/** Distance to slot center in degrees */
	distance: number;
	/** Whether color is close enough to snap to slot */
	snaps: boolean;
	/** Hue offset from slot center (signed) */
	hueOffset: number;
	/** Chroma relative to slot's reference (1.0 = same) */
	chromaRatio: number;
	/** Suggested anchor step based on lightness (9 for normal, 12 for dark, 1-3 for light) */
	suggestedAnchorStep: number;
	/** Whether color is out of bounds (requires custom row) */
	isOutOfBounds: boolean;
	/** Reason for being out of bounds */
	outOfBoundsReason?: 'low-chroma' | 'high-chroma' | 'hue-gap' | 'extreme-lightness';
	/** Lightness gap from expected step (for extreme-lightness detection) */
	lightnessGap?: number;
}

/**
 * Analyze a single brand color against the baseline hue map.
 *
 * @param hex - Input color as hex string
 * @param mode - Color mode for anchor step calculation ('light' or 'dark')
 * @returns Analysis result or null if color is invalid
 */
export function analyzeColor(hex: string, mode: ColorMode = 'light'): ColorAnalysis | null {
	const oklch = toOklch(hex);
	if (!oklch) return null;

	// Find closest baseline hue based on chroma level
	// Chromatic colors (c > 0.03): search chromatic hues only (exclude neutrals)
	// Non-chromatic colors (c ≤ 0.03): search neutrals only (prevents near-blacks routing to Ruby)
	const isChromatic = oklch.c > 0.03;
	const { slot, distance } = findClosestHueWithDistance(
		oklch.h,
		isChromatic ? { excludeNeutrals: true } : { neutralsOnly: true }
	);
	const baseline = BASELINE_HUES[slot];

	// Determine if we should snap to this slot
	const snaps = distance <= SNAP_THRESHOLD;

	// Calculate hue offset (signed, accounting for wrap-around)
	let hueOffset = oklch.h - baseline.hue;
	if (hueOffset > 180) hueOffset -= 360;
	if (hueOffset < -180) hueOffset += 360;

	// Calculate chroma ratio compared to baseline reference
	const chromaRatio = baseline.referenceChroma > 0 ? oklch.c / baseline.referenceChroma : 1;

	// Detect out-of-bounds conditions (requires custom row generation)
	// 1. Chroma out of bounds: < 0.5x or > 1.3x
	// 2. Hue gap: > 10° from nearest slot (for chromatic colors)
	// 3. Extreme lightness: too far from any valid step's expected lightness
	const isChromaOutOfBounds =
		isChromatic && (chromaRatio < CHROMA_RATIO_FLOOR || chromaRatio > CHROMA_RATIO_CEILING);
	const isHueGap = isChromatic && !snaps;

	// Calculate anchor step and check lightness gap
	const suggestedStep = suggestAnchorStep(oklch.l, slot, mode);
	const expectedLightness = getExpectedLightnessForStep(suggestedStep, slot, mode);
	const lightnessGap = Math.abs(oklch.l - expectedLightness);

	// Extreme lightness detection: two conditions (both require high chroma)
	// 1. Pure lightness gap: high-chroma color too far from any step's expected lightness
	// 2. Semantic mismatch: high-chroma color at background/text steps
	//    - Steps 1-3 (backgrounds) and 12 (high-contrast text) are semantically wrong for high-chroma
	//    - Steps 4-11 are OK for various chroma levels (UI elements, accents, hero, low-contrast text)
	// Rationale: muted colors blend in even if lightness is off; vibrant colors at wrong steps are jarring
	const isHighChroma = isChromatic && oklch.c > HIGH_CHROMA_THRESHOLD;
	const isPureLightnessGap = isHighChroma && lightnessGap > LIGHTNESS_GAP_THRESHOLD;
	const isSemanticMismatchStep = SEMANTIC_MISMATCH_STEPS.has(suggestedStep);
	const isSemanticMismatch = isHighChroma && isSemanticMismatchStep;
	const isExtremeLightness = isPureLightnessGap || isSemanticMismatch;

	// Combine all out-of-bounds conditions (chroma and hue-gap take precedence)
	const isOutOfBounds = isChromaOutOfBounds || isHueGap || isExtremeLightness;

	let outOfBoundsReason: 'low-chroma' | 'high-chroma' | 'hue-gap' | 'extreme-lightness' | undefined;

	if (isChromaOutOfBounds) {
		// Chroma takes precedence as the reason
		outOfBoundsReason = chromaRatio < CHROMA_RATIO_FLOOR ? 'low-chroma' : 'high-chroma';
	} else if (isHueGap) {
		outOfBoundsReason = 'hue-gap';
	} else if (isExtremeLightness) {
		outOfBoundsReason = 'extreme-lightness';
	}

	return {
		input: hex,
		oklch,
		slot,
		distance,
		snaps,
		hueOffset,
		chromaRatio,
		suggestedAnchorStep: suggestedStep,
		isOutOfBounds,
		outOfBoundsReason,
		lightnessGap: isExtremeLightness ? lightnessGap : undefined
	};
}

/** Maximum number of brand colors we accept */
export const MAX_BRAND_COLORS = 7;

/**
 * Generate a unique key for a custom row based on the color characteristics.
 *
 * Naming strategy:
 * - Uses nearest slot as base (e.g., "pink", "lime")
 * - Adds descriptor based on reason:
 *   - "pastel-" for low chroma
 *   - "neon-" for high chroma
 *   - "custom-" for hue gap
 *   - "bright-" or "dark-" for extreme lightness
 * - Appends numeric suffix for uniqueness if needed
 *
 * @param analysis - Color analysis result
 * @param existingKeys - Set of already-used custom row keys
 * @returns Unique custom row key
 */
export function generateCustomRowKey(analysis: ColorAnalysis, existingKeys: Set<string>): string {
	// Determine prefix based on reason
	let prefix: string;
	switch (analysis.outOfBoundsReason) {
		case 'low-chroma':
			prefix = 'pastel';
			break;
		case 'high-chroma':
			prefix = 'neon';
			break;
		case 'hue-gap':
			prefix = 'custom';
			break;
		case 'extreme-lightness':
			// Use 'bright' for high lightness (L > 0.5), 'dark' for low lightness
			prefix = analysis.oklch.l > 0.5 ? 'bright' : 'dark';
			break;
		default:
			prefix = 'custom';
	}

	const baseKey = `${prefix}-${analysis.slot}`;

	// Find unique suffix if needed
	let key = baseKey;
	let suffix = 1;
	while (existingKeys.has(key)) {
		key = `${baseKey}-${suffix}`;
		suffix++;
	}

	return key;
}

/**
 * Analyze multiple brand colors and extract a tuning profile.
 *
 * The tuning profile captures the "character" of the brand:
 * - Do they prefer warmer or cooler hues? (hueShift)
 * - Are their colors more vivid or muted? (chromaMultiplier)
 * - Do they skew lighter or darker? (lightnessShift)
 *
 * Colors with out-of-bounds chroma (< 0.5x or > 1.3x) are separated
 * into customRows for special handling during palette generation.
 *
 * IMPORTANT: The mode parameter affects anchor step calculation.
 * In dark mode, lightness progression is inverted, so the same
 * brand color will anchor at a different step.
 *
 * @param colors - Array of 1-7 hex color strings
 * @param mode - Color mode for anchor step calculation ('light' or 'dark')
 * @returns TuningProfile describing the brand's color preferences
 */
export function analyzeBrandColors(colors: string[], mode: ColorMode = 'light'): TuningProfile {
	if (colors.length === 0) {
		return createDefaultProfile();
	}

	// Enforce 7-color limit
	if (colors.length > MAX_BRAND_COLORS) {
		colors = colors.slice(0, MAX_BRAND_COLORS);
	}

	// Analyze each color with mode-aware anchor step calculation
	const analyses = colors
		.map((hex) => analyzeColor(hex, mode))
		.filter((a): a is ColorAnalysis => a !== null);

	if (analyses.length === 0) {
		return createDefaultProfile();
	}

	// Separate standard anchors from out-of-bounds (custom row) candidates
	const standardAnalyses = analyses.filter((a) => !a.isOutOfBounds);
	const outOfBoundsAnalyses = analyses.filter((a) => a.isOutOfBounds);

	// Calculate tuning profile from ALL chromatic colors
	// Custom rows contribute their clamped chroma ratios to capture brand "feel"
	// (e.g., neon brand → vivid palette, pastel brand → softer palette)
	const allChromaticAnalyses = analyses.filter((a) => a.oklch.c > 0.03);
	const standardChromaticAnalyses = standardAnalyses.filter((a) => a.oklch.c > 0.03);
	const hasChromatic = allChromaticAnalyses.length > 0;

	// Calculate average hue shift (only from standard chromatic colors that snap)
	// Custom rows keep their distinct hue, so exclude from hue shift calculation
	const snappingAnalyses = standardChromaticAnalyses.filter((a) => a.snaps);
	const hueShift =
		snappingAnalyses.length > 0 ? average(snappingAnalyses.map((a) => a.hueOffset)) : 0;

	// Calculate chroma multiplier from ALL chromatic colors (including custom rows)
	// Clamp out-of-bounds ratios to 0.5x-1.3x to prevent extreme skew
	// This captures the brand's "feel" - neon brands get 1.3x, pastels get 0.5x
	const chromaMultiplier = hasChromatic
		? average(
				allChromaticAnalyses.map((a) =>
					Math.max(CHROMA_RATIO_FLOOR, Math.min(CHROMA_RATIO_CEILING, a.chromaRatio))
				)
			)
		: 1;

	// Calculate lightness shift (from all colors including out-of-bounds)
	const expectedMidLightness = 0.65;
	const actualAvgLightness = average(analyses.map((a) => a.oklch.l));
	const lightnessShift = actualAvgLightness - expectedMidLightness;

	// Build anchors map for standard colors
	const anchors: Record<string, AnchorInfo> = {};
	for (const analysis of standardAnalyses) {
		anchors[analysis.input] = {
			slot: analysis.slot,
			step: analysis.suggestedAnchorStep,
			isCustomRow: false
		};
	}

	// Build custom rows array for out-of-bounds colors
	const customRows: CustomRowInfo[] = [];
	const usedKeys = new Set<string>();

	for (const analysis of outOfBoundsAnalyses) {
		const rowKey = generateCustomRowKey(analysis, usedKeys);
		usedKeys.add(rowKey);

		const customRowInfo: CustomRowInfo = {
			originalHex: analysis.input,
			rowKey,
			oklch: analysis.oklch,
			chromaRatio: analysis.chromaRatio,
			reason: analysis.outOfBoundsReason!,
			nearestSlot: analysis.slot,
			anchorStep: analysis.suggestedAnchorStep,
			hueAngle: analysis.oklch.h
		};

		// Add hueDistance for hue-gap rows
		if (analysis.outOfBoundsReason === 'hue-gap') {
			customRowInfo.hueDistance = analysis.distance;
		}

		customRows.push(customRowInfo);

		// Also add to anchors map with custom row key
		anchors[analysis.input] = {
			slot: rowKey,
			step: analysis.suggestedAnchorStep,
			isCustomRow: true
		};
	}

	return {
		hueShift,
		chromaMultiplier,
		lightnessShift,
		anchors,
		customRows: customRows.length > 0 ? customRows : undefined
	};
}

/**
 * Create a default/neutral tuning profile.
 * Used when no brand colors are provided.
 */
export function createDefaultProfile(): TuningProfile {
	return {
		hueShift: 0,
		chromaMultiplier: 1,
		lightnessShift: 0,
		anchors: {}
	};
}

/**
 * Get a detailed analysis report for debugging/display.
 */
export function getAnalysisReport(
	colors: string[],
	mode: ColorMode = 'light'
): {
	analyses: ColorAnalysis[];
	profile: TuningProfile;
	summary: string;
} {
	const analyses = colors
		.map((hex) => analyzeColor(hex, mode))
		.filter((a): a is ColorAnalysis => a !== null);

	const profile = analyzeBrandColors(colors, mode);

	const summary = [
		`Analyzed ${analyses.length} colors:`,
		...analyses.map((a) => {
			const snapIndicator = a.snaps ? '✓' : '✗';
			return `  ${a.input} → ${a.slot} (${snapIndicator} ${a.distance.toFixed(1)}°, H${a.hueOffset > 0 ? '+' : ''}${a.hueOffset.toFixed(1)}°, C×${a.chromaRatio.toFixed(2)})`;
		}),
		'',
		'Tuning Profile:',
		`  Hue Shift: ${profile.hueShift > 0 ? '+' : ''}${profile.hueShift.toFixed(1)}°`,
		`  Chroma Multiplier: ${profile.chromaMultiplier.toFixed(2)}×`,
		`  Lightness Shift: ${profile.lightnessShift > 0 ? '+' : ''}${profile.lightnessShift.toFixed(3)}`
	].join('\n');

	return { analyses, profile, summary };
}

// Utility: calculate average of numbers
function average(nums: number[]): number {
	if (nums.length === 0) return 0;
	return nums.reduce((sum, n) => sum + n, 0) / nums.length;
}
