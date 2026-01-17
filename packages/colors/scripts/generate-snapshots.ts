/**
 * Generate Baseline Snapshots
 *
 * Creates JSON snapshot files for regression testing.
 * Run this script to update baselines after intentional algorithm changes.
 *
 * Usage: npx tsx scripts/generate-snapshots.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import { generatePalette } from '../src/core/palette.js';
import { getTestPalette } from '../src/reference/test-palettes.js';

// Brands to snapshot - carefully selected to exercise all algorithm paths
const SNAPSHOT_BRANDS = [
	'sveltopia', // Primary brand, warm shift, neutral anchor
	'slack', // Multi-anchor, smart comparison test
	'stripe', // Neon custom row (high-chroma)
	'figma', // Hue-gap custom row
	'pastel', // Low-chroma custom row
	'spotify', // Yellow anchor (bright hue handling)
	'near-black', // Very dark anchor edge case
	'muddy', // Low-chroma brand (floor clamping)
	'between-hues' // Saddle brown - shifts entire system feel
];

interface Snapshot {
	id: string;
	name: string;
	inputColors: string[];
	generatedAt: string;
	scales: Record<string, Record<number, string>>;
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

function generateSnapshot(brandId: string, mode: 'light' | 'dark'): Snapshot {
	const testPalette = getTestPalette(brandId);
	if (!testPalette) {
		throw new Error(`Unknown brand: ${brandId}`);
	}

	const palette = generatePalette({
		brandColors: testPalette.colors,
		mode
	});

	return {
		id: brandId,
		name: testPalette.name,
		inputColors: testPalette.colors,
		generatedAt: new Date().toISOString(),
		scales: palette.scales,
		meta: {
			anchoredSlots: palette.meta.anchoredSlots,
			customSlots: palette.meta.customSlots,
			tuningProfile: {
				hueShift: palette.meta.tuningProfile.hueShift,
				chromaMultiplier: palette.meta.tuningProfile.chromaMultiplier,
				lightnessShift: palette.meta.tuningProfile.lightnessShift
			}
		}
	};
}

const snapshotsDir = join(import.meta.dirname, '../src/__tests__/snapshots');

console.log('Generating baseline snapshots...');
console.log('================================\n');

for (const brandId of SNAPSHOT_BRANDS) {
	const testPalette = getTestPalette(brandId);
	if (!testPalette) {
		console.error(`  ERROR: Unknown brand "${brandId}"`);
		continue;
	}

	// Generate light mode
	const lightSnapshot = generateSnapshot(brandId, 'light');
	const lightPath = join(snapshotsDir, 'light', `${brandId}.json`);
	writeFileSync(lightPath, JSON.stringify(lightSnapshot, null, '\t'));
	console.log(`  ${testPalette.name} (light): ${lightPath}`);

	// Generate dark mode
	const darkSnapshot = generateSnapshot(brandId, 'dark');
	const darkPath = join(snapshotsDir, 'dark', `${brandId}.json`);
	writeFileSync(darkPath, JSON.stringify(darkSnapshot, null, '\t'));
	console.log(`  ${testPalette.name} (dark): ${darkPath}`);
}

console.log('\n================================');
console.log(`Generated ${SNAPSHOT_BRANDS.length * 2} snapshots (${SNAPSHOT_BRANDS.length} light + ${SNAPSHOT_BRANDS.length} dark)`);
console.log('\nTo update baselines after intentional changes:');
console.log('  npx tsx scripts/generate-snapshots.ts');
