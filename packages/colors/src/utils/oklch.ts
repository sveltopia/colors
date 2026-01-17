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
