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

<div class="prose mt-6 max-w-none dark:prose-invert">
  <h2>When to use alpha colors</h2>

  <ul>
    <li>
      <strong>Overlays</strong> &mdash; tinted overlays on images or content that blend naturally
    </li>
    <li>
      <strong>Glassmorphism</strong> &mdash; frosted glass effects where content shows through
    </li>
    <li>
      <strong>Tinted backgrounds</strong> &mdash; subtle color washes over varying backgrounds
    </li>
    <li>
      <strong>Layered surfaces</strong> &mdash; stacking surfaces where underlying content should remain
      visible
    </li>
    <li>
      <strong>Hover/focus states</strong> &mdash; transparent tints that work over any background
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

<div class="prose mt-6 max-w-none dark:prose-invert">
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

<div class="prose mt-6 max-w-none dark:prose-invert">
  <p class="text-sm text-muted-foreground">
    These examples use the default CSS export naming (Radix 1–12 steps). If you're using the Tailwind export, the equivalent of <code>--color-blue-3</code> would be <code>--color-blue-200</code>. See the <a href="/docs/color-theory#the-radix-12-step-scale">Radix 12-step scale</a> for the full step mapping.
  </p>

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

<div class="prose mt-6 max-w-none dark:prose-invert">
  <h2>Formats</h2>

  <p>
    Alpha colors are included in the following export formats:
  </p>

  <ul>
    <li><strong>CSS</strong> &mdash; as 8-digit hex values (e.g., <code>#0064FF14</code>)</li>
    <li><strong>JSON</strong> &mdash; includes hex and P3 alpha formats</li>
    <li><strong>Radix</strong> &mdash; named exports like <code>blueA</code>, <code>orangeA</code></li>
    <li><strong>Panda CSS</strong> &mdash; included in the preset</li>
  </ul>

  <h3>What about Tailwind?</h3>

  <p>
    Tailwind's built-in opacity modifier (<code>bg-blue-200/20</code>) gives you runtime alpha
    control over every color in your palette &mdash; no special export needed. For most use cases
    (hover states, overlays, tinted backgrounds), this is all you need.
  </p>

  <p>
    The pre-computed alpha variants above are a different thing: mathematically solved RGBA values
    that produce an <em>exact visual match</em> to the solid color when composited over a known
    background (white in light mode, black in dark mode). These are primarily useful in the CSS,
    JSON, and Radix exports for projects that need precise alpha-composite matching. Use the
    <code>includeAlpha</code> option to control this in the programmatic API.
  </p>
</div>

<div class="mt-12">
  <PrevNext
    prev={{ label: 'Color Theory', href: '/docs/color-theory' }}
    next={{ label: 'Accessibility', href: '/docs/accessibility' }}
  />
</div>
