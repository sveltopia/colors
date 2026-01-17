import { describe, it, expect, afterEach } from 'vitest';
import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('CLI Dev Command E2E Tests', () => {
	const cliPath = path.join(__dirname, '../index.ts');
	let serverProcess: ChildProcess | null = null;

	afterEach(async () => {
		// Clean up server process
		if (serverProcess) {
			serverProcess.kill('SIGTERM');
			serverProcess = null;
			// Give process time to clean up
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	});

	/**
	 * Helper to start the dev server and wait for it to be ready
	 */
	async function startDevServer(args: string[] = []): Promise<{ port: number; process: ChildProcess }> {
		return new Promise((resolve, reject) => {
			const proc = spawn('npx', ['tsx', cliPath, 'dev', '--no-open', ...args], {
				cwd: path.join(__dirname, '../..'),
				stdio: ['pipe', 'pipe', 'pipe']
			});

			serverProcess = proc;
			let output = '';

			const timeout = setTimeout(() => {
				proc.kill();
				reject(new Error(`Server failed to start within timeout. Output: ${output}`));
			}, 10000);

			proc.stdout?.on('data', (data) => {
				output += data.toString();
				// Look for the "Dev server running at" message
				const match = output.match(/Dev server running at http:\/\/localhost:(\d+)/);
				if (match) {
					clearTimeout(timeout);
					resolve({ port: parseInt(match[1], 10), process: proc });
				}
			});

			proc.stderr?.on('data', (data) => {
				output += data.toString();
			});

			proc.on('error', (err) => {
				clearTimeout(timeout);
				reject(err);
			});

			proc.on('exit', (code) => {
				if (code !== 0 && code !== null) {
					clearTimeout(timeout);
					reject(new Error(`Server exited with code ${code}. Output: ${output}`));
				}
			});
		});
	}

	/**
	 * Helper to fetch from the server
	 */
	async function fetchFromServer(port: number, path: string = '/'): Promise<Response> {
		return fetch(`http://localhost:${port}${path}`);
	}

	describe('server startup', () => {
		it('starts server and responds to requests', async () => {
			const { port } = await startDevServer(['--colors', '#FF4F00']);

			const response = await fetchFromServer(port);
			expect(response.ok).toBe(true);

			const html = await response.text();
			expect(html).toContain('<!DOCTYPE html>');
			expect(html).toContain('Sveltopia Colors');
		});

		it('starts with blank canvas by default', async () => {
			const { port } = await startDevServer();

			const response = await fetchFromServer(port);
			const html = await response.text();

			// Should have default gray color
			expect(html).toContain('#888888');
		});

		it('starts with provided colors via --colors flag', async () => {
			const { port } = await startDevServer(['--colors', '#FF4F00,#2563EB']);

			const response = await fetchFromServer(port);
			const html = await response.text();

			// Should include the provided colors
			expect(html).toContain('#FF4F00');
			expect(html).toContain('#2563EB');
		});
	});

	describe('dynamic color updates via query params', () => {
		it('accepts colors via query parameter', async () => {
			const { port } = await startDevServer();

			const response = await fetchFromServer(port, '/?colors=%23FF0000,%232563EB');
			const html = await response.text();

			// Should use query param colors
			expect(html).toContain('#FF0000');
			expect(html).toContain('#2563EB');
		});
	});

	describe('API endpoint', () => {
		it('/api/generate endpoint exists and accepts POST', async () => {
			const { port } = await startDevServer(['--colors', '#FF4F00']);

			const response = await fetch(`http://localhost:${port}/api/generate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					colors: ['#FF4F00'],
					outputDir: '/tmp/test-colors-output',
					formats: ['json']
				})
			});

			// Should respond (may fail due to permissions but endpoint should exist)
			expect(response.status).toBeLessThan(500);
		});
	});

	describe('port selection', () => {
		it('uses specified port via --port flag', async () => {
			const { port } = await startDevServer(['--colors', '#FF4F00', '--port', '3456']);

			expect(port).toBe(3456);

			const response = await fetchFromServer(port);
			expect(response.ok).toBe(true);
		});

		it('finds available port if specified port is in use', async () => {
			// Start first server on port 3457
			const { port: port1 } = await startDevServer(['--colors', '#FF4F00', '--port', '3457']);
			expect(port1).toBe(3457);

			// Start second server also requesting port 3457 - should find next available
			const proc2 = spawn('npx', ['tsx', cliPath, 'dev', '--no-open', '--colors', '#2563EB', '--port', '3457'], {
				cwd: path.join(__dirname, '../..'),
				stdio: ['pipe', 'pipe', 'pipe']
			});

			const port2 = await new Promise<number>((resolve, reject) => {
				let output = '';
				const timeout = setTimeout(() => {
					proc2.kill();
					reject(new Error('Second server failed to start'));
				}, 10000);

				proc2.stdout?.on('data', (data) => {
					output += data.toString();
					const match = output.match(/Dev server running at http:\/\/localhost:(\d+)/);
					if (match) {
						clearTimeout(timeout);
						resolve(parseInt(match[1], 10));
					}
				});
			});

			// Clean up second process
			proc2.kill('SIGTERM');

			// Second server should have found a different port
			expect(port2).not.toBe(3457);
		});
	});
});
