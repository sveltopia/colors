# @sveltopia/colors

[![npm version](https://img.shields.io/npm/v/@sveltopia/colors.svg)](https://www.npmjs.com/package/@sveltopia/colors)
[![npm downloads](https://img.shields.io/npm/dm/@sveltopia/colors.svg)](https://www.npmjs.com/package/@sveltopia/colors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Generate complete, accessible color palettes from 1-7 brand colors. Drop-in compatible with Radix Colors, Tailwind CSS, and Panda CSS.

## Features

- **Interactive Dev Server** — Preview and explore your palette with a visual UI
- **Minimal Input** — Just provide your brand colors, get a full 31-hue palette
- **Perceptually Uniform** — Built on OKLCH for smooth, consistent gradients
- **Accessible by Default** — APCA contrast validation with automatic safeguards
- **Framework Ready** — Export to CSS, Tailwind, Radix, or Panda CSS
- **Light + Dark Mode** — Both modes generated automatically
- **P3 Wide Gamut** — Display P3 colors included for modern displays

## Installation

```bash
npm install @sveltopia/colors
# or
pnpm add @sveltopia/colors
# or
yarn add @sveltopia/colors
```

## Quick Start

### CLI (Recommended)

Generate a palette interactively:

```bash
npx @sveltopia/colors generate
```

Or with options:

```bash
# Generate with specific brand colors
npx @sveltopia/colors generate --colors "#FF4F00,#1A1A1A"

# Preview without writing files
npx @sveltopia/colors generate --colors "#FF4F00" --dry-run --verbose

# Export all formats
npx @sveltopia/colors generate --colors "#FF4F00" --format all
```

### Dev Server

Preview your palette with an interactive UI:

```bash
npx @sveltopia/colors dev --colors "#FF4F00"
```

Opens a visual palette grid at `http://localhost:3000`.

## CLI Commands

### `generate`

Generate color palettes from brand colors.

```bash
npx @sveltopia/colors generate [options]
```

| Option | Description |
|--------|-------------|
| `-c, --colors <colors>` | Comma-separated brand colors (e.g., `"#FF4F00,#1A1A1A"`) |
| `--config <path>` | Path to config file (default: `colors.config.json`) |
| `-o, --output <dir>` | Output directory (default: `./colors`) |
| `-f, --format <formats>` | Output formats: `css`, `json`, `tailwind`, `radix`, `panda`, or `all` |
| `-p, --prefix <prefix>` | CSS variable prefix (e.g., `"my-"` for `--my-red-9`) |
| `-v, --verbose` | Show detailed generation info |
| `--dry-run` | Preview output without writing files |

### `dev`

Start a local dev server to preview palettes.

```bash
npx @sveltopia/colors dev [options]
```

| Option | Description |
|--------|-------------|
| `-c, --colors <colors>` | Comma-separated brand colors |
| `--config <path>` | Path to config file |
| `-p, --port <port>` | Port to run server on (default: `3000`) |
| `--no-open` | Don't open browser automatically |

### Config File

Create `colors.config.json` in your project root:

```json
{
  "brandColors": ["#FF4F00", "#1A1A1A"],
  "outputDir": "./src/lib/colors",
  "formats": ["css", "tailwind"],
  "prefix": ""
}
```

## Output Formats

### CSS (Default)

CSS custom properties with light/dark mode support:

```css
:root {
  --red-1: #fffcfc;
  --red-9: #e5484d;
  --red-12: #641723;
  /* ... all 31 hues × 12 steps */
}

.dark {
  --red-1: #191111;
  --red-9: #e5484d;
  --red-12: #feecef;
}

@media (color-gamut: p3) {
  :root {
    --red-9: color(display-p3 0.8941 0.2824 0.3020);
  }
}
```

### Tailwind

Drop-in Tailwind preset with 50-950 scale:

```js
// tailwind.config.js
import sveltopiaColors from './colors/tailwind.preset.js'

export default {
  presets: [sveltopiaColors],
  // ...
}
```

Use in your markup:

```html
<div class="bg-red-500 text-red-950 dark:bg-red-800">
```

### Radix

Drop-in replacement for `@radix-ui/colors`:

```js
// Replace this:
import { red, redA, redDark, redDarkA } from '@radix-ui/colors'

// With this:
import { red, redA, redDark, redDarkA } from './colors/radix-colors.js'
```

Includes all 8 variants per hue: base, alpha, P3, P3Alpha × light/dark.

### Panda CSS

Panda CSS preset with semantic tokens:

```ts
// panda.config.ts
import { sveltopiaColors } from './colors/panda.preset'

export default defineConfig({
  presets: [sveltopiaColors],
  // ...
})
```

Automatic dark mode via semantic tokens — just use `colors.red.9` and it switches automatically.

## Programmatic API

Use the API directly for dynamic palette generation — perfect for theme builders, multi-tenant SaaS, or design tools.

```typescript
import {
  generatePalette,
  exportCSS,
  exportTailwind,
  exportRadix
} from '@sveltopia/colors'

// Generate a palette from brand colors
const result = generatePalette({
  brandColors: ['#FF4F00']
})

console.log(result.scales.red[9])  // '#e5484d'
console.log(result.meta.anchoredSlots)  // ['tomato']

// Export to different formats
const css = exportCSS(result)
const tailwind = exportTailwind(result, { scale: '50-950' })
```

### Key Exports

| Export | Description |
|--------|-------------|
| `generatePalette(options)` | Generate a full palette from brand colors |
| `analyzeBrandColors(colors)` | Analyze brand colors and create tuning profile |
| `exportCSS(palette, options)` | Export as CSS custom properties |
| `exportJSON(palette)` | Export as JSON with hex, oklch, and P3 values |
| `exportTailwind(palette, options)` | Export as Tailwind preset |
| `exportRadix(palette, options)` | Export as Radix-compatible module |
| `exportPanda(palette, brandInfo, options)` | Export as Panda CSS preset |
| `validateColor(input)` | Validate hex color with helpful error messages |

## How It Works

1. **Analyze** — Your brand colors are analyzed for hue, chroma, and lightness characteristics
2. **Tune** — A tuning profile is created that captures your brand's color personality
3. **Generate** — All 31 Radix hue scales are regenerated with your tuning applied
4. **Validate** — APCA contrast is checked and colors are adjusted if needed for accessibility

The algorithm preserves the relationships between steps (backgrounds, borders, text) while shifting the entire palette to match your brand. Your exact brand colors are anchored at specific steps, and surrounding colors blend naturally.

### Why OKLCH?

OKLCH is a perceptually uniform color space — equal numeric changes produce equal visual changes. This means:
- Smooth gradients without muddy midtones
- Consistent chroma across different hues
- Predictable lightness for accessibility

### Why APCA?

APCA (Advanced Perceptual Contrast Algorithm) is the next-generation contrast standard. It's more accurate than WCAG 2.x contrast ratios, especially for:
- Dark mode interfaces
- Large text vs small text
- Colored backgrounds

## 31 Hue Scales

The palette includes all Radix hue scales:

**Grays:** gray, mauve, slate, sage, olive, sand

**Colors:** tomato, red, ruby, crimson, pink, plum, purple, violet, iris, indigo, blue, cyan, teal, jade, green, grass, bronze, gold, brown, orange, amber, yellow, lime, mint, sky

Each scale has 12 steps designed for specific UI purposes:
- **1-2**: App/subtle backgrounds
- **3-5**: Component backgrounds
- **6-8**: Borders
- **9-10**: Solid colors
- **11-12**: Text

## License

MIT
