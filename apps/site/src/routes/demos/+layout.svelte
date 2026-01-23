<script lang="ts">
	import { mode, setMode } from 'mode-watcher';
	import { Sun, Moon, Palette } from 'lucide-svelte';
	import DemoBrandSwitcher from '$lib/components/demos/DemoBrandSwitcher.svelte';
	import { usePresetId, getPresetStylesheetUrl } from '$lib/stores/demo-preset.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	// Preset state for stylesheet swapping
	const preset = usePresetId();
	const presetStylesheetUrl = $derived(getPresetStylesheetUrl(preset.current));

	// Derived: current mode for display
	const currentMode = $derived(mode.current === 'dark' ? 'dark' : 'light');

	// Current route for tab highlight
	const isTailwindRoute = $derived(page.url.pathname.includes('/tailwind'));
	const isShadcnRoute = $derived(page.url.pathname.includes('/shadcn'));
</script>

<svelte:head>
	<!-- Load the current preset stylesheet -->
	<link rel="stylesheet" href={presetStylesheetUrl} />

	<!-- Preload other presets for instant switching -->
	{#each ['sveltopia', 'stripe', 'spotify', 'claude', 'slack', 'linear', 'figma'] as presetId}
		{#if presetId !== preset.current}
			<link rel="prefetch" href={getPresetStylesheetUrl(presetId)} as="style" />
		{/if}
	{/each}
</svelte:head>

<div class="flex flex-col">
	<!-- Demo Sub-Header with Brand Switcher -->
	<div class="sticky top-14 z-40 border-b bg-background/95 backdrop-blur">
		<div class="w-full px-4 py-3 lg:container lg:mx-auto">
			<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<!-- Left: Demo type tabs -->
				<div class="flex items-center gap-4">
					<div class="flex items-center gap-2">
						<Palette class="h-4 w-4 text-muted-foreground" />
						<span class="text-sm font-semibold">Framework Demos</span>
					</div>
					<nav class="flex items-center gap-1">
						<a
							href="/demos/tailwind"
							class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                {isTailwindRoute
								? 'bg-primary/10 text-primary'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
						>
							Tailwind
						</a>
						<a
							href="/demos/shadcn"
							class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors
                {isShadcnRoute
								? 'bg-primary/10 text-primary'
								: 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
						>
							shadcn-svelte
						</a>
					</nav>
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
