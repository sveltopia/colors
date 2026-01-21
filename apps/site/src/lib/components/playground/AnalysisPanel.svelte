<script lang="ts">
  import { Anchor, Sparkles, ArrowRight } from 'lucide-svelte';
  import type { TuningProfile, AnchorInfo } from '@sveltopia/colors';

  interface Props {
    tuningProfile: TuningProfile;
    inputColors: string[];
  }

  let { tuningProfile, inputColors }: Props = $props();

  // Build anchor mappings for display
  const anchorMappings = $derived.by(() => {
    const mappings: Array<{
      hex: string;
      slot: string;
      step: number;
      isCustom: boolean;
    }> = [];

    const anchors = tuningProfile.anchors as Record<string, AnchorInfo>;
    for (const [hex, info] of Object.entries(anchors)) {
      mappings.push({
        hex: hex.toUpperCase(),
        slot: info.slot,
        step: info.step,
        isCustom: info.isCustomRow ?? false
      });
    }

    return mappings;
  });
</script>

<div class="space-y-3">
  <div class="flex items-center gap-2">
    <Anchor class="h-4 w-4 text-muted-foreground" />
    <h3 class="text-sm font-medium">Color Analysis</h3>
  </div>

  <p class="text-xs text-muted-foreground">
    Where your brand colors anchor in the palette
  </p>

  <div class="space-y-2">
    {#each anchorMappings as mapping (mapping.hex)}
      <div class="flex items-center gap-2 rounded-md bg-secondary/50 px-2 py-1.5">
        <!-- Color swatch -->
        <div
          class="h-5 w-5 shrink-0 rounded shadow-sm"
          style="background-color: {mapping.hex};"
        ></div>

        <!-- Hex value -->
        <span class="font-mono text-xs">{mapping.hex}</span>

        <!-- Arrow -->
        <ArrowRight class="h-3 w-3 text-muted-foreground" />

        <!-- Slot and step -->
        <div class="flex items-center gap-1.5">
          {#if mapping.isCustom}
            <Sparkles class="h-3 w-3 text-amber-500" />
          {/if}
          <span class="text-xs font-medium">
            {mapping.slot}-{mapping.step}
          </span>
        </div>
      </div>
    {/each}
  </div>

  {#if tuningProfile.customRows && tuningProfile.customRows.length > 0}
    <p class="text-xs text-muted-foreground">
      <Sparkles class="mr-1 inline h-3 w-3 text-amber-500" />
      Custom row created for out-of-bounds chroma
    </p>
  {/if}
</div>
