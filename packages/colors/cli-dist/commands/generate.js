import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spinner, log, isCancel, cancel, text } from '@clack/prompts';
import { loadConfig, mergeOptions } from '../utils/config.js';
import { generatePalette, exportCSS, exportJSON, validateColor } from '../../dist/index.js';
/**
 * Format a validation error for display
 */
function formatColorError(color) {
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
 * Prompt user for brand colors if none provided
 */
async function promptForColors() {
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
/**
 * Generate palette from brand colors
 */
function createPalette(brandColors) {
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
export async function generateCommand(options) {
    const s = spinner();
    // Load and merge config
    s.start('Loading configuration');
    let config;
    try {
        config = await loadConfig(options.config);
        config = mergeOptions(config, {
            colors: options.colors,
            output: options.output,
            format: options.format
        });
    }
    catch (error) {
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
    for (const color of config.brandColors) {
        const result = validateColor(color);
        if (!result.valid) {
            throw new Error(formatColorError(color));
        }
    }
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
