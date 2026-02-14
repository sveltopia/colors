<script lang="ts">
  import { Star, X, Copy, Check } from 'lucide-svelte';
  import type { Scale } from '@sveltopia/colors';

  interface Props {
    hueName: string;
    scale: Scale;
    baselineScale?: Scale;
    showBaseline: boolean;
    isAnchored: boolean;
    anchorStep?: number;
    mode: 'light' | 'dark';
  }

  let { hueName, scale, baselineScale, showBaseline, isAnchored, anchorStep, mode }: Props = $props();

  // Determine if star should be light or dark based on step and mode
  // In light mode: steps 1-6 have light backgrounds (dark star), 7-12 have dark backgrounds (white star)
  // In dark mode: steps 1-6 have dark backgrounds (white star), 7-12 have lighter backgrounds (dark star)
  function getStarColor(step: number): { color: string; shadow: string } {
    const isLightBackground = mode === 'light' ? step <= 6 : step >= 7;
    return isLightBackground
      ? { color: '#1a1a1a', shadow: 'rgba(255,255,255,0.5)' }
      : { color: 'white', shadow: 'rgba(0,0,0,0.5)' };
  }

  // Generate array of steps 1-12
  const steps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

  // Popover state
  let activePopover = $state<number | null>(null);

  // Listen for close events from other rows
  $effect(() => {
    function handleClose() {
      activePopover = null;
    }
    window.addEventListener('close-swatch-popover', handleClose);
    return () => window.removeEventListener('close-swatch-popover', handleClose);
  });

  // Convert hex to RGB
  function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }

  // Convert RGB to HSL
  function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  // Convert RGB to OKLCH (approximate)
  function rgbToOklch(r: number, g: number, b: number): { l: number; c: number; h: number } {
    // Normalize RGB to 0-1
    r /= 255;
    g /= 255;
    b /= 255;

    // Convert to linear RGB
    const toLinear = (c: number) => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const lr = toLinear(r);
    const lg = toLinear(g);
    const lb = toLinear(b);

    // Convert to OKLab
    const l_ = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m_ = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s_ = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;

    const l_3 = Math.cbrt(l_);
    const m_3 = Math.cbrt(m_);
    const s_3 = Math.cbrt(s_);

    const L = 0.2104542553 * l_3 + 0.7936177850 * m_3 - 0.0040720468 * s_3;
    const a = 1.9779984951 * l_3 - 2.4285922050 * m_3 + 0.4505937099 * s_3;
    const b_ = 0.0259040371 * l_3 + 0.7827717662 * m_3 - 0.8086757660 * s_3;

    // Convert to OKLCH
    const C = Math.sqrt(a * a + b_ * b_);
    let H = Math.atan2(b_, a) * 180 / Math.PI;
    if (H < 0) H += 360;

    return {
      l: Math.round(L * 100) / 100,
      c: Math.round(C * 1000) / 1000,
      h: Math.round(H)
    };
  }

  // Get color info for popover
  function getColorInfo(hex: string) {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const oklch = rgbToOklch(rgb.r, rgb.g, rgb.b);
    return { hex: hex.toUpperCase(), rgb, hsl, oklch };
  }

  function handleSwatchClick(step: number, e: MouseEvent) {
    e.stopPropagation();
    const shouldOpen = activePopover !== step;
    // Close popovers in all rows (including this one)
    window.dispatchEvent(new CustomEvent('close-swatch-popover'));
    // Then open this one (if toggling on)
    activePopover = shouldOpen ? step : null;
  }

  // Copy hex to clipboard
  let copied = $state(false);
  function copyHex(hex: string) {
    navigator.clipboard.writeText(hex);
    copied = true;
    setTimeout(() => { copied = false; }, 1500);
  }
</script>

<div class="space-y-1">
  <!-- Generated row -->
  <div class="flex items-center gap-2">
    <!-- Row label -->
    <div class="w-24 shrink-0 pr-2 text-right">
      <span class="text-xs font-medium">{hueName}</span>
      {#if isAnchored}
        <Star class="ml-1 inline h-3 w-3 fill-current text-amber-500" />
      {/if}
    </div>

    <!-- Color swatches (grid for alignment) -->
    <div class="relative grid flex-1 grid-cols-12">
      {#each steps as step (step)}
        {@const color = scale[step]}
        {@const isAnchorStep = isAnchored && anchorStep === step}
        <button
          type="button"
          onclick={(e) => handleSwatchClick(step, e)}
          class="group relative h-8 transition-transform first:rounded-l-md last:rounded-r-md hover:z-10 hover:scale-y-125"
          style="background-color: {color};"
        >
          {#if isAnchorStep}
            <div class="absolute inset-0 flex items-center justify-center">
              <Star
                class="h-3 w-3 fill-current sm:h-4 sm:w-4"
                style="color: {getStarColor(step).color}; filter: drop-shadow(0 1px 1px {getStarColor(step).shadow});"
              />
            </div>
          {/if}
        </button>
      {/each}

      <!-- Color detail popover (rendered outside buttons to avoid nesting) -->
      {#if activePopover !== null}
        {@const color = scale[activePopover as keyof typeof scale]}
        {@const info = getColorInfo(color)}
        {#if info}
          <div
            class="absolute top-full z-50 mt-2 w-48 rounded-lg border bg-popover p-3 shadow-lg"
            style="left: calc({((activePopover - 1) / 12) * 100}% + {100/24}%); transform: translateX(-50%);"
            role="dialog"
            onclick={(e) => e.stopPropagation()}
            onkeydown={(e) => e.key === 'Escape' && (activePopover = null)}
          >
            <button
              type="button"
              onclick={() => (activePopover = null)}
              class="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            >
              <X class="h-3 w-3" />
            </button>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded shadow" style="background-color: {info.hex};"></div>
                <div>
                  <div class="text-xs font-medium">{hueName}-{activePopover}</div>
                </div>
              </div>
              <div class="space-y-1 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">HEX</span>
                  <button
                    type="button"
                    onclick={(e) => { e.stopPropagation(); copyHex(info.hex); }}
                    class="flex items-center gap-1 font-mono hover:text-foreground"
                    title="Copy to clipboard"
                  >
                    {info.hex}
                    {#if copied}
                      <Check class="h-3 w-3 text-green-600" />
                    {:else}
                      <Copy class="h-3 w-3 text-muted-foreground" />
                    {/if}
                  </button>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">RGB</span>
                  <span class="font-mono">{info.rgb.r}, {info.rgb.g}, {info.rgb.b}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">HSL</span>
                  <span class="font-mono">{info.hsl.h}°, {info.hsl.s}%, {info.hsl.l}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted-foreground">OKLCH</span>
                  <span class="font-mono">{info.oklch.l} {info.oklch.c} {info.oklch.h}</span>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>

  <!-- Baseline comparison row (if enabled) -->
  {#if showBaseline && baselineScale}
    <div class="flex items-center gap-2">
      <!-- Empty label space -->
      <div class="w-24 shrink-0 pr-2 text-right">
        <span class="text-[10px] text-muted-foreground">radix</span>
      </div>

      <!-- Baseline swatches (grid for alignment) -->
      <div class="grid flex-1 grid-cols-12">
        {#each steps as step (step)}
          {@const color = baselineScale[step]}
          <div
            class="h-4 first:rounded-l-md last:rounded-r-md"
            style="background-color: {color};"
            title="radix {hueName}-{step}: {color}"
          ></div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<!-- Click outside to close popover -->
<svelte:window onclick={() => activePopover = null} />
