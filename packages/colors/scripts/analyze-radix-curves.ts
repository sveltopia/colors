/**
 * Analyze Radix Colors curves to understand their L/C patterns
 * and calculate APCA contrast values for each step.
 */

import { toOklch, toHex } from '../src/utils/oklch.js';

// @ts-ignore - apca-w3 has no types
import { calcAPCA } from 'apca-w3';

// Radix scales (all 12 steps)
const RADIX_SCALES = {
	orange: {
		1: '#fefcfb',
		2: '#fff7ed',
		3: '#ffefd6',
		4: '#ffdfb5',
		5: '#ffd19a',
		6: '#ffc182',
		7: '#f5ae73',
		8: '#ec9455',
		9: '#f76b15',
		10: '#ef5f00',
		11: '#cc4e00',
		12: '#582d1d'
	},
	blue: {
		1: '#fbfdff',
		2: '#f4faff',
		3: '#e6f4fe',
		4: '#d5efff',
		5: '#c2e5ff',
		6: '#acd8fc',
		7: '#8ec8f6',
		8: '#5eb1ef',
		9: '#0090ff',
		10: '#0588f0',
		11: '#0d74ce',
		12: '#113264'
	},
	green: {
		1: '#fbfefc',
		2: '#f4fbf6',
		3: '#e6f6eb',
		4: '#d6f1df',
		5: '#c4e8d1',
		6: '#adddc0',
		7: '#8eceaa',
		8: '#5bb98b',
		9: '#30a46c',
		10: '#2b9a66',
		11: '#218358',
		12: '#193b2d'
	}
};

const WHITE = '#ffffff';

console.log('=== Radix Colors Curve Analysis ===\n');

for (const [scaleName, steps] of Object.entries(RADIX_SCALES)) {
	console.log(`\n### ${scaleName.toUpperCase()} ###\n`);
	console.log('Step | Hex     | L      | C      | H      | APCA vs White');
	console.log('-----|---------|--------|--------|--------|-------------');

	const data: Array<{ step: number; l: number; c: number; h: number; apca: number }> = [];

	for (const [step, hex] of Object.entries(steps)) {
		const oklch = toOklch(hex);
		if (!oklch) continue;

		// APCA contrast: positive = dark on light, negative = light on dark
		// For light mode, we measure color against white background
		const apca = calcAPCA(hex, WHITE);

		data.push({
			step: parseInt(step),
			l: oklch.l,
			c: oklch.c,
			h: oklch.h,
			apca: Math.abs(apca)
		});

		console.log(
			`  ${step.padStart(2)}  | ${hex} | ${oklch.l.toFixed(3)} | ${oklch.c.toFixed(3)} | ${oklch.h.toFixed(1).padStart(5)} | ${Math.abs(apca).toFixed(1)}`
		);
	}

	// Summary statistics
	console.log('\nCurve Analysis:');
	console.log(
		`  Lightness range: ${data[0].l.toFixed(3)} → ${data[data.length - 1].l.toFixed(3)}`
	);
	console.log(`  Peak chroma at step: ${data.reduce((max, d) => (d.c > max.c ? d : max)).step}`);
	console.log(`  Step 9 chroma: ${data[8].c.toFixed(3)}`);
	console.log(`  Hue drift: ${(data[data.length - 1].h - data[0].h).toFixed(1)}°`);
}

// Generate TypeScript constants for reference
console.log('\n\n=== Reference Data for Implementation ===\n');
console.log('// APCA contrast targets derived from Radix (averaged across hues)');

const avgApca: number[] = [];
for (let step = 1; step <= 12; step++) {
	const values = Object.values(RADIX_SCALES).map((scale) => {
		const hex = scale[step as keyof typeof scale];
		return Math.abs(calcAPCA(hex, WHITE));
	});
	const avg = values.reduce((a, b) => a + b, 0) / values.length;
	avgApca.push(avg);
}

console.log('export const RADIX_APCA_TARGETS = [');
avgApca.forEach((apca, i) => {
	console.log(`  ${apca.toFixed(1)}, // Step ${i + 1}`);
});
console.log('];');
