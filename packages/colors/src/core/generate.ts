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
 * APCA targets for neutral/low-chroma hues.
 * Neutrals need HIGHER APCA (darker) than chromatic colors to appear
 * equally prominent. This is because low-chroma colors have less
 * visual weight at the same lightness.
 *
 * Radix neutrals at step 9: APCA ~60-61 (vs ~55 for Orange)
 */
export const RADIX_APCA_TARGETS_NEUTRAL = [
	0.0, // Step 1
	0.0, // Step 2
	0.0, // Step 3
	10.5, // Step 4
	16.5, // Step 5
	24.0, // Step 6
	33.0, // Step 7
	45.0, // Step 8
	60.5, // Step 9: Higher than chromatic (60 vs 57)
	64.0, // Step 10
	73.0, // Step 11
	97.0 // Step 12
];

/**
 * Hues that are considered "neutral" (very low chroma) and need
 * different APCA targets to appear equally prominent.
 */
export const NEUTRAL_HUES = new Set(['gray', 'mauve', 'slate', 'sage', 'olive', 'sand']);

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
 * Radix lightness curves per hue.
 * Extracted directly from Radix Colors light mode scales.
 * Each array contains lightness values for steps 1-12.
 *
 * Key insight: Using Radix curves directly preserves their semantic intent.
 * Different hue families have different curves:
 * - Bright hues (yellow/lime/amber/mint/sky): Non-monotonic (step 9 lighter than 8)
 * - Neutrals: Flatter middle section (steps 6-8 lighter)
 * - Warm reds: Darker at steps 9-10
 */
export const RADIX_LIGHTNESS_CURVES: Record<string, number[]> = {
	// Neutrals
	gray: [0.991, 0.982, 0.955, 0.931, 0.907, 0.885, 0.851, 0.792, 0.643, 0.61, 0.503, 0.244],
	mauve: [0.992, 0.983, 0.956, 0.932, 0.903, 0.873, 0.84, 0.784, 0.646, 0.605, 0.505, 0.245],
	slate: [0.991, 0.983, 0.956, 0.932, 0.906, 0.881, 0.846, 0.786, 0.645, 0.613, 0.502, 0.24],
	sage: [0.992, 0.983, 0.959, 0.935, 0.911, 0.886, 0.852, 0.789, 0.639, 0.605, 0.501, 0.23],
	olive: [0.993, 0.984, 0.957, 0.932, 0.907, 0.883, 0.851, 0.784, 0.64, 0.607, 0.5, 0.236],
	sand: [0.994, 0.982, 0.956, 0.931, 0.905, 0.88, 0.849, 0.784, 0.641, 0.604, 0.498, 0.243],

	// Warm reds/pinks
	tomato: [0.993, 0.984, 0.954, 0.921, 0.889, 0.853, 0.802, 0.741, 0.627, 0.603, 0.566, 0.346],
	red: [0.993, 0.982, 0.955, 0.922, 0.892, 0.857, 0.807, 0.744, 0.626, 0.599, 0.557, 0.339],
	ruby: [0.994, 0.983, 0.954, 0.925, 0.896, 0.858, 0.811, 0.749, 0.628, 0.601, 0.549, 0.341],
	crimson: [0.994, 0.982, 0.954, 0.926, 0.893, 0.854, 0.809, 0.749, 0.634, 0.607, 0.552, 0.341],
	pink: [0.994, 0.983, 0.954, 0.926, 0.893, 0.856, 0.81, 0.751, 0.617, 0.596, 0.558, 0.35],
	plum: [0.993, 0.982, 0.957, 0.929, 0.899, 0.861, 0.813, 0.754, 0.579, 0.552, 0.522, 0.338],
	purple: [0.993, 0.981, 0.959, 0.933, 0.901, 0.859, 0.804, 0.733, 0.556, 0.525, 0.517, 0.322],
	violet: [0.992, 0.983, 0.962, 0.932, 0.904, 0.864, 0.806, 0.73, 0.542, 0.511, 0.508, 0.313],

	// Cool blues
	iris: [0.995, 0.987, 0.968, 0.935, 0.9, 0.856, 0.801, 0.72, 0.54, 0.514, 0.476, 0.314],
	indigo: [0.994, 0.982, 0.961, 0.935, 0.902, 0.862, 0.806, 0.731, 0.544, 0.515, 0.47, 0.313],
	blue: [0.993, 0.982, 0.96, 0.938, 0.905, 0.863, 0.81, 0.734, 0.649, 0.622, 0.556, 0.324],
	cyan: [0.992, 0.979, 0.959, 0.932, 0.9, 0.858, 0.805, 0.728, 0.66, 0.627, 0.547, 0.331],
	teal: [0.994, 0.982, 0.96, 0.934, 0.9, 0.858, 0.796, 0.721, 0.649, 0.619, 0.552, 0.327],
	jade: [0.994, 0.982, 0.961, 0.935, 0.902, 0.862, 0.8, 0.721, 0.642, 0.613, 0.547, 0.325],
	green: [0.994, 0.981, 0.958, 0.934, 0.899, 0.856, 0.796, 0.716, 0.641, 0.611, 0.543, 0.322],
	grass: [0.994, 0.982, 0.96, 0.935, 0.9, 0.856, 0.798, 0.717, 0.651, 0.615, 0.526, 0.327],

	// Bright hues (non-monotonic: step 9 lighter than step 8)
	lime: [0.992, 0.982, 0.959, 0.932, 0.897, 0.853, 0.795, 0.725, 0.887, 0.859, 0.544, 0.354],
	yellow: [0.993, 0.988, 0.974, 0.953, 0.925, 0.881, 0.835, 0.766, 0.918, 0.897, 0.569, 0.358],
	amber: [0.994, 0.986, 0.97, 0.945, 0.918, 0.88, 0.827, 0.758, 0.854, 0.831, 0.571, 0.352],
	orange: [0.992, 0.98, 0.958, 0.92, 0.888, 0.854, 0.806, 0.745, 0.691, 0.662, 0.585, 0.35],
	sky: [0.994, 0.979, 0.96, 0.936, 0.903, 0.86, 0.806, 0.728, 0.861, 0.838, 0.525, 0.351],
	mint: [0.993, 0.981, 0.96, 0.933, 0.9, 0.857, 0.797, 0.722, 0.87, 0.84, 0.512, 0.35],

	// Browns/metals
	brown: [0.995, 0.984, 0.953, 0.925, 0.898, 0.862, 0.815, 0.746, 0.633, 0.599, 0.512, 0.331],
	bronze: [0.992, 0.98, 0.952, 0.926, 0.895, 0.859, 0.817, 0.752, 0.627, 0.604, 0.53, 0.329],
	gold: [0.994, 0.981, 0.954, 0.925, 0.895, 0.859, 0.811, 0.739, 0.620, 0.589, 0.504, 0.332]
};

/**
 * Default chroma multipliers relative to step 9.
 * Used as fallback when no per-hue curve is available.
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

/**
 * Per-hue chroma curves, normalized relative to step 9.
 * Extracted from Radix Colors - each hue has a unique chroma progression.
 *
 * Key insight: Different hue families have very different chroma shapes:
 * - Bright hues (yellow/amber): High chroma ratios even at light steps (0.77-0.84 at step 5)
 * - Purple/violet: Lower chroma ratios at mid-steps (0.29-0.31 at step 5)
 * - Neutrals: Near-zero chroma throughout
 */
export const RADIX_CHROMA_CURVES: Record<string, number[]> = {
	// Neutrals (near-zero chroma, but non-zero for tinted neutrals)
	gray: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0],
	mauve: [0.088, 0.145, 0.321, 0.446, 0.601, 0.689, 0.896, 1.223, 1.0, 1.052, 0.819, 0.694],
	slate: [0.079, 0.158, 0.242, 0.327, 0.412, 0.418, 0.758, 0.764, 1.0, 1.194, 0.861, 0.582],
	sage: [0.243, 0.243, 0.243, 0.243, 0.330, 0.340, 0.340, 0.515, 1.0, 1.165, 0.786, 0.689],
	olive: [0.144, 0.237, 0.347, 0.576, 0.686, 0.695, 0.941, 1.195, 1.0, 1.127, 0.949, 0.686],
	sand: [0.127, 0.127, 0.167, 0.284, 0.343, 0.451, 0.578, 0.931, 1.0, 1.020, 0.765, 0.745],

	// Warm reds/pinks
	tomato: [0.017, 0.039, 0.111, 0.212, 0.305, 0.398, 0.489, 0.612, 1.0, 1.006, 1.022, 0.412],
	red: [0.017, 0.044, 0.107, 0.207, 0.293, 0.383, 0.459, 0.586, 1.0, 1.007, 1.021, 0.563],
	ruby: [0.017, 0.045, 0.113, 0.202, 0.288, 0.341, 0.410, 0.524, 1.0, 1.009, 1.018, 0.562],
	crimson: [0.016, 0.037, 0.120, 0.188, 0.249, 0.307, 0.366, 0.470, 1.0, 0.989, 0.973, 0.530],
	pink: [0.020, 0.044, 0.133, 0.203, 0.266, 0.323, 0.400, 0.516, 1.0, 0.999, 0.997, 0.621],
	plum: [0.024, 0.054, 0.145, 0.233, 0.308, 0.378, 0.469, 0.580, 1.0, 0.965, 0.920, 0.666],
	purple: [0.019, 0.055, 0.136, 0.211, 0.292, 0.393, 0.502, 0.670, 1.0, 0.960, 0.948, 0.602],
	violet: [0.016, 0.053, 0.107, 0.207, 0.292, 0.403, 0.504, 0.667, 1.0, 0.992, 0.888, 0.545],

	// Cool blues
	iris: [0.014, 0.036, 0.087, 0.168, 0.274, 0.323, 0.398, 0.533, 1.0, 1.007, 1.015, 0.537],
	indigo: [0.007, 0.043, 0.089, 0.162, 0.247, 0.354, 0.458, 0.588, 1.0, 0.932, 0.827, 0.449],
	blue: [0.018, 0.048, 0.104, 0.181, 0.266, 0.353, 0.460, 0.629, 1.0, 0.949, 0.840, 0.500],
	cyan: [0.029, 0.071, 0.216, 0.336, 0.443, 0.542, 0.616, 0.905, 1.0, 0.939, 0.794, 0.433],
	teal: [0.039, 0.077, 0.228, 0.370, 0.467, 0.576, 0.669, 0.857, 1.0, 0.963, 0.889, 0.446],
	jade: [0.030, 0.079, 0.193, 0.289, 0.405, 0.536, 0.663, 0.892, 1.0, 0.953, 0.855, 0.353],
	green: [0.031, 0.074, 0.168, 0.280, 0.368, 0.439, 0.674, 0.852, 1.0, 0.953, 0.840, 0.357],
	grass: [0.034, 0.069, 0.150, 0.260, 0.354, 0.484, 0.642, 0.891, 1.0, 0.969, 0.881, 0.361],

	// Bright hues (high chroma at light steps)
	lime: [0.023, 0.054, 0.245, 0.391, 0.501, 0.567, 0.639, 0.773, 1.0, 1.076, 0.638, 0.328],
	yellow: [0.029, 0.135, 0.456, 0.636, 0.767, 0.729, 0.655, 0.746, 1.0, 1.007, 0.649, 0.251],
	amber: [0.018, 0.151, 0.435, 0.658, 0.843, 0.784, 0.779, 0.892, 1.0, 1.068, 0.821, 0.309],
	orange: [0.013, 0.083, 0.194, 0.341, 0.458, 0.559, 0.588, 0.692, 1.0, 1.019, 0.913, 0.359],
	sky: [0.054, 0.100, 0.234, 0.342, 0.455, 0.556, 0.697, 0.936, 1.0, 1.011, 1.051, 0.557],
	mint: [0.054, 0.098, 0.306, 0.477, 0.612, 0.721, 0.842, 1.064, 1.0, 0.989, 0.956, 0.505],

	// Browns/metals
	brown: [0.022, 0.065, 0.163, 0.252, 0.364, 0.502, 0.685, 0.912, 1.0, 0.920, 0.741, 0.231],
	bronze: [0.024, 0.152, 0.230, 0.300, 0.380, 0.459, 0.554, 0.802, 1.0, 1.039, 1.009, 0.639],
	gold: [0.027, 0.189, 0.247, 0.312, 0.373, 0.502, 0.661, 0.860, 1.0, 0.938, 0.803, 0.385]
};

/**
 * Radix reference chromas at step 9 (the "hero" step).
 * These are the actual chroma values from Radix Colors.
 * Used as the baseline for synthetic parent colors.
 *
 * Key insight: This completes our "trust Radix" approach:
 * - Lightness curves: per-hue from Radix
 * - Chroma curves: per-hue ratios from Radix
 * - Reference chromas: step 9 values from Radix
 * Brand tuning applies as deltas on top of these accurate baselines.
 */
export const RADIX_REFERENCE_CHROMAS: Record<string, number> = {
	// Neutrals (very low chroma)
	gray: 0.0,
	mauve: 0.0193,
	slate: 0.0165,
	sage: 0.0103,
	olive: 0.0118,
	sand: 0.0102,

	// Warm reds/pinks
	tomato: 0.1936,
	red: 0.1933,
	ruby: 0.1949,
	crimson: 0.2130,
	pink: 0.2076,
	plum: 0.1877,
	purple: 0.1829,
	violet: 0.1790,

	// Cool blues
	iris: 0.1841,
	indigo: 0.1910,
	blue: 0.1930,
	cyan: 0.1217,
	teal: 0.1136,
	jade: 0.1150,
	green: 0.1329,
	grass: 0.1468,

	// Bright hues
	lime: 0.1747,
	yellow: 0.1838,
	amber: 0.1572,
	orange: 0.1909,
	sky: 0.1027,
	mint: 0.0999,

	// Browns/metals
	brown: 0.0785,
	bronze: 0.0460,
	gold: 0.0492
};

/**
 * Radix hue curves per hue.
 * Each array contains hue angles (in degrees) for steps 1-12.
 *
 * Key insight: Radix shifts hue across the scale!
 * - Orange: 80° at light steps → 41° at dark steps (gets redder/warmer)
 * - Gold: 106° at step 1 → 73° at step 9 (yellow → orange)
 * - This creates natural "warmth" as colors darken.
 *
 * Brand tuning applies hueShift as a delta on top of these curves.
 */
export const RADIX_HUE_CURVES: Record<string, number[]> = {
	// Neutrals (hue varies due to low chroma - extracted from actual Radix colors)
	gray: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
	mauve: [325.6, 308.4, 317.8, 312.3, 311.2, 303.1, 299.8, 293.0, 292.9, 293.5, 295.0, 298.5],
	slate: [286.4, 286.4, 286.3, 286.3, 277.2, 286.2, 280.4, 277.8, 277.7, 277.7, 264.4, 248.2],
	sage: [165.1, 165.1, 174.5, 174.5, 157.2, 174.5, 165.0, 165.0, 171.6, 171.6, 174.1, 167.6],
	olive: [145.6, 145.6, 145.5, 145.5, 145.5, 145.5, 145.5, 137.8, 136.6, 136.6, 140.5, 139.4],
	sand: [106.4, 106.4, 67.8, 84.6, 91.4, 91.5, 95.1, 98.9, 106.7, 106.7, 106.7, 95.4],

	// Warm reds/pinks
	tomato: [17.2, 27.2, 31.8, 34.8, 32.6, 32.6, 32.2, 32.3, 33.3, 33.2, 32.7, 30.4],
	red: [17.2, 17.3, 13.9, 16.0, 16.9, 17.7, 18.3, 18.8, 23.0, 24.0, 25.2, 16.6],
	ruby: [354.7, 8.5, 7.2, 8.1, 7.3, 8.0, 7.2, 6.5, 13.2, 13.5, 13.9, 10.0],
	crimson: [354.7, 357.8, 356.3, 356.4, 355.8, 355.2, 354.9, 354.0, 1.3, 2.2, 4.5, 356.9],
	pink: [337.3, 341.8, 342.3, 340.6, 340.4, 340.7, 341.9, 341.5, 346.0, 346.7, 347.3, 345.4],
	plum: [314.8, 325.7, 325.8, 324.8, 325.1, 323.9, 323.2, 321.2, 322.1, 322.2, 321.9, 321.4],
	purple: [325.6, 311.2, 311.7, 312.7, 311.2, 311.1, 309.7, 308.0, 305.9, 305.4, 305.9, 303.8],
	violet: [308.4, 299.2, 299.1, 297.5, 295.0, 293.7, 293.6, 292.6, 288.0, 287.7, 288.6, 286.6],

	// Cool blues
	iris: [286.4, 286.3, 286.1, 285.8, 285.3, 285.1, 284.6, 285.0, 278.3, 277.7, 276.6, 277.6],
	indigo: [286.4, 271.3, 267.8, 269.8, 269.6, 271.1, 271.4, 270.4, 267.0, 267.1, 267.4, 268.6],
	blue: [247.9, 242.8, 238.7, 234.8, 240.3, 243.3, 243.1, 243.1, 251.8, 251.7, 252.2, 258.8],
	cyan: [219.5, 205.9, 202.6, 206.0, 206.4, 208.1, 210.0, 211.9, 221.7, 221.5, 220.8, 218.8],
	teal: [179.7, 179.6, 181.9, 179.8, 181.5, 180.2, 183.0, 183.3, 182.0, 181.3, 178.8, 185.0],
	jade: [174.5, 161.4, 160.2, 165.1, 165.1, 165.6, 169.9, 173.1, 170.7, 170.9, 170.0, 170.1],
	green: [157.2, 155.1, 155.9, 156.4, 157.2, 160.6, 154.5, 160.3, 157.7, 158.2, 159.5, 164.5],
	grass: [145.5, 145.5, 145.4, 146.5, 146.0, 146.8, 147.3, 148.1, 147.4, 147.2, 147.2, 148.6],

	// Bright hues (significant hue shifts)
	lime: [121.6, 119.6, 118.6, 120.2, 122.1, 123.3, 125.4, 128.2, 126.1, 126.7, 128.6, 121.0],
	yellow: [106.5, 101.9, 104.2, 102.1, 98.1, 95.3, 92.8, 89.7, 100.9, 97.4, 76.8, 86.9],
	amber: [84.6, 99.1, 100.4, 97.9, 98.2, 93.4, 86.7, 76.7, 84.1, 80.8, 63.9, 54.2],
	orange: [48.7, 73.7, 79.1, 74.4, 71.3, 66.0, 60.0, 54.7, 45.0, 43.5, 42.7, 40.8],
	sky: [211.0, 219.6, 219.7, 219.2, 220.6, 223.6, 225.5, 228.4, 217.8, 219.4, 232.5, 242.4],
	mint: [183.0, 181.4, 178.9, 178.3, 178.1, 178.2, 178.2, 177.8, 178.0, 178.4, 175.6, 181.3],

	// Browns/metals
	brown: [67.8, 67.8, 63.9, 65.1, 65.7, 66.0, 64.2, 62.1, 61.0, 60.6, 55.5, 45.9],
	bronze: [17.2, 39.5, 39.4, 46.2, 44.8, 48.5, 53.6, 54.6, 44.2, 47.2, 39.2, 35.2],
	gold: [106.4, 100.0, 96.4, 90.2, 89.4, 85.8, 84.6, 79.4, 77.7, 78.6, 78.3, 80.5]
};

const WHITE = '#ffffff';
const TOLERANCE = 2; // APCA tolerance in Lc units

export interface GenerateScaleOptions {
	/** Parent/anchor color hex */
	parentColor: string;
	/** Which step to anchor the parent color at (default: 9) */
	anchorStep?: number;
	/** Hue key for per-hue curve lookup (e.g., 'yellow', 'lime') */
	hueKey?: string;
	/** Override APCA targets */
	apcaTargets?: number[];
	/** Override chroma curve */
	chromaCurve?: number[];
	/**
	 * If true, use Radix lightness curve for ALL steps (including anchor step).
	 * Set this for non-anchored hues where parent is synthetic.
	 * If false (default), anchor step uses parent's actual lightness.
	 */
	useFullCurve?: boolean;
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
	const { parentColor, anchorStep = 9, hueKey, chromaCurve } = options;

	const parent = toOklch(parentColor);
	if (!parent) {
		throw new Error(`Invalid parent color: ${parentColor}`);
	}

	// Get Radix lightness curve for this hue (if available)
	// Using per-hue curves preserves Radix's semantic intent:
	// - Bright hues have non-monotonic curves (step 9 lighter than 8)
	// - Neutrals have flatter middle sections
	// - Warm reds are darker at steps 9-10
	const hueLightnessCurve = hueKey ? RADIX_LIGHTNESS_CURVES[hueKey] : null;
	const lightnessCurve = hueLightnessCurve || RADIX_LIGHTNESS_TARGETS;

	// Get per-hue chroma curve - this is critical for correct saturation progression
	// Different hue families have very different chroma shapes:
	// - Bright hues (yellow/amber): High ratios at light steps (0.77-0.84 at step 5)
	// - Purple/violet: Lower ratios at mid-steps (0.29-0.31 at step 5)
	const hueChromaCurve = hueKey ? RADIX_CHROMA_CURVES[hueKey] : null;
	const effectiveChromaCurve = chromaCurve || hueChromaCurve || CHROMA_CURVE;

	// When anchoring at a different step, we need to adjust the chroma curve
	// so the parent's full chroma is at the anchor step
	const anchorChromaMultiplier = effectiveChromaCurve[anchorStep - 1];
	const adjustedChromaCurve = effectiveChromaCurve.map((c) => c / anchorChromaMultiplier);

	// Get per-hue hue curve for natural hue shift across the scale
	// This is critical for accurate reproduction of Radix's semantic intent:
	// - Orange shifts 80° → 41° (gets warmer/redder as it darkens)
	// - Gold shifts 106° → 73° (yellow → orange as it darkens)
	// - Yellow shifts 101° → 77° (more orange in darks)
	const hueHueCurve = hueKey ? RADIX_HUE_CURVES[hueKey] : null;

	// Calculate hue offset: difference between parent hue and Radix anchor step hue
	// This offset preserves brand hue at anchor step while following Radix curve shape.
	// IMPORTANT: Handle wraparound at 0°/360° boundary (e.g., 359° vs 1° should be -2°, not +358°)
	const radixAnchorHue = hueHueCurve ? hueHueCurve[anchorStep - 1] : parent.h;
	let hueOffset = parent.h - radixAnchorHue;
	if (hueOffset > 180) hueOffset -= 360;
	if (hueOffset < -180) hueOffset += 360;

	// Calculate max distance from anchor step (for dampening calculation)
	const maxDistanceFromAnchor = Math.max(anchorStep - 1, 12 - anchorStep);

	const steps: GeneratedScaleStep[] = [];

	// Calculate chroma departure for dampening
	// If parent has significantly more chroma than Radix reference, we dampen it at edges
	const radixRefChroma = RADIX_REFERENCE_CHROMAS[hueKey] ?? parent.c;
	const chromaDeparture = parent.c / radixRefChroma; // e.g., 1.42 means +42% more chroma

	for (let i = 0; i < 12; i++) {
		const stepNum = i + 1;

		// Calculate dampening factor (same as for hue and chroma)
		// minDampening controls how much brand influence remains at edges (step 1 or 12)
		// Lower values = edges closer to pure Radix, higher = more brand propagation
		const distanceFromAnchor = Math.abs(stepNum - anchorStep);
		const normalizedDistance = maxDistanceFromAnchor > 0 ? distanceFromAnchor / maxDistanceFromAnchor : 0;
		const minDampening = 0.3;
		const dampeningFactor = 1.0 - Math.pow(normalizedDistance, 1.5) * (1.0 - minDampening);

		// Apply chroma with dampening toward Radix reference at edges
		// At anchor: use full parent chroma (chromaDeparture)
		// At edges: blend toward 1.0 (Radix reference level)
		const dampenedChromaDeparture = 1.0 + (chromaDeparture - 1.0) * dampeningFactor;
		const chroma = radixRefChroma * dampenedChromaDeparture * adjustedChromaCurve[i];

		// Calculate hue for this step using Radix curve + dampened brand offset
		// Dampening prevents large brand hue departures from over-propagating to edges.
		// At anchor step: 100% of brand offset applied
		// At edges (step 1 or 12): reduced offset (closer to pure Radix curve)
		let hue: number;
		if (hueHueCurve) {
			// Reuse dampening factor calculated above for chroma
			const dampenedOffset = hueOffset * dampeningFactor;
			hue = (hueHueCurve[i] + dampenedOffset + 360) % 360;
		} else {
			// Fallback: constant parent hue with slight drift for dark steps
			hue = parent.h;
			if (stepNum >= 10) {
				hue = parent.h - ((stepNum - 9) / 3) * 3;
			}
		}

		// Use Radix lightness curve directly - no APCA binary search needed
		// For brand anchors: use parent's actual lightness at anchor step
		// For synthetic parents (useFullCurve): use Radix curve for ALL steps
		const useParentLightness = !options.useFullCurve && stepNum === anchorStep;
		const lightness = useParentLightness ? parent.l : lightnessCurve[i];

		const oklch = clampOklch({ l: lightness, c: chroma, h: hue });
		const hex = toHex(oklch);
		const apca = Math.abs(calcAPCA(hex, WHITE));

		// Note: targetApca is now informational only (showing what APCA we achieve)
		// We no longer target APCA, we target Radix's lightness curve
		steps.push({
			step: stepNum,
			oklch,
			hex,
			apca,
			targetApca: 0 // Deprecated - we use lightness curves now
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
