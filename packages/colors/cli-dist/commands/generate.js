import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spinner, log } from '@clack/prompts';
import { loadConfig, mergeOptions } from '../utils/config.js';
import { promptForColors, promptForFormats, promptForOutput, promptForInteractiveMode, validateColors } from '../utils/prompts.js';
import { generatePalette, exportCSS, exportJSON, exportTailwind, exportRadix, exportPanda } from '../../dist/index.js';
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
    // Build BrandColorInfo from the tuning profile anchors
    const brandColorInfo = [];
    const anchors = lightPalette.meta.tuningProfile.anchors;
    for (const [hex, anchor] of Object.entries(anchors)) {
        brandColorInfo.push({
            hex,
            hue: anchor.slot,
            anchorStep: anchor.step,
            isCustomRow: anchor.isCustomRow ?? false
        });
    }
    // Combine into full Palette
    const palette = {
        light: lightPalette.scales,
        dark: darkPalette.scales,
        _meta: {
            tuningProfile: lightPalette.meta.tuningProfile,
            inputColors: brandColors,
            generatedAt: new Date().toISOString()
        }
    };
    return { palette, brandColorInfo };
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
        // In interactive mode, ask if user wants to customize other settings
        const customize = await promptForInteractiveMode();
        if (customize) {
            config.formats = await promptForFormats();
            config.outputDir = await promptForOutput();
        }
    }
    // Validate colors with helpful error messages
    validateColors(config.brandColors);
    log.info(`Brand colors: ${config.brandColors.join(', ')}`);
    // Generate palette
    s.start('Generating palette');
    const { palette, brandColorInfo } = createPalette(config.brandColors);
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
    // Export Tailwind
    if (config.formats.includes('tailwind')) {
        s.start('Exporting Tailwind preset');
        const tailwind = exportTailwind(palette, { scale: '50-950' });
        const tailwindPath = join(outputDir, 'tailwind.preset.js');
        await writeFile(tailwindPath, tailwind, 'utf-8');
        s.stop(`Tailwind preset exported to ${tailwindPath}`);
    }
    // Export Radix
    if (config.formats.includes('radix')) {
        s.start('Exporting Radix colors');
        const radix = exportRadix(palette, { includeAlpha: true, includeP3: true });
        const radixPath = join(outputDir, 'radix-colors.js');
        await writeFile(radixPath, radix, 'utf-8');
        s.stop(`Radix colors exported to ${radixPath}`);
    }
    // Export Panda CSS
    if (config.formats.includes('panda')) {
        s.start('Exporting Panda CSS preset');
        const panda = exportPanda(palette, brandColorInfo, { includeSemantic: true });
        const pandaPath = join(outputDir, 'panda.preset.ts');
        await writeFile(pandaPath, panda, 'utf-8');
        s.stop(`Panda CSS preset exported to ${pandaPath}`);
    }
    log.success(`Palette generated successfully!`);
    log.info(`Output: ${outputDir}`);
    log.info(`Formats: ${config.formats.join(', ')}`);
}
