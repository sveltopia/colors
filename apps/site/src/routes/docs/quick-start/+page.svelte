<script lang="ts">
  import CodeViewer from '$lib/components/CodeViewer.svelte';
  import KeyConcept from '$lib/components/KeyConcept.svelte';
  import PrevNext from '$lib/components/PrevNext.svelte';
  import { Info } from 'lucide-svelte';
</script>

<div class="prose max-w-none dark:prose-invert">
  <h1>Quick Start</h1>

  <h2>1. Generate your palette</h2>

  <p>
    Run the generator with <code>npx</code> &mdash; no install needed. The CLI will walk you through
    choosing your brand colors, output formats, and directory:
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer code="npx @sveltopia/colors generate" language="bash" />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <p>
    Or pass everything as flags for a one-liner (up to 7 hex colors):
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer code='npx @sveltopia/colors generate --colors "#FF6A00,#43A047" --format tailwind,shadcn' language="bash" />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <p>
    This generates a full palette in <code>./colors/</code> with CSS and JSON by default. Add
    <code>--format</code> to generate framework-specific files. See the
    <a href="/docs/cli">CLI Reference</a> for all flags.
  </p>
</div>

<div class="not-prose mt-4">
  <KeyConcept icon={Info}>
    <p>
      <strong>Want to add it to your project?</strong> Install as a dev dependency with
      <code class="rounded bg-muted px-1.5 py-0.5 text-xs">npm install -D @sveltopia/colors</code>
      to pin a version and make it available to your team. The <code class="rounded bg-muted px-1.5 py-0.5 text-xs">npx</code> commands above
      still work &mdash; they'll use the local install instead of downloading each time.
    </p>
  </KeyConcept>
</div>

<div class="prose max-w-none dark:prose-invert">
  <h2>2. Use your colors</h2>

  <p>Import the generated CSS into your project's main stylesheet:</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`/* Your main stylesheet (e.g., app.css, globals.css) */
@import './colors/colors.css';`}
    language="css"
  />
</div>

<div class="not-prose mt-4">
  <KeyConcept icon={Info}>
    <p>
      Using Tailwind or shadcn? The <a href="/docs/frameworks" class="font-medium text-primary-800 underline hover:text-primary-700 dark:text-primary-600 dark:hover:text-primary-500">Frameworks</a> guide covers how to import your generated palette so it cleanly replaces the default framework colors.
    </p>
  </KeyConcept>
</div>

<div class="prose max-w-none dark:prose-invert">
  <p>Then use the colors as CSS custom properties or Tailwind classes:</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`<!-- CSS custom properties (from colors.css) -->
<div style="background-color: var(--orange-3); color: var(--orange-11);">
  Brand surface with accessible text
</div>

<!-- Tailwind classes (from --format tailwind) -->
<div class="bg-orange-200 text-orange-900">
  Brand surface with accessible text
</div>`}
    language="html"
  />
</div>

<div class="mt-12">
  <PrevNext
    prev={{ label: 'Introduction', href: '/docs' }}
    next={{ label: 'CLI Reference', href: '/docs/cli' }}
  />
</div>
