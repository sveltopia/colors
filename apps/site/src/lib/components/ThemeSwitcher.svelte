<script lang="ts">
  import { Sun, Moon, Monitor } from 'lucide-svelte';
  import { userPrefersMode, setMode } from 'mode-watcher';
  import { onMount } from 'svelte';

  type Mode = 'light' | 'dark' | 'system';

  let isOpen = $state(false);
  let mounted = $state(false);

  onMount(() => {
    mounted = true;
  });

  function selectMode(newMode: Mode) {
    setMode(newMode);
    isOpen = false;
  }

  // Click outside handler
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-theme-switcher]')) {
      isOpen = false;
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<div data-theme-switcher class="relative">
  <button
    class="cursor-pointer rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    aria-label="Toggle theme"
    onclick={() => (isOpen = !isOpen)}
  >
    {#if !mounted}
      <!-- Placeholder to prevent layout shift -->
      <div class="h-5 w-5"></div>
    {:else if userPrefersMode.current === 'light'}
      <Sun size={20} />
    {:else if userPrefersMode.current === 'dark'}
      <Moon size={20} />
    {:else}
      <Monitor size={20} />
    {/if}
  </button>

  {#if isOpen}
    <div
      class="absolute top-full right-0 z-50 mt-2 min-w-[180px] rounded-lg border bg-popover p-1 shadow-lg"
    >
      <button
        onclick={() => selectMode('light')}
        class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent {userPrefersMode.current ===
        'light'
          ? 'font-medium text-primary'
          : 'text-muted-foreground'}"
      >
        <Sun size={16} />
        Light
      </button>
      <button
        onclick={() => selectMode('dark')}
        class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent {userPrefersMode.current ===
        'dark'
          ? 'font-medium text-primary'
          : 'text-muted-foreground'}"
      >
        <Moon size={16} />
        Dark
      </button>
      <button
        onclick={() => selectMode('system')}
        class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent {userPrefersMode.current ===
        'system'
          ? 'font-medium text-primary'
          : 'text-muted-foreground'}"
      >
        <Monitor size={16} />
        System
      </button>
    </div>
  {/if}
</div>
