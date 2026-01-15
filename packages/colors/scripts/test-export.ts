/**
 * Test script for export functionality
 * Generates CSS and JSON output files for manual inspection
 *
 * Usage: npx tsx scripts/test-export.ts
 */

import { writeFileSync } from 'fs';
import { generateLightPalette } from '../src/core/palette.js';
import { exportCSS, exportJSON } from '../src/core/export.js';
import type { Palette } from '../src/types.js';

// Generate palette with Sveltopia brand colors
const brandColors = ['#FF4F00', '#1A1A1A']; // Orange and dark gray

console.log('Generating palette with brand colors:', brandColors);

const light = generateLightPalette({ brandColors });
const dark = generateLightPalette({ brandColors, mode: 'dark' });

const palette: Palette = {
	light: light.scales,
	dark: dark.scales,
	_meta: {
		tuningProfile: light.meta.tuningProfile,
		inputColors: brandColors,
		generatedAt: new Date().toISOString()
	}
};

// Export full CSS
const cssAll = exportCSS(palette);
writeFileSync('test-output.css', cssAll);
console.log('✓ Wrote test-output.css (full palette)');

// Export just accent scale (for quick inspection)
const cssAccent = exportCSS(palette, {
	scales: ['orange'],
	mode: 'both'
});
writeFileSync('test-output-accent.css', cssAccent);
console.log('✓ Wrote test-output-accent.css (orange scale only)');

// Export JSON
const json = exportJSON(palette);
writeFileSync('test-output.json', JSON.stringify(json, null, 2));
console.log('✓ Wrote test-output.json');

// Validation checklist
console.log('\n=== Validation Checklist ===');
console.log('Open test-output.css and verify:');
console.log('  □ Has all 12 steps per scale (--orange-1 through --orange-12)');
console.log('  □ Has alpha variants (--orange-a1 through --orange-a12)');
console.log('  □ Has @supports block with P3/OKLCH');
console.log('  □ Has semantic tokens (--orange-contrast, --orange-surface, etc.)');
console.log('  □ Light mode uses :root selector');
console.log('  □ Dark mode uses .dark, .dark-theme selector');
console.log('');
console.log('Open test-output.json and verify:');
console.log('  □ Each step has hex, oklch, and p3 formats');
console.log('  □ lightA/darkA have alpha hex and P3 values');
console.log('  □ semantic.light/dark have contrast, surface, indicator, track');
console.log('');

// Quick stats
const cssLines = cssAll.split('\n').length;
const jsonSize = JSON.stringify(json).length;
const scaleCount = Object.keys(palette.light).length;

console.log('=== Quick Stats ===');
console.log(`  Scales: ${scaleCount}`);
console.log(`  CSS lines: ${cssLines}`);
console.log(`  JSON size: ${(jsonSize / 1024).toFixed(1)} KB`);
console.log(`  Has P3 block: ${cssAll.includes('@supports') ? 'Yes' : 'No'}`);
console.log(`  Has alpha variants: ${cssAll.includes('-a1:') ? 'Yes' : 'No'}`);
console.log(`  Has semantic tokens: ${cssAll.includes('-contrast:') ? 'Yes' : 'No'}`);
