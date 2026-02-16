/**
 * Framework-specific Export Formats
 *
 * Exports palettes in formats that drop directly into popular frameworks:
 * - Tailwind CSS (50-950 scale mapping)
 * - Radix UI Colors (drop-in replacement)
 * - Panda CSS (preset with semantic tokens)
 */

import type { Palette, Scale } from "../types.js";
import { ensureAccessibility } from "./validate.js";
import { toOklch } from "../utils/oklch.js";
import {
  getAlphaColorSrgb,
  getAlphaColorP3,
  formatAlphaHex,
  formatAlphaP3,
  sortScaleKeys,
  type BrandColorInfo,
} from "./export.js";

// =============================================================================
// Radix → Tailwind Scale Mapping
// =============================================================================

/**
 * Maps Radix 1-12 steps to Tailwind 50-950 scale.
 *
 * | Radix | Purpose              | Tailwind |
 * |-------|----------------------|----------|
 * | 1     | App background       | 50       |
 * | 2     | Subtle background    | 100      |
 * | 3     | UI element bg        | 200      |
 * | 4     | Hovered UI element   | 300      |
 * | 5     | Active/selected      | 400      |
 * | 6     | Subtle borders       | 500      |
 * | 7     | UI element border    | 600      |
 * | 8     | Hovered borders      | 700      |
 * | 9     | Solid backgrounds    | 800      |
 * | 10    | Hovered solid        | 850      |
 * | 11    | Low-contrast text    | 900      |
 * | 12    | High-contrast text   | 950      |
 */
const RADIX_TO_TAILWIND: Record<number, string> = {
  1: "50",
  2: "100",
  3: "200",
  4: "300",
  5: "400",
  6: "500",
  7: "600",
  8: "700",
  9: "800",
  10: "850",
  11: "900",
  12: "950",
};

/**
 * Maps each Radix hue to its adjacent hue on the color wheel.
 * Used for harmonious gradient generation (secondary → adjacent target).
 */
const ADJACENT_HUE_MAP: Record<string, string> = {
  // Warm reds → oranges
  red: "tomato",
  tomato: "orange",
  orange: "amber",
  amber: "yellow",
  yellow: "lime",

  // Greens
  lime: "green",
  green: "teal",
  grass: "green",

  // Cool blues
  teal: "cyan",
  cyan: "sky",
  sky: "blue",
  blue: "indigo",
  indigo: "violet",
  iris: "indigo",
  violet: "purple",
  purple: "plum",
  plum: "violet",

  // Pinks
  pink: "plum",
  crimson: "pink",
  ruby: "crimson",

  // Neutrals - pick warm or cool adjacent
  gray: "slate",
  mauve: "plum",
  slate: "blue",
  sage: "green",
  olive: "grass",
  sand: "amber",

  // Browns/golds
  gold: "amber",
  bronze: "gold",
  brown: "orange",
};

/**
 * Get the hue angle (in degrees) from step 9 of a scale.
 * Step 9 is the "solid" step — most representative of the hue.
 */
function getScaleHueAngle(scaleName: string, palette: Palette): number | null {
  const scale = palette.light[scaleName];
  if (!scale) return null;
  const oklch = toOklch(scale[9]);
  if (!oklch || oklch.c < 0.02) return null; // achromatic / near-neutral
  return oklch.h ?? null;
}

/**
 * Get the adjacent hue for gradient purposes.
 *
 * For known Radix hues, uses the curated static map. For custom or unknown
 * hues (e.g. generated rows like "neon-sky"), computes adjacency by finding
 * the palette hue whose step-9 hue angle is closest to ~30° clockwise from
 * the target hue on the color wheel.
 */
function getAdjacentHue(hue: string, palette?: Palette): string {
  // Fast path: known Radix hue
  if (ADJACENT_HUE_MAP[hue]) return ADJACENT_HUE_MAP[hue];

  // If no palette provided, fall back to the hue itself
  if (!palette) return hue;

  const targetAngle = getScaleHueAngle(hue, palette);
  if (targetAngle === null) return hue;

  // Look for the palette hue whose angle is closest to 30° clockwise
  const idealAngle = (targetAngle + 30) % 360;
  let bestHue = hue;
  let bestDist = Infinity;

  for (const candidate of Object.keys(palette.light)) {
    if (candidate === hue) continue;
    const angle = getScaleHueAngle(candidate, palette);
    if (angle === null) continue; // skip neutrals

    // Shortest angular distance to the ideal
    const diff = Math.abs(((angle - idealAngle + 540) % 360) - 180);
    if (diff < bestDist) {
      bestDist = diff;
      bestHue = candidate;
    }
  }

  return bestHue;
}

/**
 * Resolve anchor backfill for semantic role hues.
 *
 * - 0 anchors: primary = secondary = tertiary = 'gray'
 * - 1 anchor:  primary = secondary = tertiary = A1
 * - 2 anchors: primary = secondary = A1, tertiary = A2
 * - 3+ anchors: primary = A1, secondary = A2, tertiary = A3
 */
function resolveSemanticHues(anchors: Record<string, { slot: string }>) {
  const anchorEntries = Object.entries(anchors);

  let primaryHue: string;
  let secondaryHue: string;
  let tertiaryHue: string;

  if (anchorEntries.length >= 3) {
    primaryHue = anchorEntries[0][1].slot;
    secondaryHue = anchorEntries[1][1].slot;
    tertiaryHue = anchorEntries[2][1].slot;
  } else if (anchorEntries.length === 2) {
    primaryHue = anchorEntries[0][1].slot;
    secondaryHue = anchorEntries[1][1].slot;
    tertiaryHue = anchorEntries[0][1].slot;
  } else if (anchorEntries.length === 1) {
    primaryHue = anchorEntries[0][1].slot;
    secondaryHue = anchorEntries[0][1].slot;
    tertiaryHue = anchorEntries[0][1].slot;
  } else {
    primaryHue = "gray";
    secondaryHue = "gray";
    tertiaryHue = "gray";
  }

  return { primaryHue, secondaryHue, tertiaryHue };
}

// =============================================================================
// Tailwind Export
// =============================================================================

export interface TailwindExportOptions {
  /** Scale numbering system (default: '50-950' for drop-in compatibility) */
  scale?: "50-950" | "1-12";
  /** Dark mode strategy (default: 'class') */
  darkMode?: "class" | "media";
  /** Include alpha variants (default: false - adds significant size) */
  includeAlpha?: boolean;
}

/**
 * Export palette as a Tailwind CSS preset file.
 *
 * The generated file can be used as a preset:
 * ```js
 * // tailwind.config.js
 * import sveltopiaColors from './colors/tailwind.config.js'
 * export default {
 *   presets: [sveltopiaColors],
 * }
 * ```
 */
export function exportTailwind(
  palette: Palette,
  options: TailwindExportOptions = {},
): string {
  const safePalette = ensureAccessibility(palette);
  const { scale = "50-950", darkMode = "class" } = options;

  const useRadixScale = scale === "1-12";
  const mapping = useRadixScale ? null : RADIX_TO_TAILWIND;

  // Build color object for a scale
  const buildScale = (scaleData: Scale): Record<string, string> => {
    const result: Record<string, string> = {};
    for (let step = 1; step <= 12; step++) {
      const key = mapping ? mapping[step] : String(step);
      result[key] = scaleData[step as keyof Scale];
    }
    return result;
  };

  // Build all light mode colors (sorted in canonical Radix order)
  const lightColors: Record<string, Record<string, string>> = {};
  const sortedLightKeys = sortScaleKeys(Object.keys(safePalette.light));
  for (const name of sortedLightKeys) {
    lightColors[name] = buildScale(safePalette.light[name]);
  }

  // Build all dark mode colors (sorted in canonical Radix order)
  const darkColors: Record<string, Record<string, string>> = {};
  const sortedDarkKeys = sortScaleKeys(Object.keys(safePalette.dark));
  for (const name of sortedDarkKeys) {
    darkColors[name] = buildScale(safePalette.dark[name]);
  }

  // Generate the Tailwind config file content
  const brandColors = safePalette._meta.tuningProfile.anchors
    ? Object.keys(safePalette._meta.tuningProfile.anchors)
    : [];

  // Determine which hues are brand-anchored vs baseline
  const anchoredHues = new Set(
    Object.values(safePalette._meta.tuningProfile.anchors || {}).map(
      (a) => a.slot,
    ),
  );
  const allHues = Object.keys(safePalette.light);
  const baselineHues = allHues.filter((h) => !anchoredHues.has(h));
  const customHues = allHues.filter((h) => h.startsWith("custom-"));

  const output = `// Generated by @sveltopia/colors
// Brand colors: ${brandColors.join(", ") || "none"}
// Generated at: ${new Date().toISOString()}
//
// Hue coverage (${allHues.length} scales):
//   Brand-anchored: ${[...anchoredHues].join(", ") || "none"}
//   Baseline (Radix-compatible): ${baselineHues.filter((h) => !h.startsWith("custom-")).join(", ")}
${customHues.length > 0 ? `//   Custom rows: ${customHues.join(", ")}\n` : ""}
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: '${darkMode}',
  theme: {
    extend: {
      colors: ${JSON.stringify(lightColors, null, 8).replace(/^/gm, "      ").trim()},
    },
  },
  plugins: [
    // Dark mode color overrides
    function({ addBase }) {
      addBase({
        '.dark': {
          ${Object.entries(darkColors)
            .map(([name, scale]) => {
              return Object.entries(scale)
                .map(([step, hex]) => `'--color-${name}-${step}': '${hex}'`)
                .join(",\n          ");
            })
            .join(",\n          ")}
        }
      });
    },
  ],
};
`;

  return output;
}

/**
 * Export palette as Tailwind CSS with CSS custom properties approach.
 * This is an alternative that uses CSS variables for better dark mode support.
 */
export function exportTailwindWithCSSVars(
  palette: Palette,
  options: TailwindExportOptions = {},
): string {
  const safePalette = ensureAccessibility(palette);
  const { scale = "50-950", darkMode = "class" } = options;

  const useRadixScale = scale === "1-12";
  const mapping = useRadixScale ? null : RADIX_TO_TAILWIND;

  // Build CSS variable references for Tailwind
  const buildColorRefs = (
    scaleNames: string[],
  ): Record<string, Record<string, string>> => {
    const result: Record<string, Record<string, string>> = {};
    for (const name of scaleNames) {
      result[name] = {};
      for (let step = 1; step <= 12; step++) {
        const key = mapping ? mapping[step] : String(step);
        result[name][key] = `rgb(var(--color-${name}-${key}) / <alpha-value>)`;
      }
    }
    return result;
  };

  // Build CSS variable values
  const buildCSSVars = (
    scales: Record<string, Scale>,
    prefix: string = "",
  ): Record<string, string> => {
    const vars: Record<string, string> = {};
    for (const [name, scale] of Object.entries(scales)) {
      for (let step = 1; step <= 12; step++) {
        const key = mapping ? mapping[step] : String(step);
        const hex = scale[step as keyof Scale];
        // Convert hex to RGB values for Tailwind's alpha modifier support
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        vars[`--color-${name}-${key}`] = `${r} ${g} ${b}`;
      }
    }
    return vars;
  };

  const scaleNames = Object.keys(safePalette.light);
  const colorRefs = buildColorRefs(scaleNames);
  const lightVars = buildCSSVars(safePalette.light);
  const darkVars = buildCSSVars(safePalette.dark);

  const brandColors = safePalette._meta.tuningProfile.anchors
    ? Object.keys(safePalette._meta.tuningProfile.anchors)
    : [];

  const output = `// Generated by @sveltopia/colors
// Brand colors: ${brandColors.join(", ") || "none"}
// Generated at: ${new Date().toISOString()}
//
// This config uses CSS custom properties for better dark mode support.
// Include the generated CSS file in your project for the variables.

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: '${darkMode}',
  theme: {
    extend: {
      colors: ${JSON.stringify(colorRefs, null, 8).replace(/^/gm, "      ").trim()},
    },
  },
};

// CSS to include in your stylesheets:
/*
:root {
${Object.entries(lightVars)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join("\n")}
}

.dark {
${Object.entries(darkVars)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join("\n")}
}
*/
`;

  return output;
}

// =============================================================================
// Tailwind v4 CSS Export (OKLCH)
// =============================================================================

export interface TailwindV4CSSExportOptions {
  /** Include semantic role aliases (primary, secondary, tertiary) mapped to brand colors (default: true) */
  includeSemanticRoles?: boolean;
  /** Dark mode selector (default: '.dark') */
  darkSelector?: string;
  /** Light mode selector (default: ':root') */
  lightSelector?: string;
  /** Include @theme block for utility registration (default: true) */
  includeThemeBlock?: boolean;
}

/**
 * Export palette as Tailwind v4 compatible CSS with OKLCH values.
 *
 * Generates a complete CSS file that can be imported directly into Tailwind v4 projects.
 * Includes CSS variables for light/dark mode AND a @theme block for utility registration.
 *
 * Usage with Tailwind v4:
 * ```css
 * @import 'tailwindcss';
 * @import './colors.css';
 * ```
 *
 * That's it! The colors.css file contains everything needed:
 * - CSS variables in :root and .dark for light/dark mode values
 * - @theme block to register utilities (bg-orange-800, text-primary-900, etc.)
 */
export function exportTailwindV4CSS(
  palette: Palette,
  options: TailwindV4CSSExportOptions = {},
): string {
  const safePalette = ensureAccessibility(palette);
  const {
    includeSemanticRoles = true,
    darkSelector = ".dark",
    lightSelector = ":root",
    includeThemeBlock = true,
  } = options;

  const lines: string[] = [];

  // Build header comment
  const brandColors = safePalette._meta.tuningProfile.anchors
    ? Object.keys(safePalette._meta.tuningProfile.anchors)
    : [];

  // Determine which hues are brand-anchored vs baseline
  const anchoredHues = new Set(
    Object.values(safePalette._meta.tuningProfile.anchors || {}).map(
      (a) => a.slot,
    ),
  );
  const allHues = Object.keys(safePalette.light);
  const baselineHues = allHues.filter(
    (h) => !anchoredHues.has(h) && !h.startsWith("custom-"),
  );
  const customHues = allHues.filter((h) => h.startsWith("custom-"));

  // Collect all color names for @theme block
  const allColorNames: string[] = [
    ...sortScaleKeys(Object.keys(safePalette.light)),
  ];
  if (includeSemanticRoles) {
    allColorNames.push("primary", "secondary", "tertiary");
  }

  lines.push("/**");
  lines.push(" * Generated by @sveltopia/colors");
  lines.push(` * Brand colors: ${brandColors.join(", ") || "none"}`);
  lines.push(` * Generated at: ${new Date().toISOString()}`);
  lines.push(" *");
  lines.push(" * Tailwind v4 CSS-first configuration with OKLCH colors");
  lines.push(' * Usage: @import "tailwindcss"; @import "./colors.css";');
  lines.push(" *");
  lines.push(` * Hue coverage (${allHues.length} scales):`);
  lines.push(` *   Brand-anchored: ${[...anchoredHues].join(", ") || "none"}`);
  lines.push(` *   Baseline (Radix-compatible): ${baselineHues.join(", ")}`);
  if (customHues.length > 0) {
    lines.push(` *   Custom rows: ${customHues.join(", ")}`);
  }
  lines.push(" */");
  lines.push("");

  // Light mode variables
  lines.push(`${lightSelector} {`);
  const sortedLightKeys = sortScaleKeys(Object.keys(safePalette.light));
  for (const name of sortedLightKeys) {
    const scale = safePalette.light[name];
    for (let step = 1; step <= 12; step++) {
      const tailwindStep = RADIX_TO_TAILWIND[step];
      const hex = scale[step as keyof Scale];
      const oklch = hexToOklch(hex);
      lines.push(`  --color-${name}-${tailwindStep}: ${oklch};`);
    }
  }

  // Add semantic role aliases for light mode (with backfill for missing accents)
  if (includeSemanticRoles) {
    const anchors = safePalette._meta.tuningProfile.anchors || {};
    const { primaryHue, secondaryHue, tertiaryHue } =
      resolveSemanticHues(anchors);

    const roleMapping = [
      { role: "primary", hue: primaryHue },
      { role: "secondary", hue: secondaryHue },
      { role: "tertiary", hue: tertiaryHue },
      {
        role: "primary-adjacent",
        hue: getAdjacentHue(primaryHue, safePalette),
      },
      { role: "adjacent", hue: getAdjacentHue(secondaryHue, safePalette) },
    ];

    for (const { role, hue } of roleMapping) {
      lines.push("");
      lines.push(`  /* ${role} = ${hue} */`);
      for (let step = 1; step <= 12; step++) {
        const tailwindStep = RADIX_TO_TAILWIND[step];
        lines.push(
          `  --color-${role}-${tailwindStep}: var(--color-${hue}-${tailwindStep});`,
        );
      }
    }
  }

  lines.push("}");
  lines.push("");

  // Dark mode variables
  lines.push(`${darkSelector} {`);
  const sortedDarkKeys = sortScaleKeys(Object.keys(safePalette.dark));
  for (const name of sortedDarkKeys) {
    const scale = safePalette.dark[name];
    for (let step = 1; step <= 12; step++) {
      const tailwindStep = RADIX_TO_TAILWIND[step];
      const hex = scale[step as keyof Scale];
      const oklch = hexToOklch(hex);
      lines.push(`  --color-${name}-${tailwindStep}: ${oklch};`);
    }
  }

  // Add semantic role aliases for dark mode (with backfill for missing accents)
  if (includeSemanticRoles) {
    const anchors = safePalette._meta.tuningProfile.anchors || {};
    const { primaryHue, secondaryHue, tertiaryHue } =
      resolveSemanticHues(anchors);

    const roleMapping = [
      { role: "primary", hue: primaryHue },
      { role: "secondary", hue: secondaryHue },
      { role: "tertiary", hue: tertiaryHue },
      {
        role: "primary-adjacent",
        hue: getAdjacentHue(primaryHue, safePalette),
      },
      { role: "adjacent", hue: getAdjacentHue(secondaryHue, safePalette) },
    ];

    for (const { role, hue } of roleMapping) {
      lines.push("");
      lines.push(`  /* ${role} = ${hue} */`);
      for (let step = 1; step <= 12; step++) {
        const tailwindStep = RADIX_TO_TAILWIND[step];
        lines.push(
          `  --color-${role}-${tailwindStep}: var(--color-${hue}-${tailwindStep});`,
        );
      }
    }
  }

  lines.push("}");

  // Add @theme block to register utilities with Tailwind
  if (includeThemeBlock) {
    lines.push("");
    lines.push("/*");
    lines.push(" * @theme registers color utilities with Tailwind v4");
    lines.push(
      " * This enables classes like bg-orange-800, text-primary-900, etc.",
    );
    lines.push(" */");
    lines.push("@theme {");
    for (const name of allColorNames) {
      for (let step = 1; step <= 12; step++) {
        const tailwindStep = RADIX_TO_TAILWIND[step];
        lines.push(
          `  --color-${name}-${tailwindStep}: var(--color-${name}-${tailwindStep});`,
        );
      }
    }
    lines.push("}");
  }

  return lines.join("\n");
}

// =============================================================================
// shadcn Export
// =============================================================================

export interface ShadcnExportOptions {
  /** Border radius base value (default: '0.625rem') */
  radius?: string;
  /** Neutral hue for background/surface tokens (default: 'slate') */
  neutralHue?: string;
  /** Hue for destructive tokens (default: 'red') */
  destructiveHue?: string;
  /** Include chart color tokens (default: true) */
  includeCharts?: boolean;
  /** Include sidebar tokens (default: true) */
  includeSidebar?: boolean;
  /** Include @theme block from base Tailwind export (default: true) */
  includeThemeBlock?: boolean;
  /** Include @theme inline block for semantic utility registration (default: true) */
  includeThemeInlineBlock?: boolean;
  /** Light mode selector (default: ':root') */
  lightSelector?: string;
  /** Dark mode selector (default: '.dark') */
  darkSelector?: string;
}

/**
 * Export palette as shadcn compatible CSS.
 *
 * Composes on top of `exportTailwindV4CSS` (color scales + @theme) and appends:
 * 1. shadcn semantic tokens in :root and .dark
 * 2. A @theme inline block for semantic utility registration + radius tokens
 *
 * Usage with Tailwind v4 + shadcn:
 * ```css
 * @import 'tailwindcss';
 * @import './shadcn-colors.css';
 * ```
 */
export function exportShadcn(
  palette: Palette,
  options: ShadcnExportOptions = {},
): string {
  const {
    radius = "0.625rem",
    neutralHue = "slate",
    destructiveHue = "red",
    includeCharts = true,
    includeSidebar = true,
    includeThemeBlock = true,
    includeThemeInlineBlock = true,
    lightSelector = ":root",
    darkSelector = ".dark",
  } = options;

  // Get the base Tailwind v4 CSS (color scales + @theme block)
  const base = exportTailwindV4CSS(palette, {
    includeThemeBlock,
    lightSelector,
    darkSelector,
  });

  const lines: string[] = [base];

  // Resolve semantic hues from palette anchors
  const anchors = palette._meta.tuningProfile.anchors || {};
  const { primaryHue, secondaryHue } = resolveSemanticHues(anchors);

  lines.push("");
  lines.push("/*");
  lines.push(" * shadcn Semantic Tokens");
  lines.push(" *");
  lines.push(" * These map to the palette for component theming.");
  lines.push(` * Uses primary-800 as the main accent (Radix step 9).`);
  lines.push(" */");

  // ── Light mode semantic tokens ──
  lines.push(`${lightSelector} {`);
  lines.push(`  --radius: ${radius};`);
  lines.push("");
  lines.push("  /* Semantic tokens using Sveltopia Colors palette */");
  lines.push(`  --background: var(--color-${neutralHue}-50);`);
  lines.push(`  --foreground: var(--color-${neutralHue}-950);`);
  lines.push(`  --card: var(--color-${neutralHue}-50);`);
  lines.push(`  --card-foreground: var(--color-${neutralHue}-950);`);
  lines.push(`  --popover: var(--color-${neutralHue}-50);`);
  lines.push(`  --popover-foreground: var(--color-${neutralHue}-950);`);
  lines.push(`  --primary: var(--color-primary-800);`);
  lines.push(`  --primary-foreground: white;`);
  lines.push(`  --secondary: var(--color-${neutralHue}-200);`);
  lines.push(`  --secondary-foreground: var(--color-${neutralHue}-950);`);
  lines.push(`  --muted: var(--color-${neutralHue}-200);`);
  lines.push(`  --muted-foreground: var(--color-${neutralHue}-900);`);
  lines.push(`  --accent: var(--color-secondary-800);`);
  lines.push(`  --accent-foreground: white;`);
  lines.push(`  --destructive: var(--color-${destructiveHue}-800);`);
  lines.push(`  --border: var(--color-${neutralHue}-500);`);
  lines.push(`  --input: var(--color-${neutralHue}-500);`);
  lines.push(`  --ring: var(--color-primary-700);`);

  if (includeCharts) {
    lines.push(`  --chart-1: var(--color-primary-800);`);
    lines.push(`  --chart-2: var(--color-secondary-800);`);
    lines.push(`  --chart-3: var(--color-blue-800);`);
    lines.push(`  --chart-4: var(--color-purple-800);`);
    lines.push(`  --chart-5: var(--color-amber-800);`);
  }

  if (includeSidebar) {
    lines.push(`  --sidebar: var(--color-${neutralHue}-100);`);
    lines.push(`  --sidebar-foreground: var(--color-${neutralHue}-950);`);
    lines.push(`  --sidebar-primary: var(--color-primary-800);`);
    lines.push(`  --sidebar-primary-foreground: white;`);
    lines.push(`  --sidebar-accent: var(--color-${neutralHue}-300);`);
    lines.push(
      `  --sidebar-accent-foreground: var(--color-${neutralHue}-950);`,
    );
    lines.push(`  --sidebar-border: var(--color-${neutralHue}-500);`);
    lines.push(`  --sidebar-ring: var(--color-primary-700);`);
  }

  lines.push("}");
  lines.push("");

  // ── Dark mode overrides ──
  lines.push(`${darkSelector} {`);
  lines.push(`  --background: var(--color-${neutralHue}-50);`);
  lines.push(`  --foreground: var(--color-${neutralHue}-950);`);
  lines.push(`  --card: var(--color-${neutralHue}-100);`);
  lines.push(`  --card-foreground: var(--color-${neutralHue}-950);`);
  lines.push(`  --popover: var(--color-${neutralHue}-100);`);
  lines.push(`  --popover-foreground: var(--color-${neutralHue}-950);`);
  lines.push(`  --primary: var(--color-primary-800);`);
  lines.push(`  --primary-foreground: white;`);
  lines.push(`  --secondary: var(--color-${neutralHue}-200);`);
  lines.push(`  --secondary-foreground: var(--color-${neutralHue}-950);`);
  lines.push(`  --muted: var(--color-${neutralHue}-200);`);
  lines.push(`  --muted-foreground: var(--color-${neutralHue}-900);`);
  lines.push(`  --accent: var(--color-secondary-800);`);
  lines.push(`  --accent-foreground: white;`);
  lines.push(`  --destructive: var(--color-${destructiveHue}-800);`);
  lines.push(`  --border: var(--color-${neutralHue}-500);`);
  lines.push(`  --input: var(--color-${neutralHue}-500);`);
  lines.push(`  --ring: var(--color-primary-700);`);

  if (includeCharts) {
    lines.push(`  --chart-1: var(--color-primary-800);`);
    lines.push(`  --chart-2: var(--color-secondary-800);`);
    lines.push(`  --chart-3: var(--color-blue-800);`);
    lines.push(`  --chart-4: var(--color-purple-800);`);
    lines.push(`  --chart-5: var(--color-amber-800);`);
  }

  if (includeSidebar) {
    lines.push(`  --sidebar: var(--color-${neutralHue}-100);`);
    lines.push(`  --sidebar-foreground: var(--color-${neutralHue}-950);`);
    lines.push(`  --sidebar-primary: var(--color-primary-800);`);
    lines.push(`  --sidebar-primary-foreground: white;`);
    lines.push(`  --sidebar-accent: var(--color-${neutralHue}-300);`);
    lines.push(
      `  --sidebar-accent-foreground: var(--color-${neutralHue}-950);`,
    );
    lines.push(`  --sidebar-border: var(--color-${neutralHue}-500);`);
    lines.push(`  --sidebar-ring: var(--color-primary-700);`);
  }

  lines.push("}");
  lines.push("");

  if (!includeThemeInlineBlock) {
    return lines.join("\n");
  }

  // ── @theme inline (semantic utility registration + radius) ──
  lines.push("@theme inline {");
  lines.push("  --radius-sm: calc(var(--radius) - 4px);");
  lines.push("  --radius-md: calc(var(--radius) - 2px);");
  lines.push("  --radius-lg: var(--radius);");
  lines.push("  --radius-xl: calc(var(--radius) + 4px);");

  // Semantic token -> utility mapping
  const semanticTokens = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "border",
    "input",
    "ring",
  ];

  for (const token of semanticTokens) {
    lines.push(`  --color-${token}: var(--${token});`);
  }

  if (includeCharts) {
    for (let i = 1; i <= 5; i++) {
      lines.push(`  --color-chart-${i}: var(--chart-${i});`);
    }
  }

  if (includeSidebar) {
    const sidebarTokens = [
      "sidebar",
      "sidebar-foreground",
      "sidebar-primary",
      "sidebar-primary-foreground",
      "sidebar-accent",
      "sidebar-accent-foreground",
      "sidebar-border",
      "sidebar-ring",
    ];
    for (const token of sidebarTokens) {
      lines.push(`  --color-${token}: var(--${token});`);
    }
  }

  lines.push("}");

  return lines.join("\n");
}

// =============================================================================
// Radix Export
// =============================================================================

export interface RadixExportOptions {
  /** Include alpha variants (default: true) */
  includeAlpha?: boolean;
  /** Include P3 wide gamut variants (default: true) */
  includeP3?: boolean;
  /** Export format: 'esm' for ES modules, 'cjs' for CommonJS (default: 'esm') */
  format?: "esm" | "cjs";
}

/**
 * Export palette in Radix UI Colors format.
 *
 * Generates files that exactly match @radix-ui/colors structure:
 * - Named exports for each scale (red, redA, redP3, redP3A, redDark, etc.)
 * - Same key naming convention (red1, red2, ... red12)
 * - Tree-shakeable named exports
 */
export function exportRadix(
  palette: Palette,
  options: RadixExportOptions = {},
): string {
  const safePalette = ensureAccessibility(palette);
  const { includeAlpha = true, includeP3 = true, format = "esm" } = options;

  const exports: string[] = [];
  const allExportNames: string[] = [];

  // Helper to build a scale object string
  const buildScaleObject = (
    name: string,
    scale: Scale,
    suffix: string = "",
  ): string => {
    const entries = [];
    for (let step = 1; step <= 12; step++) {
      entries.push(
        `  ${name}${suffix}${step}: '${scale[step as keyof Scale]}'`,
      );
    }
    return `{\n${entries.join(",\n")}\n}`;
  };

  // Helper to build alpha scale
  const buildAlphaScaleObject = (
    name: string,
    scale: Scale,
    mode: "light" | "dark",
    suffix: string = "A",
  ): string => {
    const backgroundHex = mode === "light" ? "#ffffff" : "#000000";
    const entries = [];
    for (let step = 1; step <= 12; step++) {
      const hex = scale[step as keyof Scale];
      const [r, g, b, a] = getAlphaColorSrgb(hex, backgroundHex);
      entries.push(
        `  ${name}${suffix}${step}: '${formatAlphaHex(r, g, b, a)}'`,
      );
    }
    return `{\n${entries.join(",\n")}\n}`;
  };

  // Helper to build P3 scale
  const buildP3ScaleObject = (
    name: string,
    scale: Scale,
    suffix: string = "P3",
  ): string => {
    const entries = [];
    for (let step = 1; step <= 12; step++) {
      const hex = scale[step as keyof Scale];
      // Convert to P3 color string
      const p3Str = hexToP3(hex);
      entries.push(`  ${name}${suffix}${step}: '${p3Str}'`);
    }
    return `{\n${entries.join(",\n")}\n}`;
  };

  // Helper to build P3 alpha scale
  const buildP3AlphaScaleObject = (
    name: string,
    scale: Scale,
    mode: "light" | "dark",
    suffix: string = "P3A",
  ): string => {
    const backgroundHex = mode === "light" ? "#ffffff" : "#000000";
    const entries = [];
    for (let step = 1; step <= 12; step++) {
      const hex = scale[step as keyof Scale];
      const [r, g, b, a] = getAlphaColorP3(hex, backgroundHex);
      entries.push(`  ${name}${suffix}${step}: '${formatAlphaP3(r, g, b, a)}'`);
    }
    return `{\n${entries.join(",\n")}\n}`;
  };

  // Process each scale (sorted in canonical Radix order)
  const sortedScaleNames = sortScaleKeys(Object.keys(safePalette.light));
  for (const name of sortedScaleNames) {
    const lightScale = safePalette.light[name];
    const darkScale = safePalette.dark[name];

    // Light mode - base
    const exportName = name;
    allExportNames.push(exportName);
    if (format === "esm") {
      exports.push(
        `export const ${exportName} = ${buildScaleObject(name, lightScale)};`,
      );
    } else {
      exports.push(
        `const ${exportName} = ${buildScaleObject(name, lightScale)};`,
      );
    }

    // Light mode - alpha
    if (includeAlpha) {
      const alphaName = `${name}A`;
      allExportNames.push(alphaName);
      if (format === "esm") {
        exports.push(
          `export const ${alphaName} = ${buildAlphaScaleObject(name, lightScale, "light")};`,
        );
      } else {
        exports.push(
          `const ${alphaName} = ${buildAlphaScaleObject(name, lightScale, "light")};`,
        );
      }
    }

    // Light mode - P3
    if (includeP3) {
      const p3Name = `${name}P3`;
      allExportNames.push(p3Name);
      if (format === "esm") {
        exports.push(
          `export const ${p3Name} = ${buildP3ScaleObject(name, lightScale)};`,
        );
      } else {
        exports.push(
          `const ${p3Name} = ${buildP3ScaleObject(name, lightScale)};`,
        );
      }
    }

    // Light mode - P3 Alpha
    if (includeAlpha && includeP3) {
      const p3aName = `${name}P3A`;
      allExportNames.push(p3aName);
      if (format === "esm") {
        exports.push(
          `export const ${p3aName} = ${buildP3AlphaScaleObject(name, lightScale, "light")};`,
        );
      } else {
        exports.push(
          `const ${p3aName} = ${buildP3AlphaScaleObject(name, lightScale, "light")};`,
        );
      }
    }

    // Dark mode - base
    const darkName = `${name}Dark`;
    allExportNames.push(darkName);
    if (format === "esm") {
      exports.push(
        `export const ${darkName} = ${buildScaleObject(name, darkScale)};`,
      );
    } else {
      exports.push(`const ${darkName} = ${buildScaleObject(name, darkScale)};`);
    }

    // Dark mode - alpha
    if (includeAlpha) {
      const darkAlphaName = `${name}DarkA`;
      allExportNames.push(darkAlphaName);
      if (format === "esm") {
        exports.push(
          `export const ${darkAlphaName} = ${buildAlphaScaleObject(name, darkScale, "dark")};`,
        );
      } else {
        exports.push(
          `const ${darkAlphaName} = ${buildAlphaScaleObject(name, darkScale, "dark")};`,
        );
      }
    }

    // Dark mode - P3
    if (includeP3) {
      const darkP3Name = `${name}DarkP3`;
      allExportNames.push(darkP3Name);
      if (format === "esm") {
        exports.push(
          `export const ${darkP3Name} = ${buildP3ScaleObject(name, darkScale)};`,
        );
      } else {
        exports.push(
          `const ${darkP3Name} = ${buildP3ScaleObject(name, darkScale)};`,
        );
      }
    }

    // Dark mode - P3 Alpha
    if (includeAlpha && includeP3) {
      const darkP3aName = `${name}DarkP3A`;
      allExportNames.push(darkP3aName);
      if (format === "esm") {
        exports.push(
          `export const ${darkP3aName} = ${buildP3AlphaScaleObject(name, darkScale, "dark")};`,
        );
      } else {
        exports.push(
          `const ${darkP3aName} = ${buildP3AlphaScaleObject(name, darkScale, "dark")};`,
        );
      }
    }

    exports.push(""); // Blank line between scales
  }

  // Build header comment
  const brandColors = safePalette._meta.tuningProfile.anchors
    ? Object.keys(safePalette._meta.tuningProfile.anchors)
    : [];

  // Determine which hues are brand-anchored vs baseline
  const anchoredHues = new Set(
    Object.values(safePalette._meta.tuningProfile.anchors || {}).map(
      (a) => a.slot,
    ),
  );
  const allHues = Object.keys(safePalette.light);
  const baselineHues = allHues.filter(
    (h) => !anchoredHues.has(h) && !h.startsWith("custom-"),
  );
  const customHues = allHues.filter((h) => h.startsWith("custom-"));

  let header = `/**
 * Generated by @sveltopia/colors
 * Brand colors: ${brandColors.join(", ") || "none"}
 * Generated at: ${new Date().toISOString()}
 *
 * Drop-in replacement for @radix-ui/colors
 * Usage:
 *   import { red, redA, redDark, redDarkA } from './colors.js';
 *
 * Hue coverage (${allHues.length} scales):
 *   Brand-anchored: ${[...anchoredHues].join(", ") || "none"}
 *   Baseline (Radix drop-in): ${baselineHues.join(", ")}
${customHues.length > 0 ? ` *   Custom rows: ${customHues.join(", ")}\n` : ""} */

`;

  // Add CJS exports if needed
  if (format === "cjs") {
    const cjsExports = `\nmodule.exports = {\n  ${allExportNames.join(",\n  ")}\n};\n`;
    return header + exports.join("\n") + cjsExports;
  }

  return header + exports.join("\n");
}

// =============================================================================
// Panda CSS Export
// =============================================================================

export interface PandaExportOptions {
  /** Include semantic tokens for accent/brand (default: true) */
  includeSemantic?: boolean;
}

/**
 * Export palette as a Panda CSS preset.
 *
 * Generates a preset file that can be imported into panda.config.ts:
 * ```ts
 * import { sveltopiaColors } from './colors/panda.preset';
 * export default defineConfig({
 *   presets: [sveltopiaColors],
 * });
 * ```
 *
 * Dark mode is automatic - just use `orange.1` and it switches based on
 * `data-theme` attribute or `.dark` class on a parent element.
 */
export function exportPanda(
  palette: Palette,
  brandColorInfo: BrandColorInfo[],
  options: PandaExportOptions = {},
): string {
  const safePalette = ensureAccessibility(palette);
  const { includeSemantic = true } = options;

  // Build raw token structure for all scales (both light and dark)
  const buildRawTokens = (
    lightScales: Record<string, Scale>,
    darkScales: Record<string, Scale>,
  ): Record<string, Record<string, { value: string }>> => {
    const tokens: Record<string, Record<string, { value: string }>> = {};

    // Add light mode tokens (e.g., orangeLight) - sorted in canonical order
    const sortedNames = sortScaleKeys(Object.keys(lightScales));
    for (const name of sortedNames) {
      const scale = lightScales[name];
      tokens[`${name}Light`] = {};
      for (let step = 1; step <= 12; step++) {
        tokens[`${name}Light`][step] = { value: scale[step as keyof Scale] };
      }
    }

    // Add dark mode tokens (e.g., orangeDark) - sorted in canonical order
    for (const name of sortedNames) {
      const scale = darkScales[name];
      tokens[`${name}Dark`] = {};
      for (let step = 1; step <= 12; step++) {
        tokens[`${name}Dark`][step] = { value: scale[step as keyof Scale] };
      }
    }

    return tokens;
  };

  // Build semantic tokens that wire light/dark together with conditions
  const buildSemanticColorTokens = (
    scaleNames: string[],
  ): Record<
    string,
    Record<string | number, { value: { base: string; _dark: string } }>
  > => {
    const semanticColors: Record<
      string,
      Record<string | number, { value: { base: string; _dark: string } }>
    > = {};

    for (const name of scaleNames) {
      semanticColors[name] = {};
      for (let step = 1; step <= 12; step++) {
        semanticColors[name][step] = {
          value: {
            base: `{colors.${name}Light.${step}}`,
            _dark: `{colors.${name}Dark.${step}}`,
          },
        };
      }
    }

    return semanticColors;
  };

  const rawTokens = buildRawTokens(safePalette.light, safePalette.dark);
  const scaleNames = sortScaleKeys(Object.keys(safePalette.light));
  const semanticColorTokens = buildSemanticColorTokens(scaleNames);

  // Build additional semantic tokens for accent/brand if we have brand color info
  let brandSemanticTokens: Record<string, unknown> = {};
  if (includeSemantic && brandColorInfo.length > 0) {
    const primary = brandColorInfo[0];
    const secondary = brandColorInfo[1] || { hue: "gray", anchorStep: 11 };

    // Build accent scale that references the primary brand hue
    const accentTokens: Record<
      string | number,
      { value: { base: string; _dark: string } }
    > = {};
    for (let step = 1; step <= 12; step++) {
      accentTokens[step] = {
        value: {
          base: `{colors.${primary.hue}Light.${step}}`,
          _dark: `{colors.${primary.hue}Dark.${step}}`,
        },
      };
    }
    accentTokens["DEFAULT"] = {
      value: {
        base: `{colors.${primary.hue}Light.${primary.anchorStep}}`,
        _dark: `{colors.${primary.hue}Dark.${primary.anchorStep}}`,
      },
    };

    brandSemanticTokens = {
      accent: accentTokens,
      brand: {
        primary: {
          value: {
            base: `{colors.${primary.hue}Light.${primary.anchorStep}}`,
            _dark: `{colors.${primary.hue}Dark.${primary.anchorStep}}`,
          },
        },
        secondary: {
          value: {
            base: `{colors.${secondary.hue}Light.${secondary.anchorStep}}`,
            _dark: `{colors.${secondary.hue}Dark.${secondary.anchorStep}}`,
          },
        },
      },
    };
  }

  // Merge all semantic color tokens
  const allSemanticColors = {
    ...semanticColorTokens,
    ...(includeSemantic && brandColorInfo.length > 0
      ? brandSemanticTokens
      : {}),
  };

  const brandColors = brandColorInfo.map((b) => b.hex);

  // Determine which hues are brand-anchored vs baseline
  const anchoredHues = new Set(
    Object.values(safePalette._meta.tuningProfile.anchors || {}).map(
      (a) => a.slot,
    ),
  );
  const allHues = Object.keys(safePalette.light);
  const baselineHues = allHues.filter(
    (h) => !anchoredHues.has(h) && !h.startsWith("custom-"),
  );
  const customHues = allHues.filter((h) => h.startsWith("custom-"));

  const output = `/**
 * Generated by @sveltopia/colors
 * Brand colors: ${brandColors.join(", ") || "none"}
 * Generated at: ${new Date().toISOString()}
 *
 * Usage:
 *   import { sveltopiaColors } from './panda.preset';
 *   export default defineConfig({ presets: [sveltopiaColors] });
 *
 * Dark mode is automatic! Just add data-theme="dark" or class="dark" to a parent:
 *   <html data-theme="dark">
 *   <div class={css({ bg: 'orange.3' })}> // Automatically uses dark palette
 *
 * Hue coverage (${allHues.length} scales):
 *   Brand-anchored: ${[...anchoredHues].join(", ") || "none"}
 *   Baseline (Radix-compatible): ${baselineHues.join(", ")}
${customHues.length > 0 ? ` *   Custom rows: ${customHues.join(", ")}\n` : ""} */

import { definePreset } from '@pandacss/dev';

export const sveltopiaColors = definePreset({
  theme: {
    conditions: {
      light: '[data-theme=light] &, .light &',
      dark: '[data-theme=dark] &, .dark &'
    },
    tokens: {
      colors: ${JSON.stringify(rawTokens, null, 8).replace(/^/gm, "      ").trim()}
    },
    semanticTokens: {
      colors: ${JSON.stringify(allSemanticColors, null, 8).replace(/^/gm, "      ").trim()}
    }
  }
});
`;

  return output;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Convert hex color to P3 color string
 */
function hexToP3(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return `color(display-p3 ${r.toFixed(4)} ${g.toFixed(4)} ${b.toFixed(4)})`;
}

/**
 * Convert hex color to OKLCH CSS string
 */
function hexToOklch(hex: string): string {
  const oklch = toOklch(hex);
  if (!oklch) return "oklch(0 0 0)";

  // Format with reasonable precision
  const l = oklch.l.toFixed(4);
  const c = oklch.c.toFixed(4);
  const h = oklch.h !== undefined ? oklch.h.toFixed(2) : "0";
  return `oklch(${l} ${c} ${h})`;
}
