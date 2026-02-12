<script lang="ts">
  import CodeViewer from '$lib/components/CodeViewer.svelte';
  import KeyConcept from '$lib/components/KeyConcept.svelte';
  import PrevNext from '$lib/components/PrevNext.svelte';
  import { Info } from 'lucide-svelte';
</script>

<div class="prose max-w-none dark:prose-invert">
  <h1>Quick Start</h1>

  <p class="lead">
    Get from zero to a working color palette in three steps.
  </p>

  <h2>1. Install</h2>
</div>

<div class="not-prose mt-4">
  <CodeViewer code="npm install @sveltopia/colors" language="bash" />
</div>

<div class="prose max-w-none dark:prose-invert">
  <h2>2. Generate your palette</h2>

  <p>
    Pass your brand color(s) to the CLI. You can provide up to 7 hex colors.
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer code='npx @sveltopia/colors generate --colors "#FF4F00"' language="bash" />
</div>

<div class="not-prose mt-4">
  <KeyConcept icon={Info}>
    <p>
      <strong>Prefer interactive mode?</strong> Run <code class="rounded bg-muted px-1.5 py-0.5 text-xs">npx @sveltopia/colors generate</code> without flags
      and the CLI will walk you through color selection, format choices, and output directory.
    </p>
  </KeyConcept>
</div>

<div class="prose max-w-none dark:prose-invert">
  <p>
    This generates a full palette in <code>./colors/</code> with CSS and JSON by default. To also
    generate framework-specific files:
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code='npx @sveltopia/colors generate --colors "#FF4F00" --format tailwind,shadcn'
    language="bash"
  />
</div>

<div class="prose max-w-none dark:prose-invert">
  <h2>3. Use your colors</h2>

  <p>Import the generated CSS into your app:</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`/* app.css */
@import './colors/colors.css';`}
    language="css"
    filename="app.css"
  />
</div>

<div class="prose max-w-none dark:prose-invert">
  <p>Then use the colors as CSS custom properties or Tailwind classes:</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`<!-- CSS custom properties -->
<div style="background-color: var(--color-orange-3); color: var(--color-orange-11);">
  Brand surface with accessible text
</div>

<!-- Tailwind classes (if using --format tailwind) -->
<div class="bg-orange-300 text-orange-950">
  Brand surface with accessible text
</div>`}
    language="html"
  />
</div>

<div class="prose max-w-none dark:prose-invert">
  <h2>What's next?</h2>

  <ul>
    <li>
      <a href="/docs/cli">CLI Reference</a> — all flags and config file options
    </li>
    <li>
      <a href="/docs/frameworks">Frameworks</a> — detailed Tailwind and shadcn/ui integration
    </li>
    <li>
      <a href="/docs/color-theory">Color Theory</a> — understand the system behind the scales
    </li>
  </ul>
</div>

<div class="mt-12">
  <PrevNext
    prev={{ label: 'Introduction', href: '/docs' }}
    next={{ label: 'CLI Reference', href: '/docs/cli' }}
  />
</div>
