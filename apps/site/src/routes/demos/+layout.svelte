<script lang="ts">
	import { mode, setMode } from 'mode-watcher';
	import { Sun, Moon, Code2 } from 'lucide-svelte';
	import DemoBrandSwitcher from '$lib/components/demos/DemoBrandSwitcher.svelte';
	import IntegrationGuide from '$lib/components/demos/IntegrationGuide.svelte';
	import * as Sheet from '$lib/components/ui/sheet';
	import { usePresetId, getPresetStylesheetUrl } from '$lib/stores/demo-preset.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// Sheet state
	let sheetOpen = $state(false);

	// Current route for tab highlight
	const isTailwindRoute = $derived(page.url.pathname.includes('/tailwind'));
	const isShadcnRoute = $derived(page.url.pathname.includes('/shadcn'));

	// Current framework for integration guide + preset selection
	const currentFramework = $derived<'tailwind' | 'shadcn'>(isShadcnRoute ? 'shadcn' : 'tailwind');

	// Preset state for stylesheet swapping
	const preset = usePresetId();
	const presetStylesheetUrl = $derived(getPresetStylesheetUrl(preset.current, currentFramework));

	// Derived: current mode for display
	const currentMode = $derived(mode.current === 'dark' ? 'dark' : 'light');
</script>

<svelte:head>
	<!-- Load the current preset stylesheet -->
	<link rel="stylesheet" href={presetStylesheetUrl} />

	<!-- Preload other presets for instant switching -->
	{#each ['sveltopia', 'stripe', 'spotify', 'claude', 'slack', 'linear', 'figma'] as presetId}
		{#if presetId !== preset.current}
			<link rel="prefetch" href={getPresetStylesheetUrl(presetId, currentFramework)} as="style" />
		{/if}
	{/each}
</svelte:head>

<div class="flex flex-col">
	<!-- Demo Sub-Header with Brand Switcher -->
	<div class="sticky top-14 z-40 border-b bg-background/95 backdrop-blur">
		<div class="w-full px-6 py-3 lg:container lg:mx-auto">
			<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<!-- Left: Framework tabs + Integration button -->
				<div class="flex items-center gap-2">
					<nav class="flex items-center gap-1">
						<a
							href="/demos/tailwind"
							class="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                {isTailwindRoute
								? 'bg-primary/10 text-primary'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
						>
							Tailwind
						</a>
						<a
							href="/demos/shadcn"
							class="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                {isShadcnRoute
								? 'bg-primary/10 text-primary'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
						>
							shadcn
						</a>
					</nav>

					<!-- Integration button -->
					<button
						type="button"
						onclick={() => (sheetOpen = true)}
						class="flex items-center gap-1.5 rounded-md border border-primary-600 bg-primary-100 px-3 py-1.5 text-sm font-medium text-primary-900 transition-colors hover:bg-primary-200"
					>
						<Code2 class="h-4 w-4" />
						<span>Integration</span>
					</button>
				</div>

				<!-- Right: Brand switcher + mode toggle -->
				<div class="flex flex-wrap items-center gap-4">
					<DemoBrandSwitcher />

					<!-- Light/Dark mode toggle -->
					<div class="flex items-center rounded-lg border bg-muted p-0.5">
						<button
							type="button"
							onclick={() => setMode('light')}
							class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors {currentMode ===
							'light'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'}"
						>
							<Sun class="h-3.5 w-3.5" />
							<span>Light</span>
						</button>
						<button
							type="button"
							onclick={() => setMode('dark')}
							class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors {currentMode ===
							'dark'
								? 'bg-background text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'}"
						>
							<Moon class="h-3.5 w-3.5" />
							<span>Dark</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Demo Content -->
	<div class="min-h-screen">
		{@render children()}
	</div>
</div>

<!-- Implementation Guide Sheet -->
<Sheet.Root bind:open={sheetOpen}>
	<Sheet.Content side="right" class="w-full overflow-y-auto sm:max-w-xl">
		<Sheet.Header>
			<Sheet.Title>
				{currentFramework === 'tailwind' ? 'Tailwind CSS v4' : 'shadcn'} Integration
			</Sheet.Title>
			<Sheet.Description>
				{currentFramework === 'tailwind'
					? 'Drop-in preset with real Tailwind classes'
					: 'Drop-in preset with shadcn semantic tokens'}
			</Sheet.Description>
		</Sheet.Header>
		<div class="mt-6 overflow-y-auto">
			<IntegrationGuide framework={currentFramework} variant="sheet" />
		</div>
	</Sheet.Content>
</Sheet.Root>
