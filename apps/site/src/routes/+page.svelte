<script lang="ts">
  // Landing page placeholder - will be expanded in SVE-191
</script>

<div class="container mx-auto px-4 py-16">
  <div class="mx-auto max-w-3xl text-center">
    <h1 class="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
      Generate complete, accessible color palettes from your brand colors
    </h1>
    <p class="mb-8 text-lg text-muted-foreground">
      Drop-in compatible with Radix Colors, Tailwind CSS, and Panda CSS.
      31 hue scales from 1-7 brand colors. APCA-compliant contrast, P3 wide gamut.
    </p>

    <div class="mb-12 flex flex-wrap justify-center gap-4">
      <a
        href="/playground"
        class="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Try the Playground
      </a>
      <a
        href="/docs"
        class="inline-flex items-center justify-center rounded-lg border bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
      >
        Quick Start
      </a>
    </div>

    <div class="rounded-lg border bg-card p-4 text-left">
      <p class="mb-2 text-sm text-muted-foreground">Install and generate:</p>
      <code class="block rounded bg-muted p-3 font-mono text-sm">
        npx @sveltopia/colors generate --colors "#FF6A00"
      </code>
    </div>
  </div>
</div>
