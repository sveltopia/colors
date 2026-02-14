<script lang="ts">
  import { onMount } from 'svelte';
  import { Copy, Check } from 'lucide-svelte';
  import { codeToHtml } from 'shiki';

  interface Props {
    code: string;
    language?: string;
    filename?: string;
  }

  let { code, language = 'bash', filename }: Props = $props();

  let highlightedCode = $state('');
  let copied = $state(false);

  onMount(async () => {
    highlightedCode = await codeToHtml(code, {
      lang: language,
      theme: 'github-dark'
    });
  });

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<!-- Force dark mode for code blocks using our Sveltopia Colors palette -->
<div class="code-viewer dark not-prose min-w-0 max-w-full overflow-hidden rounded-lg border border-border bg-background mb-6">
  <div
    class="flex items-center justify-between border-b border-border bg-card px-3 py-2 md:px-4"
  >
    <div class="flex items-center gap-2">
      {#if filename}
        <span class="truncate font-mono text-xs text-muted-foreground md:text-sm">{filename}</span>
      {:else}
        <span class="font-mono text-xs text-muted-foreground md:text-sm">{language}</span>
      {/if}
    </div>
    <button
      onclick={copyCode}
      class="flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded px-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
    >
      {#if copied}
        <Check class="h-4 w-4" />
        <span class="hidden text-xs sm:inline">Copied!</span>
      {:else}
        <Copy class="h-4 w-4" />
        <span class="hidden text-xs sm:inline">Copy</span>
      {/if}
    </button>
  </div>

  <div class="overflow-x-auto">
    {#if highlightedCode}
      <div class="shiki-wrapper">
        {@html highlightedCode}
      </div>
    {:else}
      <pre class="p-4 font-mono text-sm text-muted-foreground"><code>{code}</code></pre>
    {/if}
  </div>
</div>

<style>
  .shiki-wrapper :global(pre) {
    margin: 0;
    padding: 1rem 0.75rem;
    background: transparent !important;
    overflow-x: auto;
    line-height: 1.5;
  }

  @media (min-width: 768px) {
    .shiki-wrapper :global(pre) {
      padding: 1.5rem 1rem;
    }
  }

  .shiki-wrapper :global(code) {
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 0.75rem;
    display: block;
  }

  @media (min-width: 768px) {
    .shiki-wrapper :global(code) {
      font-size: 0.875rem;
    }
  }
</style>
