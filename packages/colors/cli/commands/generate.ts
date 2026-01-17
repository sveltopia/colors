import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spinner, log } from '@clack/prompts';
import { loadConfig, mergeOptions, type ColorsConfig } from '../utils/config.js';
import { promptForColors, validateColors } from '../utils/prompts.js';
import { generatePalette, exportCSS, exportJSON } from '../../dist/index.js';
import type { Palette } from '../../dist/index.js';

export interface GenerateOptions {
	colors?: string;
	config?: string;
	output?: string;
	format?: string;
}

/**
 * Generate palette from brand colors
 */
function createPalette(brandColors: string[]): Palette {
	// Generate light mode palette
	const lightPalette = generatePalette({
		brandColors,
		mode: 'light'
	});

	// Generate dark mode palette
	const darkPalette = generatePalette({
		brandColors,
		mode: 'dark'
	});

	// Combine into full Palette
	return {
		light: lightPalette.scales,
		dark: darkPalette.scales,
		_meta: {
			tuningProfile: lightPalette.meta.tuningProfile,
			inputColors: brandColors,
			generatedAt: new Date().toISOString()
		}
	};
}

/**
 * Main generate command handler
 */
export async function generateCommand(options: GenerateOptions): Promise<void> {
	const s = spinner();

	// Load and merge config
	s.start('Loading configuration');
	let config: ColorsConfig;
	try {
		config = await loadConfig(options.config);
		config = mergeOptions(config, {
			colors: options.colors,
			output: options.output,
			format: options.format
		});
	} catch (error) {
		s.stop('Configuration failed');
		throw error;
	}
	s.stop('Configuration loaded');

	// Prompt for colors if none provided
	if (config.brandColors.length === 0) {
		log.info('No brand colors specified in config or --colors flag');
		config.brandColors = await promptForColors();
	}

	// Validate colors with helpful error messages
	validateColors(config.brandColors);

	log.info(`Brand colors: ${config.brandColors.join(', ')}`);

	// Generate palette
	s.start('Generating palette');
	const palette = createPalette(config.brandColors);
	const scaleCount = Object.keys(palette.light).length;
	s.stop(`Generated ${scaleCount} scales (light + dark)`);

	// Ensure output directory exists
	const outputDir = resolve(config.outputDir);
	if (!existsSync(outputDir)) {
		await mkdir(outputDir, { recursive: true });
		log.info(`Created output directory: ${outputDir}`);
	}

	// Export CSS
	if (config.formats.includes('css')) {
		s.start('Exporting CSS');
		const css = exportCSS(palette, {
			prefix: config.prefix || undefined
		});
		const cssPath = join(outputDir, 'colors.css');
		await writeFile(cssPath, css, 'utf-8');
		s.stop(`CSS exported to ${cssPath}`);
	}

	// Export JSON
	if (config.formats.includes('json')) {
		s.start('Exporting JSON');
		const json = exportJSON(palette);
		const jsonPath = join(outputDir, 'colors.json');
		await writeFile(jsonPath, JSON.stringify(json, null, 2), 'utf-8');
		s.stop(`JSON exported to ${jsonPath}`);
	}

	log.success(`Palette generated successfully!`);
	log.info(`Output: ${outputDir}`);
}
