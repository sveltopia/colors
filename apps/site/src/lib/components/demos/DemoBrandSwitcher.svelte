<script lang="ts">
	import { TEST_PALETTES, type TestPalette } from '@sveltopia/colors';
	import { usePresetId } from '$lib/stores/demo-preset.svelte';

	// Filter to real-brand presets only
	const presets = TEST_PALETTES.filter((p: TestPalette) => p.category === 'real-brand');

	// Featured presets to show (most recognizable brands)
	const FEATURED_PRESET_IDS = ['sveltopia', 'stripe', 'spotify', 'claude', 'slack', 'linear', 'figma'];
	const featuredPresets = presets.filter((p: TestPalette) => FEATURED_PRESET_IDS.includes(p.id));

	// Use the preset store
	const preset = usePresetId();

	function handleSelect(presetId: string) {
		preset.current = presetId;
	}
</script>

<div class="flex flex-wrap items-center gap-2">
	<span class="text-sm font-medium text-muted-foreground">Brand:</span>
	{#each featuredPresets as presetItem (presetItem.id)}
		<button
			type="button"
			onclick={() => handleSelect(presetItem.id)}
			class="group flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all
        {preset.current === presetItem.id
				? 'border-primary bg-primary/10 text-primary'
				: 'border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground'}"
		>
			<!-- Color dots -->
			<div class="flex -space-x-1">
				{#each presetItem.colors.slice(0, 3) as color (color)}
					<div
						class="h-3 w-3 rounded-full border border-background shadow-sm"
						style="background-color: {color};"
					></div>
				{/each}
			</div>
			<span>{presetItem.name}</span>
		</button>
	{/each}
</div>
