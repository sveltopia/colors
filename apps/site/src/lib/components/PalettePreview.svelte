<script lang="ts">
  import { Star } from 'lucide-svelte';
  import { mode } from 'mode-watcher';

  // Visual preview of the Sveltopia Colors palette
  // Shows the brand-anchored scales generated from #FF6A00, #43A047, #1A1A1A

  // Anchor steps vary by mode for neutral colors
  // Light: gray-12, grass-9, orange-9
  // Dark: gray-2, grass-9, orange-9
  const scales = [
    {
      name: 'grass',
      label: 'Primary',
      brandColor: '#43A047',
      anchorStepLight: 9,
      anchorStepDark: 9,
      steps: [
        'var(--grass-1)',
        'var(--grass-2)',
        'var(--grass-3)',
        'var(--grass-4)',
        'var(--grass-5)',
        'var(--grass-6)',
        'var(--grass-7)',
        'var(--grass-8)',
        'var(--grass-9)',
        'var(--grass-10)',
        'var(--grass-11)',
        'var(--grass-12)'
      ]
    },
    {
      name: 'orange',
      label: 'Accent',
      brandColor: '#FF6A00',
      anchorStepLight: 9,
      anchorStepDark: 9,
      steps: [
        'var(--orange-1)',
        'var(--orange-2)',
        'var(--orange-3)',
        'var(--orange-4)',
        'var(--orange-5)',
        'var(--orange-6)',
        'var(--orange-7)',
        'var(--orange-8)',
        'var(--orange-9)',
        'var(--orange-10)',
        'var(--orange-11)',
        'var(--orange-12)'
      ]
    },
    {
      name: 'gray',
      label: 'Neutral',
      brandColor: '#1A1A1A',
      anchorStepLight: 12,
      anchorStepDark: 2,
      steps: [
        'var(--gray-1)',
        'var(--gray-2)',
        'var(--gray-3)',
        'var(--gray-4)',
        'var(--gray-5)',
        'var(--gray-6)',
        'var(--gray-7)',
        'var(--gray-8)',
        'var(--gray-9)',
        'var(--gray-10)',
        'var(--gray-11)',
        'var(--gray-12)'
      ]
    }
  ];

  // Get anchor step based on current mode (default to light for SSR where mode.current is undefined)
  function getAnchorStep(scale: typeof scales[0]): number {
    const isDark = mode.current === 'dark';
    return isDark ? scale.anchorStepDark : scale.anchorStepLight;
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
          {@const anchorStep = getAnchorStep(scale)}
          <div
            class="relative h-10 flex-1 transition-transform hover:scale-110 hover:z-10 first:rounded-l-lg last:rounded-r-lg sm:h-12"
            style="background-color: {step};"
            title="{scale.name}-{i + 1}"
          >
            {#if i + 1 === anchorStep}
              <div class="absolute inset-0 flex items-center justify-center">
                <Star
                  class="h-4 w-4 fill-current sm:h-5 sm:w-5"
                  style="color: {anchorStep <= 6 ? 'var(--slate-12)' : 'white'}; filter: drop-shadow(0 1px 2px {anchorStep <= 6 ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'});"
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
      {@const anchorStep = getAnchorStep(scale)}
      <div class="flex items-center gap-2">
        <div class="h-4 w-4 rounded shadow-sm" style="background-color: {scale.brandColor};"></div>
        <span>{scale.brandColor}</span>
        <Star class="h-3 w-3 text-muted-foreground" />
        <span>{scale.name}-{anchorStep}</span>
      </div>
    {/each}
  </div>
</div>
