/**
 * Shared prompt utilities for CLI commands
 */

import { isCancel, cancel, text, multiselect, confirm } from '@clack/prompts';
import { validateColor } from '@sveltopia/colors';
import type { ExportFormat } from './config.js';

/**
 * Format a validation error for display
 */
export function formatColorError(color: string): string {
	const result = validateColor(color);
	if (result.valid) return '';

	let message = `Invalid color "${color}": ${result.error}`;
	if (result.suggestion) {
		message += ` - ${result.suggestion}`;
	}
	return message;
}

/**
 * Validate all colors and throw with helpful message if invalid
 */
export function validateColors(colors: string[]): void {
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
export async function promptForColors(): Promise<string[]> {
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
					if (result.suggestion) msg += ` - ${result.suggestion}`;
					return msg;
				}
			}
		}
	});

	if (isCancel(response)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	return (response as string)
		.split(',')
		.map((c) => c.trim())
		.filter(Boolean);
}

/**
 * Prompt user for output formats if none provided
 */
export async function promptForFormats(): Promise<ExportFormat[]> {
	const response = await multiselect({
		message: 'Select output formats',
		options: [
			{ value: 'css', label: 'CSS', hint: 'CSS custom properties with light/dark mode' },
			{ value: 'json', label: 'JSON', hint: 'Full palette data with hex, oklch, P3' },
			{ value: 'tailwind', label: 'Tailwind', hint: 'Tailwind CSS preset (50-950 scale)' },
			{ value: 'radix', label: 'Radix', hint: 'Drop-in @radix-ui/colors replacement' },
			{ value: 'panda', label: 'Panda CSS', hint: 'Panda CSS preset with semantic tokens' },
			{ value: 'shadcn', label: 'shadcn', hint: 'Tailwind v4 CSS + shadcn semantic tokens' }
		],
		initialValues: ['css', 'json'],
		required: true
	});

	if (isCancel(response)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	return response as ExportFormat[];
}

/**
 * Prompt user for output directory if none provided
 */
export async function promptForOutput(): Promise<string> {
	const response = await text({
		message: 'Output directory',
		placeholder: './colors',
		defaultValue: './colors',
		validate: (value) => {
			if (!value.trim()) {
				return 'Output directory is required';
			}
		}
	});

	if (isCancel(response)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	return (response as string) || './colors';
}

/**
 * Ask if user wants to customize settings or use defaults
 */
export async function promptForInteractiveMode(): Promise<boolean> {
	const response = await confirm({
		message: 'Customize output settings?',
		initialValue: false
	});

	if (isCancel(response)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	return response as boolean;
}
