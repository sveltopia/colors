<script lang="ts">
  import CodeViewer from '$lib/components/CodeViewer.svelte';
  import KeyConcept from '$lib/components/KeyConcept.svelte';
  import PrevNext from '$lib/components/PrevNext.svelte';
  import { CheckCircle, XCircle, Shield } from 'lucide-svelte';
</script>

<div class="prose max-w-none dark:prose-invert">
  <h1>Accessibility</h1>

  <p class="lead">
    Every color in a Sveltopia palette is APCA-validated. But knowing <em>which</em> colors to
    pair together is just as important as having accessible colors available.
  </p>

  <h2>Step semantics</h2>

  <p>
    Each step in the 12-step scale has a designed purpose and an accessibility contract. Using steps
    for their intended purpose ensures accessible results:
  </p>

  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>Steps</th>
          <th>Tailwind</th>
          <th>Purpose</th>
          <th>Accessibility contract</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1–2</td>
          <td>50–100</td>
          <td>Backgrounds</td>
          <td>Safe as backgrounds for steps 11–12 text</td>
        </tr>
        <tr>
          <td>3–5</td>
          <td>200–400</td>
          <td>Interactive surfaces</td>
          <td>Safe as backgrounds for step 12 text</td>
        </tr>
        <tr>
          <td>6–7</td>
          <td>500–600</td>
          <td>Borders</td>
          <td>Sufficient contrast against backgrounds (steps 1–2)</td>
        </tr>
        <tr>
          <td>8–10</td>
          <td>700–850</td>
          <td>Solid fills</td>
          <td>White/contrast text is accessible on these backgrounds</td>
        </tr>
        <tr>
          <td>11–12</td>
          <td>900–950</td>
          <td>Text</td>
          <td>Accessible on background steps 1–5</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h2>Safe combinations</h2>

  <p>
    These pairings are guaranteed to meet APCA contrast thresholds:
  </p>
</div>

<div class="not-prose mt-4 space-y-3">
  <div class="flex items-start gap-3 rounded-lg bg-green-500/5 p-4">
    <CheckCircle class="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
    <div class="text-sm text-foreground">
      <strong>Text on backgrounds</strong> — Steps 11–12 text on steps 1–2 backgrounds
      <span class="text-muted-foreground">(e.g., <code class="rounded bg-muted px-1.5 py-0.5 text-xs">text-orange-950</code> on <code class="rounded bg-muted px-1.5 py-0.5 text-xs">bg-orange-50</code>)</span>
    </div>
  </div>

  <div class="flex items-start gap-3 rounded-lg bg-green-500/5 p-4">
    <CheckCircle class="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
    <div class="text-sm text-foreground">
      <strong>Text on surfaces</strong> — Step 12 text on steps 3–5 backgrounds
      <span class="text-muted-foreground">(e.g., <code class="rounded bg-muted px-1.5 py-0.5 text-xs">text-blue-950</code> on <code class="rounded bg-muted px-1.5 py-0.5 text-xs">bg-blue-200</code>)</span>
    </div>
  </div>

  <div class="flex items-start gap-3 rounded-lg bg-green-500/5 p-4">
    <CheckCircle class="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
    <div class="text-sm text-foreground">
      <strong>White text on solids</strong> — White text on steps 8–10
      <span class="text-muted-foreground">(e.g., white text on <code class="rounded bg-muted px-1.5 py-0.5 text-xs">bg-orange-800</code>)</span>
    </div>
  </div>

  <div class="flex items-start gap-3 rounded-lg bg-green-500/5 p-4">
    <CheckCircle class="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
    <div class="text-sm text-foreground">
      <strong>Borders on backgrounds</strong> — Steps 6–7 borders on steps 1–2 backgrounds
      <span class="text-muted-foreground">(e.g., <code class="rounded bg-muted px-1.5 py-0.5 text-xs">border-blue-600</code> on <code class="rounded bg-muted px-1.5 py-0.5 text-xs">bg-blue-50</code>)</span>
    </div>
  </div>
</div>

<div class="prose max-w-none dark:prose-invert">
  <h3>Avoid these pairings</h3>
</div>

<div class="not-prose mt-4 space-y-3">
  <div class="flex items-start gap-3 rounded-lg bg-red-500/5 p-4">
    <XCircle class="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
    <div class="text-sm text-foreground">
      <strong>Adjacent steps as text/background</strong> — Steps that are close in lightness (e.g., step
      6 text on step 5 background)
    </div>
  </div>

  <div class="flex items-start gap-3 rounded-lg bg-red-500/5 p-4">
    <XCircle class="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
    <div class="text-sm text-foreground">
      <strong>Light text on light backgrounds</strong> — Steps 1–5 text on steps 1–5 backgrounds
    </div>
  </div>

  <div class="flex items-start gap-3 rounded-lg bg-red-500/5 p-4">
    <XCircle class="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
    <div class="text-sm text-foreground">
      <strong>Dark text on dark backgrounds</strong> — Steps 8–12 text on steps 8–12 backgrounds
    </div>
  </div>
</div>

<div class="prose max-w-none dark:prose-invert">
  <h2>Why APCA over WCAG 2.x?</h2>

  <p>
    WCAG 2.x's contrast ratio algorithm has known issues:
  </p>

  <ul>
    <li>
      It treats dark-on-light and light-on-dark identically, but human perception doesn't
    </li>
    <li>
      It doesn't account for font size — a huge heading needs less contrast than 12px body text
    </li>
    <li>
      It produces false positives (passing combinations that are hard to read) and false negatives
      (failing combinations that are perfectly readable)
    </li>
  </ul>

  <p>
    APCA (Accessible Perceptual Contrast Algorithm) addresses all of these. It's being developed
    for WCAG 3 and produces results that better match how humans actually perceive contrast.
  </p>

  <h2>How validation works</h2>

  <p>
    During palette generation, every step in every scale is validated:
  </p>

  <ol>
    <li>
      Text steps (11–12) are checked against background steps (1–2) for body text contrast (APCA
      &ge; 75)
    </li>
    <li>
      Solid fill steps (8–10) are checked for white/contrast text readability (APCA &ge; 60)
    </li>
    <li>
      Border steps (6–7) are checked against backgrounds for decorative contrast (APCA &ge; 45)
    </li>
    <li>
      If any step fails, the generator adjusts its lightness until the threshold is met
    </li>
  </ol>
</div>

<div class="not-prose mt-4">
  <KeyConcept icon={Shield} variant="primary">
    <p>
      <strong>Automatic remediation:</strong> You don't need to manually check contrast. If a
      brand color would produce an inaccessible step, the generator automatically adjusts the
      lightness while preserving the hue and chroma as closely as possible.
    </p>
  </KeyConcept>
</div>

<div class="prose max-w-none dark:prose-invert">
  <h2>Testing your implementation</h2>

  <p>
    Use the programmatic API to validate palettes in your CI pipeline:
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { generatePalette, validatePaletteContrast } from '@sveltopia/colors';

const palette = generatePalette({ brandColors: ['#FF4F00'] });
const report = validatePaletteContrast(palette);

if (!report.passed) {
  console.error('Contrast issues found:', report.issues);
  process.exit(1);
}

console.log(\`All \${report.totalChecks} checks passed.\`);`}
    language="typescript"
  />
</div>

<div class="mt-12">
  <PrevNext
    prev={{ label: 'Alpha Colors', href: '/docs/alpha' }}
    next={{ label: 'API Reference', href: '/docs/api-reference' }}
  />
</div>
