import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('CLI Generate Command E2E Tests', () => {
	const testDir = path.join(__dirname, '../../test-output');
	const cliPath = path.join(__dirname, '../index.ts');
	const fixturesDir = path.join(__dirname, 'fixtures');

	beforeEach(async () => {
		// Create test output directory
		await fs.mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		// Clean up test directory
		await fs.rm(testDir, { recursive: true, force: true });
	});

	describe('--colors flag', () => {
		it('generates CSS and JSON with single color', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir}`,
				{ cwd: path.join(__dirname, '../..') }
			);

			// Verify CSS file exists and has content
			const cssPath = path.join(testDir, 'colors.css');
			const cssContent = await fs.readFile(cssPath, 'utf-8');
			expect(cssContent).toContain(':root');
			expect(cssContent).toContain('--tomato-'); // FF4F00 should anchor to tomato
			expect(cssContent).toContain('--gray-'); // Always includes neutrals

			// Verify JSON file exists and has content
			const jsonPath = path.join(testDir, 'colors.json');
			const jsonContent = await fs.readFile(jsonPath, 'utf-8');
			const json = JSON.parse(jsonContent);
			expect(json.light).toBeDefined();
			expect(json.dark).toBeDefined();
			expect(json._meta).toBeDefined();
			expect(json._meta.brandColors).toHaveLength(1);
			expect(json._meta.brandColors[0].hex).toBe('#FF4F00');
		});

		it('generates CSS and JSON with multiple colors', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00,#1A1A1A,#2563EB" --output ${testDir}`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const jsonPath = path.join(testDir, 'colors.json');
			const jsonContent = await fs.readFile(jsonPath, 'utf-8');
			const json = JSON.parse(jsonContent);

			expect(json._meta.brandColors).toHaveLength(3);
		});

		it('handles colors with spaces after commas', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00, #1A1A1A" --output ${testDir}`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const jsonPath = path.join(testDir, 'colors.json');
			const jsonContent = await fs.readFile(jsonPath, 'utf-8');
			const json = JSON.parse(jsonContent);

			expect(json._meta.brandColors).toHaveLength(2);
		});
	});

	describe('--format flag', () => {
		it('generates only CSS when format is css', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format css`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const cssExists = await fs.access(path.join(testDir, 'colors.css')).then(() => true).catch(() => false);
			const jsonExists = await fs.access(path.join(testDir, 'colors.json')).then(() => true).catch(() => false);

			expect(cssExists).toBe(true);
			expect(jsonExists).toBe(false);
		});

		it('generates only JSON when format is json', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format json`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const cssExists = await fs.access(path.join(testDir, 'colors.css')).then(() => true).catch(() => false);
			const jsonExists = await fs.access(path.join(testDir, 'colors.json')).then(() => true).catch(() => false);

			expect(cssExists).toBe(false);
			expect(jsonExists).toBe(true);
		});

		it('generates both CSS and JSON when format is both', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format both`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const cssExists = await fs.access(path.join(testDir, 'colors.css')).then(() => true).catch(() => false);
			const jsonExists = await fs.access(path.join(testDir, 'colors.json')).then(() => true).catch(() => false);

			expect(cssExists).toBe(true);
			expect(jsonExists).toBe(true);
		});
	});

	describe('--config flag', () => {
		it('loads colors from config file', async () => {
			const configPath = path.join(fixturesDir, 'colors.config.json');

			await execAsync(
				`npx tsx ${cliPath} generate --config ${configPath} --output ${testDir}`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const jsonPath = path.join(testDir, 'colors.json');
			const jsonContent = await fs.readFile(jsonPath, 'utf-8');
			const json = JSON.parse(jsonContent);

			// Config has two colors: #FF4F00, #1A1A1A
			expect(json._meta.brandColors).toHaveLength(2);
			expect(json._meta.brandColors[0].hex).toBe('#FF4F00');
			expect(json._meta.brandColors[1].hex).toBe('#1A1A1A');
		});

		it('CLI --colors flag overrides config file', async () => {
			const configPath = path.join(fixturesDir, 'colors.config.json');

			await execAsync(
				`npx tsx ${cliPath} generate --config ${configPath} --colors "#2563EB" --output ${testDir}`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const jsonPath = path.join(testDir, 'colors.json');
			const jsonContent = await fs.readFile(jsonPath, 'utf-8');
			const json = JSON.parse(jsonContent);

			// CLI flag should override config
			expect(json._meta.brandColors).toHaveLength(1);
			expect(json._meta.brandColors[0].hex).toBe('#2563EB');
		});
	});

	describe('CSS output structure', () => {
		it('includes light mode variables in :root', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format css`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const cssContent = await fs.readFile(path.join(testDir, 'colors.css'), 'utf-8');

			expect(cssContent).toContain(':root {');
			expect(cssContent).toMatch(/--\w+-1:/); // Step 1
			expect(cssContent).toMatch(/--\w+-12:/); // Step 12
		});

		it('includes dark mode variables', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format css`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const cssContent = await fs.readFile(path.join(testDir, 'colors.css'), 'utf-8');

			// Should have dark mode section
			expect(cssContent).toContain('.dark');
		});

		it('includes P3 wide gamut colors', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format css`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const cssContent = await fs.readFile(path.join(testDir, 'colors.css'), 'utf-8');

			// Should have P3 color-gamut media query
			expect(cssContent).toContain('@media (color-gamut: p3)');
			expect(cssContent).toContain('color(display-p3');
		});
	});

	describe('JSON output structure', () => {
		it('includes light and dark modes', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format json`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const json = JSON.parse(await fs.readFile(path.join(testDir, 'colors.json'), 'utf-8'));

			expect(json.light).toBeDefined();
			expect(json.dark).toBeDefined();
		});

		it('includes metadata with brand color info', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format json`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const json = JSON.parse(await fs.readFile(path.join(testDir, 'colors.json'), 'utf-8'));

			expect(json._meta.brandColors).toBeDefined();
			expect(json._meta.brandColors[0]).toMatchObject({
				hex: '#FF4F00',
				hue: expect.any(String),
				anchorStep: expect.any(Number),
				isCustomRow: expect.any(Boolean)
			});
		});

		it('includes tuning profile', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format json`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const json = JSON.parse(await fs.readFile(path.join(testDir, 'colors.json'), 'utf-8'));

			expect(json._meta.tuning).toBeDefined();
			expect(json._meta.tuning).toMatchObject({
				hueShift: expect.any(Number),
				chromaMultiplier: expect.any(Number),
				lightnessShift: expect.any(Number)
			});
		});

		it('includes all 31 hue scales', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format json`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const json = JSON.parse(await fs.readFile(path.join(testDir, 'colors.json'), 'utf-8'));

			// Should have all scales listed in meta
			expect(json._meta.scales).toBeDefined();
			expect(json._meta.scales.length).toBe(31);

			// Verify a few key scales exist in light mode
			expect(json.light.gray).toBeDefined();
			expect(json.light.red).toBeDefined();
			expect(json.light.blue).toBeDefined();
		});

		it('each scale has 12 steps with hex, oklch, and p3 formats', async () => {
			await execAsync(
				`npx tsx ${cliPath} generate --colors "#FF4F00" --output ${testDir} --format json`,
				{ cwd: path.join(__dirname, '../..') }
			);

			const json = JSON.parse(await fs.readFile(path.join(testDir, 'colors.json'), 'utf-8'));

			const redScale = json.light.red;
			expect(Object.keys(redScale)).toHaveLength(12);

			// Check step 9 has all formats
			expect(redScale[9]).toMatchObject({
				hex: expect.stringMatching(/^#[0-9A-Fa-f]{6}$/),
				oklch: expect.stringMatching(/^oklch\(/),
				p3: expect.stringMatching(/^color\(display-p3/)
			});
		});
	});

	describe('error handling', () => {
		it('fails gracefully with invalid color', async () => {
			await expect(
				execAsync(
					`npx tsx ${cliPath} generate --colors "not-a-color" --output ${testDir}`,
					{ cwd: path.join(__dirname, '../..') }
				)
			).rejects.toThrow();
		});

		it('fails gracefully with missing config file', async () => {
			await expect(
				execAsync(
					`npx tsx ${cliPath} generate --config /nonexistent/config.json --output ${testDir}`,
					{ cwd: path.join(__dirname, '../..') }
				)
			).rejects.toThrow();
		});
	});
});
