import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
const DEFAULT_CONFIG = {
    brandColors: [],
    outputDir: './colors',
    formats: ['css', 'json'],
    prefix: ''
};
const CONFIG_FILENAMES = ['colors.config.json', 'colors.json'];
/**
 * Find config file in current directory or up the tree
 */
export function findConfigFile(startDir = process.cwd()) {
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
        if (parentDir === currentDir)
            break;
        currentDir = parentDir;
    }
    return null;
}
/**
 * Load config from file
 */
export async function loadConfig(configPath) {
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
    }
    catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`Invalid JSON in config file: ${resolvedPath}`);
        }
        throw error;
    }
}
/**
 * Merge CLI options with config file
 */
export function mergeOptions(config, cliOptions) {
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
        const validFormats = ['css', 'json', 'tailwind', 'radix', 'panda'];
        const requestedFormats = cliOptions.format.split(',').map((f) => f.trim().toLowerCase());
        // Handle 'all' shorthand
        if (requestedFormats.includes('all')) {
            merged.formats = validFormats;
        }
        else {
            merged.formats = requestedFormats.filter((f) => validFormats.includes(f));
        }
        // Default to css,json if no valid formats
        if (merged.formats.length === 0) {
            merged.formats = ['css', 'json'];
        }
    }
    return merged;
}
