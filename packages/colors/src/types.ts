/**
 * Core type definitions for @sveltopia/colors
 */

/**
 * OKLCH color representation
 * L: Lightness (0-1)
 * C: Chroma (0-0.4 typical, can be higher)
 * H: Hue (0-360 degrees)
 */
export interface OklchColor {
	l: number;
	c: number;
	h: number;
	alpha?: number;
}

/**
 * A 12-step tint scale for a single hue
 * Steps 1-12 go from lightest to darkest
 * Using 1-indexed keys to match designer conventions (Radix, Tailwind)
 */
export interface Scale {
	1: string; // lightest (backgrounds)
	2: string;
	3: string;
	4: string;
	5: string;
	6: string;
	7: string;
	8: string;
	9: string; // solid/primary
	10: string;
	11: string;
	12: string; // darkest (text)
}

/** Valid step indices for a Scale (1-12) */
export type ScaleStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/**
 * Tuning profile extracted from brand colors
 * Describes how the brand's colors deviate from baseline
 */
export interface TuningProfile {
	/** Average hue shift from baseline positions */
	hueShift: number;
	/** Brand chroma relative to baseline (1.0 = same) */
	chromaMultiplier: number;
	/** Brand lightness preference shift */
	lightnessShift: number;
	/** Mapping of brand input colors (hex) to baseline hue slot names */
	anchors: Record<string, string>;
}

/**
 * Complete generated palette
 */
export interface Palette {
	/** Light mode scales for all 30 hues */
	light: Record<string, Scale>;
	/** Dark mode scales for all 30 hues */
	dark: Record<string, Scale>;
	/** Metadata about generation */
	_meta: {
		tuningProfile: TuningProfile;
		inputColors: string[];
		generatedAt: string;
	};
}

/**
 * APCA contrast validation result
 */
export interface ContrastResult {
	/** The calculated APCA Lc value */
	contrast: number;
	/** Whether it passes the minimum threshold */
	passes: boolean;
	/** The threshold used for validation */
	threshold: number;
	/** Usage context (body text, large text, decorative) */
	usage: 'body' | 'large' | 'decorative';
}

/**
 * Validation report for a palette
 */
export interface ValidationReport {
	/** Overall pass/fail */
	valid: boolean;
	/** Individual contrast checks */
	checks: Array<{
		foreground: string;
		background: string;
		result: ContrastResult;
	}>;
	/** Any issues found */
	issues: string[];
}

/**
 * A single step in a generated scale with full OKLCH data
 */
export interface GeneratedScaleStep {
	/** Step number (1-12) */
	step: number;
	/** OKLCH color values */
	oklch: OklchColor;
	/** Hex color string */
	hex: string;
	/** Actual APCA contrast against white */
	apca: number;
	/** Target APCA contrast */
	targetApca: number;
}

/**
 * A generated 12-step scale with full metadata
 */
export interface GeneratedScale {
	/** Original parent color hex */
	parent: string;
	/** Parent color in OKLCH */
	parentOklch: OklchColor;
	/** All 12 steps with OKLCH and contrast data */
	steps: GeneratedScaleStep[];
}
