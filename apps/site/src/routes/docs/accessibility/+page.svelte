<script lang="ts">
  import CodeViewer from '$lib/components/CodeViewer.svelte';
  import KeyConcept from '$lib/components/KeyConcept.svelte';
  import PrevNext from '$lib/components/PrevNext.svelte';
  import { CheckCircle, XCircle, Shield, Info } from 'lucide-svelte';
</script>

<div class="prose max-w-none dark:prose-invert">
  <h1>Accessibility</h1>

  <p class="lead">
    Sveltopia Colors uses the Radix 12-step scale system, where each step has a semantic purpose
    that guides accessible color usage. Critical text/background pairings are APCA-validated and
    auto-corrected during generation.
  </p>

  <h2>Step semantics</h2>

  <p>
    Each step in the 12-step scale has a designed purpose and an accessibility guideline. Using steps
    for their intended purpose ensures accessible results:
  </p>

  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>Steps</th>
          <th>Tailwind</th>
          <th>Purpose</th>
          <th>Accessibility guideline</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1–2</td>
          <td>50–100</td>
          <td>Backgrounds</td>
          <td>Safe as backgrounds for steps 11–12 text <strong>*</strong></td>
        </tr>
        <tr>
          <td>3–5</td>
          <td>200–400</td>
          <td>Interactive surfaces</td>
          <td>Safe as backgrounds for step 12 text (by design)</td>
        </tr>
        <tr>
          <td>6–7</td>
          <td>500–600</td>
          <td>Borders</td>
          <td>Sufficient contrast against backgrounds (by design)</td>
        </tr>
        <tr>
          <td>8–10</td>
          <td>700–850</td>
          <td>Solid fills</td>
          <td>White/contrast text at large font sizes <strong>**</strong></td>
        </tr>
        <tr>
          <td>11–12</td>
          <td>900–950</td>
          <td>Text</td>
          <td>Accessible on background steps 1–2 <strong>*</strong></td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="text-sm text-muted-foreground">
    <strong>*</strong> Enforced: the generator auto-corrects steps 11–12 against steps 1–2 if contrast falls below APCA thresholds.<br />
    <strong>**</strong> Validated as warning: step 9 is checked for white text readability but not auto-corrected, since saturated hues (yellow, lime) intentionally use dark text instead.
  </p>

  <p class="text-sm text-muted-foreground">
    Guidelines marked "by design" follow from the Radix step system's lightness progression — each
    step group is spaced to maintain perceptual contrast with its intended pairings.
  </p>

  <h2>Safe combinations</h2>

  <p>
    These pairings are designed to meet APCA contrast thresholds:
  </p>
</div>

<div class="not-prose mt-4 space-y-3">
  <div class="flex items-start gap-3 rounded-lg bg-green-500/5 p-4">
    <CheckCircle class="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
    <div class="text-sm text-foreground">
      <strong>Text on backgrounds</strong> — Steps 11–12 text on steps 1–2 backgrounds (enforced)
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
      <strong>White text on solids</strong> — White text on step 9 at large font sizes (validated as warning)
      <span class="text-muted-foreground">(e.g., white text on <code class="rounded bg-muted px-1.5 py-0.5 text-xs">bg-orange-800</code> — some saturated hues may need dark text instead)</span>
    </div>
  </div>

  <div class="flex items-start gap-3 rounded-lg bg-green-500/5 p-4">
    <CheckCircle class="mt-0.5 h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
    <div class="text-sm text-foreground">
      <strong>Borders on backgrounds</strong> — Steps 6–7 borders on steps 1–2 backgrounds (by design)
      <span class="text-muted-foreground">(e.g., <code class="rounded bg-muted px-1.5 py-0.5 text-xs">border-blue-600</code> on <code class="rounded bg-muted px-1.5 py-0.5 text-xs">bg-blue-50</code>)</span>
    </div>
  </div>
</div>

<div class="prose mt-8 max-w-none dark:prose-invert">
  <h2>Avoid these pairings</h2>
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

<div class="not-prose mt-6">
  <KeyConcept icon={Info} variant="primary">
    <p>
      The palette gives you the building blocks for accessible interfaces — but which combinations
      you use is up to you. Follow the step semantics above and you'll produce accessible results
      without needing to think about contrast ratios.
    </p>
  </KeyConcept>
</div>

<div class="prose mt-8 max-w-none dark:prose-invert">
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

  <p>
    <strong>A concrete example:</strong> white text on a saturated orange button (step 800) fails
    WCAG 2.x with a ratio of 2.87:1 — well below the 4.5:1 threshold. But the same pairing
    passes APCA at every practical button font size, because APCA accounts for the fact that large,
    bold text on a vivid background is perfectly readable. This is the kind of false negative that
    makes WCAG 2.x frustrating for design systems with saturated brand colors.
  </p>

  <h2>How validation works</h2>

  <p>
    During palette generation, the generator validates and enforces contrast for the most
    critical pairings:
  </p>

  <ol>
    <li>
      <strong>Text steps (11–12)</strong> are checked against background steps (1–2). Step 12 must
      meet body text contrast (APCA &ge; 75); step 11 must meet large text contrast (APCA &ge; 60).
      If either falls short, the generator automatically adjusts lightness until the threshold is met.
    </li>
    <li>
      <strong>Solid fill step (9)</strong> is checked for white text readability (APCA &ge; 60).
      This is flagged as a warning rather than auto-corrected, since some saturated hues (yellow,
      lime) intentionally use dark text on solid backgrounds.
    </li>
  </ol>

  <p>
    Other step relationships (borders against backgrounds, text on interactive surfaces) follow
    from the Radix scale's perceptual lightness curve — each step group is spaced to maintain
    usable contrast with its intended pairings. You can verify any palette using the programmatic
    API below.
  </p>
</div>

<div class="not-prose mt-4">
  <KeyConcept icon={Shield} variant="primary">
    <p>
      <strong>Automatic remediation:</strong> You don't need to manually check text contrast. If a
      brand color would produce text steps (11–12) that fall below APCA thresholds against
      background steps (1–2), the generator automatically adjusts lightness while preserving
      hue and chroma as closely as possible.
    </p>
  </KeyConcept>
</div>

<div class="prose mt-8 max-w-none dark:prose-invert">
  <h2>Testing your implementation</h2>

  <p>
    Use the programmatic API to validate palettes in your CI pipeline:
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { generatePalette, validatePaletteContrast, formatContrastReport } from '@sveltopia/colors';

// generatePalette returns a single mode — generate both
const light = generatePalette({ brandColors: ['#FF4F00'] });
const dark = generatePalette({ brandColors: ['#FF4F00'], mode: 'dark' });

const palette = {
  light: light.scales,
  dark: dark.scales,
  _meta: {
    tuningProfile: light.meta.tuningProfile,
    inputColors: ['#FF4F00'],
    generatedAt: new Date().toISOString()
  }
};

const report = validatePaletteContrast(palette);

if (!report.passed) {
  console.error(formatContrastReport(report));
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
