<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  import SearchButton from '$lib/components/SearchButton.svelte';
  import SearchModal from '$lib/components/SearchModal.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import { Menu } from 'lucide-svelte';
  import { page } from '$app/state';
  import { onMount } from 'svelte';

  let { children } = $props();

  let searchOpen = $state(false);
  let pagefindReady = $state(false);

  function toggleMobileMenu() {
    window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchOpen = !searchOpen;
    }
  }

  onMount(async () => {
    try {
      // Dynamic import with string concat to bypass Vite bundling
      const pagefindPath = '/pagefind/pagefind' + '.js';
      window.pagefind = await import(/* @vite-ignore */ pagefindPath);
      await window.pagefind?.init();
      pagefindReady = true;
    } catch {
      // Pagefind not available (dev mode) — search will show dev message
    }
  });
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <!-- Default color preset for the site (shadcn superset covers all site chrome) -->
  <link rel="stylesheet" href="/presets/shadcn/sveltopia.css" />
  <!-- Site-wide OG defaults -->
  <meta property="og:site_name" content="Sveltopia Colors" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#1a1a2e" />
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<ModeWatcher />

<div class="min-h-screen bg-background">
  <!-- Global Header -->
  <header
    class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
  >
    <!-- Mobile Header -->
    <div class="space-y-3 px-4 py-3 lg:hidden">
      <!-- Top row: logo, Colors, version, hamburger (on internal pages) -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-8">
          <a href="/" class="shrink-0">
            <Logo class="h-8 -translate-y-px text-foreground" id="mobile-logo" />
          </a>
          <div class="flex items-center gap-2">
            <span class="font-semibold">Colors</span>
            <span
              class="rounded-md border border-primary-800/20 bg-primary-800/10 px-2 py-0.5 text-xs font-semibold text-primary-800"
              >v0.1.0</span
            >
          </div>
        </div>
        <!-- Hamburger only on docs/playground pages -->
        {#if page.url.pathname.startsWith('/docs') || page.url.pathname.startsWith('/playground')}
          <button
            onclick={toggleMobileMenu}
            class="flex items-center rounded-md border px-2 py-2 hover:bg-muted"
            aria-label="Toggle menu"
          >
            <Menu class="h-5 w-5" />
          </button>
        {/if}
      </div>
      <!-- Second row: nav links, mode -->
      <div class="flex items-center justify-between">
        <nav class="flex items-center gap-4 text-sm font-medium">
          <a
            href="/docs"
            class="transition-colors hover:text-foreground/80 {page.url.pathname.startsWith(
              '/docs'
            )
              ? 'text-foreground'
              : 'text-muted-foreground'}">Docs</a
          >
          <a
            href="/playground"
            class="transition-colors hover:text-foreground/80 {page.url.pathname.startsWith(
              '/playground'
            )
              ? 'text-foreground'
              : 'text-muted-foreground'}">Playground</a
          >
          <a
            href="/demos/tailwind"
            class="transition-colors hover:text-foreground/80 {page.url.pathname.startsWith(
              '/demos'
            )
              ? 'text-foreground'
              : 'text-muted-foreground'}">Demos</a
          >
          <a
            href="https://github.com/sveltopia/colors"
            class="text-muted-foreground transition-colors hover:text-foreground/80">GitHub</a
          >
        </nav>
        <div class="flex items-center gap-1">
          <SearchButton iconOnly onclick={() => (searchOpen = true)} />
          <ThemeSwitcher />
        </div>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="hidden lg:block">
      <div class="w-full px-4 lg:container lg:mx-auto">
        <div class="flex h-14 items-center gap-6">
          <!-- Logo area - matches aside width -->
          <a href="/" class="flex w-64 shrink-0 items-center">
            <Logo class="h-8 text-foreground" id="desktop-logo" />
          </a>

          <!-- Content area - matches article, justify-between -->
          <div class="flex flex-1 items-center justify-between">
            <!-- Left: Colors, version, nav -->
            <div class="flex items-center gap-2 px-4 pt-1">
              <span class="font-semibold">Colors</span>
              <span
                class="rounded-md border border-primary-800/20 bg-primary-800/10 px-2 py-0.5 text-xs font-semibold text-primary-800"
                >v0.1.0</span
              >
              <nav class="flex items-center space-x-1 pl-8 text-sm font-medium pt-0.5">
                <a
                  href="/docs"
                  class="border-b-3 px-3 py-2 transition-colors hover:text-foreground/80 {page.url.pathname.startsWith(
                    '/docs'
                  )
                    ? 'border-primary-800'
                    : 'border-transparent'}">Docs</a
                >
                <a
                  href="/playground"
                  class="border-b-3 px-3 py-2 transition-colors hover:text-foreground/80 {page.url.pathname.startsWith(
                    '/playground'
                  )
                    ? 'border-primary-800'
                    : 'border-transparent'}">Playground</a
                >
                <a
                  href="/demos/tailwind"
                  class="border-b-3 px-3 py-2 transition-colors hover:text-foreground/80 {page.url.pathname.startsWith(
                    '/demos'
                  )
                    ? 'border-primary-800'
                    : 'border-transparent'}">Demos</a
                >
                <a
                  href="https://github.com/sveltopia/colors"
                  class="border-b-3 border-transparent px-3 py-2 transition-colors hover:text-foreground/80"
                  >GitHub</a
                >
              </nav>
            </div>

            <!-- Right: search, mode -->
            <div class="flex items-center gap-2">
              <SearchButton onclick={() => (searchOpen = true)} />
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content Area -->
  <main>
    {@render children()}
  </main>

  <!-- Global Footer -->
  <footer class="border-t py-6 md:py-0">
    <div
      class="flex w-full flex-col items-center justify-between gap-4 px-4 md:container md:mx-auto md:h-24 md:flex-row"
    >
      <p class="text-sm text-muted-foreground">
        Built by <a href="https://sveltopia.dev" class="font-medium underline underline-offset-4"
          >Sveltopia</a
        >. The source code is available on
        <a
          href="https://github.com/sveltopia/colors"
          class="font-medium underline underline-offset-4">GitHub</a
        >.
      </p>
    </div>
  </footer>
</div>

<SearchModal bind:open={searchOpen} {pagefindReady} onclose={() => (searchOpen = false)} />
