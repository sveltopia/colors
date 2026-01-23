/**
 * Demo Preset Store
 *
 * Manages the currently selected brand preset for the demo pages.
 * The demo layout uses this to swap the preset stylesheet.
 */

// Current preset ID (reactive state)
let currentPresetId = $state('sveltopia');

/**
 * Get the current preset ID
 */
export function getPresetId(): string {
	return currentPresetId;
}

/**
 * Set the current preset ID
 */
export function setPresetId(presetId: string): void {
	currentPresetId = presetId;
}

/**
 * Get the stylesheet URL for a preset
 */
export function getPresetStylesheetUrl(presetId: string): string {
	return `/presets/${presetId}.css`;
}

/**
 * Reactive getter for use in components
 */
export function usePresetId() {
	return {
		get current() {
			return currentPresetId;
		},
		set current(value: string) {
			currentPresetId = value;
		}
	};
}
