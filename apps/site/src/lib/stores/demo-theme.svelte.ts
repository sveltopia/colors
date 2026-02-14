/**
 * Demo Theme Store
 *
 * Manages dynamic CSS variable injection for brand preset switching.
 * Generates palettes in Tailwind v4 format (OKLCH, 50-950 scale with 850).
 *
 * Key features:
 * - Tailwind-compatible naming: --color-{hue}-{step}
 * - OKLCH color values for Tailwind v4 compatibility
 * - 50-950 scale mapping (with 850 for Radix step 10)
 * - Semantic aliases: --color-primary-*, --color-secondary-*
 */

import { generatePalette, type Palette, type Scale } from "@sveltopia/colors";
// @ts-expect-error - culori types
import { formatCss, parse } from "culori";

// Default brand colors (Sveltopia)
const DEFAULT_BRAND_COLORS = ["#FF6A00", "#43A047", "#1A1A1A"];

// Current brand colors (module-level state, not reactive)
let currentBrandColors: string[] = [...DEFAULT_BRAND_COLORS];

// Style element ID for cleanup
const STYLE_ELEMENT_ID = "demo-theme-css";

// Semantic role names for brand colors
const SEMANTIC_ROLES = ["primary", "secondary", "tertiary"] as const;

/**
 * Radix 1-12 to Tailwind 50-950 mapping
 * Includes non-standard 850 to preserve all 12 Radix steps
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
 * Convert hex color to OKLCH CSS string
 */
function hexToOklch(hex: string): string {
  const color = parse(hex);
  if (!color) return hex;
  const oklch = formatCss(color, "oklch");
  return oklch || hex;
}

/**
 * Generate a full Palette from brand colors (both light and dark modes)
 */
function generateFullPalette(colors: string[]): Palette {
  const lightPalette = generatePalette({ brandColors: colors, mode: "light" });
  const darkPalette = generatePalette({ brandColors: colors, mode: "dark" });

  return {
    light: lightPalette.scales,
    dark: darkPalette.scales,
    _meta: {
      tuningProfile: lightPalette.meta.tuningProfile,
      inputColors: colors,
      generatedAt: lightPalette.meta.generatedAt,
    },
  };
}

/**
 * Generate Tailwind-compatible CSS variables for all scales
 * Uses --color-{hue}-{step} naming with OKLCH values
 */
function generateTailwindVars(
  scales: Record<string, Scale>,
  selector: string,
): string {
  const lines: string[] = [];
  lines.push(`${selector} {`);

  for (const [hueName, scale] of Object.entries(scales)) {
    for (let radixStep = 1; radixStep <= 12; radixStep++) {
      const tailwindStep = RADIX_TO_TAILWIND[radixStep];
      const hex = scale[radixStep as keyof Scale];
      const oklch = hexToOklch(hex);
      lines.push(`  --color-${hueName}-${tailwindStep}: ${oklch};`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

/**
 * Generate semantic CSS aliases that map brand colors to --color-primary-*, etc.
 * Uses the tuning profile anchors to determine which hue each brand color maps to.
 */
function generateSemanticAliases(palette: Palette, selector: string): string {
  const anchors = palette._meta.tuningProfile.anchors;
  const inputColors = palette._meta.inputColors;
  const lines: string[] = [];

  lines.push(`${selector} {`);

  inputColors.forEach((hex, index) => {
    if (index >= SEMANTIC_ROLES.length) return;

    const anchor = anchors[hex];
    if (!anchor) return;

    const role = SEMANTIC_ROLES[index];
    const hue = anchor.slot; // e.g., 'orange', 'green', 'violet'

    // Generate Tailwind-style semantic aliases
    for (let radixStep = 1; radixStep <= 12; radixStep++) {
      const tailwindStep = RADIX_TO_TAILWIND[radixStep];
      lines.push(
        `  --color-${role}-${tailwindStep}: var(--color-${hue}-${tailwindStep});`,
      );
    }
    lines.push("");
  });

  lines.push("}");
  return lines.join("\n");
}

/**
 * Inject CSS into document body.
 * Uses body instead of head to ensure it loads after bundled CSS.
 */
function injectCSS(css: string): void {
  if (typeof document === "undefined") return;

  let styleEl = document.getElementById(
    STYLE_ELEMENT_ID,
  ) as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ELEMENT_ID;
    document.body.appendChild(styleEl);
  }

  styleEl.textContent = css;
}

/**
 * Generate and inject theme CSS from brand colors
 *
 * Generates:
 * 1. Tailwind-compatible CSS vars (--color-{hue}-{step} with OKLCH)
 * 2. Semantic aliases (--color-primary-*, --color-secondary-*, --color-tertiary-*)
 */
function updateTheme(colors: string[]): void {
  if (colors.length === 0) return;

  try {
    const palette = generateFullPalette(colors);

    // Generate Tailwind-compatible variables for light and dark modes
    const lightVars = generateTailwindVars(palette.light, "html .demo-theme");
    const darkVars = generateTailwindVars(
      palette.dark,
      "html .demo-theme.dark, html .dark .demo-theme",
    );

    // Generate semantic aliases for light and dark modes
    const lightAliases = generateSemanticAliases(palette, "html .demo-theme");
    const darkAliases = generateSemanticAliases(
      palette,
      "html .demo-theme.dark, html .dark .demo-theme",
    );

    // Combine all CSS
    const fullCSS = `/* Tailwind-compatible color variables (OKLCH, 50-950 scale) */
${lightVars}

${darkVars}

/* Semantic Aliases */
${lightAliases}

${darkAliases}`;

    injectCSS(fullCSS);
  } catch (error) {
    console.error("Failed to generate theme:", error);
  }
}

/**
 * Set brand colors and regenerate theme
 */
export function setDemoBrandColors(colors: string[]): void {
  currentBrandColors = colors;
  updateTheme(colors);
}

/**
 * Get current brand colors
 */
export function getDemoBrandColors(): string[] {
  return currentBrandColors;
}

/**
 * Reset to default brand colors
 */
export function resetDemoBrandColors(): void {
  currentBrandColors = [...DEFAULT_BRAND_COLORS];
  updateTheme(currentBrandColors);
}

/**
 * Initialize theme on mount (call from layout onMount)
 */
export function initDemoTheme(): void {
  updateTheme(currentBrandColors);
}

/**
 * Cleanup theme on unmount
 */
export function cleanupDemoTheme(): void {
  if (typeof document === "undefined") return;

  const styleEl = document.getElementById(STYLE_ELEMENT_ID);
  if (styleEl) {
    styleEl.remove();
  }
}
