/**
 * Baseline Hue Definitions
 *
 * 31 hue positions extracted from Radix Colors step-9 values.
 * These serve as the "slots" that brand colors anchor to.
 *
 * The hue angles and reference chromas are derived from actual
 * Radix Colors, giving us proven, visually-balanced positions.
 *
 * See: scripts/extract-radix.ts for extraction source.
 */

export interface HueDefinition {
	/** Display name for the hue */
	name: string;
	/** OKLCH hue angle (0-360), extracted from Radix step-9 */
	hue: number;
	/** Semantic category for grouping */
	category: 'red' | 'orange' | 'yellow' | 'green' | 'cyan' | 'blue' | 'purple' | 'pink' | 'neutral';
	/** Reference chroma at step-9, extracted from Radix */
	referenceChroma: number;
	/** Source Radix hex color (step-9) for reference */
	radixHex: string;
}

/**
 * 31 baseline hues extracted from Radix Colors step-9.
 *
 * Sorted by hue angle for logical ordering.
 * Hue angles and chromas are the actual OKLCH values from Radix.
 */
export const BASELINE_HUES: Record<string, HueDefinition> = {
	// Neutral gray (achromatic)
	gray: { name: 'Gray', hue: 0.00, category: 'neutral', referenceChroma: 0.000000, radixHex: '#8d8d8d' },

	// Red family (1° - 45°)
	crimson: {
		name: 'Crimson',
		hue: 1.28,
		category: 'red',
		referenceChroma: 0.212961,
		radixHex: '#e93d82'
	},
	ruby: { name: 'Ruby', hue: 13.15, category: 'red', referenceChroma: 0.194866, radixHex: '#e54666' },
	red: { name: 'Red', hue: 23.03, category: 'red', referenceChroma: 0.193340, radixHex: '#e5484d' },
	tomato: {
		name: 'Tomato',
		hue: 33.34,
		category: 'red',
		referenceChroma: 0.193584,
		radixHex: '#e54d2e'
	},

	// Orange family (45° - 70°)
	bronze: {
		name: 'Bronze',
		hue: 44.16,
		category: 'neutral', // Warm-tinted neutral (chroma 0.046 is near-neutral)
		referenceChroma: 0.045953,
		radixHex: '#a18072'
	},
	orange: {
		name: 'Orange',
		hue: 45.02,
		category: 'orange',
		referenceChroma: 0.190911,
		radixHex: '#f76b15'
	},
	brown: {
		name: 'Brown',
		hue: 60.98,
		category: 'orange',
		referenceChroma: 0.078487,
		radixHex: '#ad7f58'
	},

	// Yellow family (70° - 115°)
	gold: { name: 'Gold', hue: 77.70, category: 'neutral', referenceChroma: 0.049157, radixHex: '#978365' }, // Warm-tinted neutral
	amber: {
		name: 'Amber',
		hue: 84.13,
		category: 'yellow',
		referenceChroma: 0.157207,
		radixHex: '#ffc53d'
	},
	yellow: {
		name: 'Yellow',
		hue: 100.94,
		category: 'yellow',
		referenceChroma: 0.183771,
		radixHex: '#ffe629'
	},
	sand: {
		name: 'Sand',
		hue: 106.68,
		category: 'neutral',
		referenceChroma: 0.010232,
		radixHex: '#8d8d86'
	},

	// Green family (115° - 175°)
	lime: { name: 'Lime', hue: 126.09, category: 'green', referenceChroma: 0.174730, radixHex: '#bdee63' },
	olive: {
		name: 'Olive',
		hue: 136.58,
		category: 'neutral',
		referenceChroma: 0.011791,
		radixHex: '#898e87'
	},
	grass: {
		name: 'Grass',
		hue: 147.39,
		category: 'green',
		referenceChroma: 0.146785,
		radixHex: '#46a758'
	},
	green: {
		name: 'Green',
		hue: 157.68,
		category: 'green',
		referenceChroma: 0.132875,
		radixHex: '#30a46c'
	},
	jade: { name: 'Jade', hue: 170.73, category: 'green', referenceChroma: 0.115025, radixHex: '#29a383' },
	sage: { name: 'Sage', hue: 171.61, category: 'neutral', referenceChroma: 0.010322, radixHex: '#868e8b' },

	// Cyan family (175° - 215°)
	mint: { name: 'Mint', hue: 177.98, category: 'cyan', referenceChroma: 0.099913, radixHex: '#86ead4' },
	teal: { name: 'Teal', hue: 181.96, category: 'cyan', referenceChroma: 0.113572, radixHex: '#12a594' },
	sky: { name: 'Sky', hue: 217.80, category: 'cyan', referenceChroma: 0.102721, radixHex: '#7ce2fe' },
	cyan: { name: 'Cyan', hue: 221.74, category: 'cyan', referenceChroma: 0.121716, radixHex: '#00a2c7' },

	// Blue family (215° - 280°)
	blue: { name: 'Blue', hue: 251.78, category: 'blue', referenceChroma: 0.193040, radixHex: '#0090ff' },
	indigo: {
		name: 'Indigo',
		hue: 267.01,
		category: 'blue',
		referenceChroma: 0.191015,
		radixHex: '#3e63dd'
	},
	slate: {
		name: 'Slate',
		hue: 277.70,
		category: 'neutral',
		referenceChroma: 0.016454,
		radixHex: '#8b8d98'
	},
	iris: { name: 'Iris', hue: 278.28, category: 'blue', referenceChroma: 0.184124, radixHex: '#5b5bd6' },

	// Purple family (280° - 330°)
	violet: {
		name: 'Violet',
		hue: 288.03,
		category: 'purple',
		referenceChroma: 0.179028,
		radixHex: '#6e56cf'
	},
	mauve: {
		name: 'Mauve',
		hue: 292.92,
		category: 'neutral',
		referenceChroma: 0.019269,
		radixHex: '#8e8c99'
	},
	purple: {
		name: 'Purple',
		hue: 305.86,
		category: 'purple',
		referenceChroma: 0.182910,
		radixHex: '#8e4ec6'
	},
	plum: { name: 'Plum', hue: 322.11, category: 'purple', referenceChroma: 0.187722, radixHex: '#ab4aba' },

	// Pink family (330° - 360°)
	pink: { name: 'Pink', hue: 346.00, category: 'pink', referenceChroma: 0.207608, radixHex: '#d6409f' }
} as const;

/** Array of all hue keys for iteration */
export const HUE_KEYS = Object.keys(BASELINE_HUES) as (keyof typeof BASELINE_HUES)[];

/** Number of baseline hues */
export const HUE_COUNT = HUE_KEYS.length;

/** Snap threshold in degrees - if brand color is within this of a slot, snap to it */
export const SNAP_THRESHOLD = 10;

/**
 * Find the closest baseline hue to a given OKLCH hue angle.
 * Used to map brand colors to their nearest slot.
 *
 * @param hue - OKLCH hue angle (0-360)
 * @param excludeNeutrals - Skip neutral hues (they have low chroma intent)
 * @returns The key of the closest baseline hue
 */
export function findClosestHue(hue: number, excludeNeutrals = true): string {
	let closestKey = 'gray';
	let closestDistance = Infinity;

	for (const [key, def] of Object.entries(BASELINE_HUES)) {
		if (excludeNeutrals && def.category === 'neutral') continue;

		// Calculate circular distance (hue wraps at 360)
		const distance = Math.min(Math.abs(hue - def.hue), 360 - Math.abs(hue - def.hue));

		if (distance < closestDistance) {
			closestDistance = distance;
			closestKey = key;
		}
	}

	return closestKey;
}

/**
 * Find the closest hue and return both the slot and the distance.
 * Used to decide whether to snap or create a custom slot.
 *
 * @param hue - OKLCH hue angle (0-360)
 * @param options - Search options
 * @param options.excludeNeutrals - Skip neutral hues (for chromatic colors)
 * @param options.neutralsOnly - Only search neutral hues (for non-chromatic colors)
 * @returns Object with slot key and distance in degrees
 */
export function findClosestHueWithDistance(
	hue: number,
	options: { excludeNeutrals?: boolean; neutralsOnly?: boolean } | boolean = true
): { slot: string; distance: number } {
	// Support legacy boolean parameter for backwards compatibility
	const opts =
		typeof options === 'boolean' ? { excludeNeutrals: options, neutralsOnly: false } : options;

	const { excludeNeutrals = false, neutralsOnly = false } = opts;

	let closestKey = 'gray';
	let closestDistance = Infinity;

	for (const [key, def] of Object.entries(BASELINE_HUES)) {
		// Skip neutrals if excluding them
		if (excludeNeutrals && def.category === 'neutral') continue;
		// Skip non-neutrals if only searching neutrals
		if (neutralsOnly && def.category !== 'neutral') continue;

		const distance = Math.min(Math.abs(hue - def.hue), 360 - Math.abs(hue - def.hue));

		if (distance < closestDistance) {
			closestDistance = distance;
			closestKey = key;
		}
	}

	return { slot: closestKey, distance: closestDistance };
}

/**
 * Determine if a brand color should snap to a slot or get a custom slot.
 *
 * @param hue - OKLCH hue angle of the brand color
 * @param threshold - Max degrees to snap (default: SNAP_THRESHOLD)
 * @returns Object indicating whether to snap and which slot
 */
export function shouldSnapToSlot(
	hue: number,
	threshold = SNAP_THRESHOLD
): { snap: boolean; slot: string; distance: number } {
	const { slot, distance } = findClosestHueWithDistance(hue);
	return {
		snap: distance <= threshold,
		slot,
		distance
	};
}

/**
 * Get hue definitions sorted by hue angle.
 * Useful for displaying the full spectrum in order.
 */
export function getHuesSortedByAngle(): Array<[string, HueDefinition]> {
	return Object.entries(BASELINE_HUES).sort((a, b) => a[1].hue - b[1].hue);
}

/**
 * Get hue definitions grouped by category.
 */
export function getHuesByCategory(): Record<string, Array<[string, HueDefinition]>> {
	const grouped: Record<string, Array<[string, HueDefinition]>> = {};

	for (const [key, def] of Object.entries(BASELINE_HUES)) {
		if (!grouped[def.category]) {
			grouped[def.category] = [];
		}
		grouped[def.category].push([key, def]);
	}

	return grouped;
}
