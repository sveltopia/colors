<script lang="ts">
  import CodeViewer from '$lib/components/CodeViewer.svelte';
  import PrevNext from '$lib/components/PrevNext.svelte';
</script>

<svelte:head>
  <title>API Reference | Sveltopia Colors</title>
  <meta name="description" content="Complete API reference for @sveltopia/colors. All exported functions, types, and configuration options." />
  <meta property="og:title" content="API Reference | Sveltopia Colors" />
  <meta property="og:description" content="Complete API reference for @sveltopia/colors. All exported functions, types, and configuration options." />
</svelte:head>

<div class="prose max-w-none dark:prose-invert">
  <h1>API Reference</h1>

  <p class="lead">
    All exports are available from the main package:
    <code>import {'{ ... }'} from '@sveltopia/colors'</code>
  </p>

  <h2>Core</h2>

  <h3><code>generatePalette(options)</code></h3>

  <p>
    Generates a complete palette from brand colors.
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { generatePalette } from '@sveltopia/colors';

// Returns a single-mode LightPalette — call once per mode
const light = generatePalette({
  brandColors: ['#FF4F00', '#1A1A1A'],
  // Optional: 'light' (default) | 'dark'
  mode: 'light',
  // Optional: override the auto-detected tuning profile
  tuningProfile: undefined
});

// light.scales['orange'][9] → '#FF4F00' (or close to it)
// light.meta.anchoredSlots → ['orange']
// light.meta.tuningProfile → { hueShift, chromaMultiplier, ... }

// Generate dark mode with the same inputs
const dark = generatePalette({
  brandColors: ['#FF4F00', '#1A1A1A'],
  mode: 'dark'
});`}
    language="typescript"
  />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <h3><code>analyzeBrandColors(colors, mode?)</code></h3>

  <p>
    Analyzes brand colors and returns a tuning profile describing how they relate to the baseline
    palette. Used internally by <code>generatePalette</code>, but useful for understanding what
    the generator will do.
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { analyzeBrandColors } from '@sveltopia/colors';

const profile = analyzeBrandColors(['#FF4F00']);

// profile.hueShift → average hue offset from baseline
// profile.chromaMultiplier → brand chroma relative to baseline
// profile.anchors → { '#FF4F00': { slot: 'orange', step: 9 } }`}
    language="typescript"
  />
</div>

<div class="prose mt-8 max-w-none dark:prose-invert">
  <h2>Export functions</h2>

  <p>All export functions take a <code>Palette</code> (with both light and dark scales) and return
    a formatted string.</p>

  <h3><code>exportCSS(palette, options?)</code></h3>

  <p>CSS custom properties for all scales.</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { exportCSS } from '@sveltopia/colors';

const css = exportCSS(palette, {
  lightSelector: ':root',              // default
  darkSelector: '.dark, .dark-theme',  // default
  includeAlpha: true,             // default
  includeP3: true,                // default
  includeSemantic: true,          // default
  scales: undefined,              // all scales, or ['orange', 'blue']
  prefix: '',                     // CSS variable prefix
  mode: 'both'                    // 'light' | 'dark' | 'both'
});`}
    language="typescript"
  />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <h3><code>exportJSON(palette, options?)</code></h3>

  <p>Structured JSON with hex, OKLCH, and P3 formats for each color.</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { exportJSON } from '@sveltopia/colors';

const data = exportJSON(palette, {
  scales: undefined,              // all scales, or specific ones
  includeAlpha: true,
  includeP3: true,
  includeSemantic: true
});

// data.light['orange']['9'] → { hex: '#FF4F00', oklch: '...', p3: '...' }`}
    language="typescript"
  />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <h3><code>exportTailwindV4CSS(palette, options?)</code></h3>

  <p>Tailwind v4 CSS with <code>@theme</code> block for first-class utility support.</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { exportTailwindV4CSS } from '@sveltopia/colors';

const css = exportTailwindV4CSS(palette, {
  includeSemanticRoles: true,     // primary, secondary, tertiary
  darkSelector: '.dark',
  lightSelector: ':root',
  includeThemeBlock: true         // @theme {} registration
});`}
    language="typescript"
  />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <h3><code>exportTailwind(palette, options?)</code></h3>

  <p>Tailwind v3 JavaScript preset. Use this if you're still on Tailwind v3 (<code>--format tailwind-v3</code> in the CLI).</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { exportTailwind } from '@sveltopia/colors';

const js = exportTailwind(palette, {
  scale: '50-950',          // '50-950' | '1-12'
  darkMode: 'class',        // 'class' | 'media'
  includeAlpha: false        // include alpha variants
});`}
    language="typescript"
  />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <p class="text-sm text-muted-foreground">
    <code>exportTailwindWithCSSVars</code> is also available &mdash; same options, but outputs CSS
    custom properties instead of hardcoded hex values.
  </p>

  <h3><code>exportShadcn(palette, options?)</code></h3>

  <p>shadcn/ui compatible CSS with semantic tokens.</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { exportShadcn } from '@sveltopia/colors';

const css = exportShadcn(palette, {
  radius: '0.625rem',
  neutralHue: 'slate',
  destructiveHue: 'red',
  includeCharts: true,
  includeSidebar: true,
  includeThemeBlock: true,
  includeThemeInlineBlock: true,
  lightSelector: ':root',
  darkSelector: '.dark'
});`}
    language="typescript"
  />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <h3><code>exportRadix(palette, options?)</code></h3>

  <p>Radix Colors compatible JavaScript export.</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { exportRadix } from '@sveltopia/colors';

const js = exportRadix(palette, {
  format: 'esm',         // 'esm' | 'cjs'
  includeAlpha: true,
  includeP3: true
});`}
    language="typescript"
  />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <h3><code>exportPanda(palette, brandColorInfo, options?)</code></h3>

  <p>Panda CSS preset. Requires brand color info for semantic token mapping.</p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { exportPanda } from '@sveltopia/colors';

const brandColorInfo = [
  { hex: '#FF4F00', hue: 'orange', anchorStep: 9, isCustomRow: false }
];

const ts = exportPanda(palette, brandColorInfo, {
  includeSemantic: true   // include semantic tokens (default: true)
});`}
    language="typescript"
  />
</div>

<div class="prose mt-8 max-w-none dark:prose-invert">
  <h2>Validation</h2>

  <h3><code>calculateAPCA(textHex, bgHex)</code></h3>

  <p>
    Returns the APCA contrast value between a text color and background color. Higher values mean
    more contrast. Typical range is 0–108.
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { calculateAPCA } from '@sveltopia/colors';

const contrast = calculateAPCA('#1A1A1A', '#FFFFFF');
// → ~106 (very high contrast)`}
    language="typescript"
  />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <h3><code>validatePaletteContrast(palette, options?)</code></h3>

  <p>
    Validates all step combinations in a palette against APCA thresholds. Returns a detailed
    report.
  </p>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`import { validatePaletteContrast } from '@sveltopia/colors';

const report = validatePaletteContrast(palette, {
  hues: undefined,        // all hues, or ['orange', 'blue']
  errorsOnly: false       // true to suppress warnings
});

// report.passed → boolean
// report.totalChecks → number
// report.passedChecks → number
// report.issues → [{ hue, mode, textStep, bgStep, expected, actual, severity }]`}
    language="typescript"
  />
</div>

<div class="prose mt-8 max-w-none dark:prose-invert">
  <h2>Key types</h2>
</div>

<div class="not-prose mt-4">
  <CodeViewer
    code={`interface OklchColor {
  l: number;      // Lightness (0–1)
  c: number;      // Chroma (0–~0.4)
  h: number;      // Hue (0–360)
  alpha?: number;
}

interface Scale {
  1: string;  // lightest (backgrounds)
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  7: string;
  8: string;
  9: string;  // primary solid (brand anchor)
  10: string;
  11: string;
  12: string; // darkest (text)
}

interface Palette {
  light: Record<string, Scale>;
  dark: Record<string, Scale>;
  _meta: {
    tuningProfile: TuningProfile;
    inputColors: string[];
    generatedAt: string;
  };
}

interface TuningProfile {
  hueShift: number;
  chromaMultiplier: number;
  lightnessShift: number;
  anchors: Record<string, AnchorInfo>;
  customRows?: CustomRowInfo[];
}

interface ContrastReport {
  passed: boolean;
  totalChecks: number;
  passedChecks: number;
  issues: ContrastIssue[];
}`}
    language="typescript"
  />
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <p>
    For the full type definitions, see the
    <a href="https://github.com/sveltopia/colors/blob/main/packages/colors/src/types.ts" target="_blank" rel="noopener noreferrer">TypeScript source</a>.
  </p>
</div>

<div class="mt-12">
  <PrevNext
    prev={{ label: 'Accessibility', href: '/docs/accessibility' }}
    next={{ label: 'AI Docs', href: '/docs/ai-docs' }}
  />
</div>
