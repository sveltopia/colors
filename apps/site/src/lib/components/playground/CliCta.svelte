<script lang="ts">
  import { Terminal, BookOpen } from 'lucide-svelte';

  interface Props {
    brandColors: string[];
  }

  let { brandColors }: Props = $props();

  // Generate CLI command
  const cliCommand = $derived(() => {
    const colorsArg = brandColors.join(',');
    return `npx @sveltopia/colors generate --colors "${colorsArg}"`;
  });
</script>

<div class="rounded-lg border bg-card p-6">
  <div class="flex items-center gap-2 mb-4">
    <Terminal class="h-5 w-5 text-muted-foreground" />
    <h3 class="font-semibold">Use the Library</h3>
  </div>

  <p class="mb-4 text-sm text-muted-foreground">
    Generate this palette for your project with a single command.
  </p>

  <!-- CLI command display -->
  <div class="mb-6 rounded-md bg-muted p-4">
    <code class="block whitespace-pre-wrap break-all font-mono text-sm">
      {cliCommand()}
    </code>
  </div>

  <!-- CTA buttons -->
  <div class="flex flex-wrap gap-3">
    <a
      href="/docs"
      class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
    >
      <Terminal class="h-4 w-4" />
      Get Started
    </a>
    <a
      href="/docs"
      class="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
    >
      <BookOpen class="h-4 w-4" />
      Read the Docs
    </a>
  </div>
</div>
