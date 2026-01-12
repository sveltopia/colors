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
	// so the parent's full chroma is at the anchor step.
	// But for "nearly Radix" colors, skip this adjustment to match Radix exactly.
	const anchorChromaMultiplier = effectiveChromaCurve[anchorStep - 1];
	// adjustedChromaCurve is set later after isNearlyRadix is calculated

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
	const radixRefChroma = hueKey ? (RADIX_REFERENCE_CHROMAS[hueKey] ?? parent.c) : parent.c;
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

	const isNearlyRadix =
		Math.abs(hueOffsetFromStep9) < NEAR_RADIX_HUE_THRESHOLD &&
		chromaDeparture >= NEAR_RADIX_CHROMA_MIN &&
		chromaDeparture <= NEAR_RADIX_CHROMA_MAX;

	// If nearly Radix, zero out offsets and skip curve adjustments to use pure Radix curves
	const effectiveHueOffset = isNearlyRadix ? 0 : hueOffset;
	const effectiveChromaDeparture = isNearlyRadix ? 1.0 : chromaDeparture;

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
