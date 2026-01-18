<script lang="ts">
  // Visual preview of the Sveltopia Colors palette
  // Shows the brand-anchored scales generated from #FF6A00, #43A047, #1A1A1A

  const scales = [
    {
      name: 'orange',
      label: 'Primary',
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
      name: 'grass',
      label: 'Accent',
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
      name: 'slate',
      label: 'Neutral',
      steps: [
        'var(--slate-1)',
        'var(--slate-2)',
        'var(--slate-3)',
        'var(--slate-4)',
        'var(--slate-5)',
        'var(--slate-6)',
        'var(--slate-7)',
        'var(--slate-8)',
        'var(--slate-9)',
        'var(--slate-10)',
        'var(--slate-11)',
        'var(--slate-12)'
      ]
    }
  ];
</script>

<div class="space-y-4">
  {#each scales as scale}
    <div class="space-y-2">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium">{scale.name}</span>
        <span class="text-xs text-muted-foreground">({scale.label})</span>
      </div>
      <div class="flex overflow-hidden rounded-lg">
        {#each scale.steps as step, i}
          <div
            class="h-10 flex-1 transition-transform hover:scale-110 hover:z-10 first:rounded-l-lg last:rounded-r-lg sm:h-12"
            style="background-color: {step};"
            title="{scale.name}-{i + 1}"
          ></div>
        {/each}
      </div>
    </div>
  {/each}

  <!-- Brand color indicators -->
  <div class="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
    <div class="flex items-center gap-2">
      <div class="h-4 w-4 rounded" style="background-color: #FF6A00;"></div>
      <span>#FF6A00 anchors orange-9</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="h-4 w-4 rounded" style="background-color: #43A047;"></div>
      <span>#43A047 anchors grass-9</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="h-4 w-4 rounded" style="background-color: #1A1A1A;"></div>
      <span>#1A1A1A anchors gray-2</span>
    </div>
  </div>
</div>
