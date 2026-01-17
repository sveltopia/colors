/**
 * Snapshot Regression Tests
 *
 * Compares current palette generation output against known-good baselines.
 * These tests catch unintentional changes to the algorithm.
 *
 * To update baselines after INTENTIONAL changes:
 *   npx tsx scripts/generate-snapshots.ts
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { generatePalette } from '../core/palette.js';
import { getTestPalette } from '../reference/test-palettes.js';
import type { Scale } from '../types.js';

interface Snapshot {
	id: string;
	name: string;
	inputColors: string[];
	generatedAt: string;
	scales: Record<string, Scale>;
	meta: {
		anchoredSlots: string[];
		customSlots: string[];
		tuningProfile: {
			hueShift: number;
			chromaMultiplier: number;
			lightnessShift: number;
		};
	};
}

function loadSnapshot(brandId: string, mode: 'light' | 'dark'): Snapshot {
	const snapshotPath = join(
		import.meta.dirname,
		'snapshots',
		mode,
		`${brandId}.json`
	);
	const content = readFileSync(snapshotPath, 'utf-8');
	return JSON.parse(content);
}

function getSnapshotBrands(mode: 'light' | 'dark'): string[] {
	const snapshotDir = join(import.meta.dirname, 'snapshots', mode);
	return readdirSync(snapshotDir)
		.filter((f) => f.endsWith('.json'))
		.map((f) => f.replace('.json', ''));
}

describe('Snapshot Regression Tests', () => {
	describe('Light Mode', () => {
		const brands = getSnapshotBrands('light');

		for (const brandId of brands) {
			it(`${brandId}: matches baseline`, () => {
				const snapshot = loadSnapshot(brandId, 'light');
				const testPalette = getTestPalette(brandId);
				expect(testPalette).toBeDefined();

				const current = generatePalette({
					brandColors: testPalette!.colors,
					mode: 'light'
				});

				// Compare scales (the hex values)
				for (const [hueKey, expectedScale] of Object.entries(snapshot.scales)) {
					const currentScale = current.scales[hueKey];
					expect(currentScale, `Missing hue: ${hueKey}`).toBeDefined();

					for (const [step, expectedHex] of Object.entries(expectedScale)) {
						const currentHex = currentScale[Number(step) as keyof Scale];
						expect(
							currentHex,
							`${brandId} ${hueKey}-${step}: expected ${expectedHex}, got ${currentHex}`
						).toBe(expectedHex);
					}
				}

				// Compare meta
				expect(current.meta.anchoredSlots.sort()).toEqual(
					snapshot.meta.anchoredSlots.sort()
				);
				expect(current.meta.customSlots.sort()).toEqual(
					snapshot.meta.customSlots.sort()
				);

				// Compare tuning profile (with small tolerance for floating point)
				expect(current.meta.tuningProfile.hueShift).toBeCloseTo(
					snapshot.meta.tuningProfile.hueShift,
					4
				);
				expect(current.meta.tuningProfile.chromaMultiplier).toBeCloseTo(
					snapshot.meta.tuningProfile.chromaMultiplier,
					4
				);
				expect(current.meta.tuningProfile.lightnessShift).toBeCloseTo(
					snapshot.meta.tuningProfile.lightnessShift,
					4
				);
			});
		}
	});

	describe('Dark Mode', () => {
		const brands = getSnapshotBrands('dark');

		for (const brandId of brands) {
			it(`${brandId}: matches baseline`, () => {
				const snapshot = loadSnapshot(brandId, 'dark');
				const testPalette = getTestPalette(brandId);
				expect(testPalette).toBeDefined();

				const current = generatePalette({
					brandColors: testPalette!.colors,
					mode: 'dark'
				});

				// Compare scales (the hex values)
				for (const [hueKey, expectedScale] of Object.entries(snapshot.scales)) {
					const currentScale = current.scales[hueKey];
					expect(currentScale, `Missing hue: ${hueKey}`).toBeDefined();

					for (const [step, expectedHex] of Object.entries(expectedScale)) {
						const currentHex = currentScale[Number(step) as keyof Scale];
						expect(
							currentHex,
							`${brandId} ${hueKey}-${step}: expected ${expectedHex}, got ${currentHex}`
						).toBe(expectedHex);
					}
				}

				// Compare meta
				expect(current.meta.anchoredSlots.sort()).toEqual(
					snapshot.meta.anchoredSlots.sort()
				);
				expect(current.meta.customSlots.sort()).toEqual(
					snapshot.meta.customSlots.sort()
				);

				// Compare tuning profile (with small tolerance for floating point)
				expect(current.meta.tuningProfile.hueShift).toBeCloseTo(
					snapshot.meta.tuningProfile.hueShift,
					4
				);
				expect(current.meta.tuningProfile.chromaMultiplier).toBeCloseTo(
					snapshot.meta.tuningProfile.chromaMultiplier,
					4
				);
				expect(current.meta.tuningProfile.lightnessShift).toBeCloseTo(
					snapshot.meta.tuningProfile.lightnessShift,
					4
				);
			});
		}
	});
});
