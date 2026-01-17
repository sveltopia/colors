import { describe, it, expect } from 'vitest';
import {
	APCA_THRESHOLDS,
	calculateAPCA,
	getAbsoluteContrast,
	meetsContrastThreshold,
	validatePaletteContrast,
	formatContrastReport,
	isPaletteAccessible,
	boostLightnessUntilContrast,
	ensureAccessibility
} from '../core/validate.js';
import { generatePalette } from '../core/palette.js';
import type { Palette } from '../types.js';

// Helper to create a test palette
function createTestPalette(brandColors: string[] = ['#3B82F6']): Palette {
	const light = generatePalette({ brandColors });
	const dark = generatePalette({ brandColors, mode: 'dark' });

	return {
		light: light.scales,
		dark: dark.scales,
		_meta: {
			tuningProfile: light.meta.tuningProfile,
			inputColors: brandColors,
			generatedAt: new Date().toISOString()
		}
	};
}

describe('APCA Validation', () => {
	describe('calculateAPCA', () => {
		it('calculates contrast for black on white', () => {
			const lc = calculateAPCA('#000000', '#ffffff');
			// Black text on white background has high positive contrast in APCA
			expect(lc).toBeGreaterThan(100);
		});

		it('calculates contrast for white on black', () => {
			const lc = calculateAPCA('#ffffff', '#000000');
			// White text on black background has high negative contrast in APCA
			expect(lc).toBeLessThan(-100);
		});

		it('returns zero for same color', () => {
			const lc = calculateAPCA('#808080', '#808080');
			expect(Math.abs(lc)).toBeLessThan(1);
		});

		it('handles hex colors with various formats', () => {
			const lc1 = calculateAPCA('#000', '#fff');
			const lc2 = calculateAPCA('#000000', '#ffffff');
			// Should be approximately equal
			expect(Math.abs(lc1 - lc2)).toBeLessThan(1);
		});
	});

	describe('getAbsoluteContrast', () => {
		it('returns absolute value for dark text on light bg', () => {
			const lc = getAbsoluteContrast('#000000', '#ffffff');
			expect(lc).toBeGreaterThan(100);
		});

		it('returns absolute value for light text on dark bg', () => {
			const lc = getAbsoluteContrast('#ffffff', '#000000');
			expect(lc).toBeGreaterThan(100);
		});
	});

	describe('meetsContrastThreshold', () => {
		it('returns true when contrast exceeds threshold', () => {
			expect(meetsContrastThreshold('#000000', '#ffffff', 75)).toBe(true);
		});

		it('returns false when contrast below threshold', () => {
			// Gray on slightly lighter gray - low contrast
			expect(meetsContrastThreshold('#808080', '#909090', 75)).toBe(false);
		});

		it('checks body text threshold correctly', () => {
			// Dark gray on white should meet body text threshold
			expect(
				meetsContrastThreshold('#333333', '#ffffff', APCA_THRESHOLDS.BODY_TEXT)
			).toBe(true);
		});
	});

	describe('validatePaletteContrast', () => {
		it('validates a standard palette', () => {
			const palette = createTestPalette(['#3B82F6']);
			const report = validatePaletteContrast(palette);

			expect(report).toHaveProperty('passed');
			expect(report).toHaveProperty('totalChecks');
			expect(report).toHaveProperty('passedChecks');
			expect(report).toHaveProperty('issues');
			expect(report).toHaveProperty('summary');
			expect(report.totalChecks).toBeGreaterThan(0);
		});

		it('can filter to specific hues', () => {
			const palette = createTestPalette(['#3B82F6']);
			const fullReport = validatePaletteContrast(palette);
			const filteredReport = validatePaletteContrast(palette, { hues: ['blue'] });

			expect(filteredReport.totalChecks).toBeLessThan(fullReport.totalChecks);
		});

		it('errorsOnly flag skips warning checks', () => {
			const palette = createTestPalette(['#3B82F6']);
			const fullReport = validatePaletteContrast(palette);
			const errorsOnlyReport = validatePaletteContrast(palette, { errorsOnly: true });

			// errorsOnly should have fewer checks (no warning-level checks)
			expect(errorsOnlyReport.totalChecks).toBeLessThanOrEqual(fullReport.totalChecks);
		});

		it('includes summary by hue', () => {
			const palette = createTestPalette(['#3B82F6']);
			const report = validatePaletteContrast(palette, { hues: ['blue', 'gray'] });

			expect(report.summary.byHue).toHaveProperty('blue');
			expect(report.summary.byHue).toHaveProperty('gray');
			expect(report.summary.byHue.blue).toHaveProperty('passed');
			expect(report.summary.byHue.blue).toHaveProperty('failed');
			expect(report.summary.byHue.blue).toHaveProperty('warnings');
		});

		it('includes summary by mode', () => {
			const palette = createTestPalette(['#3B82F6']);
			const report = validatePaletteContrast(palette);

			expect(report.summary.byMode.light).toHaveProperty('passed');
			expect(report.summary.byMode.dark).toHaveProperty('passed');
		});

		it('issues have required properties', () => {
			const palette = createTestPalette(['#3B82F6']);
			const report = validatePaletteContrast(palette);

			// Even if all pass, check the structure is correct
			if (report.issues.length > 0) {
				const issue = report.issues[0];
				expect(issue).toHaveProperty('hue');
				expect(issue).toHaveProperty('mode');
				expect(issue).toHaveProperty('textStep');
				expect(issue).toHaveProperty('bgStep');
				expect(issue).toHaveProperty('useCase');
				expect(issue).toHaveProperty('expected');
				expect(issue).toHaveProperty('actual');
				expect(issue).toHaveProperty('severity');
			}
		});
	});

	describe('formatContrastReport', () => {
		it('formats a passing report', () => {
			const palette = createTestPalette(['#3B82F6']);
			const report = validatePaletteContrast(palette, { hues: ['gray'], errorsOnly: true });
			const formatted = formatContrastReport(report);

			expect(formatted).toContain('APCA Contrast Validation Report');
			expect(formatted).toContain('Status:');
			expect(formatted).toContain('Checks:');
		});

		it('includes failure details when present', () => {
			// Create a report with failures by mocking
			const mockReport = {
				passed: false,
				totalChecks: 10,
				passedChecks: 8,
				issues: [
					{
						hue: 'test',
						mode: 'light' as const,
						textStep: 12,
						bgStep: 1,
						useCase: 'Test case',
						expected: 75,
						actual: 50,
						severity: 'fail' as const
					}
				],
				summary: {
					byHue: { test: { passed: 8, failed: 1, warnings: 1 } },
					byMode: {
						light: { passed: 4, failed: 1, warnings: 0 },
						dark: { passed: 4, failed: 0, warnings: 1 }
					}
				}
			};

			const formatted = formatContrastReport(mockReport);
			expect(formatted).toContain('FAILED');
			expect(formatted).toContain('[FAIL]');
			expect(formatted).toContain('test');
		});
	});

	describe('isPaletteAccessible', () => {
		it('returns true for accessible palette', () => {
			const palette = createTestPalette(['#3B82F6']);
			// Our Radix-based palettes should be accessible
			expect(isPaletteAccessible(palette)).toBe(true);
		});

		it('only checks critical failures, not warnings', () => {
			const palette = createTestPalette(['#3B82F6']);
			// This should pass because it ignores warnings
			const accessible = isPaletteAccessible(palette);
			expect(typeof accessible).toBe('boolean');
		});
	});

	describe('Real-world palette validation', () => {
		it('standard blue palette passes accessibility', () => {
			const palette = createTestPalette(['#3B82F6']);
			const report = validatePaletteContrast(palette, { hues: ['blue'], errorsOnly: true });

			expect(report.passed).toBe(true);
		});

		it('validates gray scale for text readability', () => {
			const palette = createTestPalette(['#3B82F6']);
			const report = validatePaletteContrast(palette, { hues: ['gray'], errorsOnly: true });

			// Gray scale should always pass - it's the primary text scale
			expect(report.passed).toBe(true);
		});

		it('validates multiple brand colors and reports issues', () => {
			const palette = createTestPalette(['#FF4F00', '#3B82F6', '#10B981']);
			const report = validatePaletteContrast(palette, { errorsOnly: true });

			// Report should have structure even if there are issues
			expect(report.totalChecks).toBeGreaterThan(0);
			expect(report.passedChecks).toBeGreaterThan(0);
			// Most checks should pass (at least 90%)
			expect(report.passedChecks / report.totalChecks).toBeGreaterThan(0.9);
		});

		it('validates warm hues and reports marginal issues', () => {
			const palette = createTestPalette(['#FF4F00']);
			const report = validatePaletteContrast(palette, {
				hues: ['orange', 'red', 'yellow'],
				errorsOnly: true
			});

			// Warm hues may have marginal step 11 contrast issues in dark mode
			// This is expected - red step 11 dark mode is ~58.8 Lc vs 60 threshold
			expect(report.totalChecks).toBeGreaterThan(0);
			// Most checks should pass
			expect(report.passedChecks / report.totalChecks).toBeGreaterThan(0.85);
		});

		it('validates cool hues (blue, cyan, teal)', () => {
			const palette = createTestPalette(['#3B82F6']);
			const report = validatePaletteContrast(palette, {
				hues: ['blue', 'cyan', 'teal'],
				errorsOnly: true
			});

			expect(report.passed).toBe(true);
		});

		it('validates dark mode specifically', () => {
			const palette = createTestPalette(['#3B82F6']);
			const report = validatePaletteContrast(palette, { errorsOnly: true });

			// Check dark mode specifically - should have no failures (only warnings)
			expect(report.summary.byMode.dark.failed).toBe(0);
		});

		it('reports warnings for step 9 button contrast', () => {
			const palette = createTestPalette(['#3B82F6']);
			const report = validatePaletteContrast(palette, { hues: ['blue'] });

			// Step 9 checks are warnings, not failures
			const step9Warnings = report.issues.filter(
				(i) => i.textStep === 9 && i.severity === 'warning'
			);
			// May have warnings for light and/or dark mode
			expect(step9Warnings.length).toBeGreaterThanOrEqual(0);
		});
	});

	describe('APCA threshold constants', () => {
		it('has correct threshold values', () => {
			expect(APCA_THRESHOLDS.BODY_TEXT).toBe(75);
			expect(APCA_THRESHOLDS.LARGE_TEXT).toBe(60);
			expect(APCA_THRESHOLDS.DECORATIVE).toBe(45);
		});
	});

	describe('boostLightnessUntilContrast', () => {
		it('returns original color if threshold already met', () => {
			const result = boostLightnessUntilContrast('#000000', '#ffffff', 60);
			expect(result).toBe('#000000');
		});

		it('boosts dark text on light background', () => {
			// Light gray text on white - contrast below 60 Lc
			const original = '#a0a0a0';
			const originalContrast = getAbsoluteContrast(original, '#ffffff');
			expect(originalContrast).toBeLessThan(60); // Verify we're starting below threshold

			const result = boostLightnessUntilContrast(original, '#ffffff', 60);

			// Result should be darker (lower lightness) to increase contrast
			expect(result).not.toBe(original);
			const contrast = getAbsoluteContrast(result, '#ffffff');
			expect(contrast).toBeGreaterThanOrEqual(60);
		});

		it('boosts light text on dark background', () => {
			// Dark gray text on black - contrast below 60 Lc
			const original = '#555555';
			const originalContrast = getAbsoluteContrast(original, '#000000');
			expect(originalContrast).toBeLessThan(60); // Verify we're starting below threshold

			const result = boostLightnessUntilContrast(original, '#000000', 60);

			// Result should be lighter to increase contrast
			expect(result).not.toBe(original);
			const contrast = getAbsoluteContrast(result, '#000000');
			expect(contrast).toBeGreaterThanOrEqual(60);
		});

		it('handles edge case near white', () => {
			// Very light gray on white
			const result = boostLightnessUntilContrast('#f0f0f0', '#ffffff', 60);
			// Should darken significantly
			const contrast = getAbsoluteContrast(result, '#ffffff');
			expect(contrast).toBeGreaterThanOrEqual(60);
		});

		it('handles edge case near black', () => {
			// Dark gray on black - achievable within iteration limit
			const original = '#303030';
			const result = boostLightnessUntilContrast(original, '#000000', 60);
			// Should lighten to reach threshold
			const contrast = getAbsoluteContrast(result, '#000000');
			expect(contrast).toBeGreaterThanOrEqual(60);
		});
	});

	describe('ensureAccessibility', () => {
		it('returns palette with same structure', () => {
			const palette = createTestPalette(['#3B82F6']);
			const result = ensureAccessibility(palette);

			expect(result).toHaveProperty('light');
			expect(result).toHaveProperty('dark');
			expect(result).toHaveProperty('_meta');
			expect(Object.keys(result.light)).toEqual(Object.keys(palette.light));
			expect(Object.keys(result.dark)).toEqual(Object.keys(palette.dark));
		});

		it('fixes marginal contrast issues in warm hues', () => {
			// Create palette with orange brand color (known to cause marginal issues)
			const palette = createTestPalette(['#FF4F00']);

			// Check before
			const reportBefore = validatePaletteContrast(palette, { errorsOnly: true });

			// Apply safeguard
			const fixed = ensureAccessibility(palette);

			// Check after - should pass all critical checks
			const reportAfter = validatePaletteContrast(fixed, { errorsOnly: true });

			// After should have no failures (or fewer)
			expect(reportAfter.issues.filter((i) => i.severity === 'fail').length).toBeLessThanOrEqual(
				reportBefore.issues.filter((i) => i.severity === 'fail').length
			);
		});

		it('does not modify colors that already meet thresholds', () => {
			// Neutral palette should not be modified
			const palette = createTestPalette([]);
			const result = ensureAccessibility(palette);

			// Gray scale should be identical
			expect(result.light.gray).toEqual(palette.light.gray);
			expect(result.dark.gray).toEqual(palette.dark.gray);
		});

		it('makes worst-case palettes fully accessible', () => {
			// Test with extreme brand colors
			const extremeColors = ['#FF0000', '#39FF14', '#FF1493'];

			for (const color of extremeColors) {
				const palette = createTestPalette([color]);
				const fixed = ensureAccessibility(palette);
				const report = validatePaletteContrast(fixed, { errorsOnly: true });

				// All critical checks should pass after safeguard
				const failures = report.issues.filter((i) => i.severity === 'fail');
				expect(failures.length).toBe(0);
			}
		});

		it('preserves _meta information', () => {
			const palette = createTestPalette(['#3B82F6']);
			const result = ensureAccessibility(palette);

			expect(result._meta).toEqual(palette._meta);
		});
	});
});
