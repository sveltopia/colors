<script lang="ts">
  import '../app.css';
  import { ModeWatcher } from 'mode-watcher';
  import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import { Menu } from 'lucide-svelte';
  import { page } from '$app/state';

  let { children } = $props();

  function toggleMobileMenu() {
    window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
  }
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <!-- Default color preset for the site -->
  <link rel="stylesheet" href="/presets/sveltopia.css" />
</svelte:head>

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
              class="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-400"
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
            <div class="flex items-center gap-2 px-4">
              <span class="font-semibold">Colors</span>
              <span
                class="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:text-orange-400"
                >v0.1.0</span
              >
              <nav class="flex items-center space-x-1 pl-8 text-sm font-medium">
                <a
                  href="/docs"
                  class="border-b-3 px-3 py-2 transition-colors hover:text-foreground/80 {page.url.pathname.startsWith(
                    '/docs'
                  )
                    ? 'border-orange-500/75'
                    : 'border-transparent'}">Docs</a
                >
                <a
                  href="/playground"
                  class="border-b-3 px-3 py-2 transition-colors hover:text-foreground/80 {page.url.pathname.startsWith(
                    '/playground'
                  )
                    ? 'border-orange-500/75'
                    : 'border-transparent'}">Playground</a
                >
                <a
                  href="/demos/tailwind"
                  class="border-b-3 px-3 py-2 transition-colors hover:text-foreground/80 {page.url.pathname.startsWith(
                    '/demos'
                  )
                    ? 'border-orange-500/75'
                    : 'border-transparent'}">Demos</a
                >
                <a
                  href="https://github.com/sveltopia/colors"
                  class="border-b-3 border-transparent px-3 py-2 transition-colors hover:text-foreground/80"
                  >GitHub</a
                >
              </nav>
            </div>

            <!-- Right: mode -->
            <div class="flex items-center gap-2">
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
