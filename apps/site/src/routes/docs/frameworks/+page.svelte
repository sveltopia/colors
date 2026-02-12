<script lang="ts">
	import CodeViewer from '$lib/components/CodeViewer.svelte';
	import KeyConcept from '$lib/components/KeyConcept.svelte';
	import PrevNext from '$lib/components/PrevNext.svelte';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Info } from 'lucide-svelte';

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
		Sveltopia Colors exports ready-to-use files for popular CSS frameworks. Generate once, import,
		and your components just work.
	</p>
</div>

<div class="not-prose mt-8">
	<Tabs.Root value="tailwind">
		<Tabs.List>
			<Tabs.Trigger value="tailwind">Tailwind CSS</Tabs.Trigger>
			<Tabs.Trigger value="shadcn">shadcn/ui</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="tailwind">
			<div class="prose max-w-none dark:prose-invert">
				<h3>1. Generate Tailwind output</h3>
			</div>

			<div class="mt-4">
				<CodeViewer
					code='npx @sveltopia/colors generate --colors "#FF4F00" --format tailwind'
					language="bash"
				/>
			</div>

			<div class="prose max-w-none dark:prose-invert">
				<p>
					This creates <code>tailwind.css</code> in your output directory containing a
					<code>@theme</code> block with all color scales registered as Tailwind utilities.
				</p>

				<h3>2. Import in your app</h3>
			</div>

			<div class="mt-4">
				<CodeViewer
					code={`/* app.css */
@import 'tailwindcss';
@import './colors/tailwind.css';`}
					language="css"
					filename="app.css"
				/>
			</div>

			<div class="prose max-w-none dark:prose-invert">
				<h3>3. Use Tailwind classes</h3>

				<p>
					All 31 hue scales are available as Tailwind color utilities. The scale uses a 50-950
					naming convention:
				</p>
			</div>

			<div class="mt-4">
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
			</div>

			<div class="mt-4">
				<KeyConcept icon={Info}>
					<p>
						The generated Tailwind file uses Tailwind v4's <code
							class="rounded bg-muted px-1.5 py-0.5 text-xs">@theme</code
						> block, which registers CSS custom properties as first-class utilities. No
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">tailwind.config.js</code> needed.
					</p>
				</KeyConcept>
			</div>
		</Tabs.Content>

		<Tabs.Content value="shadcn">
			<div class="prose max-w-none dark:prose-invert">
				<h3>1. Generate shadcn output</h3>
			</div>

			<div class="mt-4">
				<CodeViewer
					code='npx @sveltopia/colors generate --colors "#FF4F00" --format shadcn'
					language="bash"
				/>
			</div>

			<div class="prose max-w-none dark:prose-invert">
				<p>
					This creates <code>shadcn-colors.css</code> with all the semantic tokens shadcn/ui
					expects: <code>--background</code>, <code>--foreground</code>,
					<code>--primary</code>, <code>--secondary</code>, <code>--accent</code>,
					<code>--destructive</code>, <code>--card</code>, <code>--popover</code>,
					<code>--muted</code>, and more.
				</p>

				<h3>2. Import in your app</h3>
			</div>

			<div class="mt-4">
				<CodeViewer
					code={`/* app.css */
@import 'tailwindcss';
@import './colors/shadcn-colors.css';`}
					language="css"
					filename="app.css"
				/>
			</div>

			<div class="prose max-w-none dark:prose-invert">
				<h3>3. Components just work</h3>

				<p>
					shadcn/ui components reference semantic tokens like <code>bg-primary</code> and
					<code>text-muted-foreground</code>. Since the generated CSS provides these tokens,
					everything works automatically:
				</p>
			</div>

			<div class="mt-4">
				<CodeViewer code={shadcnExample} language="svelte" />
			</div>

			<div class="mt-4">
				<KeyConcept icon={Info}>
					<p>
						The shadcn export maps your brand's primary color to <code
							class="rounded bg-muted px-1.5 py-0.5 text-xs">--primary</code
						>, derives
						<code class="rounded bg-muted px-1.5 py-0.5 text-xs">--secondary</code>
						and <code class="rounded bg-muted px-1.5 py-0.5 text-xs">--accent</code> from complementary
						hues, and provides both light and dark mode values.
					</p>
				</KeyConcept>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>

<div class="prose max-w-none dark:prose-invert">
	<h2>More formats</h2>

	<p>
		Sveltopia Colors also exports for <strong>Radix Colors</strong> (<code>--format radix</code>)
		and <strong>Panda CSS</strong> (<code>--format panda</code>). See the
		<a href="/docs/api-reference">API Reference</a> for the full export options for each format.
	</p>
</div>

<div class="mt-12">
	<PrevNext
		prev={{ label: 'CLI Reference', href: '/docs/cli' }}
		next={{ label: 'Color Theory', href: '/docs/color-theory' }}
	/>
</div>
