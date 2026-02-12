<script lang="ts">
  import { ArrowRight, Terminal, Palette, Layers, Accessibility } from 'lucide-svelte';
  import PrevNext from '$lib/components/PrevNext.svelte';
</script>

<div class="prose max-w-none dark:prose-invert">
  <h1>Sveltopia Colors</h1>

  <p class="lead">
    A perceptually uniform color system that generates accessible, beautiful palettes from your brand
    colors. Built on OKLCH and the Radix 12-step scale, with APCA contrast validation baked in.
  </p>

  <ul>
    <li>
      <strong>Brand-first generation</strong> — feed in your hex colors, get a full 31-hue palette
      tuned to your brand
    </li>
    <li>
      <strong>Perceptually uniform</strong> — OKLCH ensures consistent lightness and chroma across
      hues, unlike HSL/RGB
    </li>
    <li>
      <strong>Accessibility built in</strong> — every step is APCA-validated so you never ship
      inaccessible color combinations
    </li>
    <li>
      <strong>Framework-ready exports</strong> — Tailwind v4, shadcn/ui, Radix, and Panda CSS out of
      the box
    </li>
    <li>
      <strong>Light + dark mode</strong> — both modes generated automatically with proper contrast in
      each
    </li>
  </ul>

  <h2>Get Started</h2>
</div>

<div class="not-prose mt-6 grid gap-4 sm:grid-cols-2">
  <a
    href="/docs/quick-start"
    class="group flex items-start gap-4 rounded-lg border p-6 transition-colors hover:border-primary-800/50 hover:bg-primary-800/5"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-800/10 text-primary-800 dark:text-primary-600"
    >
      <ArrowRight class="h-5 w-5" />
    </div>
    <div>
      <div class="font-semibold text-foreground">Quick Start</div>
      <div class="mt-1 text-sm text-muted-foreground">
        Install, generate, and use your palette in under 5 minutes.
      </div>
    </div>
  </a>

  <a
    href="/docs/cli"
    class="group flex items-start gap-4 rounded-lg border p-6 transition-colors hover:border-primary-800/50 hover:bg-primary-800/5"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-800/10 text-primary-800 dark:text-primary-600"
    >
      <Terminal class="h-5 w-5" />
    </div>
    <div>
      <div class="font-semibold text-foreground">CLI Reference</div>
      <div class="mt-1 text-sm text-muted-foreground">
        All generate and dev commands with every flag explained.
      </div>
    </div>
  </a>

  <a
    href="/docs/frameworks"
    class="group flex items-start gap-4 rounded-lg border p-6 transition-colors hover:border-primary-800/50 hover:bg-primary-800/5"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-800/10 text-primary-800 dark:text-primary-600"
    >
      <Layers class="h-5 w-5" />
    </div>
    <div>
      <div class="font-semibold text-foreground">Frameworks</div>
      <div class="mt-1 text-sm text-muted-foreground">
        Integration guides for Tailwind, shadcn/ui, Radix, and Panda CSS.
      </div>
    </div>
  </a>

  <a
    href="/docs/color-theory"
    class="group flex items-start gap-4 rounded-lg border p-6 transition-colors hover:border-primary-800/50 hover:bg-primary-800/5"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-800/10 text-primary-800 dark:text-primary-600"
    >
      <Palette class="h-5 w-5" />
    </div>
    <div>
      <div class="font-semibold text-foreground">Color Theory</div>
      <div class="mt-1 text-sm text-muted-foreground">
        Why OKLCH, the Radix 12-step scale, and APCA contrast.
      </div>
    </div>
  </a>
</div>

<div class="not-prose mt-8 rounded-lg border border-primary-800/20 bg-primary-800/5 p-6">
  <div class="flex items-start gap-3">
    <Accessibility class="mt-0.5 h-5 w-5 shrink-0 text-primary-800 dark:text-primary-600" />
    <div>
      <div class="font-semibold text-foreground">Looking for examples?</div>
      <div class="mt-1 text-sm text-muted-foreground">
        Try the <a href="/playground" class="font-medium text-primary-800 underline hover:text-primary-700 dark:text-primary-600 dark:hover:text-primary-500">Playground</a> to generate
        palettes interactively, or check the <a href="/demos/tailwind" class="font-medium text-primary-800 underline hover:text-primary-700 dark:text-primary-600 dark:hover:text-primary-500">Demos</a> to see them in action.
      </div>
    </div>
  </div>
</div>

<div class="mt-12">
  <PrevNext next={{ label: 'Quick Start', href: '/docs/quick-start' }} />
</div>
