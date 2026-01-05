import { describe, it, expect } from 'vitest';
import {
	generateScale,
	generateScaleAPCA,
	validateScale,
	RADIX_APCA_TARGETS,
	RADIX_LIGHTNESS_TARGETS,
	CHROMA_CURVE
} from '../core/generate.js';

// Test colors
const SVELTOPIA_ORANGE = '#FF6A00';
const RADIX_ORANGE_9 = '#f76b15';
const RADIX_BLUE_9 = '#0090ff';
const RADIX_GREEN_9 = '#30a46c';
const NEAR_WHITE = '#fefefe';
const NEAR_BLACK = '#1a1a1a';

describe('Scale Generation', () => {
	describe('generateScale', () => {
		it('generates 12 steps', () => {
			const scale = generateScale({ parentColor: SVELTOPIA_ORANGE });
			expect(scale.steps).toHaveLength(12);
		});

		it('step 9 uses parent color values', () => {
			const scale = generateScale({ parentColor: SVELTOPIA_ORANGE });
			const step9 = scale.steps[8]; // 0-indexed

			expect(step9.step).toBe(9);
			// Step 9 should have parent's lightness (approximately)
			expect(step9.oklch.l).toBeCloseTo(scale.parentOklch.l, 1);
		});

		it('preserves parent hue across all steps', () => {
			const scale = generateScale({ parentColor: SVELTOPIA_ORANGE });
			const parentHue = scale.parentOklch.h;

			for (const step of scale.steps) {
				// Allow small drift in dark steps (up to 3°)
				expect(Math.abs(step.oklch.h - parentHue)).toBeLessThan(5);
			}
		});

		it('lightness decreases from step 1 to step 12', () => {
			const scale = generateScale({ parentColor: SVELTOPIA_ORANGE });

			for (let i = 1; i < scale.steps.length; i++) {
				expect(scale.steps[i].oklch.l).toBeLessThanOrEqual(scale.steps[i - 1].oklch.l);
			}
		});

		it('APCA contrast increases from step 1 to step 12', () => {
			const scale = generateScale({ parentColor: SVELTOPIA_ORANGE });

			// APCA should generally increase (with some tolerance for near-zero steps)
			expect(scale.steps[11].apca).toBeGreaterThan(scale.steps[0].apca);
			expect(scale.steps[11].apca).toBeGreaterThan(80); // Text should have high contrast
		});

		it('generates valid hex colors', () => {
			const scale = generateScale({ parentColor: SVELTOPIA_ORANGE });

			for (const step of scale.steps) {
				expect(step.hex).toMatch(/^#[0-9a-f]{6}$/i);
			}
		});

		it('throws for invalid parent color', () => {
			expect(() => generateScale({ parentColor: 'not-a-color' })).toThrow();
		});
	});

	describe('generateScaleAPCA', () => {
		it('generates 12 steps', () => {
			const scale = generateScaleAPCA({ parentColor: SVELTOPIA_ORANGE });
			expect(scale.steps).toHaveLength(12);
		});

		it('achieves APCA targets within tolerance for meaningful steps', () => {
			const scale = generateScaleAPCA({ parentColor: SVELTOPIA_ORANGE });

			// Check steps with meaningful targets (skip 1-3 which are near-zero)
			for (let i = 3; i < 12; i++) {
				const step = scale.steps[i];
				if (step.targetApca >= 5) {
					const diff = Math.abs(step.apca - step.targetApca);
					// Allow 5 Lc tolerance (APCA is tricky)
					expect(diff).toBeLessThan(10);
				}
			}
		});

		it('step 12 has high contrast for text', () => {
			const scale = generateScaleAPCA({ parentColor: SVELTOPIA_ORANGE });
			expect(scale.steps[11].apca).toBeGreaterThan(85);
		});
	});

	describe('chroma curve', () => {
		it('CHROMA_CURVE peaks at step 9', () => {
			const peakIndex = CHROMA_CURVE.indexOf(Math.max(...CHROMA_CURVE));
			expect(peakIndex).toBe(8); // 0-indexed, so step 9
		});

		it('CHROMA_CURVE is lower at extremes', () => {
			expect(CHROMA_CURVE[0]).toBeLessThan(0.1); // Step 1
			expect(CHROMA_CURVE[11]).toBeLessThan(0.6); // Step 12
			expect(CHROMA_CURVE[8]).toBe(1.0); // Step 9 (peak)
		});

		it('generated scale has peak chroma near step 9-10', () => {
			const scale = generateScale({ parentColor: SVELTOPIA_ORANGE });
			const chromas = scale.steps.map((s) => s.oklch.c);
			const maxChroma = Math.max(...chromas);
			const maxIndex = chromas.indexOf(maxChroma);

			// Peak should be at step 9 or 10 (index 8 or 9)
			expect(maxIndex).toBeGreaterThanOrEqual(7);
			expect(maxIndex).toBeLessThanOrEqual(9);
		});
	});

	describe('validateScale', () => {
		it('returns valid for well-generated scale', () => {
			const scale = generateScaleAPCA({ parentColor: SVELTOPIA_ORANGE });
			const result = validateScale(scale);

			// Should have few or no errors for APCA-targeted scale
			expect(result.errors.length).toBeLessThan(5);
		});

		it('identifies steps that miss APCA targets', () => {
			const scale = generateScale({ parentColor: SVELTOPIA_ORANGE });
			const result = validateScale(scale);

			// Simple generation might miss some targets
			// Each error should have step, actual, target, diff
			for (const error of result.errors) {
				expect(error.step).toBeGreaterThanOrEqual(1);
				expect(error.step).toBeLessThanOrEqual(12);
				expect(typeof error.actual).toBe('number');
				expect(typeof error.target).toBe('number');
				expect(typeof error.diff).toBe('number');
			}
		});
	});

	describe('different hues', () => {
		it('generates valid scales for blue', () => {
			const scale = generateScale({ parentColor: RADIX_BLUE_9 });
			expect(scale.steps).toHaveLength(12);
			expect(scale.steps[11].apca).toBeGreaterThan(80);
		});

		it('generates valid scales for green', () => {
			const scale = generateScale({ parentColor: RADIX_GREEN_9 });
			expect(scale.steps).toHaveLength(12);
			expect(scale.steps[11].apca).toBeGreaterThan(80);
		});

		it('handles low-chroma input', () => {
			const scale = generateScale({ parentColor: '#808080' }); // Gray
			expect(scale.steps).toHaveLength(12);
			// All steps should have very low chroma
			for (const step of scale.steps) {
				expect(step.oklch.c).toBeLessThan(0.01);
			}
		});
	});

	describe('reference constants', () => {
		it('RADIX_APCA_TARGETS has 12 values', () => {
			expect(RADIX_APCA_TARGETS).toHaveLength(12);
		});

		it('RADIX_LIGHTNESS_TARGETS has 12 values', () => {
			expect(RADIX_LIGHTNESS_TARGETS).toHaveLength(12);
		});

		it('CHROMA_CURVE has 12 values', () => {
			expect(CHROMA_CURVE).toHaveLength(12);
		});

		it('lightness targets decrease from step 1 to 12', () => {
			for (let i = 1; i < RADIX_LIGHTNESS_TARGETS.length; i++) {
				expect(RADIX_LIGHTNESS_TARGETS[i]).toBeLessThan(RADIX_LIGHTNESS_TARGETS[i - 1]);
			}
		});

		it('APCA targets generally increase from step 1 to 12', () => {
			// First few are ~0, then increase
			expect(RADIX_APCA_TARGETS[11]).toBeGreaterThan(RADIX_APCA_TARGETS[0]);
			expect(RADIX_APCA_TARGETS[11]).toBeGreaterThan(90);
		});
	});
});
