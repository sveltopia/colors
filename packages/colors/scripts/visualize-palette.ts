/**
 * Generate a visual HTML grid of the full palette.
 * Outputs palette-grid.html for visual inspection.
 *
 * Layout matches Radix Colors for easy comparison:
 * - Neutrals grouped at top
 * - Chromatic colors in Radix order
 * - Semantic column headers
 */

import { generateLightPalette, getPaletteStats } from '../src/core/palette.js';
import { BASELINE_HUES } from '../src/core/hues.js';
import * as fs from 'fs';
import * as path from 'path';

// Sveltopia brand colors
const SVELTOPIA_ORANGE = '#FF6A00';
const SVELTOPIA_GREEN = '#43A047';
const SVELTOPIA_DARK = '#1A1A1A';

// Generate palette
const palette = generateLightPalette({
	brandColors: [SVELTOPIA_ORANGE, SVELTOPIA_GREEN, SVELTOPIA_DARK]
});

const stats = getPaletteStats(palette);

// Radix-style ordering: neutrals first, then chromatic colors
// This matches the exact order shown on radix-ui.com/colors
const RADIX_ORDER = [
	// Neutrals
	'gray',
	'mauve',
	'slate',
	'sage',
	'olive',
	'sand',
	// Reds/Oranges (warm)
	'tomato',
	'red',
	'ruby',
	'crimson',
	// Pinks/Purples
	'pink',
	'plum',
	'purple',
	'violet',
	// Blues
	'iris',
	'indigo',
	'blue',
	'cyan',
	// Teals/Greens
	'teal',
	'jade',
	'green',
	'grass',
	// Warm neutrals
	'bronze',
	'gold',
	'brown',
	// Oranges/Yellows
	'orange',
	'amber',
	'yellow',
	'lime',
	// Cyans
	'mint',
	'sky',
];

// Build ordered hue list (filter to only hues we have)
const orderedHues = RADIX_ORDER
	.filter(key => palette.scales[key])
	.map(key => [key, BASELINE_HUES[key]] as const);

// Build HTML
let html = `<!DOCTYPE html>
<html>
<head>
  <title>Sveltopia Colors - Full Palette</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #fafafa;
      color: #1a1a1a;
      padding: 40px;
      margin: 0;
    }
    h1 { margin-bottom: 10px; }
    .subtitle { color: #666; margin-bottom: 30px; }
    .stats {
      display: flex;
      gap: 30px;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .stat {
      background: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #e5e5e5;
    }
    .stat-value { font-size: 24px; font-weight: bold; }
    .stat-label { color: #888; margin-top: 4px; }
    .brand-colors {
      display: flex;
      gap: 16px;
      margin-bottom: 40px;
    }
    .brand-color {
      text-align: center;
    }
    .brand-swatch {
      width: 80px;
      height: 50px;
      border-radius: 8px;
      border: 1px solid rgba(0,0,0,0.1);
    }
    .brand-label {
      font-size: 11px;
      color: #888;
      margin-top: 6px;
      font-family: monospace;
    }
    .semantic-headers {
      display: grid;
      grid-template-columns: 100px repeat(12, 1fr);
      gap: 2px;
      margin-bottom: 4px;
      font-size: 11px;
      color: #888;
    }
    .semantic-header {
      text-align: center;
      padding: 4px;
      background: #f0f0f0;
      border-radius: 4px;
    }
    .semantic-header.span-2 { grid-column: span 2; }
    .semantic-header.span-3 { grid-column: span 3; }
    .grid {
      display: grid;
      grid-template-columns: 100px repeat(12, 1fr);
      gap: 2px;
      font-size: 10px;
    }
    .header {
      text-align: center;
      padding: 8px 4px;
      color: #999;
      font-weight: 500;
    }
    .hue-label {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      color: #666;
      font-size: 11px;
    }
    .hue-label.anchored {
      color: #f76b15;
      font-weight: 600;
    }
    .swatch {
      height: 32px;
      border-radius: 3px;
      cursor: pointer;
      transition: transform 0.1s;
    }
    .swatch:hover {
      transform: scale(1.15);
      z-index: 10;
      position: relative;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .section-divider {
      grid-column: 1 / -1;
      height: 12px;
    }
    .legend {
      margin-top: 30px;
      font-size: 12px;
      color: #888;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-right: 20px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .tuning-info {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
      font-size: 13px;
      border: 1px solid #e5e5e5;
    }
    .tuning-info h3 { margin-top: 0; color: #888; }
    .tuning-value { font-family: monospace; color: #30a46c; }
  </style>
</head>
<body>
  <h1>Sveltopia Colors</h1>
  <p class="subtitle">Full light-mode palette generated from brand colors</p>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">${stats.totalHues}</div>
      <div class="stat-label">Hues</div>
    </div>
    <div class="stat">
      <div class="stat-value">${stats.totalColors}</div>
      <div class="stat-label">Colors</div>
    </div>
    <div class="stat">
      <div class="stat-value">${stats.anchoredHues}</div>
      <div class="stat-label">Anchored</div>
    </div>
  </div>

  <h3 style="color: #888; margin-bottom: 12px;">Brand Input Colors</h3>
  <div class="brand-colors">
    <div class="brand-color">
      <div class="brand-swatch" style="background: ${SVELTOPIA_ORANGE}"></div>
      <div class="brand-label">${SVELTOPIA_ORANGE}</div>
    </div>
    <div class="brand-color">
      <div class="brand-swatch" style="background: ${SVELTOPIA_GREEN}"></div>
      <div class="brand-label">${SVELTOPIA_GREEN}</div>
    </div>
    <div class="brand-color">
      <div class="brand-swatch" style="background: ${SVELTOPIA_DARK}"></div>
      <div class="brand-label">${SVELTOPIA_DARK}</div>
    </div>
  </div>

  <h3 style="color: #888; margin-bottom: 12px;">Generated Palette (${orderedHues.length} × 12 = ${orderedHues.length * 12} colors)</h3>

  <!-- Semantic column headers (like Radix) -->
  <div class="semantic-headers">
    <div></div>
    <div class="semantic-header span-2">Backgrounds</div>
    <div class="semantic-header span-3">Interactive</div>
    <div class="semantic-header span-3">Borders</div>
    <div class="semantic-header span-2">Solid</div>
    <div class="semantic-header span-2">Text</div>
  </div>

  <div class="grid">
    <div class="header"></div>
`;

// Column headers (step numbers)
for (let step = 1; step <= 12; step++) {
	html += `    <div class="header">${step}</div>\n`;
}

// Track sections for visual grouping
const neutrals = ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand'];
let lastWasNeutral = false;

// Rows for each hue
for (const [hueKey, hueDef] of orderedHues) {
	const scale = palette.scales[hueKey];
	const isAnchored = palette.meta.anchoredSlots.includes(hueKey);
	const isNeutral = neutrals.includes(hueKey);

	// Add divider after neutrals section
	if (lastWasNeutral && !isNeutral) {
		html += `    <div class="section-divider"></div>\n`;
	}
	lastWasNeutral = isNeutral;

	html += `    <div class="hue-label${isAnchored ? ' anchored' : ''}">${hueDef.name}${isAnchored ? ' ★' : ''}</div>\n`;

	for (let step = 1; step <= 12; step++) {
		const hex = scale[step as keyof typeof scale];
		html += `    <div class="swatch" style="background: ${hex}" title="${hueKey}-${step}: ${hex}"></div>\n`;
	}
}

html += `  </div>

  <div class="legend">
    <span class="legend-item">
      <span class="legend-dot" style="background: #fbbf24"></span>
      <span>★ Anchored to brand color</span>
    </span>
  </div>

  <div class="tuning-info">
    <h3>Tuning Profile</h3>
    <p>Hue Shift: <span class="tuning-value">${palette.meta.tuningProfile.hueShift > 0 ? '+' : ''}${palette.meta.tuningProfile.hueShift.toFixed(1)}°</span></p>
    <p>Chroma Multiplier: <span class="tuning-value">${palette.meta.tuningProfile.chromaMultiplier.toFixed(2)}×</span></p>
    <p>Lightness Shift: <span class="tuning-value">${palette.meta.tuningProfile.lightnessShift > 0 ? '+' : ''}${palette.meta.tuningProfile.lightnessShift.toFixed(3)}</span></p>
    <p>Anchored Slots: <span class="tuning-value">${palette.meta.anchoredSlots.join(', ') || 'none'}</span></p>
    <p>Generated: <span class="tuning-value">${palette.meta.generatedAt}</span></p>
  </div>

</body>
</html>`;

// Write to file
const outputPath = path.join(process.cwd(), 'palette-grid.html');
fs.writeFileSync(outputPath, html);
console.log(`Generated: ${outputPath}`);
console.log(`Stats: ${stats.totalHues} hues × 12 steps = ${stats.totalColors} colors`);
console.log(`Anchored: ${palette.meta.anchoredSlots.join(', ')}`);
console.log('Open with: open palette-grid.html');
