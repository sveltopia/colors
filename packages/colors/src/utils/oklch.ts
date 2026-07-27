/**
 * OKLCH color manipulation utilities using Culori
 */

import { oklch, formatHex, formatCss, parse, clampChroma, inGamut as culoriInGamut } from 'culori';
import type { OklchColor } from '../types.js';

/**
 * Convert any color string to OKLCH
 */
export function toOklch(color: string): OklchColor | null {
  const parsed = oklch(color);
  if (!parsed) return null;

  return {
    l: parsed.l ?? 0,
    c: parsed.c ?? 0,
    h: parsed.h ?? 0,
    alpha: parsed.alpha
  };
}

/**
 * Convert OKLCH to hex string
 */
export function toHex(color: OklchColor): string {
  const result = formatHex({
    mode: 'oklch',
    l: color.l,
    c: color.c,
    h: color.h,
    alpha: color.alpha
  });
  return result ?? '#000000';
}

/**
 * Convert OKLCH to CSS oklch() string
 */
export function toCss(color: OklchColor): string {
  const result = formatCss({
    mode: 'oklch',
    l: color.l,
    c: color.c,
    h: color.h,
    alpha: color.alpha
  });
  return result ?? 'oklch(0 0 0)';
}

/**
 * Parse any color string and return it in multiple formats
 */
export function parseColor(input: string): {
  oklch: OklchColor;
  hex: string;
  css: string;
} | null {
  const color = toOklch(input);
  if (!color) return null;

  return {
    oklch: color,
    hex: toHex(color),
    css: toCss(color)
  };
}

/**
 * Check if a color string is valid
 */
export function isValidColor(color: string): boolean {
  return parse(color) !== undefined;
}

/**
 * Validation result for color input
 */
export interface ColorValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Validate a color string and return helpful error messages
 */
export function validateColor(color: string): ColorValidationResult {
  if (!color || typeof color !== 'string') {
    return { valid: false, error: 'Color is required' };
  }

  const trimmed = color.trim();

  if (trimmed === '') {
    return { valid: false, error: 'Color is required' };
  }

  // Check for missing # prefix on hex-like strings
  if (/^[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Missing # prefix',
      suggestion: `Did you mean #${trimmed}?`
    };
  }

  // Check for hex with wrong length
  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1);
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
      return {
        valid: false,
        error: 'Invalid hex characters',
        suggestion: 'Hex colors should only contain 0-9 and A-F'
      };
    }
    if (hex.length !== 3 && hex.length !== 4 && hex.length !== 6 && hex.length !== 8) {
      return {
        valid: false,
        error: `Invalid hex length (${hex.length} characters)`,
        suggestion: 'Hex colors should be 3, 4, 6, or 8 characters after #'
      };
    }
  }

  // Try parsing with culori
  if (parse(trimmed) === undefined) {
    return {
      valid: false,
      error: 'Unrecognized color format',
      suggestion: 'Try a hex color like #FF4F00 or a CSS color name'
    };
  }

  return { valid: true };
}

/**
 * Clamp OKLCH values to valid ranges
 */
export function clampOklch(color: OklchColor): OklchColor {
  return {
    l: Math.max(0, Math.min(1, color.l)),
    c: Math.max(0, color.c), // Chroma has no upper limit but should be positive
    h: ((color.h % 360) + 360) % 360, // Normalize to 0-360
    alpha: color.alpha !== undefined ? Math.max(0, Math.min(1, color.alpha)) : undefined
  };
}

/**
 * Target gamut for mapping and containment checks.
 *
 * `srgb` is safe on every display and is the default; `display-p3` is the
 * wider gamut modern hardware can show.
 */
export type Gamut = 'srgb' | 'display-p3';

/** Public gamut name -> culori mode key. */
const GAMUT_MODES: Record<Gamut, 'rgb' | 'p3'> = {
  srgb: 'rgb',
  'display-p3': 'p3'
};

/** Outcome of a gamut mapping. */
export interface GamutMapResult {
  /** The in-gamut color. The input itself when it was already in gamut. */
  color: OklchColor;
  /** Whether the input was out of gamut and therefore had to be mapped. */
  mapped: boolean;
}

/** OklchColor -> the shape culori expects. */
function toCuloriOklch(color: OklchColor) {
  return {
    mode: 'oklch' as const,
    l: color.l,
    c: color.c,
    h: color.h,
    alpha: color.alpha
  };
}

/**
 * Is this color reachable in the target gamut?
 *
 * Use it to decide whether a color can be displayed as authored -- the OKLCH
 * space describes far more colors than any screen can show, so a perfectly
 * valid OKLCH triplet is often not renderable.
 */
export function inGamut(color: OklchColor, gamut: Gamut = 'srgb'): boolean {
  return culoriInGamut(GAMUT_MODES[gamut])(toCuloriOklch(color));
}

/**
 * Map a color into the target gamut by reducing chroma while holding lightness
 * and hue, and report whether that was necessary.
 *
 * This is the perceptually correct fallback: it walks in toward the gamut along
 * the chroma axis, so the result reads as the same hue at the same lightness,
 * just less saturated. It is NOT what `toHex` does -- that clips RGB channels,
 * which distorts hue and lightness at the edges. `toHex`'s behaviour is
 * deliberately unchanged; palette generation depends on it.
 *
 * Returns the mapped color and a `mapped` flag together because callers
 * almost always need both for the same input (show a fallback, but only when
 * one was actually required), and pairing them makes the flag impossible to
 * forget.
 */
export function gamutMapOklch(color: OklchColor, gamut: Gamut = 'srgb'): GamutMapResult {
  if (inGamut(color, gamut)) return { color, mapped: false };

  // Normalize the axes clampOklch owns BEFORE reducing chroma. A lightness
  // outside 0-1 cannot be rescued by chroma reduction at all: clampChroma
  // bottoms out at c = 0 and still leaves an out-of-gamut color (L = 1.5
  // comes back as 1.0000000000000002, which fails inGamut). Clamping first
  // means the result of this function is always genuinely displayable.
  const normalized = clampOklch(color);
  const clamped = clampChroma(toCuloriOklch(normalized), 'oklch', GAMUT_MODES[gamut]);

  return {
    color: {
      l: clamped.l ?? normalized.l,
      c: clamped.c ?? 0,
      // culori drops the hue channel when a result lands fully achromatic;
      // keep the caller's hue so a round-trip never silently loses it.
      h: clamped.h ?? normalized.h,
      alpha: clamped.alpha
    },
    mapped: true
  };
}
