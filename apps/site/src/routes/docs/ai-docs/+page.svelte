<script lang="ts">
  import PrevNext from '$lib/components/PrevNext.svelte';
  import { FileText, Download, ExternalLink, Bot, Sparkles } from 'lucide-svelte';
</script>

<div class="prose max-w-none dark:prose-invert">
  <h1>AI-Optimized Documentation</h1>
  <p class="lead">
    Machine-readable documentation for AI assistants, coding copilots, and LLM-powered tools.
  </p>

  <div class="not-prose mb-8 rounded-lg border border-primary-800/20 bg-primary-800/5 p-6">
    <div class="flex items-start gap-4">
      <div class="rounded-lg bg-primary-800/10 p-2">
        <Bot class="h-6 w-6 text-primary-800 dark:text-primary-600" />
      </div>
      <div>
        <h2 class="mb-2 text-lg font-semibold">What is llms.txt?</h2>
        <p class="text-sm text-muted-foreground">
          The <code class="not-prose">llms.txt</code> convention provides AI assistants with structured,
          plain-text documentation optimized for context windows. This helps tools like Claude, ChatGPT,
          GitHub Copilot, and Cursor understand how to use @sveltopia/colors correctly.
        </p>
      </div>
    </div>
  </div>

  <h2>Available Files</h2>

  <div class="not-prose mb-8 grid gap-4 md:grid-cols-2">
    <a
      href="/llms.txt"
      target="_blank"
      class="group block rounded-lg border p-6 transition-all hover:border-primary-800/50 hover:bg-primary-800/5"
    >
      <div class="mb-4 flex items-start justify-between">
        <div class="rounded-lg bg-primary-800/10 p-2">
          <FileText class="h-6 w-6 text-primary-800 dark:text-primary-600" />
        </div>
        <ExternalLink
          class="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
      <h3 class="mb-2 text-lg font-semibold">llms.txt</h3>
      <p class="mb-3 text-sm text-muted-foreground">
        Quick overview with core concepts, installation, and links to detailed documentation.
      </p>
      <span class="text-xs text-muted-foreground">~1KB &mdash; Best for quick context</span>
    </a>

    <a
      href="/llms-full.txt"
      target="_blank"
      class="group block rounded-lg border p-6 transition-all hover:border-primary-800/50 hover:bg-primary-800/5"
    >
      <div class="mb-4 flex items-start justify-between">
        <div class="rounded-lg bg-primary-800/10 p-2">
          <Sparkles class="h-6 w-6 text-primary-800 dark:text-primary-600" />
        </div>
        <ExternalLink
          class="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
      <h3 class="mb-2 text-lg font-semibold">llms-full.txt</h3>
      <p class="mb-3 text-sm text-muted-foreground">
        Complete reference with all APIs, export formats, CLI usage, and accessibility guidelines.
      </p>
      <span class="text-xs text-muted-foreground">~8KB &mdash; Full documentation</span>
    </a>
  </div>

  <h2>How to Use</h2>

  <div class="not-prose space-y-4">
    <div class="rounded-lg border p-4">
      <h3 class="mb-2 font-semibold">With Claude, ChatGPT, or similar</h3>
      <p class="mb-3 text-sm text-muted-foreground">
        Paste the contents of <code class="not-prose">llms-full.txt</code> into your conversation, or
        ask the AI to fetch it:
      </p>
      <div class="rounded bg-muted p-3 font-mono text-sm">
        "Read https://colors.sveltopia.dev/llms-full.txt and help me generate a brand palette"
      </div>
    </div>

    <div class="rounded-lg border p-4">
      <h3 class="mb-2 font-semibold">With Cursor or VS Code + Copilot</h3>
      <p class="mb-3 text-sm text-muted-foreground">
        Add to your project's AI context or reference the URL in your prompt:
      </p>
      <div class="rounded bg-muted p-3 font-mono text-sm">
        @https://colors.sveltopia.dev/llms-full.txt
      </div>
    </div>

    <div class="rounded-lg border p-4">
      <h3 class="mb-2 font-semibold">Download for offline use</h3>
      <p class="mb-3 text-sm text-muted-foreground">
        Save locally and include in your project's documentation context:
      </p>
      <div class="flex gap-2">
        <a
          href="/llms.txt"
          download="llms.txt"
          class="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <Download class="h-4 w-4" />
          llms.txt
        </a>
        <a
          href="/llms-full.txt"
          download="llms-full.txt"
          class="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          <Download class="h-4 w-4" />
          llms-full.txt
        </a>
      </div>
    </div>
  </div>

  <h2>What's Included</h2>

  <p>The full documentation covers:</p>

  <ul>
    <li><strong>Installation & CLI</strong> &mdash; Generate and dev commands, interactive mode, config files</li>
    <li><strong>12-Step Scale System</strong> &mdash; Radix step semantics, Tailwind mapping, safe color pairings</li>
    <li><strong>Export Formats</strong> &mdash; CSS, JSON, Tailwind v4, Tailwind v3, shadcn, Radix, Panda CSS</li>
    <li><strong>Programmatic API</strong> &mdash; generatePalette, analyzeBrandColors, all export functions</li>
    <li><strong>Accessibility</strong> &mdash; APCA validation, contrast thresholds, auto-remediation</li>
    <li><strong>Key Types</strong> &mdash; Palette, Scale, TuningProfile, ContrastReport</li>
    <li><strong>Common Patterns</strong> &mdash; Generate + export workflows, CI validation, brand analysis</li>
  </ul>

  <h2>About the Convention</h2>

  <p>
    The <code>llms.txt</code> convention was popularized by the AI development community as a way to provide
    documentation that's optimized for LLM context windows. Unlike HTML documentation, these plain-text
    files:
  </p>

  <ul>
    <li>Use minimal tokens (no HTML/CSS overhead)</li>
    <li>Include complete code examples</li>
    <li>Follow a consistent, parseable structure</li>
    <li>Can be easily fetched and included in AI prompts</li>
  </ul>
</div>

<div class="mt-12">
  <PrevNext prev={{ label: 'API Reference', href: '/docs/api-reference' }} />
</div>
