<script lang="ts">
	import { TEST_PALETTES, type TestPalette } from '@sveltopia/colors';
	import { usePresetId } from '$lib/stores/demo-preset.svelte';
	import * as Select from '$lib/components/ui/select';

	// Filter to real-brand presets only
	const presets = TEST_PALETTES.filter((p: TestPalette) => p.category === 'real-brand');

	// Featured presets to show (most recognizable brands)
	const FEATURED_PRESET_IDS = ['sveltopia', 'stripe', 'spotify', 'claude', 'slack', 'linear', 'figma'];
	const featuredPresets = presets.filter((p: TestPalette) => FEATURED_PRESET_IDS.includes(p.id));

	// Use the preset store
	const preset = usePresetId();

	// Get current preset for display
	const currentPreset = $derived(featuredPresets.find((p) => p.id === preset.current));

	function handleSelect(value: string | undefined) {
		if (value) {
			preset.current = value;
		}
	}
</script>

<div class="flex items-center gap-2">
	<span class="text-sm font-medium text-muted-foreground">Brand:</span>
	<Select.Root value={preset.current} onValueChange={handleSelect}>
		<Select.Trigger class="w-45">
			{#if currentPreset}
				<div class="flex items-center gap-2">
					<!-- Color dots -->
					<div class="flex -space-x-1">
						{#each currentPreset.colors.slice(0, 3) as color (color)}
							<div
								class="h-3 w-3 rounded-full border border-background shadow-sm"
								style="background-color: {color};"
							></div>
						{/each}
					</div>
					<span>{currentPreset.name}</span>
				</div>
			{:else}
				<Select.Value placeholder="Select a brand" />
			{/if}
		</Select.Trigger>
		<Select.Content>
			{#each featuredPresets as presetItem (presetItem.id)}
				<Select.Item value={presetItem.id}>
					<div class="flex items-center gap-2">
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
					</div>
				</Select.Item>
			{/each}
		</Select.Content>
	</Select.Root>
</div>
