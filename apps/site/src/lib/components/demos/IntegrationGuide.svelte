<script lang="ts">
	import { Terminal, FileCode, Palette, Check } from 'lucide-svelte';

	interface Props {
		framework: 'tailwind' | 'shadcn';
	}

	let { framework }: Props = $props();

	const tailwindSteps = [
		{
			title: 'Generate your color preset',
			code: `npx @sveltopia/colors generate \\
  --colors "#FF6A00,#43A047" \\
  --format tailwind \\
  --output ./src/lib/colors.css`,
			description: 'Creates a complete Tailwind v4 CSS file with OKLCH colors and utility registration'
		},
		{
			title: 'Import and done',
			code: `/* app.css */
@import 'tailwindcss';
@import './lib/colors.css';

/* That's it! colors.css includes:
   - CSS variables for light/dark mode
   - @theme block to register utilities
   No manual registration needed. */`,
			description: 'One import - the generated CSS includes everything Tailwind needs'
		},
		{
			title: 'Use standard Tailwind classes',
			code: `<!-- Real Tailwind classes - inspect element shows OKLCH values -->
<button class="bg-primary-800 text-white hover:bg-primary-850">
  Primary Action
</button>

<div class="border-gray-500 bg-gray-100">
  Card with brand-tuned grays
</div>

<!-- Semantic tokens map to your brand hue -->
<span class="bg-secondary-200/50 text-secondary-900">
  Badge using secondary color
</span>`,
			description: 'Standard Tailwind classes - no arbitrary values needed!'
		}
	];

	// Use separate variable for code with script tags to avoid parser issues
	const shadcnComponentCode = [
		'<' + 'script>',
		"  import { Button } from '$lib/components/ui/button';",
		"  import * as Card from '$lib/components/ui/card';",
		'</' + 'script>',
		'',
		'<!-- Uses --primary automatically -->',
		'<Button>Primary Action</Button>',
		'',
		'<!-- Uses --card, --border automatically -->',
		'<Card.Root>',
		'  <Card.Header>',
		'    <Card.Title>Brand-tuned card</Card.Title>',
		'  </Card.Header>',
		'</Card.Root>'
	].join('\n');

	const shadcnSteps = [
		{
			title: 'Generate your preset CSS',
			code: `npx @sveltopia/colors generate \\
  --colors "#FF6A00,#43A047" \\
  --format tailwind \\
  --output ./src/lib/colors.css`,
			description: 'Same command - generates Tailwind v4 preset with all color scales'
		},
		{
			title: 'Map to shadcn semantic tokens',
			code: `/* app.css - map Tailwind scales to shadcn tokens */
@import 'tailwindcss';
@import './lib/colors.css';

:root {
  /* shadcn uses semantic tokens */
  --primary: var(--color-primary-800);
  --primary-foreground: white;

  --secondary: var(--color-slate-200);
  --secondary-foreground: var(--color-slate-950);

  --accent: var(--color-secondary-800);
  --accent-foreground: white;

  --destructive: var(--color-red-800);
  --muted: var(--color-slate-200);
  --muted-foreground: var(--color-slate-900);

  --card: var(--color-slate-100);
  --card-foreground: var(--color-slate-950);

  --border: var(--color-slate-500);
  --input: var(--color-slate-500);
  --ring: var(--color-primary-700);
}`,
			description: 'shadcn components automatically use these semantic tokens'
		},
		{
			title: 'Components just work',
			code: shadcnComponentCode,
			description: 'No component changes needed - colors flow through tokens'
		}
	];

	const steps = $derived(framework === 'tailwind' ? tailwindSteps : shadcnSteps);
</script>

<section class="border-b border-gray-500 bg-gray-50 px-6 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="mb-8 flex items-center gap-3">
			<div class="rounded-lg bg-primary-200/50 p-2">
				<Terminal class="h-5 w-5 text-primary-900" />
			</div>
			<div>
				<h2 class="text-xl font-bold text-gray-950">
					{framework === 'tailwind' ? 'Tailwind CSS v4' : 'shadcn-svelte'} Integration
				</h2>
				<p class="text-sm text-gray-900">
					{framework === 'tailwind'
						? 'Drop-in preset with real Tailwind classes'
						: 'Map palette colors to shadcn semantic tokens'}
				</p>
			</div>
		</div>

		<div class="space-y-6">
			{#each steps as step, i}
				<div class="overflow-hidden rounded-xl border border-gray-500 bg-gray-100">
					<!-- Step header -->
					<div class="flex items-center gap-3 border-b border-gray-500 px-4 py-3">
						<span
							class="flex h-6 w-6 items-center justify-center rounded-full bg-primary-800 text-xs font-bold text-white"
						>
							{i + 1}
						</span>
						<span class="font-medium text-gray-950">{step.title}</span>
					</div>

					<!-- Code block -->
					<div class="bg-gray-50 p-4">
						<pre
							class="overflow-x-auto text-sm"><code class="text-gray-950">{step.code}</code></pre>
					</div>

					<!-- Description -->
					<div class="flex items-center gap-2 border-t border-gray-500 px-4 py-3">
						<Check class="h-4 w-4 text-green-900" />
						<span class="text-sm text-gray-900">{step.description}</span>
					</div>
				</div>
			{/each}
		</div>

		<!-- Key insight -->
		<div class="mt-8 rounded-xl border border-primary-500 bg-primary-200/50 p-4">
			<div class="flex gap-3">
				<Palette class="mt-0.5 h-5 w-5 shrink-0 text-primary-900" />
				<div>
					<p class="font-medium text-primary-950">The magic: same code, any brand</p>
					<p class="mt-1 text-sm text-primary-900">
						{framework === 'tailwind'
							? 'Switch brand colors by swapping the CSS preset. All your Tailwind classes stay the same - only the CSS variables change. Inspect element shows real OKLCH values!'
							: 'Your shadcn components never change. Regenerate the palette with new brand colors, and the entire UI transforms automatically.'}
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
