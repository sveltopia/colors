<script lang="ts">
  import { Search } from 'lucide-svelte';

  interface Props {
    onclick?: () => void;
    iconOnly?: boolean;
  }

  let { onclick, iconOnly = false }: Props = $props();

  // Detect platform for correct key display
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  const shortcutKey = isMac ? '⌘' : 'Ctrl';
</script>

{#if iconOnly}
  <button
    type="button"
    {onclick}
    class="flex cursor-pointer items-center justify-center rounded-md p-2 transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
    aria-label="Search documentation"
  >
    <Search class="h-5 w-5" />
  </button>
{:else}
  <button
    type="button"
    {onclick}
    class="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
    aria-label="Search documentation"
  >
    <Search class="h-4 w-4 text-muted-foreground" />
    <kbd
      class="pointer-events-none inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground select-none"
    >
      <span class="text-xs">{shortcutKey}</span>K
    </kbd>
  </button>
{/if}
