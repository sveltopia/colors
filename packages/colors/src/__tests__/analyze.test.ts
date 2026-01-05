import { describe, it, expect } from 'vitest';
import {
	analyzeColor,
	analyzeBrandColors,
	createDefaultProfile,
	getAnalysisReport
} from '../core/analyze.js';
import { SNAP_THRESHOLD } from '../core/hues.js';

// Sveltopia brand colors for testing
const SVELTOPIA_ORANGE = '#FF6A00';
const SVELTOPIA_GREEN = '#43A047';
const SVELTOPIA_DARK = '#1A1A1A';

describe('Brand Analysis', () => {
	describe('analyzeColor', () => {
		it('analyzes Sveltopia orange correctly', () => {
			const result = analyzeColor(SVELTOPIA_ORANGE);

			expect(result).not.toBeNull();
			expect(result!.input).toBe(SVELTOPIA_ORANGE);
			expect(result!.slot).toBe('orange');
			expect(result!.oklch.l).toBeGreaterThan(0.5);
			expect(result!.oklch.c).toBeGreaterThan(0.1);
		});

		it('analyzes Sveltopia green and maps to grass (closest Radix slot)', () => {
			const result = analyzeColor(SVELTOPIA_GREEN);

			expect(result).not.toBeNull();
			// Sveltopia green (#43A047) has hue ~144°
			// Grass is at 147.4°, green is at 157.7°
			// So it should map to grass (closer)
			expect(result!.slot).toBe('grass');
		});

		it('includes snap information', () => {
			const result = analyzeColor(SVELTOPIA_ORANGE);

			expect(result).not.toBeNull();
			expect(result!.distance).toBeDefined();
			expect(result!.snaps).toBeDefined();
			// Sveltopia orange is very close to Radix orange (45°)
			expect(result!.snaps).toBe(true);
			expect(result!.distance).toBeLessThan(SNAP_THRESHOLD);
		});

		it('maps near-black to a neutral slot', () => {
			const result = analyzeColor(SVELTOPIA_DARK);

			expect(result).not.toBeNull();
			// Very dark, low chroma colors should map to neutrals
			expect(result!.oklch.l).toBeLessThan(0.25);
			expect(result!.oklch.c).toBeLessThan(0.05);
		});

		it('calculates hue offset from slot center', () => {
			const result = analyzeColor(SVELTOPIA_ORANGE);

			expect(result).not.toBeNull();
			// Orange slot is at 45°, Sveltopia orange is at ~44.8°
			expect(Math.abs(result!.hueOffset)).toBeLessThan(5);
		});

		it('calculates chroma ratio', () => {
			const result = analyzeColor(SVELTOPIA_ORANGE);

			expect(result).not.toBeNull();
			expect(result!.chromaRatio).toBeGreaterThan(0);
		});

		it('returns null for invalid colors', () => {
			expect(analyzeColor('not-a-color')).toBeNull();
			expect(analyzeColor('')).toBeNull();
		});
	});

	describe('analyzeBrandColors', () => {
		it('creates profile from Sveltopia brand colors', () => {
			const profile = analyzeBrandColors([SVELTOPIA_ORANGE, SVELTOPIA_GREEN, SVELTOPIA_DARK]);

			expect(profile.anchors[SVELTOPIA_ORANGE]).toBe('orange');
			expect(profile.anchors[SVELTOPIA_GREEN]).toBe('grass');
			expect(profile.anchors[SVELTOPIA_DARK]).toBeDefined();
		});

		it('calculates reasonable hue shift', () => {
			const profile = analyzeBrandColors([SVELTOPIA_ORANGE, SVELTOPIA_GREEN]);

			// Hue shift should be small since brand colors are close to Radix baselines
			expect(Math.abs(profile.hueShift)).toBeLessThan(15);
		});

		it('calculates chroma multiplier', () => {
			const profile = analyzeBrandColors([SVELTOPIA_ORANGE, SVELTOPIA_GREEN]);

			// Sveltopia colors are fairly vivid
			expect(profile.chromaMultiplier).toBeGreaterThan(0.5);
			expect(profile.chromaMultiplier).toBeLessThan(2);
		});

		it('calculates lightness shift', () => {
			const profile = analyzeBrandColors([SVELTOPIA_ORANGE, SVELTOPIA_GREEN]);

			// Lightness shift depends on input colors
			expect(profile.lightnessShift).toBeDefined();
			expect(Math.abs(profile.lightnessShift)).toBeLessThan(0.5);
		});

		it('handles empty input', () => {
			const profile = analyzeBrandColors([]);

			expect(profile.hueShift).toBe(0);
			expect(profile.chromaMultiplier).toBe(1);
			expect(profile.lightnessShift).toBe(0);
			expect(Object.keys(profile.anchors)).toHaveLength(0);
		});

		it('handles single color input', () => {
			const profile = analyzeBrandColors([SVELTOPIA_ORANGE]);

			expect(profile.anchors[SVELTOPIA_ORANGE]).toBe('orange');
			expect(Object.keys(profile.anchors)).toHaveLength(1);
		});

		it('handles all invalid colors', () => {
			const profile = analyzeBrandColors(['invalid', 'also-invalid']);

			expect(profile.hueShift).toBe(0);
			expect(profile.chromaMultiplier).toBe(1);
			expect(Object.keys(profile.anchors)).toHaveLength(0);
		});

		it('filters out invalid colors but keeps valid ones', () => {
			const profile = analyzeBrandColors([SVELTOPIA_ORANGE, 'invalid', SVELTOPIA_GREEN]);

			expect(Object.keys(profile.anchors)).toHaveLength(2);
			expect(profile.anchors[SVELTOPIA_ORANGE]).toBe('orange');
			expect(profile.anchors[SVELTOPIA_GREEN]).toBe('grass');
		});
	});

	describe('createDefaultProfile', () => {
		it('creates neutral profile', () => {
			const profile = createDefaultProfile();

			expect(profile.hueShift).toBe(0);
			expect(profile.chromaMultiplier).toBe(1);
			expect(profile.lightnessShift).toBe(0);
			expect(Object.keys(profile.anchors)).toHaveLength(0);
		});
	});

	describe('getAnalysisReport', () => {
		it('generates comprehensive report', () => {
			const report = getAnalysisReport([SVELTOPIA_ORANGE, SVELTOPIA_GREEN]);

			expect(report.analyses).toHaveLength(2);
			expect(report.profile).toBeDefined();
			expect(report.summary).toContain('Analyzed 2 colors');
			expect(report.summary).toContain('orange');
			expect(report.summary).toContain('grass');
			expect(report.summary).toContain('Tuning Profile');
		});

		it('includes snap indicator in summary', () => {
			const report = getAnalysisReport([SVELTOPIA_ORANGE]);

			// Should show ✓ for snapping colors
			expect(report.summary).toContain('✓');
		});

		it('includes hue offset in summary', () => {
			const report = getAnalysisReport([SVELTOPIA_ORANGE]);

			expect(report.summary).toContain('H');
			expect(report.summary).toContain('°');
		});

		it('includes chroma ratio in summary', () => {
			const report = getAnalysisReport([SVELTOPIA_ORANGE]);

			expect(report.summary).toContain('C×');
		});
	});

	describe('real-world scenarios', () => {
		it('handles a full brand palette (7 colors)', () => {
			const colors = [
				'#FF6A00', // Primary orange
				'#43A047', // Accent green
				'#1A1A1A', // Dark text
				'#2563EB', // Info blue
				'#DC2626', // Error red
				'#F59E0B', // Warning amber
				'#10B981' // Success green
			];

			const profile = analyzeBrandColors(colors);

			expect(Object.keys(profile.anchors)).toHaveLength(7);
			expect(profile.chromaMultiplier).toBeGreaterThan(0);
		});

		it('detects warm brand preference', () => {
			// All warm colors
			const warmColors = ['#FF6A00', '#F59E0B', '#DC2626'];
			const profile = analyzeBrandColors(warmColors);

			// All slots should be in warm family
			const slots = Object.values(profile.anchors);
			const warmSlots = [
				'red',
				'ruby',
				'crimson',
				'tomato',
				'orange',
				'bronze',
				'brown',
				'amber',
				'yellow',
				'gold'
			];
			for (const slot of slots) {
				expect(warmSlots).toContain(slot);
			}
		});

		it('detects cool brand preference', () => {
			// All cool colors
			const coolColors = ['#2563EB', '#7C3AED', '#06B6D4'];
			const profile = analyzeBrandColors(coolColors);

			// All slots should be in cool family
			const slots = Object.values(profile.anchors);
			const coolSlots = [
				'blue',
				'indigo',
				'purple',
				'violet',
				'iris',
				'cyan',
				'sky',
				'teal',
				'plum'
			];
			for (const slot of slots) {
				expect(coolSlots).toContain(slot);
			}
		});
	});
});
