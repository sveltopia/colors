import { describe, it, expect } from 'vitest';
import {
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
} from '../core/export.js';
import { generatePalette } from '../core/palette.js';
import { rgb, oklch, formatHex } from 'culori';
import type { Palette, Scale } from '../types.js';

/**
 * Blend an alpha color over a background and return the resulting RGB.
 * This simulates what the browser does when rendering transparent colors.
 */
function blendOver(
	fgR: number,
	fgG: number,
	fgB: number,
	alpha: number,
	bgR: number,
	bgG: number,
	bgB: number
): [number, number, number] {
	// Browser blending: result = bg * (1 - alpha) + fg * alpha
	// With per-channel rounding as browsers do
	const r = Math.round(bgR * (1 - alpha)) + Math.round(fgR * alpha);
	const g = Math.round(bgG * (1 - alpha)) + Math.round(fgG * alpha);
	const b = Math.round(bgB * (1 - alpha)) + Math.round(fgB * alpha);
	return [r, g, b];
}

// Helper to create a minimal test palette
function createTestPalette(): Palette {
	const light = generatePalette({ brandColors: ['#3B82F6'] }); // Blue brand
	const dark = generatePalette({ brandColors: ['#3B82F6'], mode: 'dark' });

	return {
		light: light.scales,
		dark: dark.scales,
		_meta: {
			tuningProfile: light.meta.tuningProfile,
			inputColors: ['#3B82F6'],
			generatedAt: new Date().toISOString()
		}
	};
}

describe('Export Utilities', () => {
	describe('Alpha Color Calculation', () => {
		it('calculates alpha color for sRGB', () => {
			// Light gray on white should have low alpha
			const [r, g, b, a] = getAlphaColorSrgb('#cccccc', '#ffffff');

			expect(r).toBeGreaterThanOrEqual(0);
			expect(r).toBeLessThanOrEqual(1);
			expect(g).toBeGreaterThanOrEqual(0);
			expect(g).toBeLessThanOrEqual(1);
			expect(b).toBeGreaterThanOrEqual(0);
			expect(b).toBeLessThanOrEqual(1);
			expect(a).toBeGreaterThan(0);
			expect(a).toBeLessThanOrEqual(1);
		});

		it('calculates alpha color for P3', () => {
			const [r, g, b, a] = getAlphaColorP3('#3B82F6', '#ffffff');

			expect(r).toBeGreaterThanOrEqual(0);
			expect(r).toBeLessThanOrEqual(1);
			expect(a).toBeGreaterThan(0);
			expect(a).toBeLessThanOrEqual(1);
		});

		// CRITICAL: This test catches the precision bug where rgbPrecision=1 caused all values to round to 0 or 1
		it('P3 alpha values have proper precision (not degenerate)', () => {
			const testCases = [
				{ target: '#fefcfb', bg: '#ffffff' }, // Very light on white (low alpha)
				{ target: '#ff6300', bg: '#ffffff' }, // Saturated orange on white
				{ target: '#3B82F6', bg: '#ffffff' }, // Blue on white
				{ target: '#cccccc', bg: '#ffffff' } // Gray on white
			];

			for (const { target, bg } of testCases) {
				const [r, g, b, a] = getAlphaColorP3(target, bg);

				// Check that at least one RGB value is NOT exactly 0 or 1
				// (degenerate values indicate precision bug)
				const hasIntermediateR = r > 0.001 && r < 0.999;
				const hasIntermediateG = g > 0.001 && g < 0.999;
				const hasIntermediateB = b > 0.001 && b < 0.999;
				const hasIntermediateA = a > 0.001 && a < 0.999;

				// For colored inputs, we expect intermediate values
				// Skip check if alpha is very close to 1 (fully opaque, common for saturated colors)
				if (a < 0.99) {
					expect(
						hasIntermediateR || hasIntermediateG || hasIntermediateB || hasIntermediateA,
						`P3 alpha for ${target} has degenerate values: r=${r}, g=${g}, b=${b}, a=${a}`
					).toBe(true);
				}
			}
		});

		// Verify P3 alpha values vary appropriately across a scale
		// (The bug produced identical degenerate values for all steps)
		it('P3 alpha values vary appropriately across light/dark steps', () => {
			// Light steps should have lower alpha, dark steps should have higher alpha
			const lightStep = getAlphaColorP3('#f0f0f0', '#ffffff'); // Very light on white
			const darkStep = getAlphaColorP3('#333333', '#ffffff'); // Dark on white

			// Dark colors need more alpha to achieve the target over white
			expect(
				darkStep[3],
				`Dark step alpha (${darkStep[3].toFixed(3)}) should be > light step alpha (${lightStep[3].toFixed(3)})`
			).toBeGreaterThan(lightStep[3]);

			// Light step should have low but non-zero alpha
			expect(lightStep[3]).toBeGreaterThan(0);
			expect(lightStep[3]).toBeLessThan(0.2);

			// Dark step should have high alpha
			expect(darkStep[3]).toBeGreaterThan(0.7);
		});

		it('handles pure gray correctly', () => {
			// Pure gray should have equal R, G, B values
			const [r, g, b] = getAlphaColorSrgb('#808080', '#ffffff');
			expect(r).toBe(g);
			expect(g).toBe(b);
		});

		it('handles dark mode (lightening background)', () => {
			const [r, g, b, a] = getAlphaColorSrgb('#3B82F6', '#000000');

			expect(r).toBeGreaterThanOrEqual(0);
			expect(a).toBeGreaterThan(0);
		});

		// MATHEMATICAL VALIDATION: Alpha blending round-trip
		// The whole point of alpha colors is that when you blend them over the background,
		// you get back the original target color. This test verifies the math is correct.
		it('alpha color blends back to target (light mode - multiple colors)', () => {
			const testCases = [
				{ target: '#cccccc', bg: '#ffffff' }, // Light gray on white
				{ target: '#3B82F6', bg: '#ffffff' }, // Blue on white
				{ target: '#ff6600', bg: '#ffffff' }, // Orange on white
				{ target: '#1a1a1a', bg: '#ffffff' }, // Near-black on white
				{ target: '#f0f0f0', bg: '#ffffff' } // Very light gray on white
			];

			for (const { target, bg } of testCases) {
				const [r, g, b, a] = getAlphaColorSrgb(target, bg);

				// Convert to 0-255 range for blending
				const fgR = Math.round(r * 255);
				const fgG = Math.round(g * 255);
				const fgB = Math.round(b * 255);
				const bgRgb = rgb(bg)!;
				const bgR = Math.round(bgRgb.r * 255);
				const bgG = Math.round(bgRgb.g * 255);
				const bgB = Math.round(bgRgb.b * 255);

				// Blend the alpha color over the background
				const [blendedR, blendedG, blendedB] = blendOver(fgR, fgG, fgB, a, bgR, bgG, bgB);

				// Compare to target
				const targetRgb = rgb(target)!;
				const targetR = Math.round(targetRgb.r * 255);
				const targetG = Math.round(targetRgb.g * 255);
				const targetB = Math.round(targetRgb.b * 255);

				// Allow ±1 for rounding errors (browser-compatible tolerance)
				expect(Math.abs(blendedR - targetR)).toBeLessThanOrEqual(1);
				expect(Math.abs(blendedG - targetG)).toBeLessThanOrEqual(1);
				expect(Math.abs(blendedB - targetB)).toBeLessThanOrEqual(1);
			}
		});

		it('alpha color blends back to target (dark mode - multiple colors)', () => {
			const testCases = [
				{ target: '#333333', bg: '#000000' }, // Dark gray on black
				{ target: '#3B82F6', bg: '#000000' }, // Blue on black
				{ target: '#ff6600', bg: '#000000' }, // Orange on black
				{ target: '#e0e0e0', bg: '#000000' }, // Light gray on black
				{ target: '#0a0a0a', bg: '#000000' } // Near-black on black
			];

			for (const { target, bg } of testCases) {
				const [r, g, b, a] = getAlphaColorSrgb(target, bg);

				const fgR = Math.round(r * 255);
				const fgG = Math.round(g * 255);
				const fgB = Math.round(b * 255);
				const bgRgb = rgb(bg)!;
				const bgR = Math.round(bgRgb.r * 255);
				const bgG = Math.round(bgRgb.g * 255);
				const bgB = Math.round(bgRgb.b * 255);

				const [blendedR, blendedG, blendedB] = blendOver(fgR, fgG, fgB, a, bgR, bgG, bgB);

				const targetRgb = rgb(target)!;
				const targetR = Math.round(targetRgb.r * 255);
				const targetG = Math.round(targetRgb.g * 255);
				const targetB = Math.round(targetRgb.b * 255);

				expect(Math.abs(blendedR - targetR)).toBeLessThanOrEqual(1);
				expect(Math.abs(blendedG - targetG)).toBeLessThanOrEqual(1);
				expect(Math.abs(blendedB - targetB)).toBeLessThanOrEqual(1);
			}
		});

		it('alpha color blends correctly for full palette scale', () => {
			// Test a complete 12-step scale to ensure alpha works across the full range
			const palette = createTestPalette();
			const blueScale = palette.light.blue;
			const background = '#ffffff';

			for (let step = 1; step <= 12; step++) {
				const targetHex = blueScale[step as keyof Scale];
				const [r, g, b, a] = getAlphaColorSrgb(targetHex, background);

				const fgR = Math.round(r * 255);
				const fgG = Math.round(g * 255);
				const fgB = Math.round(b * 255);

				const [blendedR, blendedG, blendedB] = blendOver(fgR, fgG, fgB, a, 255, 255, 255);

				const targetRgb = rgb(targetHex)!;
				const targetR = Math.round(targetRgb.r * 255);
				const targetG = Math.round(targetRgb.g * 255);
				const targetB = Math.round(targetRgb.b * 255);

				// Verify each step blends correctly
				expect(
					Math.abs(blendedR - targetR),
					`Step ${step} red channel mismatch`
				).toBeLessThanOrEqual(1);
				expect(
					Math.abs(blendedG - targetG),
					`Step ${step} green channel mismatch`
				).toBeLessThanOrEqual(1);
				expect(
					Math.abs(blendedB - targetB),
					`Step ${step} blue channel mismatch`
				).toBeLessThanOrEqual(1);
			}
		});
	});

	describe('Color Formatting', () => {
		it('formats OKLCH correctly', () => {
			const result = formatOklchCss('#3B82F6');

			expect(result).toMatch(/^oklch\(\d+\.\d+% \d+\.\d+ \d+\.\d+\)$/);
			expect(result).toContain('%'); // Lightness as percentage
		});

		it('formats P3 correctly', () => {
			const result = formatP3Css('#3B82F6');

			expect(result).toMatch(/^color\(display-p3 \d+\.\d+ \d+\.\d+ \d+\.\d+\)$/);
		});

		it('formats alpha hex correctly', () => {
			const result = formatAlphaHex(0.5, 0.5, 0.5, 0.5);

			expect(result).toMatch(/^#[0-9a-f]{8}$/);
			expect(result).toBe('#80808080');
		});

		it('formats alpha P3 correctly', () => {
			const result = formatAlphaP3(0.5, 0.5, 0.5, 0.5);

			expect(result).toMatch(/^color\(display-p3 .+ \/ .+\)$/);
			expect(result).toContain('0.5000');
		});

		// MATHEMATICAL VALIDATION: OKLCH round-trip
		// Verify that our OKLCH formatting produces values that convert back to the same color
		it('OKLCH values are mathematically correct (round-trip)', () => {
			const testColors = [
				'#3B82F6', // Blue
				'#ff6600', // Orange
				'#00ff00', // Green
				'#ffffff', // White
				'#000000', // Black
				'#808080' // Gray
			];

			for (const hex of testColors) {
				const oklchCss = formatOklchCss(hex);

				// Parse the OKLCH string we generated
				const match = oklchCss.match(/oklch\((\d+\.?\d*)% (\d+\.?\d*) (\d+\.?\d*)\)/);
				expect(match, `Failed to parse OKLCH for ${hex}`).not.toBeNull();

				const [, lPct, c, h] = match!;
				const l = parseFloat(lPct) / 100;
				const chroma = parseFloat(c);
				const hue = parseFloat(h);

				// Convert back to hex using Culori
				const reconstructed = formatHex({ mode: 'oklch', l, c: chroma, h: hue });

				// The original and reconstructed should match (or be very close)
				const origRgb = rgb(hex)!;
				const reconRgb = rgb(reconstructed!)!;

				// Allow small tolerance for floating point precision
				expect(
					Math.abs(origRgb.r - reconRgb.r),
					`Red mismatch for ${hex}`
				).toBeLessThan(0.01);
				expect(
					Math.abs(origRgb.g - reconRgb.g),
					`Green mismatch for ${hex}`
				).toBeLessThan(0.01);
				expect(
					Math.abs(origRgb.b - reconRgb.b),
					`Blue mismatch for ${hex}`
				).toBeLessThan(0.01);
			}
		});

		it('P3 values are mathematically correct (round-trip)', () => {
			const testColors = ['#3B82F6', '#ff6600', '#00ff00'];

			for (const hex of testColors) {
				const p3Css = formatP3Css(hex);

				// Parse the P3 string
				const match = p3Css.match(
					/color\(display-p3 (\d+\.?\d*) (\d+\.?\d*) (\d+\.?\d*)\)/
				);
				expect(match, `Failed to parse P3 for ${hex}`).not.toBeNull();

				const [, rStr, gStr, bStr] = match!;
				const r = parseFloat(rStr);
				const g = parseFloat(gStr);
				const b = parseFloat(bStr);

				// P3 values should be in valid range
				expect(r).toBeGreaterThanOrEqual(0);
				expect(r).toBeLessThanOrEqual(1);
				expect(g).toBeGreaterThanOrEqual(0);
				expect(g).toBeLessThanOrEqual(1);
				expect(b).toBeGreaterThanOrEqual(0);
				expect(b).toBeLessThanOrEqual(1);

				// Convert back and compare
				const reconstructed = formatHex({ mode: 'p3', r, g, b });
				const origRgb = rgb(hex)!;
				const reconRgb = rgb(reconstructed!)!;

				// P3 -> sRGB conversion may have small differences, allow tolerance
				expect(Math.abs(origRgb.r - reconRgb.r)).toBeLessThan(0.02);
				expect(Math.abs(origRgb.g - reconRgb.g)).toBeLessThan(0.02);
				expect(Math.abs(origRgb.b - reconRgb.b)).toBeLessThan(0.02);
			}
		});
	});

	describe('Semantic Tokens', () => {
		const lightScale: Scale = {
			1: '#f8fafc',
			2: '#f1f5f9',
			3: '#e2e8f0',
			4: '#cbd5e1',
			5: '#94a3b8',
			6: '#64748b',
			7: '#475569',
			8: '#334155',
			9: '#3B82F6', // Bright blue - should get white contrast
			10: '#2563eb',
			11: '#1d4ed8',
			12: '#1e3a8a'
		};

		const darkScale: Scale = {
			1: '#0f172a',
			2: '#1e293b',
			3: '#334155',
			4: '#475569',
			5: '#64748b',
			6: '#94a3b8',
			7: '#cbd5e1',
			8: '#e2e8f0',
			9: '#3B82F6',
			10: '#60a5fa',
			11: '#93c5fd',
			12: '#dbeafe'
		};

		it('determines contrast color for dark step 9', () => {
			const contrast = getContrastColor('#1e3a8a'); // Dark blue
			expect(contrast).toBe('#fff');
		});

		it('determines contrast color for bright step 9', () => {
			const contrast = getContrastColor('#fef08a'); // Bright yellow
			expect(contrast).not.toBe('#fff');
		});

		it('calculates surface color for light mode', () => {
			const surface = getSurfaceColor('#f8fafc', 'light');
			expect(surface).toMatch(/^#[0-9a-f]{8}$/i);
			expect(surface.slice(-2).toLowerCase()).toBe('cc'); // 80% = 0xCC
		});

		it('calculates surface color for dark mode', () => {
			const surface = getSurfaceColor('#0f172a', 'dark');
			expect(surface).toMatch(/^#[0-9a-f]{8}$/i);
			expect(surface.slice(-2).toLowerCase()).toBe('80'); // 50% = 0x80
		});

		it('returns all semantic tokens', () => {
			const tokens = getSemanticTokens(lightScale, 'light');

			expect(tokens).toHaveProperty('contrast');
			expect(tokens).toHaveProperty('surface');
			expect(tokens).toHaveProperty('indicator');
			expect(tokens).toHaveProperty('track');
			expect(tokens.indicator).toBe(lightScale[9]);
			expect(tokens.track).toBe(lightScale[9]);
		});
	});

	describe('CSS Export', () => {
		it('exports basic CSS with default options', () => {
			const palette = createTestPalette();
			const css = exportCSS(palette);

			// Should have root selector for light mode
			expect(css).toContain(':root {');
			// Should have dark selector
			expect(css).toContain('.dark, .dark-theme {');
			// Should have CSS variables
			expect(css).toMatch(/--\w+-\d+:/);
			// Should have P3 support block
			expect(css).toContain('@supports (color: color(display-p3 1 1 1))');
		});

		it('exports only specified scales', () => {
			const palette = createTestPalette();
			const css = exportCSS(palette, { scales: ['blue'] });

			expect(css).toContain('--blue-1:');
			expect(css).not.toContain('--red-1:');
			expect(css).not.toContain('--green-1:');
		});

		it('exports with custom prefix', () => {
			const palette = createTestPalette();
			const css = exportCSS(palette, { scales: ['blue'], prefix: 'brand' });

			expect(css).toContain('--brand-1:');
			expect(css).toContain('--brand-9:');
		});

		it('exports light mode only', () => {
			const palette = createTestPalette();
			const css = exportCSS(palette, { mode: 'light' });

			expect(css).toContain(':root {');
			expect(css).not.toContain('.dark, .dark-theme {');
		});

		it('exports dark mode only', () => {
			const palette = createTestPalette();
			const css = exportCSS(palette, { mode: 'dark' });

			expect(css).not.toMatch(/^:root \{/m);
			expect(css).toContain('.dark, .dark-theme {');
		});

		it('exports alpha variants', () => {
			const palette = createTestPalette();
			const css = exportCSS(palette, { scales: ['blue'], includeAlpha: true });

			expect(css).toContain('--blue-a1:');
			expect(css).toContain('--blue-a12:');
		});

		it('excludes alpha variants when disabled', () => {
			const palette = createTestPalette();
			const css = exportCSS(palette, { scales: ['blue'], includeAlpha: false });

			expect(css).not.toContain('--blue-a1:');
		});

		it('exports semantic tokens', () => {
			const palette = createTestPalette();
			const css = exportCSS(palette, { scales: ['blue'], includeSemantic: true });

			expect(css).toContain('--blue-contrast:');
			expect(css).toContain('--blue-surface:');
			expect(css).toContain('--blue-indicator:');
			expect(css).toContain('--blue-track:');
		});

		it('excludes P3 block when disabled', () => {
			const palette = createTestPalette();
			const css = exportCSS(palette, { includeP3: false });

			expect(css).not.toContain('@supports');
			expect(css).not.toContain('display-p3');
		});

		it('uses custom selectors', () => {
			const palette = createTestPalette();
			const css = exportCSS(palette, {
				lightSelector: '.light-theme',
				darkSelector: '[data-theme="dark"]'
			});

			expect(css).toContain('.light-theme {');
			expect(css).toContain('[data-theme="dark"] {');
		});
	});

	describe('JSON Export', () => {
		it('exports basic JSON structure', () => {
			const palette = createTestPalette();
			const json = exportJSON(palette);

			expect(json).toHaveProperty('light');
			expect(json).toHaveProperty('dark');
			expect(json).toHaveProperty('_meta');
			expect(json._meta).toHaveProperty('generatedAt');
			expect(json._meta).toHaveProperty('scales');
		});

		it('includes multiple color formats per step', () => {
			const palette = createTestPalette();
			const json = exportJSON(palette, { scales: ['blue'] });

			expect(json.light.blue).toBeDefined();
			expect(json.light.blue['1']).toHaveProperty('hex');
			expect(json.light.blue['1']).toHaveProperty('oklch');
			expect(json.light.blue['1']).toHaveProperty('p3');
		});

		it('exports only specified scales', () => {
			const palette = createTestPalette();
			const json = exportJSON(palette, { scales: ['blue', 'gray'] });

			expect(json._meta.scales).toContain('blue');
			expect(json._meta.scales).toContain('gray');
			// Should only have the specified scales
			const lightKeys = Object.keys(json.light);
			expect(lightKeys.every((k) => ['blue', 'gray'].includes(k))).toBe(true);
		});

		it('includes alpha scales', () => {
			const palette = createTestPalette();
			const json = exportJSON(palette, { scales: ['blue'], includeAlpha: true });

			expect(json.lightA).toBeDefined();
			expect(json.darkA).toBeDefined();
			expect(json.lightA?.blue).toBeDefined();
			expect(json.lightA?.blue['1']).toHaveProperty('hex');
			expect(json.lightA?.blue['1']).toHaveProperty('p3');
		});

		it('excludes alpha scales when disabled', () => {
			const palette = createTestPalette();
			const json = exportJSON(palette, { includeAlpha: false });

			expect(json.lightA).toBeUndefined();
			expect(json.darkA).toBeUndefined();
		});

		it('includes semantic tokens', () => {
			const palette = createTestPalette();
			const json = exportJSON(palette, { scales: ['blue'], includeSemantic: true });

			expect(json.semantic).toBeDefined();
			expect(json.semantic?.light.blue).toBeDefined();
			expect(json.semantic?.light.blue).toHaveProperty('contrast');
			expect(json.semantic?.light.blue).toHaveProperty('surface');
			expect(json.semantic?.light.blue).toHaveProperty('indicator');
			expect(json.semantic?.light.blue).toHaveProperty('track');
		});

		it('excludes semantic tokens when disabled', () => {
			const palette = createTestPalette();
			const json = exportJSON(palette, { includeSemantic: false });

			expect(json.semantic).toBeUndefined();
		});

		it('excludes P3 values when disabled', () => {
			const palette = createTestPalette();
			const json = exportJSON(palette, { scales: ['blue'], includeP3: false });

			expect(json.light.blue['1'].p3).toBe('');
		});
	});
});
