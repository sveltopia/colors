<script lang="ts">
  import { X, Palette } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  let isOpen = $state(false);

  function open() {
    isOpen = true;
    // Prevent body scroll when drawer is open
    document.body.style.overflow = 'hidden';
  }

  function close() {
    isOpen = false;
    document.body.style.overflow = '';
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Floating action button (mobile only) -->
<button
  type="button"
  onclick={open}
  class="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95 lg:hidden"
  aria-label="View palette"
>
  <Palette class="h-6 w-6" />
</button>

<!-- Drawer backdrop + panel -->
{#if isOpen}
  <div
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && close()}
    role="button"
    tabindex="-1"
    aria-label="Close drawer"
  >
    <!-- Drawer panel -->
    <div
      class="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-background shadow-2xl animate-in slide-in-from-bottom duration-300"
    >
      <!-- Drag handle -->
      <div class="sticky top-0 z-10 flex items-center justify-center bg-background pb-2 pt-3">
        <div class="h-1.5 w-12 rounded-full bg-muted-foreground/30"></div>
      </div>

      <!-- Header -->
      <div class="flex items-center justify-between border-b px-4 pb-3">
        <h2 class="text-lg font-semibold">Generated Palette</h2>
        <button
          type="button"
          onclick={close}
          class="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Close drawer"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-4">
        {@render children()}
      </div>
    </div>
  </div>
{/if}
