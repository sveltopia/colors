import { describe, it, expect } from 'vitest';
import {
	analyzeColor,
	analyzeBrandColors,
	createDefaultProfile,
	getAnalysisReport,
	suggestAnchorStep
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

			expect(profile.anchors[SVELTOPIA_ORANGE].slot).toBe('orange');
			// Orange L ~0.70, closest to Radix Orange step 9 (0.691) with per-hue curve
			expect(profile.anchors[SVELTOPIA_ORANGE].step).toBe(9);
			expect(profile.anchors[SVELTOPIA_GREEN].slot).toBe('grass');
			// Green L ~0.59, closest to step 10 (0.632) or step 11 (0.561)
			expect(profile.anchors[SVELTOPIA_GREEN].step).toBeGreaterThanOrEqual(10);
			expect(profile.anchors[SVELTOPIA_GREEN].step).toBeLessThanOrEqual(11);
			expect(profile.anchors[SVELTOPIA_DARK]).toBeDefined();
			expect(profile.anchors[SVELTOPIA_DARK].step).toBe(12); // Dark color → step 12
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

			expect(profile.anchors[SVELTOPIA_ORANGE].slot).toBe('orange');
			// Orange L ~0.70, closest to Radix Orange step 9 (0.691) with per-hue curve
			expect(profile.anchors[SVELTOPIA_ORANGE].step).toBe(9);
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
			expect(profile.anchors[SVELTOPIA_ORANGE].slot).toBe('orange');
			expect(profile.anchors[SVELTOPIA_GREEN].slot).toBe('grass');
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

	describe('suggestAnchorStep', () => {
		it('finds best-fit step for dark colors', () => {
			// L ~0.12 is darker than step 12 target (0.332), so clamps to 12
			expect(suggestAnchorStep(0.12)).toBe(12);
			// L ~0.33 matches step 12 target exactly
			expect(suggestAnchorStep(0.33)).toBe(12);
			// L ~0.45 is between step 11 (0.561) and step 12 (0.332)
			expect(suggestAnchorStep(0.45)).toBe(11);
		});

		it('finds best-fit step for mid-range colors', () => {
			// L ~0.56 matches step 11 target (0.561)
			expect(suggestAnchorStep(0.56)).toBe(11);
			// L ~0.63 matches step 10 target (0.632)
			expect(suggestAnchorStep(0.63)).toBe(10);
			// L ~0.66 matches step 9 target (0.66)
			expect(suggestAnchorStep(0.66)).toBe(9);
			// L ~0.73 matches step 8 target (0.732)
			expect(suggestAnchorStep(0.73)).toBe(8);
			// L ~0.80 matches step 7 target (0.805)
			expect(suggestAnchorStep(0.80)).toBe(7);
		});

		it('finds best-fit step for light colors', () => {
			// L ~0.86 matches step 6 target (0.858)
			expect(suggestAnchorStep(0.86)).toBe(6);
			// L ~0.90 matches step 5 target (0.897)
			expect(suggestAnchorStep(0.90)).toBe(5);
			// L ~0.93 matches step 4 target (0.931)
			expect(suggestAnchorStep(0.93)).toBe(4);
			// L ~0.96 matches step 3 target (0.959)
			expect(suggestAnchorStep(0.96)).toBe(3);
			// L ~0.98 matches step 2 target (0.981)
			expect(suggestAnchorStep(0.98)).toBe(2);
			// L ~0.99 matches step 1 target (0.993)
			expect(suggestAnchorStep(0.99)).toBe(1);
		});

		it('includes anchor step in ColorAnalysis', () => {
			const darkResult = analyzeColor('#1A1A1A');
			expect(darkResult!.suggestedAnchorStep).toBe(12);

			const normalResult = analyzeColor('#FF6A00');
			// Orange has L ~0.70, which is between step 8 (0.732) and step 9 (0.66)
			// Best fit depends on exact value - should be 8 or 9
			expect(normalResult!.suggestedAnchorStep).toBeGreaterThanOrEqual(8);
			expect(normalResult!.suggestedAnchorStep).toBeLessThanOrEqual(9);
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

			// All slots (or custom row nearest slots) should be in warm family
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

			// Check standard anchors
			for (const anchor of Object.values(profile.anchors)) {
				if (!anchor.isCustomRow) {
					expect(warmSlots).toContain(anchor.slot);
				}
			}

			// Check custom rows are based on warm hues
			if (profile.customRows) {
				for (const row of profile.customRows) {
					expect(warmSlots).toContain(row.nearestSlot);
				}
			}
		});

		it('detects cool brand preference', () => {
			// All cool colors
			const coolColors = ['#2563EB', '#7C3AED', '#06B6D4'];
			const profile = analyzeBrandColors(coolColors);

			// All slots (or custom row nearest slots) should be in cool family
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

			// Check standard anchors
			for (const anchor of Object.values(profile.anchors)) {
				if (!anchor.isCustomRow) {
					expect(coolSlots).toContain(anchor.slot);
				}
			}

			// Check custom rows are based on cool hues
			if (profile.customRows) {
				for (const row of profile.customRows) {
					expect(coolSlots).toContain(row.nearestSlot);
				}
			}
		});
	});

	describe('out-of-bounds chroma detection', () => {
		it('detects pastel pink as out of bounds (low chroma)', () => {
			const result = analyzeColor('#FFD1DC');
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(true);
			expect(result!.outOfBoundsReason).toBe('low-chroma');
			expect(result!.chromaRatio).toBeLessThan(0.5);
		});

		it('detects neon green as out of bounds (high chroma)', () => {
			const result = analyzeColor('#39FF14');
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(true);
			expect(result!.outOfBoundsReason).toBe('high-chroma');
			expect(result!.chromaRatio).toBeGreaterThan(1.3);
		});

		it('marks standard colors as in bounds', () => {
			const result = analyzeColor('#FF6A00'); // Sveltopia orange
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(false);
			expect(result!.outOfBoundsReason).toBeUndefined();
		});

		it('creates customRows for pastel input', () => {
			const profile = analyzeBrandColors(['#FFD1DC']);
			expect(profile.customRows).toBeDefined();
			expect(profile.customRows).toHaveLength(1);
			expect(profile.customRows![0].reason).toBe('low-chroma');
			expect(profile.customRows![0].rowKey).toContain('pastel');
		});

		it('creates customRows for neon input', () => {
			const profile = analyzeBrandColors(['#39FF14']);
			expect(profile.customRows).toBeDefined();
			expect(profile.customRows).toHaveLength(1);
			expect(profile.customRows![0].reason).toBe('high-chroma');
			expect(profile.customRows![0].rowKey).toContain('neon');
		});

		it('separates standard and custom anchors correctly', () => {
			const profile = analyzeBrandColors(['#FF6A00', '#FFD1DC', '#39FF14']);

			// Orange should be standard anchor
			expect(profile.anchors['#FF6A00'].isCustomRow).toBe(false);

			// Pastel and neon should be custom rows
			expect(profile.customRows).toHaveLength(2);

			// One should be pastel, one should be neon
			const reasons = profile.customRows!.map((r) => r.reason).sort();
			expect(reasons).toEqual(['high-chroma', 'low-chroma']);
		});

		it('includes out-of-bounds colors in chromaMultiplier (clamped)', () => {
			// Orange (~1.04x, normal) + Neon Green (1.95x clamped to 1.3x)
			// Both contribute to average, but neon is clamped
			const profile = analyzeBrandColors(['#FF6A00', '#39FF14']);

			// Average of ~1.04 + 1.3 ≈ 1.17
			// Key: neon is clamped, not excluded, so multiplier is > 1.0
			expect(profile.chromaMultiplier).toBeGreaterThan(1.0);
			expect(profile.chromaMultiplier).toBeLessThan(1.3);
		});

		it('Christmas palette gets high chromaMultiplier from neon inputs', () => {
			// Both red and green are high-chroma (>1.3x)
			// Should get clamped max multiplier
			const profile = analyzeBrandColors(['#FF0000', '#00FF00']);

			// Both colors clamp to 1.3x, average = 1.3x
			expect(profile.chromaMultiplier).toBeCloseTo(1.3, 1);
			expect(profile.chromaMultiplier).toBeGreaterThan(1.0);
		});

		it('pastel palette gets low chromaMultiplier from soft inputs', () => {
			// Pastel pink has ~0.25x chroma ratio, clamped to 0.5x
			const profile = analyzeBrandColors(['#FFD1DC']);

			expect(profile.chromaMultiplier).toBeCloseTo(0.5, 1);
			expect(profile.chromaMultiplier).toBeLessThan(1.0);
		});
	});

	describe('hue-gap detection', () => {
		// Test cases from CC Handoff: colors that are >10° from nearest Radix slot
		const FIGMA_BLUE = '#1ABCFE'; // 11.9° from cyan
		const CANVA_TEAL = '#00C4CC'; // 17.8° from sky/cyan

		it('detects Figma blue as out of bounds (hue-gap)', () => {
			const result = analyzeColor(FIGMA_BLUE);
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(true);
			expect(result!.outOfBoundsReason).toBe('hue-gap');
			expect(result!.distance).toBeGreaterThan(SNAP_THRESHOLD);
		});

		it('detects Canva teal as out of bounds (hue-gap)', () => {
			const result = analyzeColor(CANVA_TEAL);
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(true);
			expect(result!.outOfBoundsReason).toBe('hue-gap');
			expect(result!.distance).toBeGreaterThan(SNAP_THRESHOLD);
		});

		it('does NOT detect Sveltopia orange as hue-gap (within threshold)', () => {
			const result = analyzeColor(SVELTOPIA_ORANGE);
			expect(result).not.toBeNull();
			// Orange snaps to Radix orange slot
			expect(result!.snaps).toBe(true);
			expect(result!.distance).toBeLessThanOrEqual(SNAP_THRESHOLD);
			// Should not be out of bounds (chroma is also within range)
			expect(result!.isOutOfBounds).toBe(false);
		});

		it('creates customRows for hue-gap input', () => {
			const profile = analyzeBrandColors([FIGMA_BLUE]);
			expect(profile.customRows).toBeDefined();
			expect(profile.customRows).toHaveLength(1);
			expect(profile.customRows![0].reason).toBe('hue-gap');
			expect(profile.customRows![0].hueDistance).toBeDefined();
			expect(profile.customRows![0].hueDistance).toBeGreaterThan(SNAP_THRESHOLD);
		});

		it('uses custom- prefix for hue-gap row keys', () => {
			const profile = analyzeBrandColors([FIGMA_BLUE]);
			expect(profile.customRows![0].rowKey).toContain('custom-');
		});

		it('chroma out-of-bounds takes precedence over hue-gap', () => {
			// A color that's both far from slots AND has extreme chroma
			// should be classified by chroma reason, not hue-gap
			const result = analyzeColor('#39FF14'); // Neon green
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(true);
			// Should be high-chroma, not hue-gap
			expect(result!.outOfBoundsReason).toBe('high-chroma');
		});
	});

	describe('extreme lightness detection', () => {
		// Test cases from SVE-162 dark mode validation
		const TIKTOK_CYAN = '#25F4EE'; // Very bright cyan (L≈0.88)
		const NAVY = '#000080'; // Very dark blue (L≈0.27)

		it('detects TikTok cyan as out of bounds in dark mode (semantic mismatch at step 12)', () => {
			// In dark mode, very bright colors anchor at step 12 (text step)
			// High chroma at text step is a semantic mismatch
			const result = analyzeColor(TIKTOK_CYAN, 'dark');
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(true);
			expect(result!.outOfBoundsReason).toBe('extreme-lightness');
			expect(result!.suggestedAnchorStep).toBe(12); // Text step
			expect(result!.oklch.c).toBeGreaterThan(0.12); // HIGH_CHROMA_THRESHOLD
		});

		it('does NOT detect TikTok cyan as out of bounds in light mode (OK at step 6)', () => {
			// In light mode, bright colors anchor at step 6 (UI element step)
			// This is semantically fine for high-chroma colors
			const result = analyzeColor(TIKTOK_CYAN, 'light');
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(false);
			expect(result!.suggestedAnchorStep).toBe(6); // UI element step
		});

		it('detects navy as out of bounds (extreme lightness - too dark)', () => {
			const result = analyzeColor(NAVY);
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(true);
			expect(result!.outOfBoundsReason).toBe('extreme-lightness');
			// Navy is detected via semantic mismatch: high chroma (0.19) at non-hero step
			expect(result!.oklch.c).toBeGreaterThan(0.12); // HIGH_CHROMA_THRESHOLD
		});

		it('does NOT detect Sveltopia orange as extreme lightness (normal L)', () => {
			const result = analyzeColor(SVELTOPIA_ORANGE);
			expect(result).not.toBeNull();
			// Orange has normal lightness that fits step 9
			expect(result!.isOutOfBounds).toBe(false);
			expect(result!.lightnessGap).toBeUndefined();
		});

		it('generates bright- prefix for high lightness colors (dark mode)', () => {
			// In dark mode, TikTok cyan triggers semantic mismatch at step 12
			const profile = analyzeBrandColors([TIKTOK_CYAN], 'dark');
			expect(profile.customRows).toBeDefined();
			expect(profile.customRows).toHaveLength(1);
			expect(profile.customRows![0].reason).toBe('extreme-lightness');
			expect(profile.customRows![0].rowKey).toMatch(/^bright-/);
		});

		it('generates dark- prefix for low lightness colors', () => {
			const profile = analyzeBrandColors([NAVY]);
			expect(profile.customRows).toBeDefined();
			expect(profile.customRows).toHaveLength(1);
			expect(profile.customRows![0].reason).toBe('extreme-lightness');
			expect(profile.customRows![0].rowKey).toMatch(/^dark-/);
		});

		it('chroma out-of-bounds takes precedence over extreme lightness', () => {
			// Neon green has both extreme chroma AND unusual lightness
			// Should be classified by chroma reason
			const result = analyzeColor('#39FF14');
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(true);
			expect(result!.outOfBoundsReason).toBe('high-chroma');
		});

		it('hue-gap takes precedence over extreme lightness', () => {
			// Figma blue is far from slots - should be hue-gap, not extreme-lightness
			const result = analyzeColor('#1ABCFE');
			expect(result).not.toBeNull();
			expect(result!.isOutOfBounds).toBe(true);
			expect(result!.outOfBoundsReason).toBe('hue-gap');
		});
	});
});
