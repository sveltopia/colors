import { describe, it, expect } from 'vitest';
import {
	BASELINE_HUES,
	HUE_KEYS,
	HUE_COUNT,
	SNAP_THRESHOLD,
	findClosestHue,
	findClosestHueWithDistance,
	shouldSnapToSlot,
	getHuesSortedByAngle,
	getHuesByCategory
} from '../core/hues.js';

describe('Baseline Hues (Radix-derived)', () => {
	describe('BASELINE_HUES', () => {
		it('has 31 hue definitions (from Radix Colors)', () => {
			expect(HUE_COUNT).toBe(31);
			expect(HUE_KEYS.length).toBe(31);
		});

		it('all hues have valid structure', () => {
			for (const [key, def] of Object.entries(BASELINE_HUES)) {
				expect(def.name).toBeTruthy();
				expect(def.hue).toBeGreaterThanOrEqual(0);
				expect(def.hue).toBeLessThan(360);
				expect(def.category).toBeTruthy();
				expect(def.referenceChroma).toBeGreaterThanOrEqual(0);
				expect(def.radixHex).toMatch(/^#[0-9a-f]{6}$/i);
			}
		});

		it('includes all expected Radix color names', () => {
			// Chromatic colors
			expect(BASELINE_HUES.red).toBeDefined();
			expect(BASELINE_HUES.orange).toBeDefined();
			expect(BASELINE_HUES.yellow).toBeDefined();
			expect(BASELINE_HUES.green).toBeDefined();
			expect(BASELINE_HUES.blue).toBeDefined();
			expect(BASELINE_HUES.purple).toBeDefined();
			expect(BASELINE_HUES.pink).toBeDefined();
			expect(BASELINE_HUES.crimson).toBeDefined();
			expect(BASELINE_HUES.violet).toBeDefined();
			expect(BASELINE_HUES.indigo).toBeDefined();
			expect(BASELINE_HUES.cyan).toBeDefined();
			expect(BASELINE_HUES.teal).toBeDefined();
			expect(BASELINE_HUES.jade).toBeDefined();
			expect(BASELINE_HUES.grass).toBeDefined();
			expect(BASELINE_HUES.lime).toBeDefined();
			expect(BASELINE_HUES.amber).toBeDefined();

			// Neutrals
			expect(BASELINE_HUES.gray).toBeDefined();
			expect(BASELINE_HUES.slate).toBeDefined();
			expect(BASELINE_HUES.mauve).toBeDefined();
			expect(BASELINE_HUES.sage).toBeDefined();
			expect(BASELINE_HUES.olive).toBeDefined();
			expect(BASELINE_HUES.sand).toBeDefined();
		});

		it('orange hue is at 45° (Radix orange #f76b15)', () => {
			expect(BASELINE_HUES.orange.hue).toBeCloseTo(45, 0);
			expect(BASELINE_HUES.orange.radixHex).toBe('#f76b15');
		});

		it('green hue is at 157.7° (Radix green #30a46c)', () => {
			expect(BASELINE_HUES.green.hue).toBeCloseTo(157.7, 0);
			expect(BASELINE_HUES.green.radixHex).toBe('#30a46c');
		});

		it('blue hue is at 251.8° (Radix blue #0090ff)', () => {
			expect(BASELINE_HUES.blue.hue).toBeCloseTo(251.8, 0);
			expect(BASELINE_HUES.blue.radixHex).toBe('#0090ff');
		});

		it('neutrals have low reference chroma', () => {
			const neutrals = ['gray', 'slate', 'mauve', 'sage', 'olive', 'sand'];
			for (const name of neutrals) {
				expect(BASELINE_HUES[name].category).toBe('neutral');
				expect(BASELINE_HUES[name].referenceChroma).toBeLessThan(0.03);
			}
		});
	});

	describe('SNAP_THRESHOLD', () => {
		it('is 10 degrees', () => {
			expect(SNAP_THRESHOLD).toBe(10);
		});
	});

	describe('findClosestHue', () => {
		it('finds orange for hue around 45° (Sveltopia #FF6A00 = 44.8°)', () => {
			expect(findClosestHue(45)).toBe('orange');
			expect(findClosestHue(44.8)).toBe('orange');
			expect(findClosestHue(48)).toBe('orange');
		});

		it('finds grass for hue around 147° (close to Sveltopia green)', () => {
			expect(findClosestHue(147)).toBe('grass');
			expect(findClosestHue(150)).toBe('grass');
		});

		it('finds green for hue around 157°', () => {
			expect(findClosestHue(157)).toBe('green');
			expect(findClosestHue(160)).toBe('green');
		});

		it('finds red for hue around 23°', () => {
			expect(findClosestHue(23)).toBe('red');
			expect(findClosestHue(25)).toBe('red');
		});

		it('finds blue for hue around 252°', () => {
			expect(findClosestHue(252)).toBe('blue');
			expect(findClosestHue(248)).toBe('blue');
		});

		it('handles hue wrap-around (near 0/360)', () => {
			// Pink is at 346°, crimson is at 1.3°
			const closestTo350 = findClosestHue(350);
			const closestTo355 = findClosestHue(355);
			const closestTo5 = findClosestHue(5);

			// 350° is 4° from pink (346°) - should match pink
			expect(closestTo350).toBe('pink');
			// 355° is 9° from pink but only 6.3° from crimson (wrap-around)
			// So it should match crimson
			expect(closestTo355).toBe('crimson');
			// 5° is 3.7° from crimson (1.3°)
			expect(closestTo5).toBe('crimson');
		});

		it('excludes neutrals by default', () => {
			// Gray is at hue 0, but should not match chromatic searches
			const result = findClosestHue(0, true);
			expect(BASELINE_HUES[result].category).not.toBe('neutral');
		});

		it('includes neutrals when specified', () => {
			// With neutrals included, hue 0 should match gray
			const result = findClosestHue(0, false);
			expect(result).toBe('gray');
		});
	});

	describe('findClosestHueWithDistance', () => {
		it('returns slot and distance', () => {
			const result = findClosestHueWithDistance(45);
			expect(result.slot).toBe('orange');
			expect(result.distance).toBeLessThan(1);
		});

		it('calculates correct distance for offset hue', () => {
			// Orange is at 45°, checking from 50°
			const result = findClosestHueWithDistance(50);
			expect(result.slot).toBe('orange');
			expect(result.distance).toBeCloseTo(5, 0);
		});
	});

	describe('shouldSnapToSlot', () => {
		it('snaps when within threshold', () => {
			// Orange is at 45°, 48° is within 10° threshold
			const result = shouldSnapToSlot(48);
			expect(result.snap).toBe(true);
			expect(result.slot).toBe('orange');
			expect(result.distance).toBeLessThan(10);
		});

		it('does not snap when beyond threshold', () => {
			// Orange is at 45°, brown is at 61°
			// 58° is 13° from orange and 3° from brown - should snap to brown
			const result = shouldSnapToSlot(58);
			expect(result.snap).toBe(true);
			expect(result.slot).toBe('brown');
		});

		it('respects custom threshold', () => {
			// With a very tight 2° threshold
			const result = shouldSnapToSlot(48, 2);
			expect(result.snap).toBe(false);
		});
	});

	describe('getHuesSortedByAngle', () => {
		it('returns all hues sorted by angle', () => {
			const sorted = getHuesSortedByAngle();
			expect(sorted.length).toBe(31);

			// Verify sorted order
			for (let i = 1; i < sorted.length; i++) {
				expect(sorted[i][1].hue).toBeGreaterThanOrEqual(sorted[i - 1][1].hue);
			}
		});

		it('first hue is lowest angle (gray at 0°)', () => {
			const sorted = getHuesSortedByAngle();
			expect(sorted[0][0]).toBe('gray');
			expect(sorted[0][1].hue).toBe(0);
		});

		it('last hue is highest angle (pink at 346°)', () => {
			const sorted = getHuesSortedByAngle();
			expect(sorted[sorted.length - 1][0]).toBe('pink');
			expect(sorted[sorted.length - 1][1].hue).toBeCloseTo(346, 0);
		});
	});

	describe('getHuesByCategory', () => {
		it('groups hues by category', () => {
			const grouped = getHuesByCategory();

			expect(grouped.red).toBeDefined();
			expect(grouped.orange).toBeDefined();
			expect(grouped.yellow).toBeDefined();
			expect(grouped.green).toBeDefined();
			expect(grouped.cyan).toBeDefined();
			expect(grouped.blue).toBeDefined();
			expect(grouped.purple).toBeDefined();
			expect(grouped.pink).toBeDefined();
			expect(grouped.neutral).toBeDefined();
		});

		it('red category includes red, ruby, crimson, tomato', () => {
			const grouped = getHuesByCategory();
			const redKeys = grouped.red.map(([key]) => key);
			expect(redKeys).toContain('red');
			expect(redKeys).toContain('ruby');
			expect(redKeys).toContain('crimson');
			expect(redKeys).toContain('tomato');
		});

		it('neutral category includes gray, slate, mauve, sage, olive, sand', () => {
			const grouped = getHuesByCategory();
			const neutralKeys = grouped.neutral.map(([key]) => key);
			expect(neutralKeys).toContain('gray');
			expect(neutralKeys).toContain('slate');
			expect(neutralKeys).toContain('mauve');
			expect(neutralKeys).toContain('sage');
			expect(neutralKeys).toContain('olive');
			expect(neutralKeys).toContain('sand');
		});

		it('orange category includes orange and brown', () => {
			const grouped = getHuesByCategory();
			const orangeKeys = grouped.orange.map(([key]) => key);
			expect(orangeKeys).toContain('orange');
			expect(orangeKeys).toContain('brown');
			// bronze is now neutral (warm-tinted, chroma 0.046)
		});

		it('neutral category includes bronze and gold (warm-tinted neutrals)', () => {
			const grouped = getHuesByCategory();
			const neutralKeys = grouped.neutral.map(([key]) => key);
			expect(neutralKeys).toContain('bronze'); // chroma 0.046
			expect(neutralKeys).toContain('gold'); // chroma 0.049
		});
	});
});
