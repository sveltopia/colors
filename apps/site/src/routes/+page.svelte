<script lang="ts">
  import CodeViewer from '$lib/components/CodeViewer.svelte';
  import PalettePreview from '$lib/components/PalettePreview.svelte';
  import { Palette, Moon, Accessibility, Layers, Sparkles, Zap } from 'lucide-svelte';

  const generateExample = `npx @sveltopia/colors generate \\
  --colors "#FF6A00,#43A047,#1A1A1A" \\
  --format css \\
  --output src/lib/colors`;

  const cssOutputExample = `:root {
  --orange-1: #fff8f3;
  --orange-2: #ffefdc;
  --orange-3: #ffe5c9;
  /* ... 12-step scale */
  --orange-9: #FF6A00;  /* Your brand color */
  --orange-10: #ed5f00;
  --orange-11: #c44d00;
  --orange-12: #4e1c00;
}

.dark {
  --orange-1: #1f1206;
  --orange-9: #ff6a00;
  /* Auto-generated dark mode */
}`;
</script>

<div class="w-full px-4 py-8 sm:py-12 md:container md:mx-auto md:max-w-5xl md:py-16">
  <div class="space-y-16 sm:space-y-24">
    <!-- Hero Section -->
    <section class="space-y-6 text-center">
      <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Generate accessible color palettes from your brand colors
      </h1>
      <p class="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
        Drop 1-7 hex colors, get 31 complete tint scales. Radix-compatible output for Tailwind, Panda CSS, or plain CSS variables.
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-wrap justify-center gap-4 pt-4">
        <a
          href="/playground"
          class="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try the Playground
        </a>
        <a
          href="/docs"
          class="inline-flex items-center justify-center rounded-lg border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Quick Start
        </a>
      </div>

      <!-- Quick Install -->
      <div class="mx-auto max-w-lg pt-4">
        <div class="rounded-lg border bg-card p-4">
          <p class="mb-2 text-sm text-muted-foreground">Install and generate:</p>
          <code class="block rounded bg-muted px-3 py-2 font-mono text-sm">
            npx @sveltopia/colors generate --colors "#FF6A00"
          </code>
        </div>
      </div>
    </section>

    <!-- Palette Preview -->
    <section class="space-y-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold sm:text-3xl">Your Brand, Full Spectrum</h2>
        <p class="mt-2 text-muted-foreground">
          From 3 brand colors to complete light and dark palettes
        </p>
      </div>
      <div class="rounded-xl border bg-card p-4 sm:p-6">
        <PalettePreview />
      </div>
    </section>

    <!-- Features Grid -->
    <section class="space-y-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold sm:text-3xl">Built for Modern Design Systems</h2>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4">
            <Palette class="h-6 w-6 text-primary" />
          </div>
          <h3 class="mb-2 font-semibold">31 Hue Scales</h3>
          <p class="text-sm text-muted-foreground">
            Full Radix Colors compatibility. Your brand colors anchor key scales, baseline colors fill the gaps.
          </p>
        </div>

        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4">
            <Moon class="h-6 w-6 text-primary" />
          </div>
          <h3 class="mb-2 font-semibold">Auto Dark Mode</h3>
          <p class="text-sm text-muted-foreground">
            Light and dark variants generated automatically with perceptually uniform transitions.
          </p>
        </div>

        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4">
            <Accessibility class="h-6 w-6 text-primary" />
          </div>
          <h3 class="mb-2 font-semibold">APCA Contrast</h3>
          <p class="text-sm text-muted-foreground">
            Modern contrast algorithm ensures text readability across all generated scales.
          </p>
        </div>

        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4">
            <Sparkles class="h-6 w-6 text-primary" />
          </div>
          <h3 class="mb-2 font-semibold">P3 Wide Gamut</h3>
          <p class="text-sm text-muted-foreground">
            OKLCH color space with Display P3 support for vivid colors on modern screens.
          </p>
        </div>

        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4">
            <Layers class="h-6 w-6 text-primary" />
          </div>
          <h3 class="mb-2 font-semibold">Multiple Formats</h3>
          <p class="text-sm text-muted-foreground">
            Output as CSS variables, Tailwind preset, or JSON. Works with any framework.
          </p>
        </div>

        <div class="rounded-lg border bg-card p-6">
          <div class="mb-4">
            <Zap class="h-6 w-6 text-primary" />
          </div>
          <h3 class="mb-2 font-semibold">Dev Server</h3>
          <p class="text-sm text-muted-foreground">
            Interactive UI for exploring and adjusting your palette before committing.
          </p>
        </div>
      </div>
    </section>

    <!-- Code Examples -->
    <section class="space-y-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold sm:text-3xl">Simple CLI, Rich Output</h2>
        <p class="mt-2 text-muted-foreground">
          Generate once, use everywhere
        </p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div class="space-y-3">
          <h3 class="font-semibold">Generate your palette</h3>
          <CodeViewer code={generateExample} language="bash" filename="terminal" />
        </div>
        <div class="space-y-3">
          <h3 class="font-semibold">Get production-ready CSS</h3>
          <CodeViewer code={cssOutputExample} language="css" filename="colors.css" />
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="space-y-6">
      <div class="text-center">
        <h2 class="text-2xl font-bold sm:text-3xl">How It Works</h2>
      </div>
      <div class="mx-auto max-w-3xl">
        <ol class="space-y-4">
          <li class="flex gap-4">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span>
            <div>
              <h4 class="font-semibold">Input your brand colors</h4>
              <p class="text-sm text-muted-foreground">1-7 hex colors that define your brand identity.</p>
            </div>
          </li>
          <li class="flex gap-4">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span>
            <div>
              <h4 class="font-semibold">Algorithm finds the best matches</h4>
              <p class="text-sm text-muted-foreground">Each brand color anchors a Radix scale at the perceptually closest hue.</p>
            </div>
          </li>
          <li class="flex gap-4">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</span>
            <div>
              <h4 class="font-semibold">Full scales generated</h4>
              <p class="text-sm text-muted-foreground">12-step tint scales for each hue, light and dark modes, plus semantic tokens.</p>
            </div>
          </li>
          <li class="flex gap-4">
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">4</span>
            <div>
              <h4 class="font-semibold">Export and use</h4>
              <p class="text-sm text-muted-foreground">Drop the output into your project. Compatible with Tailwind, Panda CSS, shadcn/ui, and more.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="rounded-xl border bg-card p-8 text-center sm:p-12">
      <h2 class="text-2xl font-bold sm:text-3xl">Ready to generate your palette?</h2>
      <p class="mt-2 text-muted-foreground">
        Try the playground or jump straight into the CLI.
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-4">
        <a
          href="/playground"
          class="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try the Playground
        </a>
        <a
          href="/docs"
          class="inline-flex items-center justify-center rounded-lg border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Read the Docs
        </a>
      </div>
    </section>
  </div>
</div>
