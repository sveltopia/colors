<script lang="ts">
  import PaletteRow from './PaletteRow.svelte';
  import { RADIX_SCALE_ORDER, type LightPalette, type Scale, type AnchorInfo } from '@sveltopia/colors';

  interface Props {
    palette: LightPalette;
    showBaseline: boolean;
    baselineScales: Record<string, Scale>;
    mode: 'light' | 'dark';
  }

  let { palette, showBaseline, baselineScales, mode }: Props = $props();

  // Core 7 families we always show (subset of RADIX_SCALE_ORDER)
  const CORE_FAMILIES = ['gray', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'];

  // Get all rows to display, properly ordered
  const allRows = $derived.by(() => {
    type RowData = {
      hueName: string;
      scale: Scale;
      baselineScale?: Scale;
      isAnchored: boolean;
      anchorStep?: number;
      isCustom: boolean;
    };

    // Get anchor info for a hue
    function getAnchorInfo(hueName: string): { isAnchored: boolean; anchorStep?: number } {
      const isAnchored = palette.meta.anchoredSlots.includes(hueName);
      let anchorStep: number | undefined;

      if (isAnchored) {
        const anchors = palette.meta.tuningProfile.anchors as Record<string, AnchorInfo>;
        for (const [, info] of Object.entries(anchors)) {
          if (info.slot === hueName) {
            anchorStep = info.step;
            break;
          }
        }
      }

      // Also check custom rows for anchor step
      if (!anchorStep && palette.meta.tuningProfile.customRows) {
        for (const customRow of palette.meta.tuningProfile.customRows) {
          if (customRow.rowKey === hueName) {
            anchorStep = customRow.anchorStep;
            break;
          }
        }
      }

      return { isAnchored, anchorStep };
    }

    // Determine which hues to show:
    // 1. All 7 core families (always)
    // 2. Any additional anchored hues (inserted in Radix order)
    const huesToShow = new Set(CORE_FAMILIES);

    // Add non-core anchored hues (but not custom slots yet)
    for (const hue of palette.meta.anchoredSlots) {
      if (!palette.meta.customSlots.includes(hue)) {
        huesToShow.add(hue);
      }
    }

    // Build rows in Radix order
    const standardRows: RowData[] = [];
    for (const hueName of RADIX_SCALE_ORDER) {
      if (huesToShow.has(hueName) && palette.scales[hueName]) {
        const { isAnchored, anchorStep } = getAnchorInfo(hueName);
        standardRows.push({
          hueName,
          scale: palette.scales[hueName],
          baselineScale: baselineScales[hueName],
          isAnchored,
          anchorStep,
          isCustom: false
        });
      }
    }

    // Custom rows (out-of-bounds chroma) go in a separate section
    const customRows: RowData[] = [];
    for (const hueName of palette.meta.customSlots) {
      if (palette.scales[hueName]) {
        const { anchorStep } = getAnchorInfo(hueName);
        customRows.push({
          hueName,
          scale: palette.scales[hueName],
          baselineScale: baselineScales[hueName],
          isAnchored: true,
          anchorStep,
          isCustom: true
        });
      }
    }

    return { standardRows, customRows };
  });

  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
</script>

<div class="space-y-4">
  <!-- Step numbers (top) -->
  <div class="flex items-center gap-2 px-4 text-[10px] text-muted-foreground">
    <div class="w-24 shrink-0"></div>
    <div class="grid flex-1 grid-cols-12 text-center">
      {#each steps as step}
        <span>{step}</span>
      {/each}
    </div>
  </div>

  <!-- Standard hue families (core + anchored non-custom) -->
  <div class="rounded-lg border bg-card p-4">
    <div class="space-y-3">
      {#each allRows.standardRows as row (row.hueName)}
        <PaletteRow
          hueName={row.hueName}
          scale={row.scale}
          baselineScale={row.baselineScale}
          {showBaseline}
          isAnchored={row.isAnchored}
          anchorStep={row.anchorStep}
          {mode}
        />
      {/each}
    </div>
  </div>

  <!-- Custom rows (out-of-bounds chroma) - dashed border -->
  {#if allRows.customRows.length > 0}
    <div class="rounded-lg border border-dashed bg-card/50 p-4">
      <div class="mb-3 text-xs font-medium text-muted-foreground">Custom Scales (out-of-bounds chroma)</div>
      <div class="space-y-3">
        {#each allRows.customRows as row (row.hueName)}
          <PaletteRow
            hueName={row.hueName}
            scale={row.scale}
            baselineScale={row.baselineScale}
            {showBaseline}
            isAnchored={row.isAnchored}
            anchorStep={row.anchorStep}
            {mode}
          />
        {/each}
      </div>
    </div>
  {/if}

  <!-- Step numbers (bottom) -->
  <div class="flex items-center gap-2 px-4 text-[10px] text-muted-foreground">
    <div class="w-24 shrink-0"></div>
    <div class="grid flex-1 grid-cols-12 text-center">
      {#each steps as step}
        <span>{step}</span>
      {/each}
    </div>
  </div>
</div>
