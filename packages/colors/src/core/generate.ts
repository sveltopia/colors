/**
 * Scale Generation
 *
 * Generates a 12-step color scale from a parent color,
 * using APCA contrast targeting derived from Radix Colors.
 *
 * Key insight: Target contrast, not lightness. This ensures
 * accessibility compliance regardless of hue characteristics.
 */

import { toOklch, toHex, clampOklch } from '../utils/oklch.js';
import type { OklchColor, GeneratedScale, GeneratedScaleStep } from '../types.js';
// @ts-ignore - apca-w3 has no types
import { calcAPCA } from 'apca-w3';

/**
 * APCA contrast targets derived from Radix Colors analysis.
 * These represent the average contrast values at each step
 * across orange, blue, and green scales.
 *
 * Measured against white (#ffffff) background.
 */
export const RADIX_APCA_TARGETS = [
	0.0, // Step 1: Near-white background
	0.0, // Step 2: Subtle background
	0.0, // Step 3: UI element background
	10.9, // Step 4: Hovered UI element
	17.3, // Step 5: Active/selected element
	24.7, // Step 6: Subtle borders
	34.1, // Step 7: UI element border
	46.3, // Step 8: Hovered borders
	57.6, // Step 9: Solid backgrounds (hero)
	61.8, // Step 10: Hovered solid
	71.7, // Step 11: Low-contrast text
	97.5 // Step 12: High-contrast text
];

/**
 * APCA targets for "bright" hues (yellow, lime, amber, mint, sky).
 * These hues have naturally high lightness at peak saturation,
 * so step 9-10 (the "hero" solid colors) are LIGHTER than step 8.
 *
 * Key insight: Radix intentionally makes step 9 brighter for these
 * hues because a vibrant yellow/lime needs to be light to be saturated.
 */
export const RADIX_APCA_TARGETS_BRIGHT = [
	0.0, // Step 1: Near-white background
	0.0, // Step 2: Subtle background
	0.0, // Step 3: UI element background
	9.0, // Step 4: Hovered UI element
	15.0, // Step 5: Active/selected element
	22.0, // Step 6: Subtle borders
	32.0, // Step 7: UI element border
	44.0, // Step 8: Hovered borders (DARKER than step 9!)
	18.0, // Step 9: Solid backgrounds - LIGHT for bright hues
	24.0, // Step 10: Hovered solid - also light
	73.0, // Step 11: Low-contrast text (big jump)
	96.0 // Step 12: High-contrast text
];

/**
 * Hues that are considered "bright" and need non-monotonic lightness curves.
 * These are hues where the saturated version is naturally very light.
 */
export const BRIGHT_HUES = new Set(['yellow', 'lime', 'amber', 'mint', 'sky']);

/**
 * Lightness targets derived from Radix Colors analysis.
 * Used as starting points for binary search.
 */
export const RADIX_LIGHTNESS_TARGETS = [
	0.993, // Step 1
	0.981, // Step 2
	0.959, // Step 3
	0.931, // Step 4
	0.897, // Step 5
	0.858, // Step 6
	0.805, // Step 7
	0.732, // Step 8
	0.660, // Step 9 (parent color position)
	0.632, // Step 10
	0.561, // Step 11
	0.332 // Step 12
];

/**
 * Chroma multipliers relative to step 9 (parent).
 * Derived from Radix curves - chroma is lower at extremes.
 */
export const CHROMA_CURVE = [
	0.02, // Step 1: Very low
	0.06, // Step 2
	0.15, // Step 3
	0.28, // Step 4
	0.40, // Step 5
	0.52, // Step 6
	0.60, // Step 7
	0.72, // Step 8
	1.0, // Step 9: Parent chroma (peak)
	0.98, // Step 10: Slightly lower
	0.85, // Step 11
	0.45 // Step 12: Reduced for dark
];

const WHITE = '#ffffff';
const TOLERANCE = 2; // APCA tolerance in Lc units

export interface GenerateScaleOptions {
	/** Parent/anchor color hex */
	parentColor: string;
	/** Which step to anchor the parent color at (default: 9) */
	anchorStep?: number;
	/** Hue key for bright hue detection (e.g., 'yellow', 'lime') */
	hueKey?: string;
	/** Override APCA targets */
	apcaTargets?: number[];
	/** Override chroma curve */
	chromaCurve?: number[];
}

/**
 * Generate a 12-step color scale from a parent color.
 *
 * Algorithm:
 * 1. Parse parent color to OKLCH
 * 2. For each step, use Radix lightness as starting point
 * 3. Apply chroma curve relative to parent's chroma
 * 4. Preserve hue from parent (with slight drift in darks)
 *
 * @param options - Generation options
 * @returns 12-step scale with OKLCH colors and hex values
 */
export function generateScale(options: GenerateScaleOptions): GeneratedScale {
	const { parentColor, apcaTargets = RADIX_APCA_TARGETS, chromaCurve = CHROMA_CURVE } = options;

	const parent = toOklch(parentColor);
	if (!parent) {
		throw new Error(`Invalid parent color: ${parentColor}`);
	}

	const steps: GeneratedScaleStep[] = [];

	for (let i = 0; i < 12; i++) {
		const stepNum = i + 1;

		// Start with Radix lightness target
		let lightness = RADIX_LIGHTNESS_TARGETS[i];

		// For step 9, use parent's actual lightness
		if (stepNum === 9) {
			lightness = parent.l;
		}

		// Apply chroma curve
		const chroma = parent.c * chromaCurve[i];

		// Slight hue shift in darker steps (Radix does this ~7-10°)
		// Shift toward cooler hues as we get darker
		let hue = parent.h;
		if (stepNum >= 10) {
			// Small shift based on how dark the step is
			const darknessFactor = (12 - stepNum) / 3; // 0.66 for step 10, 0.33 for step 11, 0 for step 12
			hue = parent.h - (1 - darknessFactor) * 3; // Up to -3° shift
		}

		const oklch = clampOklch({ l: lightness, c: chroma, h: hue });
		const hex = toHex(oklch);

		// Calculate actual APCA contrast
		const apca = Math.abs(calcAPCA(hex, WHITE));

		steps.push({
			step: stepNum,
			oklch,
			hex,
			apca,
			targetApca: apcaTargets[i]
		});
	}

	return {
		parent: parentColor,
		parentOklch: parent,
		steps
	};
}

/**
 * Generate a scale with APCA-targeted lightness.
 * Uses binary search to find lightness that achieves target contrast.
 *
 * This is more precise but slower than the simple approach.
 *
 * @param options - Generation options
 * @returns 12-step scale with precise APCA targeting
 */
export function generateScaleAPCA(options: GenerateScaleOptions): GeneratedScale {
	const { parentColor, anchorStep = 9, hueKey, chromaCurve = CHROMA_CURVE } = options;

	// Auto-select APCA targets based on hue type
	const isBrightHue = hueKey && BRIGHT_HUES.has(hueKey);
	const apcaTargets = options.apcaTargets ?? (isBrightHue ? RADIX_APCA_TARGETS_BRIGHT : RADIX_APCA_TARGETS);

	const parent = toOklch(parentColor);
	if (!parent) {
		throw new Error(`Invalid parent color: ${parentColor}`);
	}

	// When anchoring at a different step, we need to adjust the chroma curve
	// so the parent's full chroma is at the anchor step
	const anchorChromaMultiplier = chromaCurve[anchorStep - 1];
	const adjustedChromaCurve = chromaCurve.map((c) => c / anchorChromaMultiplier);

	const steps: GeneratedScaleStep[] = [];

	for (let i = 0; i < 12; i++) {
		const stepNum = i + 1;
		const targetApca = apcaTargets[i];

		// Apply adjusted chroma curve (now relative to anchor step)
		const chroma = parent.c * adjustedChromaCurve[i];

		// Hue with slight drift for dark steps
		let hue = parent.h;
		if (stepNum >= 10) {
			hue = parent.h - ((stepNum - 9) / 3) * 3;
		}

		// For steps 1-3 with ~0 APCA target, use Radix lightness directly
		// Binary search doesn't work well for near-zero targets
		let lightness: number;
		if (targetApca < 5) {
			lightness = RADIX_LIGHTNESS_TARGETS[i];
		} else if (stepNum === anchorStep) {
			// Anchor step uses parent lightness
			lightness = parent.l;
		} else {
			// Binary search for lightness that achieves target APCA
			lightness = findLightnessForAPCA(targetApca, chroma, hue, RADIX_LIGHTNESS_TARGETS[i]);
		}

		const oklch = clampOklch({ l: lightness, c: chroma, h: hue });
		const hex = toHex(oklch);
		const apca = Math.abs(calcAPCA(hex, WHITE));

		steps.push({
			step: stepNum,
			oklch,
			hex,
			apca,
			targetApca
		});
	}

	return {
		parent: parentColor,
		parentOklch: parent,
		steps
	};
}

/**
 * Binary search to find lightness that achieves target APCA contrast.
 */
function findLightnessForAPCA(
	targetApca: number,
	chroma: number,
	hue: number,
	initialGuess: number
): number {
	let low = 0;
	let high = 1;
	let best = initialGuess;
	let bestDiff = Infinity;

	// Start with initial guess
	let current = initialGuess;

	for (let iteration = 0; iteration < 20; iteration++) {
		const oklch = clampOklch({ l: current, c: chroma, h: hue });
		const hex = toHex(oklch);
		const apca = Math.abs(calcAPCA(hex, WHITE));

		const diff = Math.abs(apca - targetApca);
		if (diff < bestDiff) {
			bestDiff = diff;
			best = current;
		}

		if (diff < TOLERANCE) {
			return current;
		}

		// Adjust search bounds
		// Higher lightness = lower APCA (closer to white)
		if (apca < targetApca) {
			high = current;
		} else {
			low = current;
		}

		current = (low + high) / 2;
	}

	return best;
}

/**
 * Validate a generated scale against APCA targets.
 */
export function validateScale(scale: GeneratedScale): {
	valid: boolean;
	errors: Array<{ step: number; actual: number; target: number; diff: number }>;
} {
	const errors: Array<{ step: number; actual: number; target: number; diff: number }> = [];

	for (const step of scale.steps) {
		const diff = Math.abs(step.apca - step.targetApca);
		if (diff > TOLERANCE && step.targetApca >= 5) {
			// Only flag errors for steps with meaningful targets
			errors.push({
				step: step.step,
				actual: step.apca,
				target: step.targetApca,
				diff
			});
		}
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
