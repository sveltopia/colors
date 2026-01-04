/**
 * OKLCH color manipulation utilities using Culori
 */

import { oklch, formatHex, formatCss, parse } from 'culori';
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
