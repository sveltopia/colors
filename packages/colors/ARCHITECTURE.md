# @sveltopia/colors &mdash; Architecture Guide

A developer reference for understanding, debugging, and extending the color library.

---

## 1. Color Science Foundations

### Why OKLCH?

HSL and RGB are not **perceptually uniform** &mdash; `hsl(60, 100%, 50%)` (yellow) looks dramatically brighter than `hsl(240, 100%, 50%)` (blue), even though both are "50% lightness." Human vision disagrees with the math.

OKLCH models color the way humans actually see it:

| Channel           | Range            | What it represents                                                    |
| ----------------- | ---------------- | --------------------------------------------------------------------- |
| **L** (Lightness) | 0&ndash;1        | Perceived brightness. 0.5 in blue _looks_ as bright as 0.5 in yellow. |
| **C** (Chroma)    | 0&ndash;~0.4     | Color intensity. Max depends on hue and lightness.                    |
| **H** (Hue)       | 0&ndash;360&deg; | Color wheel angle.                                                    |

This matters because when generating a 12-step scale, we want step 6 of blue to _feel_ the same visual weight as step 6 of orange. OKLCH gives us this by design; HSL would require manual per-hue correction.

### Gamut and Clamping

OKLCH can describe colors no screen can display. A high chroma at certain lightness/hue combinations may fall outside the sRGB gamut (or even P3). The library handles this at two levels:

- **Mathematical clamping** (`clampOklch`) &mdash; keeps L, C, H in valid ranges (prevents NaN propagation)
- **Gamut clamping** (via Culori's `formatHex`) &mdash; maps out-of-gamut colors to the nearest displayable sRGB value at export time

The library works in OKLCH internally for all calculations, only converting to hex/CSS at export time.

### P3 Wide Gamut

The export pipeline produces both sRGB hex values and P3 `oklch()` CSS values. P3 output is optional (`includeP3`, defaults to `true`) &mdash; consumers targeting only sRGB displays can disable it to reduce CSS bundle size. CSS cascading handles fallback:

```css
--red-9: #e54d4d; /* sRGB fallback */
--red-9: oklch(0.63 0.19 25); /* P3-capable browsers use this */
```

### Foundation Layer: `utils/oklch.ts`

A thin wrapper around [Culori](https://culorijs.org/) providing:

- `toOklch(color)` &mdash; Any CSS color string to internal `OklchColor`. Defaults `undefined` channels to 0 (achromatic colors have no hue).
- `toHex(color)` &mdash; OKLCH to hex. Culori implicitly gamut-clamps to sRGB here.
- `toCss(color)` &mdash; OKLCH to CSS `oklch()` notation (preserves full P3 range).
- `parseColor(input)` &mdash; Convenience: returns `{ oklch, hex, css }` in one call. Used at input boundaries.
- `validateColor(color)` &mdash; DX-focused validation with helpful error messages (missing `#`, invalid hex length, etc.).
- `clampOklch(color)` &mdash; Mathematical range enforcement (L: 0&ndash;1, C: 0+, H: 0&ndash;360 wrapping).

---

## 2. The Radix Foundation

### Why Radix Curves?

Generating a 12-step scale requires knowing what lightness each step should target &mdash; and those targets differ by hue. Yellow is naturally bright; blue is naturally dark. Linear interpolation produces poor results.

[Radix Colors](https://www.radix-ui.com/colors) hand-tuned 12-step scales for ~30 hues with careful attention to:

- Semantic purpose at each step
- Perceptual consistency across hues
- Accessibility contrast ratios
- Light and dark mode behavior

Rather than inventing our own curves, we extracted the lightness and chroma progressions from Radix's published scales and use them as reference baselines.

### The 12-Step Semantic Scale

| Steps       | Role                   | Example usage               |
| ----------- | ---------------------- | --------------------------- |
| 1&ndash;2   | Backgrounds            | Page bg, card bg            |
| 3&ndash;5   | Borders / Interactive  | Input borders, hover states |
| 6&ndash;8   | UI / Solid backgrounds | Selected states, badges     |
| 9&ndash;10  | Solid / Brand surfaces | Buttons, alerts             |
| 11&ndash;12 | Text                   | Body text, headings         |

Step 9 is the **hero color** &mdash; the most visually prominent step, used for primary buttons and brand surfaces. It's the step a designer picks first ("this site uses indigo"), and the anchor from which other steps are derived.

### What the Curves Look Like (Tomato Example)

| Step | Lightness | Chroma |
| ---- | --------- | ------ |
| 1    | 0.993     | 0.003  |
| 2    | 0.984     | 0.008  |
| 3    | 0.954     | 0.022  |
| 4    | 0.921     | 0.041  |
| 5    | 0.889     | 0.059  |
| 6    | 0.853     | 0.077  |
| 7    | 0.802     | 0.095  |
| 8    | 0.741     | 0.118  |
| 9    | 0.627     | 0.194  |
| 10   | 0.604     | 0.195  |
| 11   | 0.567     | 0.198  |
| 12   | 0.346     | 0.080  |

Lightness descends smoothly from near-white to dark. Chroma builds gradually, spikes at step 9 (the hero), and drops at step 12 (text shouldn't be overly saturated). These per-hue curves are what we'd lose with a single mathematical formula.

### 31 Hue Slots: `core/hues.ts`

Defines the coordinate system &mdash; 31 positions around the OKLCH color wheel, extracted from Radix step-9 values:

- **Chromatic hues** (22): crimson, ruby, red, tomato, orange, brown, amber, yellow, lime, grass, green, jade, mint, teal, sky, cyan, blue, indigo, iris, violet, purple, plum, pink
- **Tinted neutrals** (8): gray, bronze, gold, sand, olive, sage, slate, mauve
- Each slot stores: `hue` angle, `referenceChroma` at step-9, `category`, source `radixHex`

### Hue Snapping

When a brand color enters the system, we find the closest slot:

1. Calculate **circular distance** (hue wraps at 360&deg;)
2. Route based on chroma: chromatic colors (`c > 0.03`) search chromatic slots; non-chromatic colors search neutral slots
3. If distance &le; 10&deg; (`SNAP_THRESHOLD`) &rarr; **snap** to that slot's Radix curves
4. If distance > 10&deg; &rarr; **custom row** (the brand color is unique enough to need its own scale)

The 10&deg; threshold balances two risks: too wide and generated colors diverge perceptually from the Radix baseline; too narrow and we generate unnecessary custom rows for colors that would work fine with a nearby slot's curves.

### Reference Data: `reference/radix-scales.ts`

Contains the actual hex values from all Radix scales (light and dark). These are converted to OKLCH at generation time to extract per-hue lightness and chroma curves. The library follows the _shape_ of these curves while substituting the brand's hue angle.

---

## 3. Brand Analysis Pipeline

The analysis pipeline takes 1&ndash;7 brand colors and extracts a **tuning profile** &mdash; a compact description of how the brand deviates from baseline expectations. This profile is then applied across all 31 hues during palette generation.

### Core Concept: From Brand Colors to Tuning Profile

A brand's colors encode preferences: do they skew warm or cool? Vivid or muted? Light or dark? The analysis pipeline quantifies these preferences into three numbers plus structural data:

| Field              | What it captures                             | How it's computed                                                      |
| ------------------ | -------------------------------------------- | ---------------------------------------------------------------------- |
| `hueShift`         | Warmer or cooler than baseline               | Average signed hue offset of snapping chromatic colors                 |
| `chromaMultiplier` | More vivid or more muted                     | Average chroma ratio (clamped 0.5x&ndash;1.3x) of all chromatic colors |
| `lightnessShift`   | Preference for lighter or darker             | Average lightness minus 0.65 (typical step-9 lightness)                |
| `anchors`          | Where each brand color lands                 | Map of hex &rarr; `{ slot, step, isCustomRow }`                        |
| `customRows`       | Out-of-bounds colors needing their own scale | Array with full OKLCH data, reason, nearest slot                       |

### Single Color Analysis: `analyzeColor()`

Each brand color goes through this pipeline (`core/analyze.ts`):

1. **Convert to OKLCH** via `toOklch()`
2. **Route by chroma**: `c > 0.03` searches chromatic slots (excludes neutrals); `c &le; 0.03` searches neutral slots only. This prevents a dark gray from accidentally matching a vivid hue at a similar angle.
3. **Find closest slot** via circular hue distance (wrapping at 360&deg;)
4. **Snap check**: distance &le; 10&deg; (`SNAP_THRESHOLD`) means the color is close enough to use that slot's Radix curves
5. **Chroma ratio**: `input.c / slot.referenceChroma` &mdash; how saturated is this color compared to what Radix expects?
6. **Anchor step**: `suggestAnchorStep()` finds which of the 12 steps best matches the color's lightness, using per-hue Radix lightness curves
7. **Out-of-bounds detection** (four triggers):

| Trigger           | Condition                                                                         | Example                                      |
| ----------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| Low chroma        | Ratio &lt; 0.5x                                                                   | Pastel pink (`#FFD1DC`, ratio 0.25x)         |
| High chroma       | Ratio &gt; 1.3x                                                                   | Neon green (`#39FF14`, ratio ~1.95x)         |
| Hue gap           | Distance &gt; 10&deg; from any chromatic slot                                     | A color at 39&deg; between tomato and orange |
| Extreme lightness | High-chroma color at background/text steps (1&ndash;3, 12) or large lightness gap | Vivid yellow at L=0.98                       |

### Multi-Color Analysis: `analyzeBrandColors()`

After analyzing each color individually:

1. **Separate** standard (in-bounds) from out-of-bounds colors
2. **Compute tuning values** with careful scoping:
   - `hueShift` &mdash; only from standard, snapping, chromatic colors (out-of-bounds hues would distort the average)
   - `chromaMultiplier` &mdash; from _all_ chromatic colors, but clamped to 0.5x&ndash;1.3x (a neon brand gets 1.3x max, a pastel brand gets 0.5x min &mdash; this captures brand "feel" without extreme skew)
   - `lightnessShift` &mdash; from all colors (even out-of-bounds ones reflect the brand's lightness preference)
3. **Build anchors map** &mdash; standard colors map to their snapped slot; out-of-bounds colors map to generated custom row keys
4. **Generate custom rows** with descriptive keys: `pastel-{slot}`, `neon-{slot}`, `custom-{slot}`, `bright-{slot}`, `dark-{slot}` (numeric suffixes for uniqueness)

### Worked Example

Input: `['#FF4F00', '#FFD1DC']`

**`#FF4F00`** (vivid orange-red): OKLCH (0.670, 0.222, 37.42&deg;) &rarr; closest slot **tomato** (33.34&deg;), distance 4.08&deg;, snaps. Chroma ratio 1.147 (within bounds). Anchors at **step 9** (hero position).

**`#FFD1DC`** (pastel pink): OKLCH (0.903, 0.054, 2.19&deg;) &rarr; closest slot **crimson** (1.28&deg;), distance 0.91&deg;, snaps on hue. But chroma ratio 0.251 &mdash; below the 0.5 floor. **Out of bounds** (low-chroma). Custom row key: `pastel-crimson`. Anchors at **step 2** (background-level lightness).

Resulting tuning profile:

- `hueShift`: +4.08&deg; (brand skews slightly warmer than tomato baseline)
- `chromaMultiplier`: 0.824 (slightly muted &mdash; pastel pulls average down)
- `lightnessShift`: +0.137 (brand prefers lighter colors)

### Key Files

| File              | Role                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `types.ts`        | `TuningProfile`, `AnchorInfo`, `CustomRowInfo`, `ColorAnalysis`                           |
| `core/analyze.ts` | `analyzeColor()`, `analyzeBrandColors()`, `generateCustomRowKey()`, `suggestAnchorStep()` |
| `core/hues.ts`    | `findClosestHueWithDistance()`, `SNAP_THRESHOLD`, `BASELINE_HUES`                         |

---

## 4. Palette Generation

Three files work together: `generate.ts` produces a single 12-step scale, `palette.ts` orchestrates all 31+ hues, and `validate.ts` enforces accessibility.

### Three Curves Per Hue

For each of the 31 hues, Radix reference data provides three extracted curves (light and dark mode variants):

- **Lightness curve** (`RADIX_LIGHTNESS_CURVES`) &mdash; target lightness at each of the 12 steps
- **Chroma curve** (`RADIX_CHROMA_CURVES`) &mdash; chroma ratio at each step, normalized so step 9 = 1.0
- **Hue curve** (`RADIX_HUE_CURVES`) &mdash; hue angle at each step (Radix shifts hue across the scale &mdash; e.g., orange at step 1 is 48.7&deg; but 40.8&deg; at step 12, getting warmer as it darkens)

### Three APCA Target Sets

Different hue families need different contrast targets at step 9:

| Target set | Step 9 APCA | Used for                                                                             |
| ---------- | ----------- | ------------------------------------------------------------------------------------ |
| Standard   | 57.6        | Most chromatic hues                                                                  |
| Bright     | 18.0        | Yellow, lime, amber, mint, sky (step 9 is lighter than step 8)                       |
| Neutral    | 60.5        | Gray, mauve, slate, sage, olive, sand (need more contrast to feel equally prominent) |

### The "Retuning the Guitar" Metaphor

The palette is a guitar. Each of the 31 hues is a string. Brand colors tell us how some strings should be tuned. The tuning profile shifts ALL strings by the same amount so the whole instrument sounds cohesive:

- `hueShift` of +3&deg; &rarr; every hue rotates 3&deg; warmer
- `chromaMultiplier` of 0.85 &rarr; every hue is 85% as vivid as Radix baseline

### Scale Generation: `generateScaleAPCA()`

For each step in a 12-step scale:

1. **Lightness** &mdash; from the per-hue Radix curve (except at the anchor step for brand colors, where the brand's actual lightness is used)
2. **Chroma** &mdash; Radix reference chroma &times; per-step chroma curve ratio &times; brand chroma departure (dampened toward edges)
3. **Hue** &mdash; Radix hue curve + brand hue offset (dampened toward edges)

**Dampening:** Brand influence is strongest at the anchor step (100%) and fades toward the edges of the scale (~30% at steps 1 and 12). This prevents large brand departures from producing unnatural-looking extremes at near-white and near-black steps.

### Anchored vs Synthetic Parents

`generatePalette()` loops through all 31 hue keys and decides for each:

| Condition                     | Parent type                                | `useFullCurve` | What happens                                                                                                                                  |
| ----------------------------- | ------------------------------------------ | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Brand color maps to this slot | Brand parent (actual hex)                  | `false`        | Brand's lightness used at anchor step; Radix lightness at other 11 steps. Brand's hue/chroma departure shapes all steps via dampened offsets. |
| No brand color for this slot  | Synthetic parent via `createTunedParent()` | `true`         | Radix lightness used at ALL 12 steps. Hue and chroma come from Radix reference + tuning profile deltas.                                       |

`createTunedParent()` builds the synthetic parent by:

- Starting from the Radix reference chroma for that hue
- Applying `chromaMultiplier` (clamped: 0.5x&ndash;1.3x for chromatic, max 1.0x for neutrals)
- Applying `hueShift` (skipped for neutrals &mdash; their low chroma makes hue shifts disproportionately visible)
- Using the Radix step-9 lightness for that hue (avoids gamut clipping &mdash; yellow at L=0.65 loses 30% chroma in sRGB, but at its natural L=0.918 it preserves full chroma)

### The "Nearly Radix" Problem

When a brand color happens to be very close to its Radix baseline (&lt;3&deg; hue, 0.9&ndash;1.1x chroma), its per-row offset is effectively zero. Without special handling, this row would be the only one in the palette that doesn't reflect the brand's overall warm/cool tendency &mdash; one out-of-tune guitar string.

Solution: detect "nearly Radix" anchors and substitute the **global tuning profile** instead of the per-row offset. But only when the global shift is larger than the per-row offset (meaning the brand intended a uniform shift, not that this specific color is deliberately close to Radix).

### Custom Row Generation

Out-of-bounds brand colors (pastel, neon, hue-gap, extreme-lightness) get their own scales via `generateCustomRowScale()`:

- Uses the brand color's **actual chroma** (not clamped &mdash; the whole point is preserving the brand's unusual saturation)
- Uses Radix curves from the **nearest slot** for shape
- Hue shift: applied for neons (robust enough), skipped for pastels and hue-gap colors (too delicate, or the distinct hue is the whole point)
- For high-chroma colors near bright hues (yellow, lime): uses the nearest **non-bright** slot's curves instead, to avoid the non-monotonic lightness issue where step 9 is lighter than step 8

### Accessibility Enforcement: `validate.ts`

Called in the **export pipeline** (not during generation) as a separate concern:

1. `ensureAccessibility()` checks steps 11 and 12 against background steps 1 and 2
2. If contrast falls below APCA thresholds, `boostLightnessUntilContrast()` nudges lightness by 0.01 increments until the threshold is met
3. The result is a `safePalette` that all export functions use

| Check                 | Threshold          | Severity     |
| --------------------- | ------------------ | ------------ |
| Step 12 vs step 1     | Lc 75 (body text)  | Fail         |
| Step 12 vs step 2     | Lc 75 (body text)  | Fail         |
| Step 11 vs step 1     | Lc 60 (large text) | Fail         |
| Step 11 vs step 2     | Lc 60 (large text) | Fail         |
| Step 9 vs white/black | Lc 60 (large text) | Warning only |

Step 9 is warning-only because bright hues (yellow, lime) intentionally need dark text on their hero color rather than white.

Only steps 11&ndash;12 need enforcement because they are the text steps with hard accessibility requirements. Steps 1&ndash;10 are backgrounds, borders, and UI elements &mdash; not text &mdash; so contrast thresholds don't apply.

### Key Files

| File               | Role                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------- |
| `core/generate.ts` | `generateScaleAPCA()`, all Radix reference curves, `findLightnessForAPCA()`           |
| `core/palette.ts`  | `generatePalette()`, `createTunedParent()`, `generateCustomRowScale()`                |
| `core/validate.ts` | `validatePaletteContrast()`, `ensureAccessibility()`, `boostLightnessUntilContrast()` |

---

## 5. Export Pipeline

The export pipeline transforms the internal palette (31+ hues &times; 12 steps &times; light/dark) into consumable output. Every export function calls `ensureAccessibility()` first, producing a `safePalette` before generating any output.

### Core Exports: `core/export.ts`

**CSS custom properties** (`exportCSS`):

- Solid scale as sRGB hex variables (`--red-9: #e54d4d`)
- Optional P3 wide gamut overrides in `@supports (color: color(display-p3 1 1 1))` + `@media (color-gamut: p3)` block, using `oklch()` notation
- Optional alpha variants (`--red-a9: #e54d2e80`)
- Optional semantic tokens (`--red-contrast`, `--red-surface`, `--red-indicator`, `--red-track`)
- Configurable selectors (`:root` for light, `.dark` for dark)

**JSON export** (`exportJSON`):

- Structured data with hex, oklch, and P3 representations per step
- Rich `_meta` including brand color info, tuning profile, and scale list

### Alpha Color Computation

The alpha algorithm (ported from Radix Colors) answers: "What RGBA color, composited over white (light mode) or black (dark mode), produces the exact same visual result as this solid hex?"

This is not simply `opacity: 0.5`. Two key differences:

1. The alpha value is computed to reproduce the exact visual appearance of the solid color when blended against the mode's background
2. Alpha is on the **color itself**, not the element &mdash; `opacity` would make text, borders, and children transparent too

The algorithm handles sRGB (8-bit, precision 255) and P3 (fractional, precision 1000) separately, with rounding corrections to match browser compositing behavior.

### Semantic Tokens

Four tokens per hue, derived from the scale:

| Token       | Value                                   | Purpose                                                  |
| ----------- | --------------------------------------- | -------------------------------------------------------- |
| `contrast`  | White or dark text                      | Readable text on step 9 (dark if L &gt; 0.6, else white) |
| `surface`   | Step 1 with alpha (80% light, 50% dark) | Semi-transparent surface overlay                         |
| `indicator` | Step 9                                  | Active state indicator                                   |
| `track`     | Step 9                                  | Slider/progress track                                    |

### Framework Exports: `core/export-frameworks.ts`

**Radix &rarr; Tailwind step mapping:**

| Radix    | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | 11  | 12  |
| -------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tailwind | 50  | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 850 | 900 | 950 |

Step 10 maps to 850, which doesn't exist in standard Tailwind &mdash; we add it.

**Export functions:**

| Function                      | Output                       | Notes                                                                     |
| ----------------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| `exportTailwind()`            | Tailwind v3 config preset    | JS file with `colors` and dark mode plugin                                |
| `exportTailwindWithCSSVars()` | CSS variable approach        | Alternative dark mode strategy                                            |
| `exportTailwindV4CSS()`       | Tailwind v4 CSS-first config | OKLCH values, `@theme` block, semantic role aliases                       |
| `exportShadcn()`              | shadcn-svelte tokens         | Builds on `exportTailwindV4CSS()`, adds `--primary`, `--background`, etc. |
| `exportRadix()`               | Radix UI Colors drop-in      | Matches `@radix-ui/colors` export structure                               |
| `exportPanda()`               | Panda CSS preset             | Semantic tokens and scale tokens                                          |

**Semantic role resolution** (used in Tailwind v4 and shadcn exports):

- 0 brand colors: primary = secondary = tertiary = gray
- 1 brand color: all three roles point to same hue
- 2 brand colors: primary + secondary split, tertiary = primary
- 3+ brand colors: each role gets its own hue

**Adjacent hue mapping** (for gradients): each hue has a curated neighbor ~30&deg; away on the color wheel (e.g., red &rarr; tomato, blue &rarr; indigo). For custom rows, adjacency is computed dynamically by finding the palette hue closest to 30&deg; clockwise.

### Public API: `index.ts`

Barrel file re-exporting everything. The library supports both high-level use (`generatePalette` + `exportShadcn`) and granular access (individual utilities like `toOklch`, `calculateAPCA`). All types are exported for TypeScript consumers.

### Key Files

| File                        | Role                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------- |
| `core/export.ts`            | `exportCSS()`, `exportJSON()`, alpha computation, semantic tokens, P3 formatting                |
| `core/export-frameworks.ts` | `exportTailwind()`, `exportTailwindV4CSS()`, `exportShadcn()`, `exportRadix()`, `exportPanda()` |
| `index.ts`                  | Public API barrel file                                                                          |

---

## 6. Where Things Live

### Directory Structure

```
packages/colors/
  src/
    index.ts                  # Public API barrel file
    types.ts                  # Core type definitions (OklchColor, Scale, TuningProfile, etc.)
    utils/
      oklch.ts                # OKLCH color manipulation (Culori wrapper)
    core/
      hues.ts                 # 31 baseline hue definitions + snapping logic
      analyze.ts              # Brand color analysis + tuning profile extraction
      generate.ts             # Single scale generation + all Radix reference curves
      palette.ts              # Full 31-hue palette orchestration
      validate.ts             # APCA accessibility validation + enforcement
      export.ts               # CSS/JSON export, alpha computation, P3, semantic tokens
      export-frameworks.ts    # Tailwind, shadcn, Radix, Panda CSS exports
    reference/
      radix-scales.ts         # Radix hex values (light mode) for comparison
      radix-scales-dark.ts    # Radix hex values (dark mode)
      test-palettes.ts        # Preset brand color sets for demos/testing
    __tests__/                # Vitest unit tests (mirrors src/ structure)
  scripts/
    extract-radix.ts          # Extraction script that produced the reference curves
  dist/                       # Built output (generated by tsup)
```

### Why This Organization?

**`utils/`** &mdash; Pure utility functions with no domain knowledge. `oklch.ts` wraps Culori and could theoretically be used in any color project.

**`core/`** &mdash; Domain logic, organized by pipeline stage. Files are ordered by data flow: `hues` &rarr; `analyze` &rarr; `generate` &rarr; `palette` &rarr; `validate` &rarr; `export`. Each file has a single responsibility.

**`reference/`** &mdash; Static data extracted from external sources (Radix Colors). Not generated at runtime. The extraction script in `scripts/` documents how this data was produced.

**`types.ts`** at root &mdash; Shared across all modules. Types that serve a single file stay co-located with that file (e.g., `ColorValidationResult` in `oklch.ts`, `ColorAnalysis` in `analyze.ts`).

**`index.ts`** at root &mdash; Barrel file. Everything the consumer needs is re-exported here. The library supports both high-level use (`generatePalette` + `exportShadcn`) and granular access (`toOklch`, `calculateAPCA`).

### Data Flow

```
Brand hex colors (user input)
  |
  v
analyze.ts ──> TuningProfile (hueShift, chromaMultiplier, lightnessShift, anchors, customRows)
  |
  v
palette.ts ──> Palette (31+ hues x 12 steps x light/dark)
  |             |-- createTunedParent() for non-anchored hues
  |             |-- generateScaleAPCA() for each hue (from generate.ts)
  |             |-- generateCustomRowScale() for out-of-bounds colors
  |
  v
validate.ts ──> safePalette (ensureAccessibility: boost steps 11-12 if needed)
  |
  v
export.ts / export-frameworks.ts ──> CSS, JSON, Tailwind, shadcn, Radix, Panda output
```

### File Map

| File                             | Section | Role                                                 |
| -------------------------------- | ------- | ---------------------------------------------------- |
| `utils/oklch.ts`                 | 1       | OKLCH color manipulation (Culori wrapper)            |
| `types.ts`                       | 1, 3    | Core type definitions                                |
| `core/hues.ts`                   | 2       | 31 baseline hue definitions                          |
| `reference/radix-scales.ts`      | 2       | Radix reference values (light)                       |
| `reference/radix-scales-dark.ts` | 2       | Radix reference values (dark)                        |
| `core/analyze.ts`                | 3       | Brand color analysis and tuning profiles             |
| `core/generate.ts`               | 4       | Single scale generation + all Radix reference curves |
| `core/palette.ts`                | 4       | Full palette orchestration                           |
| `core/validate.ts`               | 4       | APCA accessibility validation                        |
| `core/export.ts`                 | 5       | CSS/JSON export with P3 and alpha                    |
| `core/export-frameworks.ts`      | 5       | Framework-specific exports                           |
| `index.ts`                       | 5       | Public API surface                                   |

---

## 7. Known Limitations and Future Considerations

- **`generateScale()` (v1)** in generate.ts is superseded by `generateScaleAPCA()`. Could be removed or marked `@deprecated`.
- **`lightnessShift`** is computed in the tuning profile but not applied during palette generation. The Radix lightness curves were deemed more reliable than shifting them based on brand preference.
- **Synthetic parent hex round-trip** &mdash; `createTunedParent()` converts OKLCH &rarr; hex, then `generateScaleAPCA()` converts back. Technically lossy but practically irrelevant (sub-pixel differences).
- **P3 export doubles CSS size** &mdash; consumers building production apps should consider `includeP3: false` if not targeting wide gamut displays.
