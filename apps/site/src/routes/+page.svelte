<script lang="ts">
  import CodeViewer from '$lib/components/CodeViewer.svelte';
  import PalettePreview from '$lib/components/PalettePreview.svelte';
  import HueSpectrum from '$lib/components/HueSpectrum.svelte';
  import { Palette, Moon, Accessibility, Layers, Sparkles, Zap, ArrowDown } from 'lucide-svelte';

  const generateExample = `npx @sveltopia/colors generate \\
  --colors "#FF6A00,#43A047,#1A1A1A" \\
  --format css \\
  --output src/lib/colors

# ✓ Analyzed 3 brand colors
# ✓ Generated 31 scales (light + dark)
# ✓ Wrote src/lib/colors/colors.css`;

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

  const features = [
    {
      icon: Palette,
      title: '31 Hue Scales',
      description: 'Full Radix Colors compatibility. Your brand colors anchor key scales, baseline colors fill the gaps.',
      color: 'orange'
    },
    {
      icon: Moon,
      title: 'Auto Dark Mode',
      description: 'Light and dark variants generated automatically with perceptually uniform transitions.',
      color: 'blue'
    },
    {
      icon: Accessibility,
      title: 'APCA Contrast',
      description: 'Modern contrast algorithm ensures text readability across all generated scales.',
      color: 'purple'
    },
    {
      icon: Sparkles,
      title: 'P3 Wide Gamut',
      description: 'OKLCH color space with Display P3 support for vivid colors on modern screens.',
      color: 'green'
    },
    {
      icon: Layers,
      title: 'Multiple Formats',
      description: 'Output as CSS variables, Tailwind preset, or JSON. Works with any framework.',
      color: 'cyan'
    },
    {
      icon: Zap,
      title: 'Dev Server',
      description: 'Interactive UI for exploring and adjusting your palette before committing.',
      color: 'pink'
    }
  ];

  function getColorClasses(color: string) {
    const classes: Record<string, { iconBg: string; icon: string }> = {
      orange: { iconBg: 'bg-orange-200 dark:bg-orange-300/20', icon: 'text-orange-800' },
      blue: { iconBg: 'bg-blue-200 dark:bg-blue-300/20', icon: 'text-blue-800' },
      purple: { iconBg: 'bg-purple-200 dark:bg-purple-300/20', icon: 'text-purple-800' },
      green: { iconBg: 'bg-green-200 dark:bg-green-300/20', icon: 'text-green-800' },
      cyan: { iconBg: 'bg-cyan-200 dark:bg-cyan-300/20', icon: 'text-cyan-800' },
      pink: { iconBg: 'bg-pink-200 dark:bg-pink-300/20', icon: 'text-pink-800' }
    };
    return classes[color] || classes.orange;
  }
</script>

<!-- Hero Section — subtle warm tint -->
<section class="bg-orange-500/30 dark:bg-gray-100">
  <div class="w-full px-4 py-10 sm:py-12 md:container md:mx-auto md:max-w-5xl md:py-20">
    <div class="space-y-6 text-center">
      <h1 class="font-serif text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Generate <span class="bg-linear-to-r from-grass-850 to-grass-700 bg-clip-text text-transparent">accessible</span> <span class="bg-linear-to-r from-orange-800 to-orange-900 bg-clip-text text-transparent">color palettes</span> from your brand
      </h1>
      <p class="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
        Provide your brand colors, get 31 complete tint scales tuned to your identity. Radix-compatible output for Tailwind, shadcn/ui, Panda CSS, or CSS variables.
      </p>

      <div class="flex flex-wrap justify-center gap-4 pt-4">
        <a
          href="/playground"
          class="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try the Playground
        </a>
        <a
          href="/docs/quick-start"
          class="inline-flex items-center justify-center rounded-lg border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-secondary"
        >
          Quick Start
        </a>
      </div>

      <div class="mx-auto max-w-lg pt-4">
        <div class="rounded-lg border bg-card p-4">
          <p class="mb-2 text-sm text-muted-foreground">Generate your palette:</p>
          <code class="block rounded bg-muted px-3 py-2 font-mono text-sm">
            npx @sveltopia/colors generate
          </code>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Palette Preview — white (the palette IS the color) -->
<section class="w-full px-4 py-16 sm:py-24 md:container md:mx-auto md:max-w-5xl">
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="mb-6 font-serif text-2xl font-bold sm:text-3xl">Your Project Colors Should Look Like <em>You</em></h2>
    </div>

    <div class="flex flex-col items-center gap-3">
      <div class="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Input:</span>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <div class="h-8 w-8 rounded-lg shadow-md" style="background-color: #43A047;"></div>
            <span class="hidden font-mono sm:inline">#43A047</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="h-8 w-8 rounded-lg shadow-md" style="background-color: #FF6A00;"></div>
            <span class="hidden font-mono sm:inline">#FF6A00</span>
          </div>
          <div class="flex items-center gap-1.5">
            <div class="h-8 w-8 rounded-lg shadow-md" style="background-color: #1A1A1A;"></div>
            <span class="hidden font-mono sm:inline">#1A1A1A</span>
          </div>
        </div>
      </div>

      <ArrowDown class="h-5 w-5 text-muted-foreground" />

      <span class="text-xs text-muted-foreground">Output: 31 tuned scales (3 anchored to your brand + 28 baseline hues)</span>
    </div>

    <div class="rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
      <PalettePreview />

      <div class="my-6 border-t border-border"></div>

      <p class="mb-3 text-center text-sm text-muted-foreground">
        Plus 28 more hues, all tuned to your brand
      </p>
      <HueSpectrum />
    </div>
  </div>
</section>

<!-- Features Grid — tinted background -->
<section class="bg-gray-100">
  <div class="w-full px-4 py-16 sm:py-24 md:container md:mx-auto md:max-w-5xl">
    <div class="space-y-6">
      <div class="text-center">
        <h2 class="mb-16 font-serif text-2xl font-bold sm:text-3xl">Built for Modern Design Systems</h2>
      </div>
      <div class="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-12 lg:grid-cols-3">
        {#each features as feature (feature.title)}
          {@const colors = getColorClasses(feature.color)}
          {@const Icon = feature.icon}
          <div class="group">
            <div class="mb-4 inline-flex rounded-xl p-3 {colors.iconBg}">
              <Icon class="h-7 w-7 {colors.icon}" />
            </div>
            <h3 class="mb-2 font-semibold">{feature.title}</h3>
            <p class="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>

<!-- Code Examples — white -->
<section class="w-full px-4 py-16 sm:py-24 md:container md:mx-auto md:max-w-5xl">
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="mb-16 font-serif text-2xl font-bold sm:text-3xl">Simple CLI, Production-Ready CSS</h2>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="flex min-w-0 flex-col gap-3">
        <h3 class="font-semibold">Generate your palette</h3>
        <div class="min-w-0 flex-1 [&>.code-viewer]:mb-0 [&>.code-viewer]:h-full [&>.code-viewer]:flex [&>.code-viewer]:flex-col [&>.code-viewer_.overflow-x-auto]:flex-1">
          <CodeViewer code={generateExample} language="bash" filename="terminal" />
        </div>
      </div>
      <div class="flex min-w-0 flex-col gap-3">
        <h3 class="font-semibold">Drop the CSS into your project</h3>
        <div class="min-w-0 flex-1 [&>.code-viewer]:mb-0 [&>.code-viewer]:h-full [&>.code-viewer]:flex [&>.code-viewer]:flex-col [&>.code-viewer_.overflow-x-auto]:flex-1">
          <CodeViewer code={cssOutputExample} language="css" filename="colors.css" />
        </div>
      </div>
    </div>
  </div>
</section>

<section class="relative overflow-hidden">
  <div
    class="absolute inset-0 dark:hidden"
    style="background: linear-gradient(135deg, var(--color-grass-850), var(--color-grass-900));"
  ></div>
  <!-- Dark mode gradient -->
  <div
    class="absolute inset-0 hidden dark:block"
    style="background: linear-gradient(135deg, var(--color-grass-600), var(--color-grass-700));"
  ></div>

  <!-- Decorative blur circles -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute left-1/4 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-white blur-3xl"></div>
    <div class="absolute bottom-0 right-1/4 h-64 w-64 translate-y-1/2 rounded-full bg-white blur-3xl"></div>
  </div>

  <div class="relative px-4 py-16 sm:py-24 md:container md:mx-auto md:max-w-5xl">
    <div class="text-center">
      <h2 class="font-serif text-3xl font-bold text-white sm:text-4xl">How It Works</h2>
    </div>

    <div class="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
      <div class="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
        <div class="mb-3 flex items-center gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">1</span>
          <h4 class="font-semibold text-white">Input your brand colors</h4>
        </div>
        <p class="text-sm text-white/80">1-7 hex colors that define your brand identity.</p>
      </div>

      <div class="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
        <div class="mb-3 flex items-center gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">2</span>
          <h4 class="font-semibold text-white">Algorithm finds best matches</h4>
        </div>
        <p class="text-sm text-white/80">Each brand color anchors a Radix scale at the perceptually closest hue. If no close match exists, a custom scale is generated.</p>
      </div>

      <div class="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
        <div class="mb-3 flex items-center gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">3</span>
          <h4 class="font-semibold text-white">Full scales generated</h4>
        </div>
        <p class="text-sm text-white/80">12-step tint scales for each hue, tuned to your brand color profiles, light/dark modes, plus semantic tokens.</p>
      </div>

      <div class="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
        <div class="mb-3 flex items-center gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold text-white">4</span>
          <h4 class="font-semibold text-white">Export and use</h4>
        </div>
        <p class="text-sm text-white/80">Drop the output into your project. Compatible with Tailwind, Panda CSS, shadcn/ui, and more.</p>
      </div>
    </div>
  </div>
</section>

<!-- Bottom CTA — forced dark section -->
<section class="dark relative overflow-hidden bg-gray-50">
  <!-- Ambient primary glow -->
  <div
    class="absolute left-1/2 top-0 h-96 w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-2xl"
    style="background: radial-gradient(circle, var(--color-primary-800), transparent);"
  ></div>

  <div class="relative px-4 py-16 sm:py-24 md:container md:mx-auto md:max-w-5xl">
    <div class="space-y-8 text-center">
      <div>
        <h2 class="font-serif text-2xl font-bold text-gray-950 sm:text-3xl">One command yields a complete palette</h2>
        <div class="mt-4">
          <code class="inline-block rounded-lg bg-gray-200 px-4 py-2 font-mono text-sm text-gray-950">
            npx @sveltopia/colors generate
          </code>
        </div>
      </div>

      <div>
        <h3 class="font-serif text-xl font-bold text-gray-950 sm:text-2xl">Or use the dev server to experiment</h3>
        <div class="mt-4">
          <code class="inline-block rounded-lg bg-gray-200 px-4 py-2 font-mono text-sm text-gray-950">
            npx @sveltopia/colors dev
          </code>
        </div>
      </div>
    </div>

    <div class="mt-8 flex flex-wrap justify-center gap-4">
      <a
        href="/playground"
        class="inline-flex items-center justify-center rounded-lg bg-primary-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-850"
      >
        Try the Playground
      </a>
      <a
        href="/docs"
        class="inline-flex items-center justify-center rounded-lg border border-gray-500 px-6 py-3 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-200"
      >
        Read the Docs
      </a>
    </div>
  </div>
</section>
