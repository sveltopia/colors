/**
 * Tailwind v4 Compilation Smoke Tests
 *
 * These tests feed our generated CSS through Tailwind v4's actual compiler to verify
 * that utility classes are correctly produced. This catches issues that string-matching
 * tests miss — like invalid CSS that Tailwind silently ignores.
 *
 * The candidate list IS the contract: every utility listed here is one we guarantee
 * works when a developer drops our generated CSS into their Tailwind v4 project.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { compile } from 'tailwindcss';
import { exportTailwindV4CSS, exportShadcn } from '../core/export-frameworks.js';
import { generatePalette } from '../core/palette.js';
import type { Palette } from '../types.js';

// =============================================================================
// Test Setup
// =============================================================================

/** Create a real palette from a brand color for realistic integration tests */
function createTestPalette(): Palette {
	const light = generatePalette({ brandColors: ['#FF4F00'] });
	const dark = generatePalette({ brandColors: ['#FF4F00'], mode: 'dark' });

	return {
		light: light.scales,
		dark: dark.scales,
		_meta: {
			tuningProfile: light.meta.tuningProfile,
			inputColors: ['#FF4F00'],
			generatedAt: new Date().toISOString()
		}
	};
}

// Cache the Tailwind base CSS so we don't re-read it on every test
let tailwindBaseCSS: string;

/** Load tailwindcss/index.css once for all tests */
async function getTailwindBase(): Promise<string> {
	if (!tailwindBaseCSS) {
		const tailwindPath = join(
			import.meta.dirname,
			'../../node_modules/tailwindcss/index.css'
		);
		tailwindBaseCSS = await readFile(tailwindPath, 'utf-8');
	}
	return tailwindBaseCSS;
}

/**
 * Compile CSS through Tailwind v4's actual compiler and build utility classes.
 *
 * This is the same API that Tailwind's Vite plugin uses internally.
 * We feed it `@import "tailwindcss"` + our generated color CSS, then
 * call `build(candidates)` with real class names to verify they produce output.
 */
async function compileTailwind(
	generatedCSS: string,
	candidates: string[]
): Promise<string> {
	const tailwindBase = await getTailwindBase();

	const inputCSS = `@import "tailwindcss";\n${generatedCSS}`;

	const compiler = await compile(inputCSS, {
		loadStylesheet: async (id: string, base: string) => {
			if (id === 'tailwindcss') {
				return {
					path: join(base, 'node_modules/tailwindcss/index.css'),
					base,
					content: tailwindBase
				};
			}
			throw new Error(`Unexpected stylesheet import: ${id}`);
		}
	});

	return compiler.build(candidates);
}

// =============================================================================
// Tailwind v4 CSS Export — Compilation Smoke Tests
// =============================================================================

describe('Tailwind v4 Compilation Smoke Tests', () => {
	let palette: Palette;
	let tailwindCSS: string;

	beforeAll(() => {
		palette = createTestPalette();
		tailwindCSS = exportTailwindV4CSS(palette);
	});

	describe('Standard color scale utilities', () => {
		it('compiles bg-orange-800 (Radix step 9 = brand anchor)', async () => {
			const output = await compileTailwind(tailwindCSS, ['bg-orange-800']);
			expect(output).toContain('.bg-orange-800');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--color-orange-800)');
		});

		it('compiles text-slate-950 (highest contrast text)', async () => {
			const output = await compileTailwind(tailwindCSS, ['text-slate-950']);
			expect(output).toContain('.text-slate-950');
			expect(output).toContain('color:');
			expect(output).toContain('var(--color-slate-950)');
		});

		it('compiles bg-orange-50 (lightest step)', async () => {
			const output = await compileTailwind(tailwindCSS, ['bg-orange-50']);
			expect(output).toContain('.bg-orange-50');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--color-orange-50)');
		});

		it('compiles border-slate-500 (mid-range border)', async () => {
			const output = await compileTailwind(tailwindCSS, ['border-slate-500']);
			expect(output).toContain('.border-slate-500');
			expect(output).toContain('border-color:');
			expect(output).toContain('var(--color-slate-500)');
		});
	});

	describe('850 step (non-standard, Radix step 10)', () => {
		it('compiles bg-orange-850 (hovered solid background)', async () => {
			const output = await compileTailwind(tailwindCSS, ['bg-orange-850']);
			expect(output).toContain('.bg-orange-850');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--color-orange-850)');
		});

		it('compiles text-slate-850', async () => {
			const output = await compileTailwind(tailwindCSS, ['text-slate-850']);
			expect(output).toContain('.text-slate-850');
			expect(output).toContain('color:');
			expect(output).toContain('var(--color-slate-850)');
		});
	});

	describe('Alpha modifier utilities', () => {
		it('compiles bg-orange-800/50 (50% alpha)', async () => {
			const output = await compileTailwind(tailwindCSS, ['bg-orange-800/50']);
			expect(output).toContain('background-color:');
			expect(output).toContain('--color-orange-800');
		});

		it('compiles text-primary-800/75 (alpha on semantic role scale)', async () => {
			const output = await compileTailwind(tailwindCSS, ['text-primary-800/75']);
			expect(output).toContain('color:');
			expect(output).toContain('--color-primary-800');
		});

		it('compiles bg-slate-200/25 (very low alpha)', async () => {
			const output = await compileTailwind(tailwindCSS, ['bg-slate-200/25']);
			expect(output).toContain('background-color:');
			expect(output).toContain('--color-slate-200');
		});
	});

	describe('Semantic role utilities (primary/secondary/tertiary)', () => {
		it('compiles bg-primary-800 (brand accent)', async () => {
			const output = await compileTailwind(tailwindCSS, ['bg-primary-800']);
			expect(output).toContain('.bg-primary-800');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--color-primary-800)');
		});

		it('compiles text-secondary-900', async () => {
			const output = await compileTailwind(tailwindCSS, ['text-secondary-900']);
			expect(output).toContain('.text-secondary-900');
			expect(output).toContain('color:');
			expect(output).toContain('var(--color-secondary-900)');
		});

		it('compiles bg-tertiary-200', async () => {
			const output = await compileTailwind(tailwindCSS, ['bg-tertiary-200']);
			expect(output).toContain('.bg-tertiary-200');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--color-tertiary-200)');
		});
	});

	describe('Dark variant', () => {
		it('compiles dark:bg-orange-800', async () => {
			const output = await compileTailwind(tailwindCSS, ['dark:bg-orange-800']);
			expect(output).toContain('dark');
			expect(output).toContain('background-color:');
			expect(output).toContain('--color-orange-800');
		});

		it('compiles dark:text-slate-50', async () => {
			const output = await compileTailwind(tailwindCSS, ['dark:text-slate-50']);
			expect(output).toContain('dark');
			expect(output).toContain('color:');
			expect(output).toContain('--color-slate-50');
		});
	});

	describe('Multiple candidates in one build', () => {
		it('compiles a batch of mixed utilities', async () => {
			const candidates = [
				'bg-orange-800',
				'text-slate-950',
				'border-primary-500',
				'bg-orange-850',
				'text-orange-800/50',
				'dark:bg-slate-100'
			];
			const output = await compileTailwind(tailwindCSS, candidates);

			expect(output).toContain('.bg-orange-800');
			expect(output).toContain('.text-slate-950');
			expect(output).toContain('.border-primary-500');
			expect(output).toContain('.bg-orange-850');
			expect(output).toContain('--color-slate-100');
		});
	});

	describe('Invalid candidates produce no output', () => {
		it('does not produce utility for non-existent color scale', async () => {
			const output = await compileTailwind(tailwindCSS, ['bg-unicorn-800']);
			// "unicorn" is not a real hue in our palette or Tailwind defaults
			expect(output).not.toContain('.bg-unicorn-800');
		});
	});
});

// =============================================================================
// shadcn Export — Compilation Smoke Tests
// =============================================================================

describe('shadcn Compilation Smoke Tests', () => {
	let palette: Palette;
	let shadcnCSS: string;

	beforeAll(() => {
		palette = createTestPalette();
		shadcnCSS = exportShadcn(palette);
	});

	describe('Semantic token utilities (multi-level chain)', () => {
		// The full runtime chain: bg-background → var(--background) → var(--color-slate-50) → oklch(...)
		// Tailwind's @theme inline inlines the value, so the compiled utility uses var(--background) directly.

		it('compiles bg-background (semantic → scale → oklch)', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-background']);
			expect(output).toContain('.bg-background');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--background)');
		});

		it('compiles text-foreground', async () => {
			const output = await compileTailwind(shadcnCSS, ['text-foreground']);
			expect(output).toContain('.text-foreground');
			expect(output).toContain('color:');
			expect(output).toContain('var(--foreground)');
		});

		it('compiles bg-primary (shadcn primary semantic token)', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-primary']);
			expect(output).toContain('.bg-primary');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--primary)');
		});

		it('compiles text-primary-foreground', async () => {
			const output = await compileTailwind(shadcnCSS, ['text-primary-foreground']);
			expect(output).toContain('.text-primary-foreground');
			expect(output).toContain('color:');
			expect(output).toContain('var(--primary-foreground)');
		});

		it('compiles bg-muted', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-muted']);
			expect(output).toContain('.bg-muted');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--muted)');
		});

		it('compiles text-muted-foreground (hyphenated semantic token)', async () => {
			const output = await compileTailwind(shadcnCSS, ['text-muted-foreground']);
			expect(output).toContain('.text-muted-foreground');
			expect(output).toContain('color:');
			expect(output).toContain('var(--muted-foreground)');
		});

		it('compiles bg-destructive', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-destructive']);
			expect(output).toContain('.bg-destructive');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--destructive)');
		});

		it('compiles bg-accent', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-accent']);
			expect(output).toContain('.bg-accent');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--accent)');
		});

		it('compiles text-accent-foreground', async () => {
			const output = await compileTailwind(shadcnCSS, ['text-accent-foreground']);
			expect(output).toContain('.text-accent-foreground');
			expect(output).toContain('color:');
			expect(output).toContain('var(--accent-foreground)');
		});

		it('compiles border-border', async () => {
			const output = await compileTailwind(shadcnCSS, ['border-border']);
			expect(output).toContain('.border-border');
			expect(output).toContain('border-color:');
			expect(output).toContain('var(--border)');
		});

		it('compiles ring-ring', async () => {
			const output = await compileTailwind(shadcnCSS, ['ring-ring']);
			expect(output).toContain('.ring-ring');
			expect(output).toContain('--tw-ring-color:');
			expect(output).toContain('var(--ring)');
		});

		it('compiles bg-input', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-input']);
			expect(output).toContain('.bg-input');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--input)');
		});
	});

	describe('Card and popover surfaces', () => {
		it('compiles bg-card', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-card']);
			expect(output).toContain('.bg-card');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--card)');
		});

		it('compiles text-card-foreground', async () => {
			const output = await compileTailwind(shadcnCSS, ['text-card-foreground']);
			expect(output).toContain('.text-card-foreground');
			expect(output).toContain('color:');
			expect(output).toContain('var(--card-foreground)');
		});

		it('compiles bg-popover', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-popover']);
			expect(output).toContain('.bg-popover');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--popover)');
		});

		it('compiles text-popover-foreground', async () => {
			const output = await compileTailwind(shadcnCSS, ['text-popover-foreground']);
			expect(output).toContain('.text-popover-foreground');
			expect(output).toContain('color:');
			expect(output).toContain('var(--popover-foreground)');
		});
	});

	describe('Chart tokens', () => {
		it('compiles bg-chart-1 through bg-chart-5', async () => {
			const candidates = [
				'bg-chart-1',
				'bg-chart-2',
				'bg-chart-3',
				'bg-chart-4',
				'bg-chart-5'
			];
			const output = await compileTailwind(shadcnCSS, candidates);

			for (let i = 1; i <= 5; i++) {
				expect(output).toContain(`.bg-chart-${i}`);
				expect(output).toContain(`var(--chart-${i})`);
			}
		});
	});

	describe('Sidebar tokens', () => {
		it('compiles bg-sidebar', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-sidebar']);
			expect(output).toContain('.bg-sidebar');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--sidebar)');
		});

		it('compiles text-sidebar-foreground', async () => {
			const output = await compileTailwind(shadcnCSS, ['text-sidebar-foreground']);
			expect(output).toContain('.text-sidebar-foreground');
			expect(output).toContain('color:');
			expect(output).toContain('var(--sidebar-foreground)');
		});

		it('compiles bg-sidebar-primary', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-sidebar-primary']);
			expect(output).toContain('.bg-sidebar-primary');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--sidebar-primary)');
		});

		it('compiles bg-sidebar-accent', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-sidebar-accent']);
			expect(output).toContain('.bg-sidebar-accent');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--sidebar-accent)');
		});

		it('compiles border-sidebar-border', async () => {
			const output = await compileTailwind(shadcnCSS, ['border-sidebar-border']);
			expect(output).toContain('.border-sidebar-border');
			expect(output).toContain('border-color:');
			expect(output).toContain('var(--sidebar-border)');
		});
	});

	describe('Radius tokens from @theme inline', () => {
		// @theme inline inlines the calc() expressions directly into utilities
		it('compiles rounded-lg (maps to var(--radius))', async () => {
			const output = await compileTailwind(shadcnCSS, ['rounded-lg']);
			expect(output).toContain('.rounded-lg');
			expect(output).toContain('border-radius:');
			expect(output).toContain('var(--radius)');
		});

		it('compiles rounded-sm, rounded-md, rounded-xl with calc expressions', async () => {
			const output = await compileTailwind(shadcnCSS, [
				'rounded-sm',
				'rounded-md',
				'rounded-xl'
			]);
			expect(output).toContain('.rounded-sm');
			expect(output).toContain('.rounded-md');
			expect(output).toContain('.rounded-xl');
			// Each uses a calc() relative to --radius
			expect(output).toContain('calc(var(--radius) - 4px)');
			expect(output).toContain('calc(var(--radius) - 2px)');
			expect(output).toContain('calc(var(--radius) + 4px)');
		});
	});

	describe('Alpha modifiers on semantic tokens', () => {
		it('compiles bg-primary/50 (alpha on semantic token)', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-primary/50']);
			expect(output).toContain('background-color:');
			// Tailwind uses color-mix for alpha on inline theme values
			expect(output).toContain('var(--primary)');
		});

		it('compiles bg-background/75', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-background/75']);
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--background)');
			expect(output).toContain('color-mix');
		});
	});

	describe('Dark variant with semantic tokens', () => {
		it('compiles dark:bg-card (elevated surface in dark mode)', async () => {
			const output = await compileTailwind(shadcnCSS, ['dark:bg-card']);
			expect(output).toContain('dark');
			expect(output).toContain('background-color:');
			expect(output).toContain('var(--card)');
		});

		it('compiles dark:text-muted-foreground', async () => {
			const output = await compileTailwind(shadcnCSS, ['dark:text-muted-foreground']);
			expect(output).toContain('dark');
			expect(output).toContain('color:');
			expect(output).toContain('var(--muted-foreground)');
		});
	});

	describe('Color scales still work alongside semantic tokens', () => {
		it('compiles a mix of scale and semantic candidates', async () => {
			const candidates = [
				'bg-orange-800', // scale (from @theme)
				'bg-background', // semantic (from @theme inline)
				'text-primary-foreground', // semantic
				'border-slate-500', // scale
				'bg-orange-850', // non-standard step
				'bg-chart-1', // chart semantic
				'rounded-lg' // radius
			];
			const output = await compileTailwind(shadcnCSS, candidates);

			// Scale utilities reference --color-* variables
			expect(output).toContain('var(--color-orange-800)');
			expect(output).toContain('var(--color-slate-500)');
			expect(output).toContain('var(--color-orange-850)');
			// Semantic utilities reference bare token variables (inlined by @theme inline)
			expect(output).toContain('var(--background)');
			expect(output).toContain('var(--primary-foreground)');
			expect(output).toContain('var(--chart-1)');
			expect(output).toContain('var(--radius)');
		});
	});

	describe('Secondary token resolution (shadcn secondary ≠ palette secondary)', () => {
		it('compiles bg-secondary (shadcn semantic token)', async () => {
			const output = await compileTailwind(shadcnCSS, ['bg-secondary']);
			expect(output).toContain('.bg-secondary');
			expect(output).toContain('background-color:');
			// Inlined from @theme inline: --color-secondary: var(--secondary)
			expect(output).toContain('var(--secondary)');
		});

		it('compiles text-secondary-foreground', async () => {
			const output = await compileTailwind(shadcnCSS, ['text-secondary-foreground']);
			expect(output).toContain('.text-secondary-foreground');
			expect(output).toContain('color:');
			expect(output).toContain('var(--secondary-foreground)');
		});
	});
});
