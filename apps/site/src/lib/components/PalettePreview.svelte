<script lang="ts">
  import { Star } from 'lucide-svelte';
  import { mode } from 'mode-watcher';

  // Visual preview of the Sveltopia Colors palette
  // Shows the brand-anchored scales generated from #FF6A00, #43A047, #1A1A1A

  // Tailwind step names (12 steps like Radix, but different numbering)
  const TAILWIND_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900, 950];

  // Anchor step indexes vary by mode for neutral colors
  // Light: gray-950 (index 11), grass-800 (index 8), orange-800 (index 8)
  // Dark: gray-100 (index 1), grass-800 (index 8), orange-800 (index 8)
  const scales = [
    {
      name: 'grass',
      label: 'Primary',
      brandColor: '#43A047',
      anchorIndexLight: 8, // step 800
      anchorIndexDark: 8,  // step 800
      steps: [
        'var(--color-grass-50)',
        'var(--color-grass-100)',
        'var(--color-grass-200)',
        'var(--color-grass-300)',
        'var(--color-grass-400)',
        'var(--color-grass-500)',
        'var(--color-grass-600)',
        'var(--color-grass-700)',
        'var(--color-grass-800)',
        'var(--color-grass-850)',
        'var(--color-grass-900)',
        'var(--color-grass-950)'
      ]
    },
    {
      name: 'orange',
      label: 'Accent',
      brandColor: '#FF6A00',
      anchorIndexLight: 8, // step 800
      anchorIndexDark: 8,  // step 800
      steps: [
        'var(--color-orange-50)',
        'var(--color-orange-100)',
        'var(--color-orange-200)',
        'var(--color-orange-300)',
        'var(--color-orange-400)',
        'var(--color-orange-500)',
        'var(--color-orange-600)',
        'var(--color-orange-700)',
        'var(--color-orange-800)',
        'var(--color-orange-850)',
        'var(--color-orange-900)',
        'var(--color-orange-950)'
      ]
    },
    {
      name: 'gray',
      label: 'Neutral',
      brandColor: '#1A1A1A',
      anchorIndexLight: 11, // step 950
      anchorIndexDark: 1,   // step 100
      steps: [
        'var(--color-gray-50)',
        'var(--color-gray-100)',
        'var(--color-gray-200)',
        'var(--color-gray-300)',
        'var(--color-gray-400)',
        'var(--color-gray-500)',
        'var(--color-gray-600)',
        'var(--color-gray-700)',
        'var(--color-gray-800)',
        'var(--color-gray-850)',
        'var(--color-gray-900)',
        'var(--color-gray-950)'
      ]
    }
  ];

  // Get anchor index based on current mode (default to light for SSR where mode.current is undefined)
  function getAnchorIndex(scale: typeof scales[0]): number {
    const isDark = mode.current === 'dark';
    return isDark ? scale.anchorIndexDark : scale.anchorIndexLight;
  }
</script>

<div class="space-y-4">
  <!-- Brand-anchored scales (full 12-step) -->
  {#each scales as scale (scale.name)}
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">{scale.name}</span>
        <span class="text-xs text-muted-foreground">({scale.label})</span>
      </div>
      <div class="relative flex overflow-hidden rounded-lg">
        {#each scale.steps as step, i (i)}
          {@const anchorIndex = getAnchorIndex(scale)}
          <div
            class="relative h-10 flex-1 transition-transform hover:scale-110 hover:z-10 first:rounded-l-lg last:rounded-r-lg sm:h-12"
            style="background-color: {step};"
            title="{scale.name}-{TAILWIND_STEPS[i]}"
          >
            {#if i === anchorIndex}
              <div class="absolute inset-0 flex items-center justify-center">
                <Star
                  class="h-4 w-4 fill-current sm:h-5 sm:w-5"
                  style="color: {anchorIndex <= 5 ? 'var(--color-slate-950)' : 'white'}; filter: drop-shadow(0 1px 2px {anchorIndex <= 5 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'});"
                />
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {/each}

  <!-- Brand color legend -->
  <div class="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
    {#each scales as scale (scale.name)}
      {@const anchorIndex = getAnchorIndex(scale)}
      <div class="flex items-center gap-2">
        <div class="h-4 w-4 rounded shadow-sm" style="background-color: {scale.brandColor};"></div>
        <span>{scale.brandColor}</span>
        <Star class="h-3 w-3 text-muted-foreground" />
        <span>{scale.name}-{TAILWIND_STEPS[anchorIndex]}</span>
      </div>
    {/each}
  </div>
</div>
