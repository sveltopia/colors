/**
 * OKLCH Exploration Script
 *
 * Generates a self-contained HTML file to visualize OKLCH color manipulation.
 * This is a development tool for building intuition, not shipped with the library.
 *
 * Usage:
 *   npx tsx packages/colors/scripts/explore.ts
 *   open explore.html
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { toOklch, toHex, toCss } from '../src/utils/oklch.js';
import type { OklchColor } from '../src/types.js';

// Sveltopia brand colors
const BRAND_COLORS = [
	{ name: 'Orange (Primary)', hex: '#FF6A00' },
	{ name: 'Green (Accent)', hex: '#43A047' },
	{ name: 'Near Black', hex: '#1A1A1A' }
];

// Helper to create a color swatch with OKLCH applied
function createSwatch(oklch: OklchColor, label?: string): string {
	const hex = toHex(oklch);
	const css = toCss(oklch);
	const textColor = oklch.l > 0.6 ? '#000' : '#fff';

	return `
    <div class="swatch" style="background: ${hex}; color: ${textColor};">
      ${label ? `<span class="label">${label}</span>` : ''}
      <span class="hex">${hex}</span>
    </div>
  `;
}

// Generate input breakdown section
function generateInputSection(): string {
	const swatches = BRAND_COLORS.map((color) => {
		const oklch = toOklch(color.hex);
		if (!oklch) return `<div class="error">Invalid: ${color.hex}</div>`;

		return `
      <div class="color-card">
        <div class="color-preview" style="background: ${color.hex};"></div>
        <div class="color-info">
          <h3>${color.name}</h3>
          <div class="value"><span class="key">Hex:</span> ${color.hex}</div>
          <div class="value"><span class="key">L:</span> ${oklch.l.toFixed(3)} <span class="desc">(lightness)</span></div>
          <div class="value"><span class="key">C:</span> ${oklch.c.toFixed(3)} <span class="desc">(chroma)</span></div>
          <div class="value"><span class="key">H:</span> ${oklch.h.toFixed(1)}° <span class="desc">(hue)</span></div>
        </div>
      </div>
    `;
	}).join('');

	return `
    <section>
      <h2>1. Input Breakdown</h2>
      <p class="section-desc">Sveltopia's brand colors converted to OKLCH</p>
      <div class="color-cards">${swatches}</div>
    </section>
  `;
}

// Generate L/C/H manipulation demos
function generateManipulationSection(): string {
	const orange = toOklch('#FF6A00');
	if (!orange) return '<div class="error">Failed to parse orange</div>';

	// Lightness demo
	const lightnessValues = [0.3, 0.5, 0.7, 0.9];
	const lightnessSwatches = lightnessValues.map((l) => {
		const modified: OklchColor = { ...orange, l };
		return createSwatch(modified, `L=${l}`);
	}).join('');

	// Chroma demo
	const chromaValues = [0.05, 0.10, 0.15, 0.20, 0.25];
	const chromaSwatches = chromaValues.map((c) => {
		const modified: OklchColor = { ...orange, c };
		return createSwatch(modified, `C=${c.toFixed(2)}`);
	}).join('');

	// Hue demo
	const hueOffsets = [-60, -30, 0, 30, 60];
	const hueSwatches = hueOffsets.map((offset) => {
		const h = ((orange.h + offset) % 360 + 360) % 360;
		const modified: OklchColor = { ...orange, h };
		const label = offset === 0 ? 'Original' : `H${offset > 0 ? '+' : ''}${offset}°`;
		return createSwatch(modified, label);
	}).join('');

	return `
    <section>
      <h2>2. L/C/H Manipulation</h2>
      <p class="section-desc">See how changing each OKLCH component affects the orange</p>

      <div class="demo-group">
        <h3>Lightness (L) — 0 = black, 1 = white</h3>
        <p class="demo-desc">Higher L = lighter color. This is the primary lever for tint scales.</p>
        <div class="swatch-row">${lightnessSwatches}</div>
      </div>

      <div class="demo-group">
        <h3>Chroma (C) — 0 = gray, higher = more vivid</h3>
        <p class="demo-desc">Higher C = more saturated/vivid. Extremes (very light/dark) naturally have lower chroma.</p>
        <div class="swatch-row">${chromaSwatches}</div>
      </div>

      <div class="demo-group">
        <h3>Hue (H) — 0-360° color wheel position</h3>
        <p class="demo-desc">Shifting hue rotates around the color wheel. ±30° shows neighboring colors.</p>
        <div class="swatch-row">${hueSwatches}</div>
      </div>
    </section>
  `;
}

// Generate naive 12-step scale
function generateScaleSection(): string {
	const orange = toOklch('#FF6A00');
	const green = toOklch('#43A047');

	if (!orange || !green) return '<div class="error">Failed to parse colors</div>';

	// Naive linear lightness interpolation from 0.97 (step 1) to 0.25 (step 12)
	const steps = 12;
	const lStart = 0.97;
	const lEnd = 0.25;

	function generateScale(baseColor: OklchColor, name: string): string {
		const swatches = Array.from({ length: steps }, (_, i) => {
			const step = i + 1;
			const l = lStart - (lStart - lEnd) * (i / (steps - 1));
			const modified: OklchColor = { ...baseColor, l };
			return createSwatch(modified, `${step}`);
		}).join('');

		return `
      <div class="scale-group">
        <h4>${name}</h4>
        <div class="swatch-row scale-row">${swatches}</div>
      </div>
    `;
	}

	return `
    <section>
      <h2>3. Naive 12-Step Scale</h2>
      <p class="section-desc">
        Linear lightness interpolation from L=0.97 (step 1) to L=0.25 (step 12).
        Chroma and hue held constant. This reveals problems we'll need to solve:
      </p>
      <ul class="issues-list">
        <li>Muddy midtones? (steps 5-7 may look washed out)</li>
        <li>Clipping at extremes? (very light colors may lose saturation)</li>
        <li>Perceptual uniformity? (steps should feel evenly spaced)</li>
      </ul>

      ${generateScale(orange, 'Orange Scale')}
      ${generateScale(green, 'Green Scale')}

      <div class="scale-labels">
        <span>← Step 1: Backgrounds</span>
        <span>Step 9: Solid/Primary →</span>
        <span>Step 12: Text →</span>
      </div>
    </section>
  `;
}

// Generate complete HTML
function generateHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OKLCH Exploration - Sveltopia Colors</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e5e5e5;
      line-height: 1.6;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      color: #fff;
    }

    .subtitle {
      color: #888;
      margin-bottom: 2rem;
    }

    section {
      margin-bottom: 3rem;
      padding: 1.5rem;
      background: #141414;
      border-radius: 12px;
      border: 1px solid #262626;
    }

    h2 {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      color: #fff;
    }

    h3 {
      font-size: 1rem;
      margin-bottom: 0.25rem;
      color: #e5e5e5;
    }

    h4 {
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      color: #888;
    }

    .section-desc {
      color: #888;
      margin-bottom: 1.5rem;
    }

    .demo-desc {
      color: #666;
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }

    .color-cards {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .color-card {
      background: #1a1a1a;
      border-radius: 8px;
      overflow: hidden;
      width: 220px;
      border: 1px solid #333;
    }

    .color-preview {
      height: 80px;
    }

    .color-info {
      padding: 1rem;
    }

    .color-info h3 {
      font-size: 0.875rem;
      margin-bottom: 0.75rem;
    }

    .value {
      font-size: 0.8125rem;
      margin-bottom: 0.25rem;
      font-family: 'SF Mono', Monaco, monospace;
    }

    .key {
      color: #888;
      display: inline-block;
      width: 28px;
    }

    .desc {
      color: #555;
      font-size: 0.75rem;
    }

    .demo-group {
      margin-bottom: 1.5rem;
    }

    .swatch-row {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .scale-row {
      gap: 2px;
    }

    .swatch {
      width: 80px;
      height: 80px;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-family: 'SF Mono', Monaco, monospace;
    }

    .scale-row .swatch {
      width: 70px;
      height: 70px;
    }

    .swatch .label {
      font-weight: 600;
      margin-bottom: 2px;
    }

    .swatch .hex {
      opacity: 0.8;
      font-size: 0.625rem;
    }

    .scale-group {
      margin-bottom: 1rem;
    }

    .scale-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #555;
      margin-top: 1rem;
      padding-top: 0.5rem;
      border-top: 1px solid #262626;
    }

    .issues-list {
      color: #888;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
      padding-left: 1.5rem;
    }

    .issues-list li {
      margin-bottom: 0.25rem;
    }

    .error {
      color: #ff6b6b;
      padding: 1rem;
      background: #2d1515;
      border-radius: 6px;
    }

    footer {
      text-align: center;
      color: #444;
      font-size: 0.75rem;
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <h1>OKLCH Exploration</h1>
  <p class="subtitle">Building intuition for Sveltopia Colors algorithm development</p>

  ${generateInputSection()}
  ${generateManipulationSection()}
  ${generateScaleSection()}

  <footer>
    Generated by packages/colors/scripts/explore.ts — Development tool, not shipped with library
  </footer>
</body>
</html>`;
}

// Main
const html = generateHtml();
const outputPath = resolve(process.cwd(), 'explore.html');
writeFileSync(outputPath, html);

console.log(`✓ Generated ${outputPath}`);
console.log('  Open with: open explore.html');
