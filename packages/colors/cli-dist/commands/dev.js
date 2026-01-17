import { spinner, log } from '@clack/prompts';
import { loadConfig, mergeOptions } from '../utils/config.js';
import { promptForColors, validateColors } from '../utils/prompts.js';
import { createPaletteServer, findAvailablePort } from '../server/static-server.js';
import { exec } from 'node:child_process';
import { platform } from 'node:os';
/**
 * Open URL in default browser
 */
function openBrowser(url) {
    const cmd = platform() === 'darwin' ? 'open' : platform() === 'win32' ? 'start' : 'xdg-open';
    exec(`${cmd} ${url}`, (err) => {
        if (err) {
            log.warn(`Could not open browser automatically. Visit: ${url}`);
        }
    });
}
/**
 * Main dev command handler
 */
export async function devCommand(options) {
    const s = spinner();
    // Load and merge config
    s.start('Loading configuration');
    let config;
    try {
        config = await loadConfig(options.config);
        config = mergeOptions(config, {
            colors: options.colors
        });
    }
    catch (error) {
        s.stop('Configuration failed');
        throw error;
    }
    s.stop('Configuration loaded');
    // Handle blank mode or prompt for colors
    if (config.brandColors.length === 0) {
        if (options.blank) {
            // Start with a neutral gray as a starting point
            config.brandColors = ['#888888'];
            log.info('Starting with blank canvas (default gray). Add colors via the UI.');
        }
        else {
            log.info('No brand colors specified in config or --colors flag');
            config.brandColors = await promptForColors();
        }
    }
    // Validate colors
    validateColors(config.brandColors);
    log.info(`Brand colors: ${config.brandColors.join(', ')}`);
    // Find available port
    const preferredPort = options.port ? parseInt(options.port, 10) : 3000;
    s.start('Starting dev server');
    let port;
    try {
        port = await findAvailablePort(preferredPort);
    }
    catch (error) {
        s.stop('Could not find available port');
        throw error;
    }
    // Start server
    try {
        const server = await createPaletteServer({
            port,
            brandColors: config.brandColors,
            title: 'Sveltopia Colors - Dev Server'
        });
        s.stop(`Dev server running at ${server.url}`);
        // Open browser (unless disabled)
        if (options.open !== false) {
            openBrowser(server.url);
        }
        log.info('Press Ctrl+C to stop');
        // Keep process alive
        process.on('SIGINT', async () => {
            log.info('\nShutting down...');
            await server.close();
            process.exit(0);
        });
        // Prevent the process from exiting
        await new Promise(() => { });
    }
    catch (error) {
        s.stop('Server failed to start');
        throw error;
    }
}
