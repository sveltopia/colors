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
	gray: { name: 'Gray', hue: 0, category: 'neutral', referenceChroma: 0.0, radixHex: '#8d8d8d' },

	// Red family (1° - 45°)
	crimson: {
		name: 'Crimson',
		hue: 1.3,
		category: 'red',
		referenceChroma: 0.213,
		radixHex: '#e93d82'
	},
	ruby: { name: 'Ruby', hue: 13.2, category: 'red', referenceChroma: 0.195, radixHex: '#e54666' },
	red: { name: 'Red', hue: 23.0, category: 'red', referenceChroma: 0.193, radixHex: '#e5484d' },
	tomato: {
		name: 'Tomato',
		hue: 33.3,
		category: 'red',
		referenceChroma: 0.194,
		radixHex: '#e54d2e'
	},

	// Orange family (45° - 70°)
	bronze: {
		name: 'Bronze',
		hue: 44.2,
		category: 'neutral', // Warm-tinted neutral (chroma 0.046 is near-neutral)
		referenceChroma: 0.046,
		radixHex: '#a18072'
	},
	orange: {
		name: 'Orange',
		hue: 45.0,
		category: 'orange',
		referenceChroma: 0.191,
		radixHex: '#f76b15'
	},
	brown: {
		name: 'Brown',
		hue: 61.0,
		category: 'orange',
		referenceChroma: 0.078,
		radixHex: '#ad7f58'
	},

	// Yellow family (70° - 115°)
	gold: { name: 'Gold', hue: 77.7, category: 'neutral', referenceChroma: 0.049, radixHex: '#978365' }, // Warm-tinted neutral
	amber: {
		name: 'Amber',
		hue: 84.1,
		category: 'yellow',
		referenceChroma: 0.157,
		radixHex: '#ffc53d'
	},
	yellow: {
		name: 'Yellow',
		hue: 100.9,
		category: 'yellow',
		referenceChroma: 0.184,
		radixHex: '#ffe629'
	},
	sand: {
		name: 'Sand',
		hue: 106.7,
		category: 'neutral',
		referenceChroma: 0.01,
		radixHex: '#8d8d86'
	},

	// Green family (115° - 175°)
	lime: { name: 'Lime', hue: 126.1, category: 'green', referenceChroma: 0.175, radixHex: '#bdee63' },
	olive: {
		name: 'Olive',
		hue: 136.6,
		category: 'neutral',
		referenceChroma: 0.012,
		radixHex: '#898e87'
	},
	grass: {
		name: 'Grass',
		hue: 147.4,
		category: 'green',
		referenceChroma: 0.147,
		radixHex: '#46a758'
	},
	green: {
		name: 'Green',
		hue: 157.7,
		category: 'green',
		referenceChroma: 0.133,
		radixHex: '#30a46c'
	},
	jade: { name: 'Jade', hue: 170.7, category: 'green', referenceChroma: 0.115, radixHex: '#29a383' },
	sage: { name: 'Sage', hue: 171.6, category: 'neutral', referenceChroma: 0.01, radixHex: '#868e8b' },

	// Cyan family (175° - 215°)
	mint: { name: 'Mint', hue: 178.0, category: 'cyan', referenceChroma: 0.1, radixHex: '#86ead4' },
	teal: { name: 'Teal', hue: 182.0, category: 'cyan', referenceChroma: 0.114, radixHex: '#12a594' },
	sky: { name: 'Sky', hue: 217.8, category: 'cyan', referenceChroma: 0.103, radixHex: '#7ce2fe' },
	cyan: { name: 'Cyan', hue: 221.7, category: 'cyan', referenceChroma: 0.122, radixHex: '#00a2c7' },

	// Blue family (215° - 280°)
	blue: { name: 'Blue', hue: 251.8, category: 'blue', referenceChroma: 0.193, radixHex: '#0090ff' },
	indigo: {
		name: 'Indigo',
		hue: 267.0,
		category: 'blue',
		referenceChroma: 0.191,
		radixHex: '#3e63dd'
	},
	slate: {
		name: 'Slate',
		hue: 277.7,
		category: 'neutral',
		referenceChroma: 0.016,
		radixHex: '#8b8d98'
	},
	iris: { name: 'Iris', hue: 278.3, category: 'blue', referenceChroma: 0.184, radixHex: '#5b5bd6' },

	// Purple family (280° - 330°)
	violet: {
		name: 'Violet',
		hue: 288.0,
		category: 'purple',
		referenceChroma: 0.179,
		radixHex: '#6e56cf'
	},
	mauve: {
		name: 'Mauve',
		hue: 292.9,
		category: 'neutral',
		referenceChroma: 0.019,
		radixHex: '#8e8c99'
	},
	purple: {
		name: 'Purple',
		hue: 305.9,
		category: 'purple',
		referenceChroma: 0.183,
		radixHex: '#8e4ec6'
	},
	plum: { name: 'Plum', hue: 322.1, category: 'purple', referenceChroma: 0.188, radixHex: '#ab4aba' },

	// Pink family (330° - 360°)
	pink: { name: 'Pink', hue: 346.0, category: 'pink', referenceChroma: 0.208, radixHex: '#d6409f' }
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
 * @param excludeNeutrals - Skip neutral hues
 * @returns Object with slot key and distance in degrees
 */
export function findClosestHueWithDistance(
	hue: number,
	excludeNeutrals = true
): { slot: string; distance: number } {
	let closestKey = 'gray';
	let closestDistance = Infinity;

	for (const [key, def] of Object.entries(BASELINE_HUES)) {
		if (excludeNeutrals && def.category === 'neutral') continue;

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
