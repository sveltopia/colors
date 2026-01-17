#!/usr/bin/env node

import { intro, outro } from '@clack/prompts';
import { Command } from 'commander';
import { generateCommand } from './commands/generate.js';
import { devCommand } from './commands/dev.js';

const program = new Command();

program
	.name('colors')
	.description('CLI for @sveltopia/colors - Algorithmic color palette generation')
	.version('0.1.0');

program
	.command('generate')
	.description('Generate color palettes from brand colors')
	.option('-c, --colors <colors>', 'Comma-separated brand colors (e.g., "#FF4F00,#1A1A1A")')
	.option('--config <path>', 'Path to config file (default: colors.config.json)')
	.option('-o, --output <dir>', 'Output directory (default: ./colors)')
	.option('-f, --format <format>', 'Output format: css, json, or both (default: both)', 'both')
	.action(async (options) => {
		intro('@sveltopia/colors');
		try {
			await generateCommand(options);
			outro('Done!');
		} catch (error) {
			outro('Generation failed');
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error(error);
			}
			process.exit(1);
		}
	});

program
	.command('dev')
	.description('Start a local dev server to preview palettes')
	.option('-c, --colors <colors>', 'Comma-separated brand colors (e.g., "#FF4F00,#1A1A1A")')
	.option('--config <path>', 'Path to config file (default: colors.config.json)')
	.option('-p, --port <port>', 'Port to run the server on (default: 3000)', '3000')
	.option('--no-open', 'Do not open browser automatically')
	.option('-b, --blank', 'Start with a blank canvas (no color prompts)')
	.action(async (options) => {
		intro('@sveltopia/colors dev server');
		try {
			await devCommand(options);
		} catch (error) {
			outro('Dev server failed');
			if (error instanceof Error) {
				console.error(error.message);
			} else {
				console.error(error);
			}
			process.exit(1);
		}
	});

program.parse();
