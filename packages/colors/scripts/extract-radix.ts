/**
 * Extract OKLCH values from Radix Colors step-9 values.
 * This gives us the proven hue angles and reference chromas.
 */

import { toOklch } from '../src/utils/oklch.js';

// Radix Colors step-9 values (the "solid" position)
const RADIX_STEP_9: Record<string, string> = {
	// Chromatic colors
	tomato: '#e54d2e',
	red: '#e5484d',
	ruby: '#e54666',
	crimson: '#e93d82',
	pink: '#d6409f',
	plum: '#ab4aba',
	purple: '#8e4ec6',
	violet: '#6e56cf',
	iris: '#5b5bd6',
	indigo: '#3e63dd',
	blue: '#0090ff',
	cyan: '#00a2c7',
	teal: '#12a594',
	jade: '#29a383',
	green: '#30a46c',
	grass: '#46a758',
	brown: '#ad7f58',
	bronze: '#a18072',
	gold: '#978365',
	sky: '#7ce2fe',
	mint: '#86ead4',
	lime: '#bdee63',
	yellow: '#ffe629',
	amber: '#ffc53d',
	orange: '#f76b15',

	// Neutral grays (with subtle undertones)
	gray: '#8d8d8d',
	mauve: '#8e8c99',
	slate: '#8b8d98',
	sage: '#868e8b',
	olive: '#898e87',
	sand: '#8d8d86'
};

console.log('Radix Colors Step-9 → OKLCH Extraction\n');
console.log('='.repeat(70));

// Group by category for easier reading
const categories = {
	'Red Family': ['tomato', 'red', 'ruby', 'crimson'],
	'Pink/Purple': ['pink', 'plum', 'purple', 'violet'],
	'Blue Family': ['iris', 'indigo', 'blue', 'cyan'],
	'Green Family': ['teal', 'jade', 'green', 'grass'],
	'Yellow/Orange': ['lime', 'yellow', 'amber', 'orange'],
	'Warm Accents': ['sky', 'mint', 'brown', 'bronze', 'gold'],
	Neutrals: ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand']
};

const results: Array<{ name: string; hex: string; l: number; c: number; h: number }> = [];

for (const [category, colors] of Object.entries(categories)) {
	console.log(`\n${category}:`);
	console.log('-'.repeat(70));

	for (const name of colors) {
		const hex = RADIX_STEP_9[name];
		const oklch = toOklch(hex);

		if (oklch) {
			const l = oklch.l;
			const c = oklch.c;
			const h = oklch.h ?? 0;

			results.push({ name, hex, l, c, h });

			console.log(
				`  ${name.padEnd(10)} ${hex}  →  L: ${l.toFixed(3)}  C: ${c.toFixed(3)}  H: ${h.toFixed(1)}°`
			);
		}
	}
}

// Generate TypeScript output for hues.ts
console.log('\n' + '='.repeat(70));
console.log('\nTypeScript BASELINE_HUES (sorted by hue angle):\n');

const sorted = [...results].sort((a, b) => a.h - b.h);

console.log('export const BASELINE_HUES = {');
for (const { name, h, c } of sorted) {
	const category = getCategoryForHue(h, name);
	console.log(
		`  ${name}: { name: '${capitalize(name)}', hue: ${h.toFixed(1)}, category: '${category}', referenceChroma: ${c.toFixed(3)} },`
	);
}
console.log('} as const;');

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

function getCategoryForHue(h: number, name: string): string {
	// Neutrals
	if (['gray', 'mauve', 'slate', 'sage', 'olive', 'sand'].includes(name)) {
		return 'neutral';
	}

	// Map hue angles to categories
	if (h < 45 || h >= 350) return 'red';
	if (h < 70) return 'orange';
	if (h < 115) return 'yellow';
	if (h < 175) return 'green';
	if (h < 210) return 'cyan';
	if (h < 280) return 'blue';
	if (h < 330) return 'purple';
	return 'pink';
}
