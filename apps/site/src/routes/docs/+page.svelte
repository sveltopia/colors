<script lang="ts">
  import { ArrowRight, Terminal, Palette, Layers, Images } from 'lucide-svelte';
  import PrevNext from '$lib/components/PrevNext.svelte';
</script>

<div class="prose max-w-none dark:prose-invert">
  <h1>Sveltopia Colors</h1>

  <p class="lead">
    Generate a harmonious, accessible color palette tuned to your brand. One command gives you a
    drop-in replacement for the colors in your Tailwind or shadcn project.
  </p>

  <p>
    Libraries like <a href="https://tailwindcss.com/docs/colors" target="_blank" rel="noopener noreferrer">Tailwind</a> and <a href="https://www.radix-ui.com/colors" target="_blank" rel="noopener noreferrer">Radix</a> already provide well designed color palettes, crafted
    for contrast and accessibility. These palettes are like a big box of crayons &mdash; comprehensive, beautiful, and ready to use. But
    the crayons aren't designed to adapt to your brand.
  </p>

  <p>
    Your options are to pick the closest existing color and hope it feels right, or use a
    tool like Radix's <a href="https://www.radix-ui.com/colors/custom" target="_blank" rel="noopener noreferrer">custom color generator</a>
    to create a single hue family that matches your brand input. The latter is a great step
    in the right direction, but when you drop that custom row into the rest of the
    palette there's no guarantee that it will harmonize with the other ~30 hue families.
  </p>

  <p>
    Sveltopia Colors solves this by finding the closest perceptual match in the Radix baseline,
    or generating a custom row if it can't find an ideal match. Then it tunes
    the entire palette so every hue shifts to harmonize with your inputs. The shifts are subtle and
    dampened, so that everything across the full palette shares a "family resemblance" with your brand
    while maintaining the original cohesiveness of the Radix color choices.
    The result is a complete 31-hue system with light and dark mode, every step APCA-validated for
    accessibility, that feels like it was designed for you from the start.
  </p>

  <h2>Why Radix?</h2>

  <p>We chose Radix's 12-step scale as our foundation because each step has a clear semantic purpose:
    backgrounds, borders, solids, and text which take the guesswork out of choosing the right shade
    for a given UI context. The light/dark mode pairing is solved at the scale level, and twelve steps
    hits the sweet spot between flexibility and decision fatigue.</p>

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
        Integration guides for Tailwind and shadcn/ui.
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
    <Images class="mt-0.5 h-5 w-5 shrink-0 text-primary-800 dark:text-primary-600" />
    <div>
      <div class="font-semibold text-foreground">Need examples?</div>
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
