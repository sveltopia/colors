<script lang="ts">
  import { Check, Palette } from 'lucide-svelte';
  import { TEST_PALETTES, type TestPalette } from '@sveltopia/colors';

  interface Props {
    selected: string | null;
    onSelect: (presetId: string | null) => void;
  }

  let { selected, onSelect }: Props = $props();

  // Filter to real-brand presets only
  const presets = TEST_PALETTES.filter((p: TestPalette) => p.category === 'real-brand');

  // Subset of presets to show (most recognizable brands)
  const FEATURED_PRESET_IDS = ['sveltopia', 'stripe', 'spotify', 'linear', 'figma', 'slack'];
  const featuredPresets = presets.filter((p: TestPalette) => FEATURED_PRESET_IDS.includes(p.id));
</script>

<div class="space-y-3">
  <div class="flex items-center gap-2">
    <Palette class="h-4 w-4 text-muted-foreground" />
    <h3 class="text-sm font-medium">Brand Presets</h3>
  </div>

  <div class="space-y-1">
    {#each featuredPresets as preset (preset.id)}
      <button
        type="button"
        onclick={() => onSelect(preset.id)}
        class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary {selected === preset.id
          ? 'bg-secondary font-medium'
          : ''}"
      >
        <!-- Color dots -->
        <div class="flex -space-x-1">
          {#each preset.colors as color (color)}
            <div
              class="h-4 w-4 rounded-full border-2 border-background shadow-sm"
              style="background-color: {color};"
            ></div>
          {/each}
        </div>

        <!-- Name -->
        <span class="flex-1">{preset.name}</span>

        <!-- Check mark if selected -->
        {#if selected === preset.id}
          <Check class="h-4 w-4 text-primary" />
        {/if}
      </button>
    {/each}

    <!-- Custom option -->
    <button
      type="button"
      onclick={() => onSelect(null)}
      class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-secondary {selected === null
        ? 'bg-secondary font-medium'
        : ''}"
    >
      <div class="flex h-4 w-4 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground">
        <span class="text-xs text-muted-foreground">+</span>
      </div>
      <span class="flex-1">Custom</span>
      {#if selected === null}
        <Check class="h-4 w-4 text-primary" />
      {/if}
    </button>
  </div>
</div>
