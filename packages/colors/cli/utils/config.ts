import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

export interface ColorsConfig {
	brandColors: string[];
	outputDir: string;
	formats: ('css' | 'json')[];
	prefix?: string;
}

const DEFAULT_CONFIG: ColorsConfig = {
	brandColors: [],
	outputDir: './colors',
	formats: ['css', 'json'],
	prefix: ''
};

const CONFIG_FILENAMES = ['colors.config.json', 'colors.json'];

/**
 * Find config file in current directory or up the tree
 */
export function findConfigFile(startDir: string = process.cwd()): string | null {
	let currentDir = resolve(startDir);
	const root = dirname(currentDir);

	while (currentDir !== root) {
		for (const filename of CONFIG_FILENAMES) {
			const configPath = resolve(currentDir, filename);
			if (existsSync(configPath)) {
				return configPath;
			}
		}
		const parentDir = dirname(currentDir);
		if (parentDir === currentDir) break;
		currentDir = parentDir;
	}

	return null;
}

/**
 * Load config from file
 */
export async function loadConfig(configPath?: string): Promise<ColorsConfig> {
	const resolvedPath = configPath ? resolve(configPath) : findConfigFile();

	if (!resolvedPath) {
		return { ...DEFAULT_CONFIG };
	}

	if (!existsSync(resolvedPath)) {
		throw new Error(`Config file not found: ${resolvedPath}`);
	}

	try {
		const content = await readFile(resolvedPath, 'utf-8');
		const parsed = JSON.parse(content);
		return {
			...DEFAULT_CONFIG,
			...parsed
		};
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error(`Invalid JSON in config file: ${resolvedPath}`);
		}
		throw error;
	}
}

/**
 * Merge CLI options with config file
 */
export function mergeOptions(
	config: ColorsConfig,
	cliOptions: {
		colors?: string;
		output?: string;
		format?: string;
	}
): ColorsConfig {
	const merged = { ...config };

	// CLI --colors overrides config brandColors
	if (cliOptions.colors) {
		merged.brandColors = cliOptions.colors
			.split(',')
			.map((c) => c.trim())
			.filter(Boolean);
	}

	// CLI --output overrides config outputDir
	if (cliOptions.output) {
		merged.outputDir = cliOptions.output;
	}

	// CLI --format overrides config formats
	if (cliOptions.format) {
		if (cliOptions.format === 'both') {
			merged.formats = ['css', 'json'];
		} else if (cliOptions.format === 'css' || cliOptions.format === 'json') {
			merged.formats = [cliOptions.format];
		}
	}

	return merged;
}
