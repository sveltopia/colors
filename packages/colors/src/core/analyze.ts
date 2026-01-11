/**
 * Brand Color Analysis
 *
 * Analyzes input brand colors to extract a "tuning profile" that describes
 * how the brand deviates from baseline expectations. This profile is then
 * applied to generate the full palette.
 *
 * Key concept: SNAP THRESHOLD (10°)
 * - If brand color is within 10° of a Radix slot → snap to that slot
 * - If beyond 10° → could create a custom slot (future feature)
 */

import { toOklch } from '../utils/oklch.js';
import type { OklchColor, TuningProfile, AnchorInfo } from '../types.js';
import { BASELINE_HUES, findClosestHueWithDistance, SNAP_THRESHOLD } from './hues.js';
import { RADIX_LIGHTNESS_CURVES } from './generate.js';

/**
 * Radix lightness targets for each step (1-12).
 * Used to find best-fit anchor step for any input color.
 * These are the same values from generate.ts.
 */
const RADIX_LIGHTNESS_TARGETS = [
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
 * Determine the best anchor step for a color based on its lightness.
 * Uses best-fit matching against per-hue Radix lightness curves.
 *
 * This allows anchoring at ANY step (1-12), not just 9 or 12.
 * For example:
 * - L ≈ 0.66 → Step 9 (standard hero)
 * - L ≈ 0.73 → Step 8 (lighter hero)
 * - L ≈ 0.56 → Step 11 (dark accent)
 * - L ≈ 0.33 → Step 12 (text color)
 * - L < 0.25 → Step 12 (clamped, darker than any target)
 *
 * @param lightness - OKLCH lightness value (0-1)
 * @param slot - Hue slot name for per-hue curve lookup (optional)
 * @returns Best-fit step number (1-12)
 */
export function suggestAnchorStep(lightness: number, slot?: string): number {
	// Use per-hue lightness curve if available, otherwise fall back to generic
	const lightnessCurve = slot ? RADIX_LIGHTNESS_CURVES[slot] : null;
	const targets = lightnessCurve || RADIX_LIGHTNESS_TARGETS;

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
}

/**
 * Analyze a single brand color against the baseline hue map.
 *
 * @param hex - Input color as hex string
 * @returns Analysis result or null if color is invalid
 */
export function analyzeColor(hex: string): ColorAnalysis | null {
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

	// Warn if color is far from any hue slot (potential custom row candidate)
	if (!snaps && isChromatic) {
		console.warn(
			`⚠️ ${hex} is ${distance.toFixed(1)}° from nearest hue (${slot}). Consider custom row.`
		);
	}

	// Calculate hue offset (signed, accounting for wrap-around)
	let hueOffset = oklch.h - baseline.hue;
	if (hueOffset > 180) hueOffset -= 360;
	if (hueOffset < -180) hueOffset += 360;

	// Calculate chroma ratio compared to baseline reference
	const chromaRatio = baseline.referenceChroma > 0 ? oklch.c / baseline.referenceChroma : 1;

	return {
		input: hex,
		oklch,
		slot,
		distance,
		snaps,
		hueOffset,
		chromaRatio,
		// Use per-hue lightness curve for accurate step matching
		suggestedAnchorStep: suggestAnchorStep(oklch.l, slot)
	};
}

/** Maximum number of brand colors we accept */
export const MAX_BRAND_COLORS = 7;

/**
 * Analyze multiple brand colors and extract a tuning profile.
 *
 * The tuning profile captures the "character" of the brand:
 * - Do they prefer warmer or cooler hues? (hueShift)
 * - Are their colors more vivid or muted? (chromaMultiplier)
 * - Do they skew lighter or darker? (lightnessShift)
 *
 * @param colors - Array of 1-7 hex color strings
 * @returns TuningProfile describing the brand's color preferences
 */
export function analyzeBrandColors(colors: string[]): TuningProfile {
	if (colors.length === 0) {
		return createDefaultProfile();
	}

	// Enforce 7-color limit
	if (colors.length > MAX_BRAND_COLORS) {
		console.warn(
			`Brand color limit is ${MAX_BRAND_COLORS}, received ${colors.length}. Using first ${MAX_BRAND_COLORS}.`
		);
		colors = colors.slice(0, MAX_BRAND_COLORS);
	}

	// Analyze each color
	const analyses = colors.map(analyzeColor).filter((a): a is ColorAnalysis => a !== null);

	if (analyses.length === 0) {
		return createDefaultProfile();
	}

	// Separate chromatic from neutral colors
	const chromaticAnalyses = analyses.filter((a) => a.oklch.c > 0.03);
	const hasChromatic = chromaticAnalyses.length > 0;

	// Calculate average hue shift (only from chromatic colors that snap)
	// Colors that don't snap would get their own custom slots
	const snappingAnalyses = chromaticAnalyses.filter((a) => a.snaps);
	const hueShift =
		snappingAnalyses.length > 0 ? average(snappingAnalyses.map((a) => a.hueOffset)) : 0;

	// Calculate chroma multiplier (only from chromatic colors)
	const chromaMultiplier = hasChromatic
		? average(chromaticAnalyses.map((a) => a.chromaRatio))
		: 1;

	// Calculate lightness shift (from all colors)
	// Compare to expected "mid" lightness of ~0.65 (Radix step-9 is around 0.62-0.65)
	const expectedMidLightness = 0.65;
	const actualAvgLightness = average(analyses.map((a) => a.oklch.l));
	const lightnessShift = actualAvgLightness - expectedMidLightness;

	// Build anchors map: input hex -> { slot, step }
	const anchors: Record<string, AnchorInfo> = {};
	for (const analysis of analyses) {
		anchors[analysis.input] = {
			slot: analysis.slot,
			step: analysis.suggestedAnchorStep
		};
	}

	return {
		hueShift,
		chromaMultiplier,
		lightnessShift,
		anchors
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
export function getAnalysisReport(colors: string[]): {
	analyses: ColorAnalysis[];
	profile: TuningProfile;
	summary: string;
} {
	const analyses = colors.map(analyzeColor).filter((a): a is ColorAnalysis => a !== null);

	const profile = analyzeBrandColors(colors);

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
