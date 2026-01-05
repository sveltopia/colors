import { toOklch } from '../src/utils/oklch.js';
import { BASELINE_HUES, findClosestHueWithDistance } from '../src/core/hues.js';

const coral = toOklch('#FF7F50');

console.log('Coral (#FF7F50) OKLCH:');
console.log('  L:', coral?.l.toFixed(3));
console.log('  C:', coral?.c.toFixed(3));
console.log('  H:', coral?.h.toFixed(1) + '°');

const coralHue = coral?.h ?? 0;

console.log('\nDistances to nearby slots:');
console.log('  To tomato (33.3°):', Math.abs(coralHue - 33.3).toFixed(1) + '°');
console.log('  To bronze (44.2°):', Math.abs(coralHue - 44.2).toFixed(1) + '°');
console.log('  To orange (45.0°):', Math.abs(coralHue - 45.0).toFixed(1) + '°');

console.log('\nChroma comparison:');
console.log('  Coral chroma:', coral?.c.toFixed(3), '(vibrant)');
console.log('  Tomato ref:   ', BASELINE_HUES.tomato.referenceChroma.toFixed(3), '(vibrant)');
console.log('  Bronze ref:   ', BASELINE_HUES.bronze.referenceChroma.toFixed(3), '(MUTED)');
console.log('  Orange ref:   ', BASELINE_HUES.orange.referenceChroma.toFixed(3), '(vibrant)');

console.log('\nWhat findClosestHueWithDistance returns:');
const result = findClosestHueWithDistance(coralHue);
console.log('  Slot:', result.slot);
console.log('  Distance:', result.distance.toFixed(1) + '°');

console.log('\n=== THE PROBLEM ===');
console.log('findClosestHue only compares HUE ANGLE, not chroma.');
console.log('Bronze and orange are both ~44-45°, but bronze wins by 0.8°');
console.log('Semantically, coral should map to tomato or orange (vibrant), not bronze (muted).');
