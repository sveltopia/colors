/**
 * Baseline Accuracy Test
 * 
 * This test ensures that when given an EXACT Radix color as input,
 * the generated palette matches Radix EXACTLY (hex-for-hex).
 * 
 * This is the "ground truth" test - if this fails, our foundation is broken.
 */

import { describe, it, expect } from 'vitest';
import * as radixColors from '@radix-ui/colors';
import { analyzeBrandColors } from '../core/analyze.js';
import { generateLightPalette } from '../core/palette.js';

// All 31 Radix hue names
const RADIX_HUES = [
  'gray', 'mauve', 'slate', 'sage', 'olive', 'sand',
  'tomato', 'red', 'ruby', 'crimson', 'pink', 'plum',
  'purple', 'violet', 'iris', 'indigo', 'blue', 'cyan',
  'teal', 'jade', 'green', 'grass', 'bronze', 'gold',
  'brown', 'orange', 'amber', 'yellow', 'lime', 'mint', 'sky'
];

describe('Baseline Accuracy: Exact Radix Input', () => {
  // Use Radix Green step 9 as input - should produce tuning profile of ~1.0x
  const EXACT_RADIX_INPUT = '#30A46C'; // Radix green-9
  
  it('should produce tuning profile near 1.0x for exact Radix input', () => {
    const tuningProfile = analyzeBrandColors([EXACT_RADIX_INPUT]);
    
    // Tuning should be nearly neutral
    expect(Math.abs(tuningProfile.hueShift)).toBeLessThan(1); // < 1°
    expect(Math.abs(tuningProfile.chromaMultiplier - 1.0)).toBeLessThan(0.01); // < 1%
    expect(Math.abs(tuningProfile.lightnessShift)).toBeLessThan(0.02); // < 2%
  });

  it('should generate colors that EXACTLY match Radix for all 31 hues', () => {
    const tuningProfile = analyzeBrandColors([EXACT_RADIX_INPUT]);
    const palette = generateLightPalette({ tuningProfile });
    
    const mismatches: string[] = [];
    
    for (const hue of RADIX_HUES) {
      const radixScale = (radixColors as any)[hue];
      const generatedScale = palette.scales[hue];
      
      for (let step = 1; step <= 12; step++) {
        const radixHex = radixScale[`${hue}${step}`].toLowerCase();
        const generatedHex = generatedScale[step].toLowerCase();
        
        if (radixHex !== generatedHex) {
          mismatches.push(`${hue}-${step}: expected ${radixHex}, got ${generatedHex}`);
        }
      }
    }
    
    // This test MUST pass with ZERO mismatches
    expect(mismatches).toEqual([]);
  });

  // Test each hue individually for clearer failure messages
  for (const hue of RADIX_HUES) {
    it(`should match Radix exactly for ${hue}`, () => {
      const tuningProfile = analyzeBrandColors([EXACT_RADIX_INPUT]);
      const palette = generateLightPalette({ tuningProfile });
      
      const radixScale = (radixColors as any)[hue];
      const generatedScale = palette.scales[hue];
      
      for (let step = 1; step <= 12; step++) {
        const radixHex = radixScale[`${hue}${step}`].toLowerCase();
        const generatedHex = generatedScale[step].toLowerCase();
        
        expect(generatedHex, `${hue} step ${step}`).toBe(radixHex);
      }
    });
  }
});
