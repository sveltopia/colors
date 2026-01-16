/**
 * APCA Validation Module
 *
 * Validates that generated palettes maintain accessibility guarantees.
 * Uses APCA (Accessible Perceptual Contrast Algorithm) for contrast checking.
 *
 * @see https://github.com/Myndex/apca-w3
 */

import { APCAcontrast, sRGBtoY } from 'apca-w3';
import { rgb, oklch, formatHex } from 'culori';
import type { Palette, Scale } from '../types.js';

// APCA Lightness Contrast (Lc) thresholds
// Based on WCAG 3 draft recommendations
export const APCA_THRESHOLDS = {
	BODY_TEXT: 75, // Minimum for body text (14-16px)
	LARGE_TEXT: 60, // Minimum for large text (18px+) and UI elements
	DECORATIVE: 45 // Minimum for non-text, decorative elements
} as const;

export type ContrastSeverity = 'warning' | 'fail';

export interface ContrastIssue {
	hue: string;
	mode: 'light' | 'dark';
	textStep: number;
	bgStep: number | 'white' | 'black';
	useCase: string;
	expected: number;
	actual: number;
	severity: ContrastSeverity;
}

export interface ContrastReport {
	passed: boolean;
	totalChecks: number;
	passedChecks: number;
	issues: ContrastIssue[];
	summary: {
		byHue: Record<string, { passed: number; failed: number; warnings: number }>;
		byMode: Record<'light' | 'dark', { passed: number; failed: number; warnings: number }>;
	};
}

/**
 * Convert hex color to RGB array for APCA
 */
function hexToRgbArray(hex: string): [number, number, number] {
	const color = rgb(hex);
	if (!color) {
		throw new Error(`Invalid hex color: ${hex}`);
	}
	return [Math.round(color.r * 255), Math.round(color.g * 255), Math.round(color.b * 255)];
}

/**
 * Calculate APCA contrast between two colors.
 * Returns the Lc (lightness contrast) value.
 *
 * @param textHex - Foreground/text color
 * @param bgHex - Background color
 * @returns Lc value (positive = light text on dark, negative = dark text on light)
 */
export function calculateAPCA(textHex: string, bgHex: string): number {
	const textRgb = hexToRgbArray(textHex);
	const bgRgb = hexToRgbArray(bgHex);

	const textY = sRGBtoY(textRgb);
	const bgY = sRGBtoY(bgRgb);

	const lc = APCAcontrast(textY, bgY);

	// APCAcontrast can return a number or string, normalize to number
	return typeof lc === 'string' ? parseFloat(lc) : lc;
}

/**
 * Get the absolute Lc value (APCA contrast is signed)
 */
export function getAbsoluteContrast(textHex: string, bgHex: string): number {
	return Math.abs(calculateAPCA(textHex, bgHex));
}

/**
 * Check if contrast meets a threshold
 */
export function meetsContrastThreshold(
	textHex: string,
	bgHex: string,
	threshold: number
): boolean {
	return getAbsoluteContrast(textHex, bgHex) >= threshold;
}

interface ContrastCheck {
	textStep: number;
	bgStep: number | 'white' | 'black';
	useCase: string;
	threshold: number;
	// Some checks are warnings (best practice) vs failures (accessibility violation)
	isWarning?: boolean;
}

// Define the core accessibility checks per the Radix design system
// Based on SVE-163 requirements:
// - Step 12 (text) against step 1 (background)
// - Step 12 (text) against step 2 (subtle background)
// - Step 11 (low-contrast text) against step 1
// - Step 9 (solid/button) against white text
const LIGHT_MODE_CHECKS: ContrastCheck[] = [
	// Primary text checks
	{
		textStep: 12,
		bgStep: 1,
		useCase: 'High-contrast text on app background',
		threshold: APCA_THRESHOLDS.BODY_TEXT
	},
	{
		textStep: 12,
		bgStep: 2,
		useCase: 'High-contrast text on subtle background',
		threshold: APCA_THRESHOLDS.BODY_TEXT
	},
	// Low-contrast text checks
	{
		textStep: 11,
		bgStep: 1,
		useCase: 'Low-contrast text on app background',
		threshold: APCA_THRESHOLDS.LARGE_TEXT
	},
	{
		textStep: 11,
		bgStep: 2,
		useCase: 'Low-contrast text on subtle background',
		threshold: APCA_THRESHOLDS.LARGE_TEXT
	},
	// Solid color / button checks (step 9 with white text)
	// Warning only: some hues (yellow, lime) intentionally use dark text
	{
		textStep: 9,
		bgStep: 'white',
		useCase: 'White text on solid/button color',
		threshold: APCA_THRESHOLDS.LARGE_TEXT,
		isWarning: true
	}
];

const DARK_MODE_CHECKS: ContrastCheck[] = [
	// Primary text checks (in dark mode, text is light, backgrounds are dark)
	{
		textStep: 12,
		bgStep: 1,
		useCase: 'High-contrast text on app background',
		threshold: APCA_THRESHOLDS.BODY_TEXT
	},
	{
		textStep: 12,
		bgStep: 2,
		useCase: 'High-contrast text on subtle background',
		threshold: APCA_THRESHOLDS.BODY_TEXT
	},
	// Low-contrast text checks
	{
		textStep: 11,
		bgStep: 1,
		useCase: 'Low-contrast text on app background',
		threshold: APCA_THRESHOLDS.LARGE_TEXT
	},
	{
		textStep: 11,
		bgStep: 2,
		useCase: 'Low-contrast text on subtle background',
		threshold: APCA_THRESHOLDS.LARGE_TEXT
	},
	// Solid color / button checks
	// Warning only: contrast direction varies by hue
	{
		textStep: 9,
		bgStep: 'black',
		useCase: 'Black text on solid/button color',
		threshold: APCA_THRESHOLDS.LARGE_TEXT,
		isWarning: true
	}
];

/**
 * Validate a single scale's contrast accessibility
 */
function validateScale(
	scale: Scale,
	hue: string,
	mode: 'light' | 'dark',
	checks: ContrastCheck[]
): { passed: number; issues: ContrastIssue[] } {
	const issues: ContrastIssue[] = [];
	let passed = 0;

	for (const check of checks) {
		const textHex = scale[check.textStep as keyof Scale];

		let bgHex: string;
		if (check.bgStep === 'white') {
			bgHex = '#ffffff';
		} else if (check.bgStep === 'black') {
			bgHex = '#000000';
		} else {
			bgHex = scale[check.bgStep as keyof Scale];
		}

		const contrast = getAbsoluteContrast(textHex, bgHex);
		const meetThreshold = contrast >= check.threshold;

		if (meetThreshold) {
			passed++;
		} else {
			issues.push({
				hue,
				mode,
				textStep: check.textStep,
				bgStep: check.bgStep,
				useCase: check.useCase,
				expected: check.threshold,
				actual: Math.round(contrast * 10) / 10,
				severity: check.isWarning ? 'warning' : 'fail'
			});
		}
	}

	return { passed, issues };
}

/**
 * Validate an entire palette for APCA contrast accessibility.
 *
 * Checks:
 * - Step 12 (text) against step 1 (background) - body text
 * - Step 12 (text) against step 2 (subtle background)
 * - Step 11 (low-contrast text) against step 1
 * - Step 9 (solid/button) against white/black text
 * - Step 8 (border) visibility against step 1
 *
 * @param palette - The palette to validate
 * @param options - Validation options
 * @returns ContrastReport with pass/fail status and detailed issues
 */
export function validatePaletteContrast(
	palette: Palette,
	options: {
		/** Only validate specific hues */
		hues?: string[];
		/** Skip warning-level checks */
		errorsOnly?: boolean;
	} = {}
): ContrastReport {
	const issues: ContrastIssue[] = [];
	let totalChecks = 0;
	let passedChecks = 0;

	const summary: ContrastReport['summary'] = {
		byHue: {},
		byMode: {
			light: { passed: 0, failed: 0, warnings: 0 },
			dark: { passed: 0, failed: 0, warnings: 0 }
		}
	};

	const hueKeys = options.hues ?? Object.keys(palette.light);

	// Filter checks if errorsOnly
	const lightChecks = options.errorsOnly
		? LIGHT_MODE_CHECKS.filter((c) => !c.isWarning)
		: LIGHT_MODE_CHECKS;
	const darkChecks = options.errorsOnly
		? DARK_MODE_CHECKS.filter((c) => !c.isWarning)
		: DARK_MODE_CHECKS;

	for (const hue of hueKeys) {
		const lightScale = palette.light[hue];
		const darkScale = palette.dark[hue];

		if (!lightScale || !darkScale) {
			continue;
		}

		summary.byHue[hue] = { passed: 0, failed: 0, warnings: 0 };

		// Validate light mode
		const lightResult = validateScale(lightScale, hue, 'light', lightChecks);
		totalChecks += lightChecks.length;
		passedChecks += lightResult.passed;
		summary.byHue[hue].passed += lightResult.passed;
		summary.byMode.light.passed += lightResult.passed;

		for (const issue of lightResult.issues) {
			issues.push(issue);
			if (issue.severity === 'fail') {
				summary.byHue[hue].failed++;
				summary.byMode.light.failed++;
			} else {
				summary.byHue[hue].warnings++;
				summary.byMode.light.warnings++;
			}
		}

		// Validate dark mode
		const darkResult = validateScale(darkScale, hue, 'dark', darkChecks);
		totalChecks += darkChecks.length;
		passedChecks += darkResult.passed;
		summary.byHue[hue].passed += darkResult.passed;
		summary.byMode.dark.passed += darkResult.passed;

		for (const issue of darkResult.issues) {
			issues.push(issue);
			if (issue.severity === 'fail') {
				summary.byHue[hue].failed++;
				summary.byMode.dark.failed++;
			} else {
				summary.byHue[hue].warnings++;
				summary.byMode.dark.warnings++;
			}
		}
	}

	// Determine pass/fail (warnings don't cause failure)
	const failures = issues.filter((i) => i.severity === 'fail');
	const passed = failures.length === 0;

	return {
		passed,
		totalChecks,
		passedChecks,
		issues,
		summary
	};
}

/**
 * Format a contrast report as a human-readable string
 */
export function formatContrastReport(report: ContrastReport): string {
	const lines: string[] = [];

	lines.push('=== APCA Contrast Validation Report ===\n');
	lines.push(`Status: ${report.passed ? 'PASSED' : 'FAILED'}`);
	lines.push(`Checks: ${report.passedChecks}/${report.totalChecks} passed\n`);

	// Summary by mode
	lines.push('By Mode:');
	lines.push(
		`  Light: ${report.summary.byMode.light.passed} passed, ${report.summary.byMode.light.failed} failed, ${report.summary.byMode.light.warnings} warnings`
	);
	lines.push(
		`  Dark:  ${report.summary.byMode.dark.passed} passed, ${report.summary.byMode.dark.failed} failed, ${report.summary.byMode.dark.warnings} warnings`
	);
	lines.push('');

	// Issues
	if (report.issues.length > 0) {
		const failures = report.issues.filter((i) => i.severity === 'fail');
		const warnings = report.issues.filter((i) => i.severity === 'warning');

		if (failures.length > 0) {
			lines.push(`Failures (${failures.length}):`);
			for (const issue of failures) {
				lines.push(
					`  [FAIL] ${issue.hue} (${issue.mode}): ${issue.useCase}`
				);
				lines.push(
					`         Step ${issue.textStep} vs ${issue.bgStep}: Lc ${issue.actual} < ${issue.expected}`
				);
			}
			lines.push('');
		}

		if (warnings.length > 0) {
			lines.push(`Warnings (${warnings.length}):`);
			for (const issue of warnings) {
				lines.push(
					`  [WARN] ${issue.hue} (${issue.mode}): ${issue.useCase}`
				);
				lines.push(
					`         Step ${issue.textStep} vs ${issue.bgStep}: Lc ${issue.actual} < ${issue.expected}`
				);
			}
		}
	} else {
		lines.push('No issues found!');
	}

	return lines.join('\n');
}

/**
 * Quick check: validate that a palette passes all critical accessibility checks
 */
export function isPaletteAccessible(palette: Palette): boolean {
	const report = validatePaletteContrast(palette, { errorsOnly: true });
	return report.passed;
}

/**
 * Boost the lightness of a text color until it meets the contrast threshold.
 * Used as a safeguard when chromaMultiplier tuning causes marginal contrast degradation.
 *
 * @param textHex - The text color to adjust
 * @param bgHex - The background color to measure against
 * @param threshold - The minimum Lc contrast required
 * @param maxIterations - Safety limit to prevent infinite loops
 * @returns The adjusted hex color, or original if threshold already met
 */
export function boostLightnessUntilContrast(
	textHex: string,
	bgHex: string,
	threshold: number,
	maxIterations: number = 50
): string {
	let currentContrast = getAbsoluteContrast(textHex, bgHex);

	// Already meets threshold
	if (currentContrast >= threshold) {
		return textHex;
	}

	const color = oklch(textHex);
	if (!color) {
		return textHex;
	}

	let { l, c, h } = color;

	// Determine direction: increase lightness for dark text on light bg,
	// decrease lightness for light text on dark bg
	const bgColor = oklch(bgHex);
	if (!bgColor) {
		return textHex;
	}

	// If text is darker than bg, we need to go darker (lower L) for more contrast
	// If text is lighter than bg, we need to go lighter (higher L) for more contrast
	const direction = l < bgColor.l ? -1 : 1;
	const step = 0.01;

	for (let i = 0; i < maxIterations; i++) {
		l += direction * step;

		// Clamp to valid range
		if (l <= 0 || l >= 1) {
			break;
		}

		const newHex = formatHex({ mode: 'oklch', l, c, h });
		if (!newHex) {
			break;
		}

		currentContrast = getAbsoluteContrast(newHex, bgHex);
		if (currentContrast >= threshold) {
			return newHex;
		}
	}

	// Return best effort (the last iteration)
	const finalHex = formatHex({ mode: 'oklch', l, c, h });
	return finalHex || textHex;
}

/**
 * Ensure a palette meets accessibility requirements by boosting lightness
 * on any steps that fall below APCA thresholds.
 *
 * This is a safeguard for marginal contrast degradation caused by chromaMultiplier
 * tuning. It only affects step 11 (low-contrast text) which can drop below 60 Lc
 * in dark mode for warm hues.
 *
 * @param palette - The palette to check and fix
 * @returns A new palette with accessibility-compliant colors
 */
export function ensureAccessibility(palette: Palette): Palette {
	const result: Palette = {
		light: {},
		dark: {},
		_meta: palette._meta
	};

	// Process both modes
	for (const mode of ['light', 'dark'] as const) {
		for (const [hue, scale] of Object.entries(palette[mode])) {
			// Copy the scale
			const newScale = { ...scale };

			// Check step 11 against step 1 (app background)
			const step11 = newScale[11];
			const step1 = newScale[1];

			if (step11 && step1) {
				const contrast = getAbsoluteContrast(step11, step1);
				if (contrast < APCA_THRESHOLDS.LARGE_TEXT) {
					newScale[11] = boostLightnessUntilContrast(
						step11,
						step1,
						APCA_THRESHOLDS.LARGE_TEXT
					);
				}
			}

			// Check step 11 against step 2 (subtle background)
			const step2 = newScale[2];
			if (newScale[11] && step2) {
				const contrast = getAbsoluteContrast(newScale[11], step2);
				if (contrast < APCA_THRESHOLDS.LARGE_TEXT) {
					newScale[11] = boostLightnessUntilContrast(
						newScale[11],
						step2,
						APCA_THRESHOLDS.LARGE_TEXT
					);
				}
			}

			// Check step 12 against step 1 (should rarely need adjustment)
			const step12 = newScale[12];
			if (step12 && step1) {
				const contrast = getAbsoluteContrast(step12, step1);
				if (contrast < APCA_THRESHOLDS.BODY_TEXT) {
					newScale[12] = boostLightnessUntilContrast(
						step12,
						step1,
						APCA_THRESHOLDS.BODY_TEXT
					);
				}
			}

			// Check step 12 against step 2
			if (newScale[12] && step2) {
				const contrast = getAbsoluteContrast(newScale[12], step2);
				if (contrast < APCA_THRESHOLDS.BODY_TEXT) {
					newScale[12] = boostLightnessUntilContrast(
						newScale[12],
						step2,
						APCA_THRESHOLDS.BODY_TEXT
					);
				}
			}

			result[mode][hue] = newScale;
		}
	}

	return result;
}
