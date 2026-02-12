<script lang="ts">
  import PrevNext from '$lib/components/PrevNext.svelte';
  import KeyConcept from '$lib/components/KeyConcept.svelte';
  import { Copy, Check, Bot } from 'lucide-svelte';

  let copied = $state(false);

  const llmContext = `# @sveltopia/colors — LLM Context

## What it is
A perceptually uniform color system that generates accessible palettes from brand hex colors.
Built on OKLCH color space, Radix 12-step scale, and APCA contrast validation.

## Install & Generate
\`\`\`bash
npm install @sveltopia/colors
npx @sveltopia/colors generate --colors "#FF4F00" --format tailwind,shadcn
\`\`\`

## CLI Flags (generate)
- \`-c, --colors <hex,...>\` — brand colors (up to 7)
- \`-f, --format <formats>\` — css, json, tailwind, shadcn, radix, panda, all
- \`-o, --output <dir>\` — output directory (default: ./colors)
- \`--config <path>\` — config file (default: colors.config.json)
- \`-p, --prefix <prefix>\` — CSS variable prefix
- \`-v, --verbose\` — show tuning details
- \`--dry-run\` — preview without writing

## Config File (colors.config.json)
\`\`\`json
{ "brandColors": ["#FF4F00"], "outputDir": "./colors", "formats": ["css","json","tailwind"] }
\`\`\`

## 12-Step Scale (Radix-based)
Step 1 (50): app background | Step 2 (100): subtle bg | Step 3 (200): component bg
Step 4 (300): hover bg | Step 5 (400): active/selected | Step 6 (500): subtle border
Step 7 (600): strong border | Step 8 (700): solid bg | Step 9 (800): primary solid (brand anchor)
Step 10 (850): hovered solid | Step 11 (900): low-contrast text | Step 12 (950): high-contrast text

## Safe Color Pairings
✅ Steps 11-12 text on steps 1-2 backgrounds (body text)
✅ Step 12 text on steps 3-5 backgrounds (surface text)
✅ White text on steps 8-10 backgrounds (buttons)
✅ Steps 6-7 borders on steps 1-2 backgrounds
❌ Adjacent steps as text/bg pairs
❌ Light text on light backgrounds (steps 1-5 on 1-5)

## APCA Thresholds
Body text (14-16px): ≥75 | Large text/UI (18px+): ≥60 | Decorative: ≥45

## Core API
\`\`\`typescript
import {
  generatePalette,        // (opts: { brandColors: string[], tuningProfile?, mode? }) => Palette
  analyzeBrandColors,     // (colors: string[], mode?) => TuningProfile
  exportCSS,              // (palette, opts?) => string
  exportJSON,             // (palette, opts?) => JSONOutput
  exportTailwindV4CSS,    // (palette, opts?) => string — Tailwind v4 @theme CSS
  exportShadcn,           // (palette, opts?) => string — shadcn/ui CSS tokens
  exportRadix,            // (palette, opts?) => string — Radix Colors JS
  exportPanda,            // (palette, opts?) => string — Panda CSS preset
  calculateAPCA,          // (textHex, bgHex) => number — APCA contrast value
  validatePaletteContrast // (palette, opts?) => ContrastReport
} from '@sveltopia/colors';
\`\`\`

## Key Types
\`\`\`typescript
interface OklchColor { l: number; c: number; h: number; alpha?: number }
interface Scale { 1-12: string } // hex values, lightest to darkest
interface Palette { light: Record<string, Scale>; dark: Record<string, Scale>; _meta: {...} }
interface TuningProfile { hueShift: number; chromaMultiplier: number; lightnessShift: number; anchors: Record<string, AnchorInfo> }
interface ContrastReport { passed: boolean; totalChecks: number; passedChecks: number; issues: ContrastIssue[] }
\`\`\`

## Common Patterns
\`\`\`typescript
// Generate + export for Tailwind
const palette = generatePalette({ brandColors: ['#FF4F00'] });
const css = exportTailwindV4CSS(palette);

// Validate accessibility
const report = validatePaletteContrast(palette);
if (!report.passed) console.error(report.issues);

// Check specific contrast
const contrast = calculateAPCA('#1A1A1A', '#FFFFFF'); // ~106

// Analyze brand colors before generating
const profile = analyzeBrandColors(['#FF4F00', '#2563EB']);
// profile.anchors shows which baseline hues each brand color maps to
\`\`\`

## 31 Baseline Hues
gray, crimson, ruby, red, tomato, bronze, orange, brown, gold, amber, yellow, sand, lime, olive, grass, green, jade, sage, mint, teal, sky, cyan, blue, indigo, slate, iris, violet, mauve, purple, plum, pink

## Export Options Quick Reference
- CSS: lightSelector, darkSelector, includeAlpha, includeP3, prefix, mode
- Tailwind: includeSemanticRoles, includeThemeBlock
- shadcn: radius, neutralHue, destructiveHue, includeCharts, includeSidebar
- Radix/Panda: format (esm|cjs), includeAlpha, includeP3`;

  async function copyContext() {
    await navigator.clipboard.writeText(llmContext);
    copied = true;
    setTimeout(() => {
      copied = false;
    }, 2000);
  }
</script>

<div class="prose max-w-none dark:prose-invert">
  <h1>AI Docs</h1>

  <p class="lead">
    A single, dense context block optimized for LLM ingestion. Copy it into your AI assistant's
    context window to get accurate help with Sveltopia Colors.
  </p>
</div>

<div class="not-prose mt-4">
  <KeyConcept icon={Bot}>
    <p>
      This context block contains the full API surface, common patterns, and key concepts in a
      format optimized for AI assistants like Claude, ChatGPT, and Copilot. It's designed to be
      concise but complete enough for accurate code generation.
    </p>
  </KeyConcept>
</div>

<div class="not-prose mt-8">
  <div class="overflow-hidden rounded-lg border">
    <div class="flex items-center justify-between border-b bg-card px-4 py-2">
      <span class="font-mono text-sm text-muted-foreground">LLM Context</span>
      <button
        onclick={copyContext}
        class="flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        {#if copied}
          <Check class="h-4 w-4" />
          Copied!
        {:else}
          <Copy class="h-4 w-4" />
          Copy to clipboard
        {/if}
      </button>
    </div>
    <pre class="max-h-[600px] overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-relaxed text-foreground">{llmContext}</pre>
  </div>
</div>

<div class="mt-12">
  <PrevNext prev={{ label: 'API Reference', href: '/docs/api-reference' }} />
</div>
