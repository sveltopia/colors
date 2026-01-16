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
 * Normalize calcAPCA return value to number (it can return string or number)
 */
function normalizeApca(value: string | number): number {
	return typeof value === 'string' ? parseFloat(value) : value;
}

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
	gray: [0.991069, 0.982118, 0.955140, 0.930999, 0.906701, 0.885305, 0.851419, 0.792074, 0.643409, 0.609986, 0.503229, 0.243535],
	mauve: [0.992108, 0.983440, 0.955575, 0.931726, 0.908803, 0.886930, 0.853669, 0.794512, 0.646025, 0.612304, 0.504979, 0.244506],
	slate: [0.991348, 0.982679, 0.955990, 0.932143, 0.910418, 0.887350, 0.853006, 0.793843, 0.645314, 0.610750, 0.502489, 0.241130],
	sage: [0.992259, 0.980323, 0.955583, 0.931445, 0.909912, 0.885758, 0.850813, 0.791459, 0.639205, 0.605737, 0.500844, 0.239603],
	olive: [0.993013, 0.983032, 0.956061, 0.931927, 0.909630, 0.885189, 0.851302, 0.791668, 0.640437, 0.606982, 0.500421, 0.241747],
	sand: [0.993770, 0.981839, 0.955627, 0.931209, 0.909678, 0.885236, 0.851067, 0.791147, 0.641298, 0.604779, 0.498088, 0.243140],
	tomato: [0.993357, 0.984248, 0.954111, 0.921230, 0.888968, 0.853199, 0.802045, 0.740916, 0.627076, 0.603456, 0.566469, 0.345923],
	red: [0.993357, 0.982320, 0.955471, 0.921722, 0.892041, 0.856904, 0.806988, 0.744337, 0.625565, 0.599021, 0.557003, 0.338991],
	ruby: [0.993635, 0.982597, 0.953842, 0.924958, 0.896038, 0.858201, 0.810669, 0.748883, 0.628361, 0.601203, 0.548907, 0.341048],
	crimson: [0.993635, 0.982094, 0.953612, 0.925768, 0.893388, 0.854098, 0.808691, 0.749336, 0.634053, 0.607453, 0.552180, 0.340907],
	pink: [0.993915, 0.982655, 0.954218, 0.925504, 0.892741, 0.855768, 0.809740, 0.751304, 0.616784, 0.595526, 0.557538, 0.349770],
	plum: [0.993431, 0.982446, 0.957325, 0.928591, 0.898527, 0.860633, 0.809296, 0.741342, 0.578737, 0.551948, 0.521556, 0.337672],
	purple: [0.993150, 0.981187, 0.958846, 0.933267, 0.901159, 0.859175, 0.804274, 0.733054, 0.555623, 0.524636, 0.516833, 0.322222],
	violet: [0.992388, 0.982640, 0.962275, 0.932472, 0.903512, 0.864181, 0.806227, 0.729729, 0.541680, 0.510882, 0.507832, 0.312809],
	iris: [0.994608, 0.981119, 0.961159, 0.934430, 0.903922, 0.863367, 0.809235, 0.729281, 0.540310, 0.508747, 0.511108, 0.314275],
	indigo: [0.994327, 0.982307, 0.960859, 0.934611, 0.901944, 0.861955, 0.806155, 0.730853, 0.543750, 0.510646, 0.509214, 0.312637],
	blue: [0.993098, 0.982018, 0.959677, 0.938067, 0.905075, 0.863266, 0.809760, 0.733610, 0.649294, 0.622299, 0.555750, 0.323963],
	cyan: [0.992066, 0.979396, 0.958571, 0.932066, 0.900376, 0.857871, 0.804487, 0.727567, 0.660042, 0.626991, 0.546966, 0.331430],
	teal: [0.993737, 0.981540, 0.960252, 0.933987, 0.899502, 0.855785, 0.796358, 0.721436, 0.649077, 0.619317, 0.552073, 0.327205],
	jade: [0.994486, 0.981724, 0.960803, 0.934609, 0.901858, 0.859508, 0.799680, 0.721390, 0.642150, 0.613040, 0.547451, 0.325413],
	green: [0.994208, 0.981448, 0.958247, 0.933533, 0.898801, 0.855821, 0.798152, 0.715586, 0.640597, 0.611472, 0.543464, 0.321984],
	grass: [0.993932, 0.981918, 0.959885, 0.935277, 0.900379, 0.856259, 0.797783, 0.717359, 0.651236, 0.615233, 0.526232, 0.326585],
	bronze: [0.991829, 0.980206, 0.952302, 0.926180, 0.894889, 0.860871, 0.812169, 0.742276, 0.627428, 0.587836, 0.510854, 0.329494],
	gold: [0.993770, 0.980960, 0.954210, 0.925040, 0.894865, 0.859396, 0.810907, 0.739024, 0.620440, 0.588716, 0.504233, 0.332007],
	brown: [0.994530, 0.983583, 0.953433, 0.925388, 0.897820, 0.861621, 0.815448, 0.745913, 0.632852, 0.597401, 0.512201, 0.331363],
	orange: [0.992315, 0.979622, 0.958319, 0.919963, 0.887886, 0.853723, 0.805855, 0.744999, 0.690796, 0.662359, 0.585488, 0.349931],
	amber: [0.994254, 0.985594, 0.969544, 0.944669, 0.917991, 0.880406, 0.827268, 0.757680, 0.853697, 0.831295, 0.570648, 0.352189],
	yellow: [0.992945, 0.987551, 0.973526, 0.953400, 0.924677, 0.881083, 0.835081, 0.765655, 0.917579, 0.896699, 0.569122, 0.357818],
	lime: [0.992461, 0.981663, 0.958778, 0.931909, 0.897330, 0.853151, 0.794815, 0.725043, 0.887418, 0.858801, 0.544400, 0.353704],
	mint: [0.992992, 0.980803, 0.959936, 0.933222, 0.900203, 0.856821, 0.797281, 0.722136, 0.869608, 0.840146, 0.511713, 0.349650],
	sky: [0.993552, 0.979231, 0.959821, 0.935836, 0.903332, 0.860360, 0.806253, 0.728303, 0.861068, 0.837756, 0.525465, 0.350676],
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
	gray: [0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000, 0.000000],
	mauve: [0.087242, 0.147068, 0.320679, 0.383761, 0.535991, 0.586020, 0.729346, 0.948749, 1.000000, 0.936440, 0.821594, 0.697725],
	slate: [0.080090, 0.160590, 0.242644, 0.325707, 0.416052, 0.577758, 0.671809, 0.948146, 1.000000, 0.939430, 0.827830, 0.588941],
	sage: [0.240460, 0.241186, 0.334905, 0.337033, 0.406198, 0.341254, 0.499177, 0.508185, 1.000000, 1.012939, 0.781791, 1.129645],
	olive: [0.142511, 0.285715, 0.287707, 0.289549, 0.436908, 0.439888, 0.444193, 0.549048, 1.000000, 1.013416, 0.951114, 0.937063],
	sand: [0.128618, 0.129006, 0.167969, 0.283025, 0.409332, 0.412105, 0.545903, 0.823016, 1.000000, 0.870157, 0.760952, 0.739092],
	tomato: [0.016494, 0.039403, 0.110869, 0.211767, 0.304836, 0.397720, 0.488464, 0.611758, 1.000000, 1.005999, 1.021620, 0.412139],
	red: [0.016515, 0.044355, 0.107158, 0.207459, 0.293501, 0.383118, 0.459248, 0.585768, 1.000000, 1.006805, 1.021154, 0.563299],
	ruby: [0.017631, 0.044414, 0.113392, 0.201831, 0.288394, 0.340638, 0.410103, 0.523879, 1.000000, 1.009204, 1.018764, 0.562166],
	crimson: [0.016133, 0.037134, 0.120068, 0.188494, 0.248943, 0.306509, 0.366415, 0.470489, 1.000000, 0.988834, 0.973369, 0.530294],
	pink: [0.019787, 0.043813, 0.132942, 0.202893, 0.266352, 0.323269, 0.399693, 0.516057, 1.000000, 0.999066, 0.996485, 0.620951],
	plum: [0.023759, 0.053880, 0.144660, 0.233204, 0.308317, 0.378041, 0.487565, 0.640286, 1.000000, 0.965255, 0.919715, 0.666586],
	purple: [0.018377, 0.055391, 0.136000, 0.211084, 0.291707, 0.392763, 0.501658, 0.669864, 1.000000, 0.959390, 0.947570, 0.602527],
	violet: [0.015793, 0.052886, 0.106441, 0.206397, 0.291348, 0.402595, 0.503999, 0.666319, 1.000000, 0.991239, 0.887673, 0.544533],
	iris: [0.014308, 0.050335, 0.094451, 0.175862, 0.259575, 0.375743, 0.473817, 0.642206, 1.000000, 1.015112, 0.944347, 0.536819],
	indigo: [0.006894, 0.043203, 0.088792, 0.162496, 0.246827, 0.353516, 0.458277, 0.588083, 1.000000, 1.022817, 0.903067, 0.449289],
	blue: [0.017639, 0.047856, 0.103921, 0.181100, 0.265728, 0.353312, 0.459356, 0.628701, 1.000000, 0.948610, 0.840341, 0.499283],
	cyan: [0.028390, 0.070474, 0.215780, 0.335811, 0.443186, 0.541786, 0.670562, 0.905643, 1.000000, 0.939191, 0.793994, 0.432867],
	teal: [0.038887, 0.077785, 0.228322, 0.370664, 0.467619, 0.566048, 0.669470, 0.857214, 1.000000, 0.963420, 0.889366, 0.446200],
	jade: [0.029759, 0.078725, 0.193377, 0.295120, 0.405000, 0.522619, 0.663425, 0.892026, 1.000000, 0.953028, 0.854521, 0.352963],
	green: [0.030867, 0.074323, 0.167629, 0.279835, 0.368326, 0.482069, 0.625884, 0.852727, 1.000000, 0.953062, 0.839860, 0.357493],
	grass: [0.034328, 0.068841, 0.149845, 0.259230, 0.354250, 0.483400, 0.642530, 0.891192, 1.000000, 0.968998, 0.881611, 0.361208],
	bronze: [0.023131, 0.151872, 0.230011, 0.300658, 0.381691, 0.501000, 0.635699, 0.844495, 1.000000, 0.992010, 0.952457, 0.639066],
	gold: [0.026772, 0.189002, 0.246813, 0.311778, 0.372767, 0.501885, 0.661277, 0.859980, 1.000000, 0.937538, 0.803380, 0.384994],
	brown: [0.021680, 0.065212, 0.162467, 0.251748, 0.364368, 0.501705, 0.685281, 0.911773, 1.000000, 0.922465, 0.741816, 0.230953],
	orange: [0.013182, 0.082612, 0.194444, 0.340976, 0.458356, 0.559553, 0.588368, 0.692601, 1.000000, 1.019108, 0.912786, 0.358851],
	amber: [0.018123, 0.151297, 0.435199, 0.657971, 0.843714, 0.784102, 0.778765, 0.892314, 1.000000, 1.068122, 0.821444, 0.309357],
	yellow: [0.028618, 0.135722, 0.455874, 0.636201, 0.767050, 0.729035, 0.655211, 0.746379, 1.000000, 1.007025, 0.648398, 0.250619],
	lime: [0.023324, 0.054051, 0.245006, 0.391050, 0.501297, 0.567446, 0.638722, 0.773045, 1.000000, 1.075183, 0.637502, 0.327827],
	mint: [0.054367, 0.098504, 0.306084, 0.476476, 0.611248, 0.720890, 0.842164, 1.064074, 1.000000, 0.989092, 0.956143, 0.505671],
	sky: [0.053168, 0.100755, 0.233734, 0.341817, 0.454487, 0.556331, 0.697185, 0.935945, 1.000000, 1.010516, 1.050689, 0.556592],
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
	gray: 0.000000,
	mauve: 0.019269,
	slate: 0.016454,
	sage: 0.010322,
	olive: 0.011791,
	sand: 0.010232,
	tomato: 0.193584,
	red: 0.193340,
	ruby: 0.194866,
	crimson: 0.212961,
	pink: 0.207608,
	plum: 0.187722,
	purple: 0.182910,
	violet: 0.179028,
	iris: 0.184124,
	indigo: 0.191015,
	blue: 0.193040,
	cyan: 0.121716,
	teal: 0.113572,
	jade: 0.115025,
	green: 0.132875,
	grass: 0.146785,
	bronze: 0.045953,
	gold: 0.049157,
	brown: 0.078487,
	orange: 0.190911,
	amber: 0.157207,
	yellow: 0.183771,
	lime: 0.174730,
	mint: 0.099913,
	sky: 0.102721,
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
	gray: [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
	mauve: [325.59, 308.43, 317.75, 312.30, 311.17, 303.09, 299.76, 293.05, 292.92, 293.51, 295.00, 298.46],
	slate: [286.38, 286.35, 286.32, 286.30, 277.16, 286.20, 280.45, 277.79, 277.70, 272.56, 264.44, 248.23],
	sage: [165.08, 165.08, 174.48, 174.48, 157.17, 174.47, 164.98, 164.97, 171.61, 171.57, 174.11, 167.56],
	olive: [145.56, 145.55, 145.55, 145.55, 145.53, 145.53, 145.53, 137.78, 136.58, 136.59, 140.50, 139.43],
	sand: [106.42, 106.42, 67.80, 84.56, 91.45, 91.45, 95.11, 98.91, 106.68, 106.66, 106.68, 95.37],
	tomato: [17.21, 27.23, 31.78, 34.76, 32.56, 32.63, 32.19, 32.25, 33.34, 33.22, 32.73, 30.39],
	red: [17.21, 17.30, 13.86, 16.00, 16.93, 17.68, 18.32, 18.75, 23.03, 24.04, 25.17, 16.60],
	ruby: [354.69, 8.54, 7.18, 8.14, 7.27, 8.00, 7.15, 6.50, 13.15, 13.52, 13.90, 10.00],
	crimson: [354.69, 357.79, 356.28, 356.41, 355.77, 355.16, 354.94, 354.02, 1.28, 2.23, 4.49, 356.94],
	pink: [337.35, 341.80, 342.25, 340.62, 340.39, 340.72, 341.92, 341.48, 346.00, 346.67, 347.32, 345.36],
	plum: [314.81, 325.65, 325.79, 324.76, 325.14, 323.89, 323.31, 322.24, 322.11, 322.24, 321.89, 321.42],
	purple: [325.60, 311.18, 311.71, 312.65, 311.25, 311.05, 309.69, 307.97, 305.86, 305.39, 305.88, 303.84],
	violet: [308.43, 299.24, 299.07, 297.54, 294.99, 293.65, 293.59, 292.60, 288.03, 287.68, 288.64, 286.57],
	iris: [286.35, 286.23, 282.54, 283.85, 282.81, 283.05, 282.83, 281.44, 278.28, 277.45, 279.84, 277.56],
	indigo: [286.38, 271.33, 267.79, 269.82, 269.62, 271.09, 271.41, 270.43, 267.01, 266.58, 267.17, 268.60],
	blue: [247.86, 242.83, 238.66, 234.80, 240.31, 243.32, 243.05, 243.09, 251.78, 251.70, 252.19, 258.82],
	cyan: [219.53, 205.90, 202.56, 205.98, 206.45, 208.14, 209.70, 211.93, 221.74, 221.50, 220.75, 218.83],
	teal: [179.74, 179.61, 181.86, 179.80, 181.47, 181.17, 182.97, 183.28, 181.96, 181.30, 178.79, 184.99],
	jade: [174.49, 161.36, 160.23, 163.22, 165.05, 166.24, 169.89, 173.12, 170.73, 170.85, 170.05, 170.08],
	green: [157.18, 155.10, 155.93, 156.43, 157.25, 158.20, 159.15, 160.28, 157.68, 158.23, 159.50, 164.53],
	grass: [145.54, 145.50, 145.40, 146.47, 145.99, 146.77, 147.26, 148.14, 147.39, 147.19, 147.20, 148.59],
	bronze: [17.18, 39.46, 39.44, 46.22, 44.79, 45.58, 42.62, 41.17, 44.16, 40.91, 38.63, 35.24],
	gold: [106.42, 99.98, 96.42, 90.24, 89.37, 85.79, 84.58, 79.36, 77.70, 78.62, 78.26, 80.51],
	brown: [67.80, 67.76, 63.92, 65.13, 65.74, 66.01, 64.15, 62.10, 60.98, 59.14, 55.45, 45.86],
	orange: [48.72, 73.68, 79.11, 74.37, 71.31, 66.02, 59.96, 54.68, 45.02, 43.46, 42.74, 40.83],
	amber: [84.56, 99.10, 100.39, 97.91, 98.23, 93.39, 86.69, 76.72, 84.13, 80.85, 63.94, 54.17],
	yellow: [106.49, 101.95, 104.20, 102.06, 98.07, 95.34, 92.84, 89.74, 100.94, 97.44, 76.81, 86.88],
	lime: [121.56, 119.57, 118.62, 120.20, 122.06, 123.29, 125.43, 128.23, 126.09, 126.75, 128.60, 120.98],
	mint: [183.03, 181.42, 178.93, 178.33, 178.06, 178.17, 178.23, 177.84, 177.98, 178.42, 175.60, 181.31],
	sky: [211.04, 219.59, 219.72, 219.19, 220.56, 223.65, 225.48, 228.43, 217.80, 219.37, 232.55, 242.37],
};

// ===== DARK MODE CURVES =====
// Extracted from Radix dark mode values

/**
 * Radix dark mode lightness curves per hue.
 * Dark mode inverts the lightness progression:
 * - Step 1-2: Dark backgrounds (L ~0.17-0.21)
 * - Step 9-10: Hero colors (similar saturation)
 * - Step 11-12: Light text on dark (L ~0.77-0.95)
 */
export const RADIX_LIGHTNESS_CURVES_DARK: Record<string, number[]> = {
	gray: [0.177638, 0.213423, 0.251965, 0.285017, 0.313167, 0.348460, 0.401667, 0.489056, 0.538237, 0.582916, 0.769931, 0.949119],
	mauve: [0.179702, 0.215386, 0.254258, 0.284631, 0.313182, 0.349863, 0.402409, 0.491740, 0.540301, 0.584920, 0.769077, 0.949685],
	slate: [0.178529, 0.213175, 0.252140, 0.283193, 0.311775, 0.346552, 0.399281, 0.489318, 0.537004, 0.582514, 0.768560, 0.948921],
	sage: [0.179529, 0.210840, 0.249477, 0.281606, 0.309826, 0.347774, 0.400084, 0.489032, 0.532655, 0.578495, 0.765879, 0.947309],
	olive: [0.180235, 0.211523, 0.250137, 0.281863, 0.310080, 0.345104, 0.397157, 0.488611, 0.535190, 0.581021, 0.765994, 0.947029],
	sand: [0.177218, 0.213020, 0.251577, 0.284274, 0.312086, 0.348400, 0.401273, 0.491910, 0.537547, 0.581636, 0.768715, 0.945760],
	tomato: [0.186622, 0.207826, 0.254740, 0.290235, 0.331097, 0.380006, 0.446356, 0.538064, 0.627076, 0.664292, 0.779355, 0.898673],
	red: [0.188029, 0.204575, 0.251050, 0.289285, 0.332115, 0.381440, 0.450181, 0.543563, 0.625565, 0.663385, 0.780414, 0.902365],
	ruby: [0.188831, 0.207921, 0.254120, 0.292542, 0.334134, 0.381974, 0.448242, 0.543185, 0.628361, 0.663853, 0.781411, 0.905549],
	crimson: [0.189256, 0.206173, 0.255016, 0.293183, 0.332040, 0.382650, 0.450062, 0.543106, 0.634053, 0.663127, 0.782477, 0.908533],
	pink: [0.190625, 0.207632, 0.261612, 0.298650, 0.338008, 0.388361, 0.458276, 0.549632, 0.616784, 0.649470, 0.784570, 0.905481],
	plum: [0.189749, 0.210040, 0.267281, 0.307181, 0.343845, 0.388957, 0.456020, 0.545014, 0.578737, 0.616156, 0.786061, 0.906138],
	purple: [0.191328, 0.213745, 0.267703, 0.308777, 0.344745, 0.388694, 0.448556, 0.541226, 0.555623, 0.595519, 0.780657, 0.910686],
	violet: [0.191359, 0.211133, 0.270734, 0.311797, 0.349181, 0.388911, 0.444528, 0.517739, 0.541680, 0.588623, 0.777832, 0.911651],
	iris: [0.192361, 0.209108, 0.272190, 0.318097, 0.356828, 0.400354, 0.448478, 0.506847, 0.540310, 0.586798, 0.774294, 0.913982],
	indigo: [0.190865, 0.209368, 0.271567, 0.318454, 0.362468, 0.403298, 0.449066, 0.502083, 0.543750, 0.589149, 0.775873, 0.910782],
	blue: [0.193607, 0.212927, 0.274470, 0.320138, 0.367096, 0.416028, 0.474106, 0.540567, 0.649294, 0.688383, 0.764220, 0.907125],
	cyan: [0.191653, 0.214033, 0.273295, 0.316436, 0.362635, 0.413536, 0.477691, 0.556625, 0.660042, 0.698817, 0.785373, 0.909540],
	teal: [0.187233, 0.215547, 0.272539, 0.317840, 0.363255, 0.414426, 0.473086, 0.537401, 0.649077, 0.688016, 0.788562, 0.905128],
	jade: [0.186392, 0.215148, 0.273597, 0.316238, 0.361166, 0.412719, 0.468397, 0.536509, 0.642150, 0.677749, 0.785238, 0.902679],
	green: [0.187292, 0.211657, 0.272144, 0.317272, 0.364928, 0.412449, 0.466981, 0.528033, 0.640597, 0.674587, 0.779430, 0.904840],
	grass: [0.186899, 0.209651, 0.267256, 0.318556, 0.366816, 0.416368, 0.467985, 0.522900, 0.651236, 0.689358, 0.779656, 0.910860],
	bronze: [0.180889, 0.201036, 0.248011, 0.290943, 0.332624, 0.376549, 0.432160, 0.499662, 0.627428, 0.671745, 0.791819, 0.915128],
	gold: [0.181787, 0.217756, 0.265850, 0.309372, 0.356715, 0.406677, 0.470214, 0.540986, 0.610943, 0.654127, 0.782758, 0.896276],
	brown: [0.178010, 0.207357, 0.254375, 0.295458, 0.341500, 0.381677, 0.432651, 0.506691, 0.632852, 0.673344, 0.798410, 0.917381],
	orange: [0.186938, 0.207818, 0.257882, 0.293681, 0.333924, 0.384901, 0.452318, 0.540564, 0.690796, 0.732699, 0.788766, 0.924722],
	amber: [0.184964, 0.211986, 0.257809, 0.295500, 0.336319, 0.386332, 0.454241, 0.536379, 0.853697, 0.884914, 0.861667, 0.935052],
	yellow: [0.182083, 0.209466, 0.260942, 0.292897, 0.334641, 0.384898, 0.452049, 0.534914, 0.917579, 0.971098, 0.900112, 0.941547],
	lime: [0.181880, 0.208992, 0.265644, 0.316491, 0.362634, 0.410268, 0.463333, 0.524084, 0.887418, 0.934584, 0.868276, 0.946490],
	mint: [0.188564, 0.210871, 0.268302, 0.314638, 0.359045, 0.410634, 0.470159, 0.540835, 0.869608, 0.915577, 0.795425, 0.930603],
	sky: [0.190016, 0.215795, 0.271445, 0.320786, 0.373434, 0.426177, 0.488424, 0.556840, 0.861068, 0.908492, 0.792706, 0.933986],
};

/**
 * Radix dark mode chroma curves (normalized to step 9).
 */
export const RADIX_CHROMA_CURVES_DARK: Record<string, number[]> = {
	gray: [0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000],
	mauve: [0.2538, 0.2425, 0.3360, 0.4524, 0.5390, 0.6445, 0.6937, 0.9449, 1.0000, 0.9800, 0.8441, 0.1559],
	slate: [0.2655, 0.2750, 0.3800, 0.4562, 0.5420, 0.6716, 0.7872, 1.0128, 1.0000, 0.9494, 0.6294, 0.1885],
	sage: [0.2163, 0.2081, 0.1998, 0.2665, 0.2605, 0.3671, 0.4197, 0.5667, 1.0000, 0.8850, 0.5654, 0.1437],
	olive: [0.2382, 0.2290, 0.2197, 0.3365, 0.3286, 0.4051, 0.5036, 0.7318, 1.0000, 0.8752, 0.7194, 0.1875],
	sand: [0.2605, 0.2490, 0.2390, 0.4628, 0.6772, 0.6842, 0.8663, 1.0218, 1.0000, 1.3616, 1.2725, 0.7021],
	tomato: [0.0607, 0.0877, 0.2829, 0.4474, 0.5038, 0.5183, 0.5489, 0.6683, 1.0000, 0.9226, 0.6769, 0.2402],
	red: [0.0696, 0.1121, 0.3359, 0.4919, 0.5517, 0.5732, 0.6262, 0.7539, 1.0000, 0.9175, 0.6626, 0.2725],
	ruby: [0.0711, 0.0775, 0.3139, 0.4577, 0.5118, 0.5436, 0.5942, 0.7432, 1.0000, 0.9250, 0.6612, 0.2711],
	crimson: [0.0679, 0.1089, 0.2807, 0.4389, 0.4909, 0.5067, 0.5666, 0.6946, 1.0000, 0.9268, 0.6283, 0.2539],
	pink: [0.0842, 0.1520, 0.3012, 0.4723, 0.5042, 0.5176, 0.5765, 0.6514, 1.0000, 0.9489, 0.7467, 0.2831],
	plum: [0.0945, 0.1695, 0.3242, 0.4655, 0.5150, 0.5177, 0.5720, 0.6822, 1.0000, 0.9682, 0.8183, 0.2931],
	purple: [0.1230, 0.1637, 0.3345, 0.4474, 0.5032, 0.5269, 0.5902, 0.7252, 1.0000, 0.9663, 0.7939, 0.2662],
	violet: [0.1460, 0.1790, 0.3658, 0.5192, 0.5537, 0.5705, 0.6163, 0.7292, 1.0000, 0.9452, 0.6961, 0.2511],
	iris: [0.1202, 0.1600, 0.3767, 0.5554, 0.5950, 0.6065, 0.6509, 0.7477, 1.0000, 0.9327, 0.6600, 0.2283],
	indigo: [0.1286, 0.1578, 0.3691, 0.4954, 0.5464, 0.5823, 0.6287, 0.7152, 1.0000, 0.9202, 0.5957, 0.2238],
	blue: [0.1321, 0.1572, 0.3434, 0.5013, 0.5485, 0.5867, 0.6313, 0.7228, 1.0000, 0.8772, 0.6514, 0.2644],
	cyan: [0.1466, 0.1527, 0.3569, 0.4870, 0.5583, 0.6135, 0.6792, 0.8094, 1.0000, 0.9815, 0.9516, 0.4675],
	teal: [0.1074, 0.1398, 0.3319, 0.4783, 0.5293, 0.5770, 0.6493, 0.7579, 1.0000, 1.0812, 1.2917, 0.6347],
	jade: [0.1176, 0.1435, 0.3775, 0.4971, 0.5553, 0.5971, 0.6594, 0.7605, 1.0000, 1.0916, 1.3554, 0.6742],
	green: [0.0923, 0.1157, 0.2978, 0.4285, 0.4970, 0.5430, 0.6196, 0.7246, 1.0000, 1.0583, 1.2454, 0.6243],
	grass: [0.0912, 0.0905, 0.2052, 0.3591, 0.4215, 0.4935, 0.5625, 0.6630, 1.0000, 0.9876, 0.9666, 0.5318],
	bronze: [0.1173, 0.1974, 0.3420, 0.4276, 0.4824, 0.5609, 0.6968, 0.9064, 1.0000, 1.0580, 0.9383, 0.3734],
	gold: [0.0252, 0.0746, 0.2145, 0.3671, 0.4918, 0.5753, 0.7107, 0.8691, 1.0000, 1.1475, 1.1894, 0.6779],
	brown: [0.0554, 0.0789, 0.1664, 0.2492, 0.3220, 0.3546, 0.4095, 0.5067, 1.0000, 0.9433, 0.7990, 0.4562],
	orange: [0.0599, 0.0969, 0.2339, 0.3735, 0.4363, 0.4541, 0.4951, 0.6056, 1.0000, 0.9522, 0.7509, 0.2744],
	amber: [0.0850, 0.1171, 0.2813, 0.3986, 0.4559, 0.4986, 0.5239, 0.6131, 1.0000, 1.1482, 1.1003, 0.4562],
	yellow: [0.0758, 0.0945, 0.2566, 0.3267, 0.3726, 0.4224, 0.4402, 0.5151, 1.0000, 0.9900, 0.9053, 0.4073],
	lime: [0.0808, 0.1172, 0.1997, 0.2718, 0.3289, 0.3864, 0.4544, 0.5407, 1.0000, 1.0536, 0.8882, 0.4689],
	mint: [0.1062, 0.1705, 0.3918, 0.5422, 0.6206, 0.6630, 0.7257, 0.8542, 1.0000, 0.7905, 1.1819, 0.5705],
	sky: [0.2431, 0.2826, 0.5211, 0.6843, 0.7610, 0.8546, 0.9560, 1.1151, 1.0000, 0.7123, 0.9652, 0.5117],
};

/**
 * Radix dark mode reference chromas (step 9 absolute values).
 */
export const RADIX_REFERENCE_CHROMAS_DARK: Record<string, number> = {
	gray: 0.000000,
	mauve: 0.017092,
	slate: 0.015318,
	sage: 0.017478,
	olive: 0.018139,
	sand: 0.007751,
	tomato: 0.193584,
	red: 0.193340,
	ruby: 0.194866,
	crimson: 0.212961,
	pink: 0.207608,
	plum: 0.187722,
	purple: 0.182910,
	violet: 0.179028,
	iris: 0.184124,
	indigo: 0.191015,
	blue: 0.193040,
	cyan: 0.121716,
	teal: 0.113572,
	jade: 0.115025,
	green: 0.132875,
	grass: 0.146785,
	bronze: 0.045953,
	gold: 0.079548,
	brown: 0.078487,
	orange: 0.190911,
	amber: 0.157207,
	yellow: 0.183771,
	lime: 0.174730,
	mint: 0.099913,
	sky: 0.102721,
};

/**
 * Radix dark mode hue curves per hue.
 */
export const RADIX_HUE_CURVES_DARK: Record<string, number[]> = {
	gray: [0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00],
	mauve: [308.19, 308.25, 301.13, 308.16, 303.92, 308.11, 298.90, 299.48, 294.16, 294.22, 299.72, 286.35],
	slate: [285.98, 264.48, 271.18, 248.07, 255.56, 253.97, 252.94, 251.69, 262.34, 266.63, 258.34, 264.54],
	sage: [164.58, 164.68, 164.77, 174.10, 174.15, 164.65, 170.09, 168.42, 170.54, 173.79, 171.70, 165.07],
	olive: [128.73, 128.68, 128.64, 134.94, 134.92, 128.70, 132.53, 141.23, 139.44, 138.72, 137.79, 145.55],
	sand: [106.60, 106.56, 106.53, 106.63, 106.70, 91.54, 95.22, 97.47, 97.45, 100.11, 100.03, 95.10],
	tomato: [18.26, 31.43, 26.76, 27.76, 28.63, 29.90, 31.61, 33.41, 33.34, 34.09, 34.91, 31.23],
	red: [18.42, 14.06, 12.69, 14.33, 15.53, 16.80, 18.77, 21.76, 23.03, 22.85, 22.14, 6.45],
	ruby: [1.87, 3.65, 6.05, 6.07, 6.48, 7.06, 9.12, 11.27, 13.15, 13.63, 15.10, 355.75],
	crimson: [354.17, 354.54, 353.51, 354.29, 354.53, 355.87, 357.14, 358.72, 1.28, 1.85, 4.74, 346.63],
	pink: [335.35, 337.00, 337.59, 339.42, 341.18, 341.41, 342.90, 347.43, 346.00, 345.96, 346.97, 343.22],
	plum: [326.25, 326.64, 327.11, 325.61, 325.02, 324.96, 323.21, 321.88, 322.11, 322.30, 322.22, 326.02],
	purple: [315.59, 313.13, 312.61, 310.80, 310.50, 309.45, 308.61, 307.57, 305.86, 306.45, 307.74, 310.99],
	violet: [290.76, 300.93, 294.41, 292.08, 291.33, 292.12, 291.97, 290.29, 288.03, 289.35, 293.19, 292.44],
	iris: [284.13, 286.61, 278.46, 275.99, 277.31, 279.45, 280.42, 280.80, 278.28, 281.26, 287.46, 287.02],
	indigo: [276.53, 274.84, 267.98, 267.25, 267.03, 268.76, 268.94, 268.25, 267.01, 269.30, 273.02, 269.55],
	blue: [256.49, 261.25, 253.93, 252.35, 250.70, 252.01, 253.09, 253.17, 251.78, 251.40, 249.46, 238.45],
	cyan: [222.83, 227.95, 220.38, 223.70, 223.74, 221.50, 221.64, 221.11, 221.74, 218.86, 213.80, 211.50],
	teal: [186.67, 189.00, 186.76, 187.27, 186.64, 184.75, 184.95, 183.49, 181.96, 180.31, 175.73, 175.13],
	jade: [169.78, 168.20, 165.19, 167.62, 168.17, 169.57, 170.27, 172.23, 170.73, 169.57, 167.11, 166.88],
	green: [167.01, 165.91, 162.17, 161.84, 161.23, 160.95, 160.24, 159.39, 157.68, 157.70, 157.29, 158.18],
	grass: [159.73, 149.92, 150.16, 150.30, 149.85, 149.33, 148.99, 148.32, 147.39, 147.80, 148.48, 144.90],
	bronze: [39.35, 43.04, 71.30, 70.23, 66.94, 66.91, 64.97, 61.20, 44.16, 45.86, 44.29, 50.42],
	gold: [106.60, 91.62, 86.87, 93.65, 93.74, 92.81, 96.43, 92.56, 88.56, 90.07, 95.06, 94.46],
	brown: [84.59, 56.02, 51.58, 50.20, 54.41, 53.67, 53.93, 66.73, 60.98, 61.13, 62.71, 75.54],
	orange: [60.68, 62.72, 60.79, 56.70, 54.38, 54.98, 52.66, 50.05, 45.02, 50.86, 56.21, 66.17],
	amber: [77.80, 81.99, 74.48, 73.88, 72.90, 75.25, 74.96, 73.44, 84.13, 94.78, 89.02, 86.07],
	yellow: [94.03, 91.81, 90.26, 93.80, 92.46, 92.91, 91.97, 89.38, 100.94, 109.36, 101.72, 101.11],
	lime: [120.76, 129.62, 132.01, 131.68, 131.03, 131.45, 131.08, 130.63, 126.09, 126.30, 124.74, 122.70],
	mint: [196.29, 195.94, 192.36, 190.98, 189.96, 186.24, 183.51, 179.23, 177.98, 180.00, 176.46, 168.28],
	sky: [259.24, 257.53, 251.29, 248.74, 244.92, 243.92, 240.81, 237.44, 217.80, 214.51, 231.61, 214.32],
};

/** Color mode for palette generation */
export type ColorMode = 'light' | 'dark';

const WHITE = '#ffffff';
const BLACK = '#111111';
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
	/**
	 * Global tuning profile to use as fallback when brand anchor is "nearly Radix".
	 * This ensures uniform brand character across the palette even when individual
	 * brand colors happen to be close to their Radix slot.
	 */
	globalTuning?: {
		hueShift: number;
		chromaMultiplier: number;
	};
	/** Color mode: 'light' (default) or 'dark' */
	mode?: ColorMode;
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
		const apca = Math.abs(normalizeApca(calcAPCA(hex, WHITE)));

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
	const { parentColor, anchorStep = 9, hueKey, chromaCurve, mode = 'light' } = options;

	const parent = toOklch(parentColor);
	if (!parent) {
		throw new Error(`Invalid parent color: ${parentColor}`);
	}

	// Select curves based on mode (light or dark)
	const lightnessCurves = mode === 'dark' ? RADIX_LIGHTNESS_CURVES_DARK : RADIX_LIGHTNESS_CURVES;
	const chromaCurves = mode === 'dark' ? RADIX_CHROMA_CURVES_DARK : RADIX_CHROMA_CURVES;
	const hueCurves = mode === 'dark' ? RADIX_HUE_CURVES_DARK : RADIX_HUE_CURVES;
	const refChromas = mode === 'dark' ? RADIX_REFERENCE_CHROMAS_DARK : RADIX_REFERENCE_CHROMAS;
	const background = mode === 'dark' ? BLACK : WHITE;

	// Get Radix lightness curve for this hue (if available)
	// Using per-hue curves preserves Radix's semantic intent:
	// - Bright hues have non-monotonic curves (step 9 lighter than 8)
	// - Neutrals have flatter middle sections
	// - Warm reds are darker at steps 9-10
	const hueLightnessCurve = hueKey ? lightnessCurves[hueKey] : null;
	const lightnessCurve = hueLightnessCurve || RADIX_LIGHTNESS_TARGETS;

	// Get per-hue chroma curve - this is critical for correct saturation progression
	// Different hue families have very different chroma shapes:
	// - Bright hues (yellow/amber): High ratios at light steps (0.77-0.84 at step 5)
	// - Purple/violet: Lower ratios at mid-steps (0.29-0.31 at step 5)
	const hueChromaCurve = hueKey ? chromaCurves[hueKey] : null;
	const effectiveChromaCurve = chromaCurve || hueChromaCurve || CHROMA_CURVE;

	// When anchoring at a different step, we need to adjust the chroma curve
	// so the parent's full chroma is at the anchor step.
	// But for "nearly Radix" colors, skip this adjustment to match Radix exactly.
	const anchorChromaMultiplier = effectiveChromaCurve[anchorStep - 1];
	// adjustedChromaCurve is set later after isNearlyRadix is calculated

	// Get per-hue hue curve for natural hue shift across the scale
	// This is critical for accurate reproduction of Radix's semantic intent:
	// - Orange shifts 80° → 41° (gets warmer/redder as it darkens)
	// - Gold shifts 106° → 73° (yellow → orange as it darkens)
	// - Yellow shifts 101° → 77° (more orange in darks)
	const hueHueCurve = hueKey ? hueCurves[hueKey] : null;

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
	const radixRefChroma = hueKey ? (refChromas[hueKey] ?? parent.c) : parent.c;
	const chromaDeparture = parent.c / radixRefChroma; // e.g., 1.42 means +42% more chroma

	// "Nearly Radix" threshold: if brand is very close to Radix STEP 9, skip offset propagation
	// We compare against step 9 (hero position) because that's the canonical hue for the slot.
	// This handles cases like Slack cyan which anchors at step 7 but has hue matching step 9.
	// Thresholds: <3° hue offset from step 9 AND 0.90x-1.10x chroma ratio
	const NEAR_RADIX_HUE_THRESHOLD = 3;
	const NEAR_RADIX_CHROMA_MIN = 0.90;
	const NEAR_RADIX_CHROMA_MAX = 1.10;

	// Compare against step 9 hue (index 8) instead of anchor step
	const radixStep9Hue = hueHueCurve ? hueHueCurve[8] : parent.h;
	let hueOffsetFromStep9 = parent.h - radixStep9Hue;
	if (hueOffsetFromStep9 > 180) hueOffsetFromStep9 -= 360;
	if (hueOffsetFromStep9 < -180) hueOffsetFromStep9 += 360;

	// Only apply "nearly Radix" for brand anchors (!useFullCurve), not synthetic parents.
	// Synthetic parents already have tuning applied via createTunedParent() - checking
	// isNearlyRadix here would cancel out that tuning since the synthetic parent is
	// intentionally close to Radix (just shifted by the tuning profile).
	const isNearlyRadix =
		!options.useFullCurve &&
		Math.abs(hueOffsetFromStep9) < NEAR_RADIX_HUE_THRESHOLD &&
		chromaDeparture >= NEAR_RADIX_CHROMA_MIN &&
		chromaDeparture <= NEAR_RADIX_CHROMA_MAX;

	// When "nearly Radix", decide whether to apply global tuning or zero out.
	// Key insight: Only apply global tuning if it's LARGER than the per-row offset.
	// This handles two cases:
	// 1. Sveltopia Orange: per-row 0.25°, global -1.72° → apply global (brand intended uniform shift)
	// 2. Slack Cyan: per-row 1.46°, global 0.22° → zero out (brand cyan is intentionally close to Radix)
	let effectiveHueOffset: number;
	let effectiveChromaDeparture: number;

	if (isNearlyRadix && options.globalTuning) {
		// Only apply global tuning if it represents MORE shift than per-row offset
		const globalShiftMagnitude = Math.abs(options.globalTuning.hueShift);
		const perRowShiftMagnitude = Math.abs(hueOffsetFromStep9);

		if (globalShiftMagnitude > perRowShiftMagnitude) {
			// Global tuning is larger - apply it for uniform brand character
			effectiveHueOffset = options.globalTuning.hueShift;
			effectiveChromaDeparture = options.globalTuning.chromaMultiplier;
		} else {
			// Per-row offset is larger - brand intended this color close to Radix
			effectiveHueOffset = 0;
			effectiveChromaDeparture = 1.0;
		}
	} else if (isNearlyRadix) {
		// No global tuning provided, fall back to zero (original behavior)
		effectiveHueOffset = 0;
		effectiveChromaDeparture = 1.0;
	} else {
		// Use per-row offset calculated from brand color
		effectiveHueOffset = hueOffset;
		effectiveChromaDeparture = chromaDeparture;
	}

	// For nearly Radix: use original curve (no adjustment needed)
	// For brand anchors: normalize so anchor step = 1.0
	const adjustedChromaCurve = isNearlyRadix
		? effectiveChromaCurve
		: effectiveChromaCurve.map((c) => c / anchorChromaMultiplier);

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
		// At anchor: use full parent chroma (effectiveChromaDeparture)
		// At edges: blend toward 1.0 (Radix reference level)
		// Note: effectiveChromaDeparture is 1.0 if brand is "nearly Radix"
		const dampenedChromaDeparture = 1.0 + (effectiveChromaDeparture - 1.0) * dampeningFactor;
		const chroma = radixRefChroma * dampenedChromaDeparture * adjustedChromaCurve[i];

		// Calculate hue for this step using Radix curve + dampened brand offset
		// Dampening prevents large brand hue departures from over-propagating to edges.
		// At anchor step: 100% of brand offset applied
		// At edges (step 1 or 12): reduced offset (closer to pure Radix curve)
		// Note: effectiveHueOffset is 0 if brand is "nearly Radix"
		let hue: number;
		if (hueHueCurve) {
			// Reuse dampening factor calculated above for chroma
			const dampenedOffset = effectiveHueOffset * dampeningFactor;
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
		// For nearly Radix: also use Radix curve for all steps to minimize drift
		const useParentLightness = !options.useFullCurve && stepNum === anchorStep && !isNearlyRadix;
		const lightness = useParentLightness ? parent.l : lightnessCurve[i];

		const oklch = clampOklch({ l: lightness, c: chroma, h: hue });
		const hex = toHex(oklch);
		const apca = Math.abs(normalizeApca(calcAPCA(hex, background)));

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
		const apca = Math.abs(normalizeApca(calcAPCA(hex, WHITE)));

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
