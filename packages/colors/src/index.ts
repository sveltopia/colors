/**
 * @sveltopia/colors
 * Algorithmic color palette generation from brand colors
 */

// Types
export type {
	OklchColor,
	Scale,
	ScaleStep,
	TuningProfile,
	Palette,
	ContrastResult,
	ValidationReport
} from './types.js';

// OKLCH utilities
export { toOklch, toHex, toCss, parseColor, isValidColor, clampOklch } from './utils/oklch.js';

// Baseline hues (extracted from Radix Colors)
export {
	BASELINE_HUES,
	HUE_KEYS,
	HUE_COUNT,
	SNAP_THRESHOLD,
	findClosestHue,
	findClosestHueWithDistance,
	shouldSnapToSlot,
	getHuesSortedByAngle,
	getHuesByCategory
} from './core/hues.js';
export type { HueDefinition } from './core/hues.js';

// Brand analysis
export {
	analyzeColor,
	analyzeBrandColors,
	createDefaultProfile,
	getAnalysisReport
} from './core/analyze.js';
export type { ColorAnalysis } from './core/analyze.js';
