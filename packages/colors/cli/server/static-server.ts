/**
 * Static HTTP Server
 *
 * Simple HTTP server using Node's built-in http module.
 * Serves generated HTML palette visualizer.
 */

import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { generateHtml, type GenerateHtmlOptions } from './html-generator.js';
import { generatePalette, exportCSS, exportJSON, type Palette } from '../../dist/index.js';

export interface ServerOptions {
	port: number;
	brandColors: string[];
	title?: string;
	onReady?: (url: string) => void;
}

export interface PaletteServer {
	server: Server;
	url: string;
	close: () => Promise<void>;
	refresh: () => void;
}

/**
 * Create palette from brand colors
 */
function createPalette(brandColors: string[]): Palette {
	const lightPalette = generatePalette({ brandColors, mode: 'light' });
	const darkPalette = generatePalette({ brandColors, mode: 'dark' });

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
 * Handle POST /api/generate
 */
async function handleGenerate(
	req: IncomingMessage,
	res: ServerResponse
): Promise<void> {
	let body = '';

	req.on('data', (chunk) => {
		body += chunk.toString();
	});

	req.on('end', async () => {
		try {
			const data = JSON.parse(body);
			const { outputDir, colors } = data;

			if (!colors || !Array.isArray(colors) || colors.length === 0) {
				res.writeHead(400, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ success: false, error: 'No colors provided' }));
				return;
			}

			// Generate palette
			const palette = createPalette(colors);

			// Ensure output directory exists
			const resolvedDir = resolve(outputDir || './src/lib/colors');
			const dirExisted = existsSync(resolvedDir);
			if (!dirExisted) {
				await mkdir(resolvedDir, { recursive: true });
			}

			// Check if files exist (for overwrite warning)
			const cssPath = join(resolvedDir, 'colors.css');
			const jsonPath = join(resolvedDir, 'colors.json');
			const cssExisted = existsSync(cssPath);
			const jsonExisted = existsSync(jsonPath);

			// Export CSS
			const css = exportCSS(palette, {});
			await writeFile(cssPath, css, 'utf-8');

			// Export JSON
			const json = exportJSON(palette);
			await writeFile(jsonPath, JSON.stringify(json, null, 2), 'utf-8');

			const overwritten = cssExisted || jsonExisted;
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(
				JSON.stringify({
					success: true,
					files: ['colors.css', 'colors.json'],
					outputDir: resolvedDir,
					overwritten
				})
			);
		} catch (err) {
			res.writeHead(500, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ success: false, error: String(err) }));
		}
	});
}

/**
 * Create and start a palette visualization server
 */
export function createPaletteServer(options: ServerOptions): Promise<PaletteServer> {
	const { port, brandColors: defaultBrandColors, title, onReady } = options;

	// Generate initial HTML
	let currentHtml = generateHtml({ brandColors: defaultBrandColors, title });

	const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
		const parsedUrl = new URL(req.url || '/', `http://localhost:${port}`);
		const pathname = parsedUrl.pathname;

		// Handle API endpoints
		if (pathname === '/api/generate' && req.method === 'POST') {
			await handleGenerate(req, res);
			return;
		}

		// Simple routing for pages
		if (pathname === '/' || pathname === '/index.html') {
			// Check for colors query param
			const colorsParam = parsedUrl.searchParams.get('colors');
			let html = currentHtml;

			if (colorsParam) {
				const colors = colorsParam.split(',').map((c) => c.trim());
				if (colors.length > 0 && colors.every((c) => /^#[0-9A-Fa-f]{6}$/.test(c))) {
					html = generateHtml({ brandColors: colors, title });
				}
			}

			res.writeHead(200, {
				'Content-Type': 'text/html; charset=utf-8',
				'Cache-Control': 'no-cache'
			});
			res.end(html);
		} else if (pathname === '/favicon.ico') {
			res.writeHead(204);
			res.end();
		} else {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.end('Not Found');
		}
	});

	return new Promise((resolve, reject) => {
		server.on('error', (err: NodeJS.ErrnoException) => {
			if (err.code === 'EADDRINUSE') {
				reject(new Error(`Port ${port} is already in use`));
			} else {
				reject(err);
			}
		});

		server.listen(port, () => {
			const url = `http://localhost:${port}`;

			if (onReady) {
				onReady(url);
			}

			resolve({
				server,
				url,
				close: () => {
					return new Promise((resolveClose) => {
						server.close(() => resolveClose());
					});
				},
				refresh: () => {
					// Regenerate HTML (for live reload support)
					currentHtml = generateHtml({ brandColors: defaultBrandColors, title });
				}
			});
		});
	});
}

/**
 * Try to find an available port starting from the preferred port
 */
export async function findAvailablePort(preferredPort: number, maxAttempts = 10): Promise<number> {
	for (let i = 0; i < maxAttempts; i++) {
		const port = preferredPort + i;
		const available = await isPortAvailable(port);
		if (available) {
			return port;
		}
	}
	throw new Error(`Could not find available port after ${maxAttempts} attempts`);
}

function isPortAvailable(port: number): Promise<boolean> {
	return new Promise((resolve) => {
		const server = createServer();
		server.on('error', () => resolve(false));
		server.listen(port, () => {
			server.close(() => resolve(true));
		});
	});
}
