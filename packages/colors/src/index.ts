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
	ValidationReport,
	GeneratedScale,
	GeneratedScaleStep
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

// Scale generation
export {
	generateScale,
	generateScaleAPCA,
	validateScale,
	RADIX_APCA_TARGETS,
	RADIX_LIGHTNESS_TARGETS,
	CHROMA_CURVE
} from './core/generate.js';
export type { GenerateScaleOptions } from './core/generate.js';

// Full palette generation
export { generateLightPalette, getPaletteStats } from './core/palette.js';
export type { GeneratePaletteOptions, LightPalette } from './core/palette.js';

// Export utilities (CSS + JSON)
export {
	exportCSS,
	exportJSON,
	getAlphaColor,
	getAlphaColorSrgb,
	getAlphaColorP3,
	formatOklchCss,
	formatP3Css,
	formatAlphaHex,
	formatAlphaP3,
	getContrastColor,
	getSurfaceColor,
	getSemanticTokens
} from './core/export.js';
export type {
	CSSExportOptions,
	JSONExportOptions,
	ColorFormats,
	AlphaColorFormats,
	SemanticTokens,
	JSONScale,
	JSONAlphaScale,
	JSONOutput
} from './core/export.js';
