import { describe, it, expect } from 'vitest';
import { generateLightPalette, getPaletteStats } from '../core/palette.js';
import { HUE_KEYS, HUE_COUNT } from '../core/hues.js';
import { analyzeBrandColors } from '../core/analyze.js';

// Sveltopia brand colors
const SVELTOPIA_ORANGE = '#FF6A00';
const SVELTOPIA_GREEN = '#43A047';
const SVELTOPIA_DARK = '#1A1A1A';

describe('Full Palette Generation', () => {
	describe('generateLightPalette', () => {
		it('generates scales for all 31 baseline hues', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE]
			});

			expect(Object.keys(palette.scales)).toHaveLength(HUE_COUNT);

			// Verify all hue keys are present
			for (const key of HUE_KEYS) {
				expect(palette.scales[key]).toBeDefined();
			}
		});

		it('each scale has 12 steps', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE]
			});

			for (const [hue, scale] of Object.entries(palette.scales)) {
				const steps = Object.keys(scale).map(Number);
				expect(steps).toHaveLength(12);
				expect(steps).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
			}
		});

		it('all colors are valid hex strings', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE]
			});

			for (const scale of Object.values(palette.scales)) {
				for (const hex of Object.values(scale)) {
					expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
				}
			}
		});

		it('anchors brand colors to correct slots', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE, SVELTOPIA_GREEN]
			});

			// Orange should anchor to 'orange' slot
			expect(palette.meta.anchoredSlots).toContain('orange');

			// Green should anchor to 'grass' or 'green' (depends on hue distance)
			const greenAnchored =
				palette.meta.anchoredSlots.includes('grass') ||
				palette.meta.anchoredSlots.includes('green');
			expect(greenAnchored).toBe(true);
		});

		it('preserves tuning profile in metadata', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE, SVELTOPIA_GREEN]
			});

			expect(palette.meta.tuningProfile).toBeDefined();
			expect(typeof palette.meta.tuningProfile.hueShift).toBe('number');
			expect(typeof palette.meta.tuningProfile.chromaMultiplier).toBe('number');
			expect(typeof palette.meta.tuningProfile.lightnessShift).toBe('number');
		});

		it('records input colors in metadata', () => {
			const colors = [SVELTOPIA_ORANGE, SVELTOPIA_GREEN];
			const palette = generateLightPalette({ brandColors: colors });

			expect(palette.meta.inputColors).toEqual(colors);
		});

		it('includes generation timestamp', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE]
			});

			expect(palette.meta.generatedAt).toBeDefined();
			// Should be valid ISO date
			expect(() => new Date(palette.meta.generatedAt)).not.toThrow();
		});

		it('accepts custom tuning profile override', () => {
			const customProfile = {
				hueShift: 5,
				chromaMultiplier: 1.2,
				lightnessShift: 0.05,
				anchors: {}
			};

			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE],
				tuningProfile: customProfile
			});

			expect(palette.meta.tuningProfile).toEqual(customProfile);
		});

		it('works with single brand color', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE]
			});

			expect(Object.keys(palette.scales)).toHaveLength(HUE_COUNT);
			expect(palette.meta.anchoredSlots.length).toBeGreaterThan(0);
		});

		it('works with multiple brand colors', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE, SVELTOPIA_GREEN, SVELTOPIA_DARK]
			});

			expect(Object.keys(palette.scales)).toHaveLength(HUE_COUNT);
		});

		it('works with empty brand colors (uses defaults)', () => {
			const palette = generateLightPalette({
				brandColors: []
			});

			expect(Object.keys(palette.scales)).toHaveLength(HUE_COUNT);
			expect(palette.meta.anchoredSlots).toHaveLength(0);
		});
	});

	describe('getPaletteStats', () => {
		it('returns correct total hues', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE]
			});
			const stats = getPaletteStats(palette);

			expect(stats.totalHues).toBe(HUE_COUNT);
		});

		it('returns correct total colors (hues × 12)', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE]
			});
			const stats = getPaletteStats(palette);

			expect(stats.totalColors).toBe(HUE_COUNT * 12);
		});

		it('counts anchored hues correctly', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE, SVELTOPIA_GREEN]
			});
			const stats = getPaletteStats(palette);

			expect(stats.anchoredHues).toBe(palette.meta.anchoredSlots.length);
			expect(stats.anchoredHues).toBeGreaterThanOrEqual(2);
		});
	});

	describe('color quality', () => {
		it('step 1 colors are near-white (high lightness)', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE]
			});

			// Check a few scales - step 1 should be very light
			const orangeStep1 = palette.scales.orange[1];
			const blueStep1 = palette.scales.blue[1];

			// Near-white colors typically start with #f
			expect(orangeStep1.toLowerCase().startsWith('#f')).toBe(true);
			expect(blueStep1.toLowerCase().startsWith('#f')).toBe(true);
		});

		it('step 12 colors are dark (low lightness)', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE]
			});

			// Check a few scales - step 12 should be dark
			const orangeStep12 = palette.scales.orange[12];
			const blueStep12 = palette.scales.blue[12];

			// Dark colors have low RGB values (first digit after # is low)
			const orangeR = parseInt(orangeStep12.slice(1, 3), 16);
			const blueR = parseInt(blueStep12.slice(1, 3), 16);

			expect(orangeR).toBeLessThan(128);
			expect(blueR).toBeLessThan(128);
		});

		it('anchored slot uses brand color characteristics', () => {
			const palette = generateLightPalette({
				brandColors: [SVELTOPIA_ORANGE]
			});

			// The orange slot's step 9 should be close to the brand orange
			// Not exact match because generateScaleAPCA may adjust slightly
			const step9 = palette.scales.orange[9];

			// Should be an orange color (high red, medium green, low blue)
			const r = parseInt(step9.slice(1, 3), 16);
			const g = parseInt(step9.slice(3, 5), 16);
			const b = parseInt(step9.slice(5, 7), 16);

			expect(r).toBeGreaterThan(200); // High red
			expect(g).toBeLessThan(150); // Medium-low green
			expect(b).toBeLessThan(100); // Low blue
		});
	});

	describe('custom row generation', () => {
		it('generates custom row for pastel pink', () => {
			const palette = generateLightPalette({ brandColors: ['#FFD1DC'] });

			expect(palette.meta.customSlots.length).toBeGreaterThan(0);
			expect(palette.meta.customSlots[0]).toContain('pastel');

			// Custom row should exist in scales
			const customKey = palette.meta.customSlots[0];
			expect(palette.scales[customKey]).toBeDefined();
			expect(Object.keys(palette.scales[customKey])).toHaveLength(12);
		});

		it('generates custom row for neon green', () => {
			const palette = generateLightPalette({ brandColors: ['#39FF14'] });

			expect(palette.meta.customSlots.length).toBeGreaterThan(0);
			expect(palette.meta.customSlots[0]).toContain('neon');

			// Custom row should exist in scales
			const customKey = palette.meta.customSlots[0];
			expect(palette.scales[customKey]).toBeDefined();
		});

		it('preserves exact brand color at anchor step in custom row', () => {
			const pastelPink = '#ffd1dc';
			const palette = generateLightPalette({ brandColors: [pastelPink] });
			const customKey = palette.meta.customSlots[0];
			const scale = palette.scales[customKey];

			// Pastel pink should appear at its anchor step (exact match)
			const hasExactColor = Object.values(scale).some(
				(hex) => hex.toLowerCase() === pastelPink.toLowerCase()
			);
			expect(hasExactColor).toBe(true);
		});

		it('custom row is tracked in anchoredSlots', () => {
			const palette = generateLightPalette({ brandColors: ['#FFD1DC'] });
			const customKey = palette.meta.customSlots[0];

			// Custom rows should also be tracked as anchored
			expect(palette.meta.anchoredSlots).toContain(customKey);
		});

		it('getPaletteStats counts custom hues', () => {
			const palette = generateLightPalette({ brandColors: ['#FFD1DC'] });
			const stats = getPaletteStats(palette);

			expect(stats.customHues).toBe(1);
			expect(stats.totalHues).toBe(HUE_COUNT + 1); // 31 baseline + 1 custom
		});

		it('standard hues still use clamped chroma multiplier with neon input', () => {
			// When we have a neon input, non-anchored hues should still use
			// clamped chroma (not be influenced by the extreme chroma)
			const palette = generateLightPalette({ brandColors: ['#39FF14'] });

			// The neon creates a custom row, standard hues use default profile
			expect(palette.meta.customSlots.length).toBe(1);

			// Blue row should still be present and reasonable
			expect(palette.scales.blue).toBeDefined();
			expect(palette.scales.blue[9]).toBeDefined();
		});
	});

	describe('hue-gap custom row generation', () => {
		// Test cases from CC Handoff: colors that are >10° from nearest Radix slot
		const FIGMA_BLUE = '#1ABCFE';
		const CANVA_TEAL = '#00C4CC';

		it('generates custom row for Figma blue (hue-gap)', () => {
			const palette = generateLightPalette({ brandColors: [FIGMA_BLUE] });

			expect(palette.meta.customSlots.length).toBe(1);
			expect(palette.meta.customSlots[0]).toContain('custom-');

			// Custom row should exist in scales
			const customKey = palette.meta.customSlots[0];
			expect(palette.scales[customKey]).toBeDefined();
			expect(Object.keys(palette.scales[customKey])).toHaveLength(12);
		});

		it('generates custom row for Canva teal (hue-gap)', () => {
			const palette = generateLightPalette({ brandColors: [CANVA_TEAL] });

			expect(palette.meta.customSlots.length).toBe(1);
			expect(palette.meta.customSlots[0]).toContain('custom-');

			// Custom row should exist in scales
			const customKey = palette.meta.customSlots[0];
			expect(palette.scales[customKey]).toBeDefined();
		});

		it('preserves exact brand color at anchor step in hue-gap row', () => {
			const palette = generateLightPalette({ brandColors: [FIGMA_BLUE] });
			const customKey = palette.meta.customSlots[0];
			const scale = palette.scales[customKey];

			// Brand color should appear at its anchor step (exact match)
			const hasExactColor = Object.values(scale).some(
				(hex) => hex.toLowerCase() === FIGMA_BLUE.toLowerCase()
			);
			expect(hasExactColor).toBe(true);
		});

		it('hue-gap row is tracked in anchoredSlots', () => {
			const palette = generateLightPalette({ brandColors: [FIGMA_BLUE] });
			const customKey = palette.meta.customSlots[0];

			expect(palette.meta.anchoredSlots).toContain(customKey);
		});

		it('getPaletteStats counts hue-gap custom hues', () => {
			const palette = generateLightPalette({ brandColors: [FIGMA_BLUE] });
			const stats = getPaletteStats(palette);

			expect(stats.customHues).toBe(1);
			expect(stats.totalHues).toBe(HUE_COUNT + 1);
		});
	});

	describe('nearly Radix anchored rows', () => {
		// Slack cyan is very close to Radix cyan: 1.5° hue, 1.07x chroma
		// Should generate a row that tracks Radix closely (no propagated drift)
		const SLACK_CYAN = '#36C5F0';

		it('Slack cyan anchors to cyan slot (not custom row)', () => {
			const analysis = analyzeBrandColors([SLACK_CYAN]);

			// Should NOT be a custom row (it snaps and has normal chroma)
			expect(analysis.customRows).toBeUndefined();

			// Should anchor to cyan
			expect(analysis.anchors[SLACK_CYAN].slot).toBe('cyan');
			expect(analysis.anchors[SLACK_CYAN].isCustomRow).toBeFalsy();
		});

		it('Slack cyan row tracks Radix cyan closely (no drift)', () => {
			const palette = generateLightPalette({ brandColors: [SLACK_CYAN] });
			const cyanScale = palette.scales.cyan;

			// Get the actual anchor step from metadata
			// Slack cyan anchors at step 7 (L=0.768 matches step 7's L=0.805)
			const anchorStep = palette.meta.tuningProfile.anchors[SLACK_CYAN]?.step ?? 9;
			expect(anchorStep).toBe(7); // Verify our understanding

			// Import Radix colors for comparison
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const radixCyan = require('@radix-ui/colors').cyan;

			// Helper to parse hex to RGB
			const hexToRgb = (hex: string) => ({
				r: parseInt(hex.slice(1, 3), 16),
				g: parseInt(hex.slice(3, 5), 16),
				b: parseInt(hex.slice(5, 7), 16)
			});

			// Check that non-anchor steps are close to Radix
			// Anchor step preserves exact brand color, all others should match Radix
			for (let step = 1; step <= 12; step++) {
				if (step === anchorStep) continue; // Skip anchor step (exact brand color)

				const generated = cyanScale[step as keyof typeof cyanScale];
				const radix = radixCyan[`cyan${step}`];

				// Both should exist
				expect(generated).toBeDefined();
				expect(radix).toBeDefined();

				// Should be very close (within 5 RGB points per channel)
				// Small differences may occur due to:
				// 1. OKLCH precision/rounding
				// 2. Global tuning profile being applied for uniform brand character
				//    (Slack's global tuning is ~0.2° hue, ~1.06x chroma)
				const genRgb = hexToRgb(generated);
				const radixRgb = hexToRgb(radix);
				const maxDiff = Math.max(
					Math.abs(genRgb.r - radixRgb.r),
					Math.abs(genRgb.g - radixRgb.g),
					Math.abs(genRgb.b - radixRgb.b)
				);
				expect(maxDiff).toBeLessThanOrEqual(5);
			}
		});

		it('brand colors with significant departure still propagate offset', () => {
			// Use a color that's clearly outside "nearly Radix" threshold
			// Hot pink #FF69B4 has significant hue offset from pink slot
			const HOT_PINK = '#FF69B4';
			const palette = generateLightPalette({ brandColors: [HOT_PINK] });
			const pinkScale = palette.scales.pink;

			// Import Radix colors for comparison
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const radixPink = require('@radix-ui/colors').pink;

			// Helper to parse hex to RGB
			const hexToRgb = (hex: string) => ({
				r: parseInt(hex.slice(1, 3), 16),
				g: parseInt(hex.slice(3, 5), 16),
				b: parseInt(hex.slice(5, 7), 16)
			});

			// At least some non-anchor steps should differ significantly from Radix
			// (because brand offset is propagated)
			let maxDifference = 0;
			for (let step = 1; step <= 12; step++) {
				if (step === 9) continue;
				const generated = pinkScale[step as keyof typeof pinkScale];
				const radix = radixPink[`pink${step}`];
				const genRgb = hexToRgb(generated);
				const radixRgb = hexToRgb(radix);
				const diff = Math.max(
					Math.abs(genRgb.r - radixRgb.r),
					Math.abs(genRgb.g - radixRgb.g),
					Math.abs(genRgb.b - radixRgb.b)
				);
				maxDifference = Math.max(maxDifference, diff);
			}
			// Should have at least some noticeable difference (>5 RGB points)
			expect(maxDifference).toBeGreaterThan(5);
		});
	});
});
