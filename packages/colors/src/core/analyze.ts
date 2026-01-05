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
import type { OklchColor, TuningProfile } from '../types.js';
import { BASELINE_HUES, findClosestHueWithDistance, SNAP_THRESHOLD } from './hues.js';

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

	// Find closest baseline hue (skip neutrals for chromatic colors)
	const isChromatic = oklch.c > 0.03;
	const { slot, distance } = findClosestHueWithDistance(oklch.h, isChromatic);
	const baseline = BASELINE_HUES[slot];

	// Determine if we should snap to this slot
	const snaps = distance <= SNAP_THRESHOLD;

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
		chromaRatio
	};
}

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

	// Build anchors map: input hex -> baseline slot name
	const anchors: Record<string, string> = {};
	for (const analysis of analyses) {
		anchors[analysis.input] = analysis.slot;
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
