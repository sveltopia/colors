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
});
