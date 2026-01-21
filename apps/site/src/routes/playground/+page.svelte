<script lang="ts">
  import { mode, setMode } from 'mode-watcher';
  import { Sun, Moon, Info } from 'lucide-svelte';
  import { generatePalette, RADIX_SCALES, RADIX_SCALES_DARK, TEST_PALETTES, type LightPalette, type TestPalette } from '@sveltopia/colors';
  import PresetSelector from '$lib/components/playground/PresetSelector.svelte';
  import ColorInputs from '$lib/components/playground/ColorInputs.svelte';
  import TuningProfile from '$lib/components/playground/TuningProfile.svelte';
  import AnalysisPanel from '$lib/components/playground/AnalysisPanel.svelte';
  import PaletteGrid from '$lib/components/playground/PaletteGrid.svelte';
  import CliCta from '$lib/components/playground/CliCta.svelte';
  import MobilePaletteDrawer from '$lib/components/playground/MobilePaletteDrawer.svelte';

  // Get initial colors from default preset
  const DEFAULT_PRESET = 'sveltopia';
  const defaultPresetColors = TEST_PALETTES.find((p: TestPalette) => p.id === DEFAULT_PRESET)?.colors ?? ['#FF6A00'];

  // State
  let selectedPreset = $state<string | null>(DEFAULT_PRESET);
  let customColors = $state<string[]>([...defaultPresetColors]);
  let showBaseline = $state(false);

  // Derived: Get brand colors from preset or custom input
  const brandColors = $derived.by(() => {
    if (selectedPreset) {
      const preset = TEST_PALETTES.find((p: TestPalette) => p.id === selectedPreset);
      return preset?.colors ?? ['#FF6A00'];
    }
    return customColors.filter((c: string) => c.length > 0);
  });

  // Derived: Current mode for palette generation
  const currentMode = $derived(mode.current === 'dark' ? 'dark' : 'light');

  // Derived: Generate palette reactively
  const palette = $derived.by(() => {
    if (brandColors.length === 0) {
      return null;
    }
    try {
      return generatePalette({ brandColors, mode: currentMode });
    } catch {
      return null;
    }
  });

  // Derived: Get baseline Radix scales for comparison
  const baselineScales = $derived(currentMode === 'dark' ? RADIX_SCALES_DARK : RADIX_SCALES);

  // Handle preset selection
  function handlePresetSelect(presetId: string | null) {
    selectedPreset = presetId;
    if (presetId) {
      // When selecting a preset, also update customColors to match
      // so switching to "Custom" shows those colors
      const preset = TEST_PALETTES.find((p: TestPalette) => p.id === presetId);
      if (preset) {
        customColors = [...preset.colors];
      }
    }
  }

  // Handle custom color changes
  function handleColorsChange(colors: string[]) {
    customColors = colors;
    selectedPreset = null; // Switch to custom mode
  }
</script>

<svelte:head>
  <title>Playground | Sveltopia Colors</title>
  <meta name="description" content="Interactive playground to generate color palettes from your brand colors." />
</svelte:head>

<div class="w-full px-4 py-8 md:container md:mx-auto md:max-w-7xl">
  <div class="mb-8">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Playground</h1>
    <p class="mt-2 text-muted-foreground">
      See how Sveltopia Colors transforms brand colors into complete palettes.
    </p>
  </div>

  <div class="grid gap-8 lg:grid-cols-[320px_1fr]">
    <!-- Sidebar: Inputs -->
    <div class="space-y-6">
      <!-- Preset Selector -->
      <div class="rounded-lg border bg-card p-4">
        <PresetSelector
          selected={selectedPreset}
          onSelect={handlePresetSelect}
        />
      </div>

      <!-- Color Inputs -->
      <div class="rounded-lg border bg-card p-4">
        <ColorInputs
          colors={customColors}
          onChange={handleColorsChange}
        />
      </div>

      <!-- Tuning Profile -->
      {#if palette}
        <div class="rounded-lg border bg-card p-4">
          <TuningProfile tuningProfile={palette.meta.tuningProfile} />
        </div>
      {/if}

      <!-- Analysis Panel -->
      {#if palette}
        <div class="rounded-lg border bg-card p-4">
          <AnalysisPanel
            tuningProfile={palette.meta.tuningProfile}
            inputColors={brandColors}
          />
        </div>
      {/if}
    </div>

    <!-- Main: Palette Grid (hidden on mobile, shown on lg+) -->
    <div class="hidden space-y-6 lg:block">
      <!-- Header with mode toggle and baseline toggle -->
      <div class="space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-sm font-medium">Generated Palette</span>
            <!-- Light/Dark mode toggle -->
            <div class="flex items-center rounded-lg border bg-muted p-0.5">
              <button
                type="button"
                onclick={() => setMode('light')}
                class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors {currentMode === 'light' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
              >
                <Sun class="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onclick={() => setMode('dark')}
                class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors {currentMode === 'dark' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
              >
                <Moon class="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>
          <label class="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              bind:checked={showBaseline}
              class="h-4 w-4 rounded border-border"
            />
            <span class="text-sm text-muted-foreground">Show Radix baseline</span>
          </label>
        </div>
        <p class="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Info class="h-3.5 w-3.5" />
          Showing 7 core hues + anchored colors. Full output includes all 31 Radix families.
        </p>
      </div>

      <!-- Palette Grid -->
      {#if palette}
        <PaletteGrid
          {palette}
          {showBaseline}
          {baselineScales}
          mode={currentMode}
        />
      {:else}
        <div class="flex h-64 items-center justify-center rounded-lg border bg-card">
          <p class="text-muted-foreground">Enter at least one color to generate a palette</p>
        </div>
      {/if}

      <!-- CLI CTA -->
      <CliCta {brandColors} />
    </div>
  </div>

  <!-- Mobile: Drawer for palette (lg:hidden) -->
  {#if palette}
    <MobilePaletteDrawer>
      <div class="space-y-6">
        <!-- Mode toggle and baseline toggle -->
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center rounded-lg border bg-muted p-0.5">
              <button
                type="button"
                onclick={() => setMode('light')}
                class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors {currentMode === 'light' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
              >
                <Sun class="h-3.5 w-3.5" />
                <span>Light</span>
              </button>
              <button
                type="button"
                onclick={() => setMode('dark')}
                class="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors {currentMode === 'dark' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
              >
                <Moon class="h-3.5 w-3.5" />
                <span>Dark</span>
              </button>
            </div>
            <label class="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                bind:checked={showBaseline}
                class="h-4 w-4 rounded border-border"
              />
              <span class="text-xs text-muted-foreground">Radix baseline</span>
            </label>
          </div>
          <p class="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Info class="h-3 w-3 shrink-0" />
            Showing 7 core hues + anchored. Full output: all 31 families.
          </p>
        </div>

        <!-- Palette Grid (scrollable on mobile) -->
        <div class="-mx-4 overflow-x-auto px-4">
          <div class="min-w-[600px]">
            <PaletteGrid
              {palette}
              {showBaseline}
              {baselineScales}
              mode={currentMode}
            />
          </div>
        </div>

        <!-- CLI CTA -->
        <CliCta {brandColors} />
      </div>
    </MobilePaletteDrawer>
  {/if}
</div>
