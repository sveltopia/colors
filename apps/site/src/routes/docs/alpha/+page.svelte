<script lang="ts">
  import CodeViewer from '$lib/components/CodeViewer.svelte';
  import KeyConcept from '$lib/components/KeyConcept.svelte';
  import PrevNext from '$lib/components/PrevNext.svelte';
  import { Lightbulb } from 'lucide-svelte';
</script>

<div class="prose max-w-none dark:prose-invert">
  <h1>Alpha Colors</h1>

  <p class="lead">
    Alpha colors are semi-transparent versions of each palette step. They blend to the same visual
    appearance as the solid color when composited over a standard background.
  </p>

  <h2>What are alpha colors?</h2>

  <p>
    For every solid color in the palette, there's a matching alpha variant (suffixed with
    <code>A</code> in the Radix scale, or using 8-digit hex). The alpha color is a semi-transparent
    RGBA value that, when composited over white (light mode) or black (dark mode), produces the
    exact same visual result as the solid color.
  </p>
</div>

<div class="not-prose mt-4">
  <KeyConcept icon={Lightbulb}>
    <p>
      <strong>Why not just use <code class="rounded bg-muted px-1.5 py-0.5 text-xs">opacity</code>?</strong> CSS
      <code class="rounded bg-muted px-1.5 py-0.5 text-xs">opacity</code> affects the entire element including text, borders,
      and children. Alpha colors only affect the background, and they're calculated to produce the
      correct visual result on the expected background.
    </p>
  </KeyConcept>
</div>

<div class="prose max-w-none dark:prose-invert">
  <h2>When to use alpha colors</h2>

  <ul>
    <li>
      <strong>Overlays</strong> — tinted overlays on images or content that blend naturally
    </li>
    <li>
      <strong>Glassmorphism</strong> — frosted glass effects where content shows through
    </li>
    <li>
      <strong>Tinted backgrounds</strong> — subtle color washes over varying backgrounds
    </li>
    <li>
      <strong>Layered surfaces</strong> — stacking surfaces where underlying content should remain
      visible
    </li>
    <li>
      <strong>Hover/focus states</strong> — transparent tints that work over any background
    </li>
  </ul>

  <h2>How they're generated</h2>

  <p>
    Alpha colors are computed by solving the compositing equation backwards:
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`// Browser compositing formula:
result = background × (1 - alpha) + foreground × alpha

// We solve for foreground + alpha that produces the target solid color
// Light mode: background = white (#FFFFFF)
// Dark mode: background = black (#000000)`}
    language="typescript"
  />
</div>

<div class="prose max-w-none dark:prose-invert">
  <p>
    The computation targets the closest possible RGBA match in sRGB (0–255 precision). P3
    wide-gamut versions are also generated for modern displays.
  </p>

  <h2>Using alpha colors</h2>

  <h3>CSS custom properties</h3>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`/* Solid color */
.card {
  background-color: var(--color-blue-3);
}

/* Alpha version - blends with whatever is behind it */
.card-overlay {
  background-color: var(--color-blue-a3);
}

/* Great for hover states over images */
.image-overlay:hover {
  background-color: var(--color-blue-a5);
}`}
    language="css"
  />
</div>

<div class="prose max-w-none dark:prose-invert">
  <h3>With Radix export</h3>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { blueA } from './colors/radix-colors.js';

// blueA.blueA3 = 'rgba(0, 100, 255, 0.08)'
element.style.backgroundColor = blueA.blueA3;`}
    language="typescript"
  />
</div>

<div class="prose max-w-none dark:prose-invert">
  <h2>Formats</h2>

  <p>
    Alpha colors are included in the following export formats:
  </p>

  <ul>
    <li><strong>CSS</strong> — as 8-digit hex values (e.g., <code>#0064FF14</code>)</li>
    <li><strong>JSON</strong> — includes hex and P3 alpha formats</li>
    <li><strong>Radix</strong> — named exports like <code>blueA</code>, <code>orangeA</code></li>
    <li><strong>Panda CSS</strong> — included in the preset</li>
  </ul>

  <p>
    The CSS and JSON exports include alpha colors by default. Use the
    <code>includeAlpha</code> option to control this in the programmatic API.
  </p>
</div>

<div class="mt-12">
  <PrevNext
    prev={{ label: 'Color Theory', href: '/docs/color-theory' }}
    next={{ label: 'Accessibility', href: '/docs/accessibility' }}
  />
</div>
