/**
 * Shared prompt utilities for CLI commands
 */
import { isCancel, cancel, text } from '@clack/prompts';
import { validateColor } from '../../dist/index.js';
/**
 * Format a validation error for display
 */
export function formatColorError(color) {
    const result = validateColor(color);
    if (result.valid)
        return '';
    let message = `Invalid color "${color}": ${result.error}`;
    if (result.suggestion) {
        message += ` - ${result.suggestion}`;
    }
    return message;
}
/**
 * Validate all colors and throw with helpful message if invalid
 */
export function validateColors(colors) {
    for (const color of colors) {
        const result = validateColor(color);
        if (!result.valid) {
            throw new Error(formatColorError(color));
        }
    }
}
/**
 * Prompt user for brand colors if none provided
 */
export async function promptForColors() {
    const response = await text({
        message: 'Enter your brand colors (comma-separated hex values)',
        placeholder: '#FF4F00, #1A1A1A',
        validate: (value) => {
            if (!value.trim()) {
                return 'At least one color is required';
            }
            const colors = value.split(',').map((c) => c.trim());
            for (const color of colors) {
                const result = validateColor(color);
                if (!result.valid) {
                    let msg = result.error || 'Invalid color';
                    if (result.suggestion)
                        msg += ` - ${result.suggestion}`;
                    return msg;
                }
            }
        }
    });
    if (isCancel(response)) {
        cancel('Operation cancelled');
        process.exit(0);
    }
    return response
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
}
