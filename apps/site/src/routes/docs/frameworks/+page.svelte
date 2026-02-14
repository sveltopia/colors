<script lang="ts">
	import CodeViewer from '$lib/components/CodeViewer.svelte';
	import KeyConcept from '$lib/components/KeyConcept.svelte';
	import PrevNext from '$lib/components/PrevNext.svelte';
	import Step from '$lib/components/Step.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Info, AlertTriangle } from 'lucide-svelte';

	const shadcnExample = `<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
<\/script>

<!-- These components automatically use your brand colors -->
<Card.Root>
  <Card.Header>
    <Card.Title>Dashboard</Card.Title>
  </Card.Header>
  <Card.Content>
    <Button>Primary Action</Button>
    <Button variant="secondary">Secondary</Button>
  </Card.Content>
</Card.Root>`;
</script>

<div class="prose max-w-none dark:prose-invert">
	<h1>Frameworks</h1>

	<p class="lead">
		Sveltopia Colors generates drop-in files for Tailwind, shadcn/ui, Radix Colors, and Panda CSS.
		Import one file and your existing classes and components use your brand palette.
	</p>
</div>

<div class="not-prose mt-8">
	<Tabs.Root value="tailwind">
		<Tabs.List>
			<Tabs.Trigger value="tailwind">Tailwind CSS</Tabs.Trigger>
			<Tabs.Trigger value="shadcn">shadcn/ui</Tabs.Trigger>
			<Tabs.Trigger value="radix">Radix Colors</Tabs.Trigger>
			<Tabs.Trigger value="panda">Panda CSS</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="tailwind">
			<Step number={1} title="Generate Tailwind output">
				<CodeViewer
					code='npx @sveltopia/colors generate --colors "#FF4F00" --format tailwind'
					language="bash"
				/>

				<div class="prose max-w-none dark:prose-invert">
					<p>
						This creates <code>tailwind.css</code> in your output directory — a self-contained
						file with CSS variables for light and dark mode, plus a <code>@theme</code> block that
						registers every color as a Tailwind utility.
					</p>
				</div>
			</Step>

			<Step number={2} title="Import in your stylesheet">
				<CodeViewer
					code={`/* app.css */
@import 'tailwindcss';
@import './colors/tailwind.css';`}
					language="css"
					filename="app.css"
				/>

				<KeyConcept icon={AlertTriangle}>
					<p>
						<strong>About Tailwind's default colors:</strong> Importing
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">tailwind.css</code> adds your
						palette alongside Tailwind's built-in colors. Where hue names overlap (like
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">orange</code> or
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">blue</code>), yours win. But
						Tailwind defaults like
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">emerald</code> and
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">fuchsia</code> will still be
						available. If you want <em>only</em> your palette, add
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">--color-*: initial</code> before your
						import to clear the defaults:
					</p>
				</KeyConcept>

				<CodeViewer
					code={`/* app.css — use only Sveltopia colors */
@import 'tailwindcss';

@theme {
  --color-*: initial;
}

@import './colors/tailwind.css';`}
					language="css"
					filename="app.css"
				/>

				<div class="prose max-w-none dark:prose-invert">
					<p>
						The <code>--color-*: initial</code> directive clears all of Tailwind's built-in color
						utilities. Your generated <code>tailwind.css</code> then re-registers only your
						palette's colors via its own <code>@theme</code> block.
					</p>
				</div>
			</Step>

			<Step number={3} title="Use Tailwind classes">
				<div class="prose max-w-none dark:prose-invert">
					<p>All 31 hue scales are available as Tailwind utilities with a 50–950 scale:</p>
				</div>

				<CodeViewer
					code={`<!-- Background + text -->
<div class="bg-orange-100 text-orange-900">
  Brand card
</div>

<!-- Borders and rings -->
<button class="border-blue-600 ring-blue-400">
  Action
</button>

<!-- Dark mode (automatic with .dark class) -->
<div class="bg-orange-100 text-orange-900 dark:bg-orange-900 dark:text-orange-100">
  Adaptive card
</div>`}
					language="html"
				/>

				<KeyConcept icon={Info}>
					<p>
						<strong>Still on Tailwind v3?</strong> Use
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">--format tailwind-v3</code> to
						generate a JS preset file instead. See the
						<a
							href="/docs/cli"
							class="font-medium text-primary-800 underline hover:text-primary-700 dark:text-primary-600 dark:hover:text-primary-500"
							>CLI Reference</a
						> for details.
					</p>
				</KeyConcept>
			</Step>
		</Tabs.Content>

		<Tabs.Content value="shadcn">
			<Step number={1} title="Generate shadcn output">
				<CodeViewer
					code='npx @sveltopia/colors generate --colors "#FF4F00" --format shadcn'
					language="bash"
				/>

				<div class="prose max-w-none dark:prose-invert">
					<p>
						This creates <code>shadcn-colors.css</code> — it includes everything from the Tailwind
						export (color scales + <code>@theme</code> block) plus all the semantic tokens shadcn
						expects: <code>--background</code>, <code>--foreground</code>,
						<code>--primary</code>, <code>--secondary</code>, <code>--accent</code>,
						<code>--destructive</code>, <code>--muted</code>, <code>--card</code>,
						<code>--popover</code>, and more.
					</p>
				</div>
			</Step>

			<Step number={2} title="Import in your stylesheet">
				<CodeViewer
					code={`/* app.css */
@import 'tailwindcss';
@import './colors/shadcn-colors.css';`}
					language="css"
					filename="app.css"
				/>

				<div class="prose max-w-none dark:prose-invert">
					<p>
						Since the shadcn export already includes the full Tailwind color registration, you
						don't need to import both <code>tailwind.css</code> and
						<code>shadcn-colors.css</code> — just use the shadcn file.
					</p>
				</div>
			</Step>

			<Step number={3} title="Components just work">
				<div class="prose max-w-none dark:prose-invert">
					<p>
						shadcn/ui components reference semantic tokens like <code>bg-primary</code> and
						<code>text-muted-foreground</code>. Since the generated CSS provides these tokens,
						everything works automatically:
					</p>
				</div>

				<CodeViewer code={shadcnExample} language="svelte" />

				<KeyConcept icon={Info}>
					<p>
						Your first brand color becomes
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">--primary</code>. If you provide
						a second color, it maps to
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">--accent</code>. A third becomes
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">--tertiary</code>. Neutral
						surfaces (<code class="rounded bg-muted px-1.5 py-0.5 text-xs">--secondary</code>,
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">--muted</code>) default to
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">slate</code> (configurable via
						the programmatic API). Both light and dark mode tokens are generated automatically.
					</p>
				</KeyConcept>
			</Step>
		</Tabs.Content>

		<Tabs.Content value="radix">
			<Step number={1} title="Generate Radix output">
				<CodeViewer
					code='npx @sveltopia/colors generate --colors "#FF4F00" --format radix'
					language="bash"
				/>

				<div class="prose max-w-none dark:prose-invert">
					<p>
						This creates <code>radix-colors.js</code> — a drop-in replacement for
						<code>@radix-ui/colors</code> with the same export structure: named exports for each
						scale, alpha variants, P3 wide gamut, and dark mode variants.
					</p>
				</div>
			</Step>

			<Step number={2} title="Swap the import">
				<div class="prose max-w-none dark:prose-invert">
					<p>Replace your existing Radix Colors import with the generated file:</p>
				</div>

				<CodeViewer
					code={`// Before
import { orange, orangeA, orangeDark, orangeDarkA } from '@radix-ui/colors';

// After
import { orange, orangeA, orangeDark, orangeDarkA } from './colors/radix-colors.js';`}
					language="js"
				/>
			</Step>

			<Step number={3} title="Use the same API">
				<div class="prose max-w-none dark:prose-invert">
					<p>
						The export uses Radix's 1–12 step naming convention, so your existing code works
						unchanged:
					</p>
				</div>

				<CodeViewer
					code={`// Same key structure as @radix-ui/colors
orange.orange9   // Brand accent
orangeA.orangeA9 // Alpha variant for overlays
orangeDark.orangeDark9 // Dark mode equivalent`}
					language="js"
				/>

				<KeyConcept icon={Info}>
					<p>
						The generated file includes all 31 hue scales — not just your brand colors. Every scale
						is tuned to harmonize with your brand inputs, so the entire palette feels cohesive even
						for colors you didn't explicitly provide.
					</p>
				</KeyConcept>
			</Step>
		</Tabs.Content>

		<Tabs.Content value="panda">
			<Step number={1} title="Generate Panda CSS output">
				<CodeViewer
					code='npx @sveltopia/colors generate --colors "#FF4F00" --format panda'
					language="bash"
				/>

				<div class="prose max-w-none dark:prose-invert">
					<p>
						This creates <code>panda.preset.ts</code> — a Panda CSS preset with all color scales
						registered as tokens and semantic tokens, including automatic light/dark mode switching.
					</p>
				</div>
			</Step>

			<Step number={2} title="Add the preset">
				<CodeViewer
					code={`// panda.config.ts
import { defineConfig } from '@pandacss/dev';
import { sveltopiaColors } from './colors/panda.preset';

export default defineConfig({
  presets: [sveltopiaColors],
  // ... rest of your config
});`}
					language="ts"
					filename="panda.config.ts"
				/>
			</Step>

			<Step number={3} title="Use color tokens">
				<div class="prose max-w-none dark:prose-invert">
					<p>
						All scales are available as Panda tokens using Radix's 1–12 step convention. Dark mode
						switches automatically based on <code>data-theme="dark"</code> or a
						<code>.dark</code> class on a parent element:
					</p>
				</div>

				<CodeViewer
					code={`import { css } from '../styled-system/css';

// Use any hue scale (1-12 steps)
const card = css({
  bg: 'orange.3',      // Light surface
  color: 'orange.12',  // High-contrast text
  borderColor: 'orange.6'
});

// Semantic tokens for brand colors
const button = css({
  bg: 'accent',        // Your primary brand color
  color: 'white'
});`}
					language="ts"
				/>

				<KeyConcept icon={Info}>
					<p>
						The preset includes semantic tokens:
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">accent</code> maps to your
						primary brand hue, and
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">brand.primary</code> /
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">brand.secondary</code> give you
						direct access to your exact brand color steps.
					</p>
				</KeyConcept>
			</Step>
		</Tabs.Content>
	</Tabs.Root>
</div>

<div class="prose mt-8 max-w-none dark:prose-invert">
	<h2>Plain CSS &amp; JSON</h2>

	<p>
		Not using a framework? The default <code>--format css</code> export gives you CSS custom
		properties that work anywhere — no build tools required. See the
		<a href="/docs/quick-start">Quick Start</a> for usage. The <code>--format json</code> export
		provides structured palette data (hex, OKLCH, and P3 values) for use in design tools, scripts,
		or custom integrations.
	</p>
</div>

<div class="mt-12">
	<PrevNext
		prev={{ label: 'CLI Reference', href: '/docs/cli' }}
		next={{ label: 'Color Theory', href: '/docs/color-theory' }}
	/>
</div>
