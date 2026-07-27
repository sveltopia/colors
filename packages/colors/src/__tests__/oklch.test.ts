import { describe, it, expect } from 'vitest';
import {
  toOklch,
  toHex,
  toCss,
  parseColor,
  isValidColor,
  clampOklch,
  inGamut,
  gamutMapOklch
} from '../utils/oklch.js';

describe('OKLCH utilities', () => {
  describe('toOklch', () => {
    it('converts hex colors to OKLCH', () => {
      const result = toOklch('#FF6A00');
      expect(result).not.toBeNull();
      expect(result!.l).toBeGreaterThan(0);
      expect(result!.c).toBeGreaterThan(0);
      expect(result!.h).toBeGreaterThan(0);
    });

    it('converts Sveltopia brand orange', () => {
      const result = toOklch('#FF6A00');
      expect(result).not.toBeNull();
      // Orange should have hue roughly in 40-70 range
      expect(result!.h).toBeGreaterThan(30);
      expect(result!.h).toBeLessThan(80);
    });

    it('converts Sveltopia brand green', () => {
      const result = toOklch('#43A047');
      expect(result).not.toBeNull();
      // Green should have hue roughly in 130-160 range
      expect(result!.h).toBeGreaterThan(120);
      expect(result!.h).toBeLessThan(170);
    });

    it('returns null for invalid colors', () => {
      expect(toOklch('not-a-color')).toBeNull();
    });

    // Edge cases
    it('handles pure black', () => {
      const result = toOklch('#000000');
      expect(result).not.toBeNull();
      expect(result!.l).toBe(0);
    });

    it('handles pure white', () => {
      const result = toOklch('#FFFFFF');
      expect(result).not.toBeNull();
      expect(result!.l).toBeCloseTo(1, 2);
    });

    it('handles neutral gray (zero chroma)', () => {
      const result = toOklch('#808080');
      expect(result).not.toBeNull();
      expect(result!.c).toBeCloseTo(0, 2);
      // Hue is undefined for achromatic colors, Culori returns 0 or NaN
    });

    it('returns null for empty string', () => {
      expect(toOklch('')).toBeNull();
    });

    it('returns null for whitespace', () => {
      expect(toOklch('   ')).toBeNull();
    });

    it('returns null for invalid hex characters', () => {
      expect(toOklch('#GGGGGG')).toBeNull();
    });

    it('handles 3-character hex shorthand', () => {
      const result = toOklch('#F00');
      expect(result).not.toBeNull();
      expect(result!.h).toBeGreaterThan(15); // Red hue
      expect(result!.h).toBeLessThan(35);
    });

    it('handles hex with alpha channel', () => {
      const result = toOklch('#FF6A0080');
      expect(result).not.toBeNull();
      expect(result!.alpha).toBeCloseTo(0.5, 1);
    });

    it('handles rgb() format', () => {
      const result = toOklch('rgb(255, 106, 0)');
      expect(result).not.toBeNull();
      expect(result!.h).toBeGreaterThan(30);
      expect(result!.h).toBeLessThan(80);
    });

    it('handles CSS named colors', () => {
      const result = toOklch('rebeccapurple');
      expect(result).not.toBeNull();
      expect(result!.h).toBeGreaterThan(280);
      expect(result!.h).toBeLessThan(320);
    });
  });

  describe('toHex', () => {
    it('converts OKLCH back to hex', () => {
      const hex = toHex({ l: 0.7, c: 0.15, h: 50 });
      expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('toCss', () => {
    it('formats OKLCH as CSS string', () => {
      const css = toCss({ l: 0.7, c: 0.15, h: 50 });
      expect(css).toContain('oklch');
    });
  });

  describe('round-trip conversion', () => {
    it('preserves color through hex → OKLCH → hex', () => {
      const original = '#FF6A00';
      const oklch = toOklch(original);
      expect(oklch).not.toBeNull();

      const backToHex = toHex(oklch!);
      // Allow small differences due to color space conversion
      expect(backToHex).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('parseColor', () => {
    it('returns all formats for valid color', () => {
      const result = parseColor('#FF6A00');
      expect(result).not.toBeNull();
      expect(result!.oklch).toBeDefined();
      expect(result!.hex).toMatch(/^#[0-9a-f]{6}$/i);
      expect(result!.css).toContain('oklch');
    });

    it('returns null for invalid color', () => {
      expect(parseColor('invalid')).toBeNull();
    });
  });

  describe('isValidColor', () => {
    it('returns true for valid hex colors', () => {
      expect(isValidColor('#FF6A00')).toBe(true);
      expect(isValidColor('#43A047')).toBe(true);
      expect(isValidColor('#1A1A1A')).toBe(true);
    });

    it('returns true for named colors', () => {
      expect(isValidColor('red')).toBe(true);
      expect(isValidColor('blue')).toBe(true);
    });

    it('returns false for invalid colors', () => {
      expect(isValidColor('not-a-color')).toBe(false);
    });
  });

  describe('clampOklch', () => {
    it('clamps lightness to 0-1', () => {
      expect(clampOklch({ l: 1.5, c: 0.1, h: 50 }).l).toBe(1);
      expect(clampOklch({ l: -0.5, c: 0.1, h: 50 }).l).toBe(0);
    });

    it('ensures chroma is positive', () => {
      expect(clampOklch({ l: 0.5, c: -0.1, h: 50 }).c).toBe(0);
    });

    it('normalizes hue to 0-360', () => {
      expect(clampOklch({ l: 0.5, c: 0.1, h: 400 }).h).toBe(40);
      expect(clampOklch({ l: 0.5, c: 0.1, h: -30 }).h).toBe(330);
    });

    it('clamps alpha to 0-1 when present', () => {
      expect(clampOklch({ l: 0.5, c: 0.1, h: 50, alpha: 1.5 }).alpha).toBe(1);
      expect(clampOklch({ l: 0.5, c: 0.1, h: 50, alpha: -0.5 }).alpha).toBe(0);
    });
  });

  describe('inGamut', () => {
    it('accepts a color sRGB can actually show', () => {
      expect(inGamut(toOklch('#3E63DD')!)).toBe(true);
    });

    it('rejects a color beyond sRGB', () => {
      // oklch(0.7 0.3 145) -- a vivid green well past what sRGB reaches
      expect(inGamut({ l: 0.7, c: 0.3, h: 145 })).toBe(false);
    });

    it('defaults to sRGB', () => {
      expect(inGamut({ l: 0.7, c: 0.25, h: 145 })).toBe(
        inGamut({ l: 0.7, c: 0.25, h: 145 }, 'srgb')
      );
    });

    it('display-p3 reaches colors sRGB cannot', () => {
      const wide = { l: 0.7, c: 0.25, h: 145 };
      expect(inGamut(wide, 'srgb')).toBe(false);
      expect(inGamut(wide, 'display-p3')).toBe(true);
    });
  });

  describe('gamutMapOklch', () => {
    // The whole reason this exists instead of toHex's channel clipping.
    it('preserves lightness and hue while reducing chroma', () => {
      const input = { l: 0.7, c: 0.3, h: 145 };
      const { color, mapped } = gamutMapOklch(input);

      expect(mapped).toBe(true);
      expect(color.l).toBeCloseTo(input.l, 10);
      expect(color.h).toBeCloseTo(input.h, 4);
      expect(color.c).toBeLessThan(input.c);
    });

    it('returns a color that is genuinely displayable', () => {
      const { color } = gamutMapOklch({ l: 0.7, c: 0.3, h: 145 });
      expect(inGamut(color)).toBe(true);
    });

    it('leaves an in-gamut color untouched and reports mapped: false', () => {
      const input = toOklch('#3E63DD')!;
      const { color, mapped } = gamutMapOklch(input);

      expect(mapped).toBe(false);
      expect(color).toEqual(input);
    });

    it('maps into display-p3 when asked, keeping more chroma than sRGB', () => {
      const input = { l: 0.7, c: 0.3, h: 145 };
      const srgb = gamutMapOklch(input, 'srgb');
      const p3 = gamutMapOklch(input, 'display-p3');

      expect(inGamut(p3.color, 'display-p3')).toBe(true);
      expect(p3.color.c).toBeGreaterThan(srgb.color.c);
    });

    it('rescues a lightness outside 0-1', () => {
      // Chroma reduction alone cannot fix this: culori bottoms out at c = 0
      // and still returns L = 1.0000000000000002, which is out of gamut.
      const { color, mapped } = gamutMapOklch({ l: 1.5, c: 0.1, h: 200 });

      expect(mapped).toBe(true);
      expect(color.l).toBe(1);
      expect(inGamut(color)).toBe(true);
    });

    it('keeps the hue even when the result lands achromatic', () => {
      const { color } = gamutMapOklch({ l: 1, c: 0.4, h: 200 });
      expect(color.c).toBe(0);
      expect(color.h).toBe(200);
    });

    it('preserves alpha', () => {
      const { color } = gamutMapOklch({ l: 0.7, c: 0.3, h: 145, alpha: 0.4 });
      expect(color.alpha).toBe(0.4);
    });

    it('does not change toHex, which still clips', () => {
      // Guard on the constraint: toHex must keep its clipping behaviour,
      // because palette generation runs through it.
      const input = { l: 0.7, c: 0.3, h: 145 };
      const clipped = toOklch(toHex(input))!;
      const { color: gamutMapped } = gamutMapOklch(input);

      // Clipping distorts hue; chroma reduction does not.
      expect(Math.abs(clipped.h - input.h)).toBeGreaterThan(Math.abs(gamutMapped.h - input.h));
    });
  });
});
