/**
 * Generate a visual HTML grid of the full palette with Radix comparison.
 * Outputs palette-grid.html for visual inspection.
 *
 * Features:
 * - Dropdown selector to switch between test palettes
 * - Toggle to show/hide Radix reference scales
 * - Toggle to show/hide generated scales
 * - Side-by-side comparison when both visible
 * - Radix-style layout with semantic headers
 * - Instant client-side switching (all palettes embedded as JSON)
 */

import { generateLightPalette, getPaletteStats } from '../src/core/palette.js';
import { BASELINE_HUES } from '../src/core/hues.js';
import { RADIX_SCALES, RADIX_SCALE_ORDER } from '../src/reference/radix-scales.js';
import { TEST_PALETTES, type TestPalette } from '../src/reference/test-palettes.js';
import * as fs from 'fs';
import * as path from 'path';

// Types for serialized palette data
interface SerializedPalette {
	id: string;
	name: string;
	category: TestPalette['category'];
	notes?: string;
	brandColors: string[];
	scales: Record<string, Record<number, string>>;
	anchoredSlots: string[];
	customSlots: string[];
	anchorStepMap: Record<string, number>;
	customRowInfo: Array<{
		rowKey: string;
		reason: 'low-chroma' | 'high-chroma';
		chromaRatio: number;
		nearestSlot: string;
	}>;
	tuningProfile: {
		hueShift: number;
		chromaMultiplier: number;
		lightnessShift: number;
	};
	stats: {
		totalHues: number;
		totalColors: number;
		anchoredHues: number;
		customHues: number;
	};
}

// Generate all test palettes
console.log('Generating all test palettes...');
const allPalettes: SerializedPalette[] = [];

for (const testPalette of TEST_PALETTES) {
	try {
		const palette = generateLightPalette({ brandColors: testPalette.colors });
		const stats = getPaletteStats(palette);

		// Build anchor step map
		const anchorStepMap: Record<string, number> = {};
		for (const [hex, info] of Object.entries(palette.meta.tuningProfile.anchors)) {
			anchorStepMap[info.slot] = info.step;
		}

		// Build custom row info
		const customRowInfo = (palette.meta.tuningProfile.customRows || []).map((cr) => ({
			rowKey: cr.rowKey,
			reason: cr.reason,
			chromaRatio: cr.chromaRatio,
			nearestSlot: cr.nearestSlot
		}));

		allPalettes.push({
			id: testPalette.id,
			name: testPalette.name,
			category: testPalette.category,
			notes: testPalette.notes,
			brandColors: testPalette.colors,
			scales: palette.scales as Record<string, Record<number, string>>,
			anchoredSlots: palette.meta.anchoredSlots,
			customSlots: palette.meta.customSlots,
			anchorStepMap,
			customRowInfo,
			tuningProfile: {
				hueShift: palette.meta.tuningProfile.hueShift,
				chromaMultiplier: palette.meta.tuningProfile.chromaMultiplier,
				lightnessShift: palette.meta.tuningProfile.lightnessShift
			},
			stats: {
				totalHues: stats.totalHues,
				totalColors: stats.totalColors,
				anchoredHues: stats.anchoredHues,
				customHues: stats.customHues
			}
		});
		const customInfo = stats.customHues > 0 ? `, ${stats.customHues} custom` : '';
		console.log(`  ${testPalette.id}: ${stats.anchoredHues} anchored${customInfo}`);
	} catch (e) {
		console.error(`  ERROR generating ${testPalette.id}:`, e);
	}
}

console.log(`Generated ${allPalettes.length} palettes`);

// Build ordered hue list (use first palette as reference for structure)
const orderedHueKeys = RADIX_SCALE_ORDER.filter(
	(key) => allPalettes[0]?.scales[key] && RADIX_SCALES[key]
);

// Serialize Radix scales for client-side use
const radixScalesJson = JSON.stringify(RADIX_SCALES);
const hueDefs = JSON.stringify(
	Object.fromEntries(orderedHueKeys.map((key) => [key, BASELINE_HUES[key]]))
);

// Build selector options HTML grouped by category
function buildSelectorOptions(): string {
	const categories: Record<TestPalette['category'], TestPalette[]> = {
		'real-brand': [],
		'edge-case': [],
		nightmare: []
	};

	for (const p of TEST_PALETTES) {
		categories[p.category].push(p);
	}

	const categoryLabels: Record<TestPalette['category'], string> = {
		'real-brand': 'Real Brands',
		'edge-case': 'Edge Cases',
		nightmare: 'Nightmare Scenarios'
	};

	let html = '';
	for (const [cat, palettes] of Object.entries(categories) as [
		TestPalette['category'],
		TestPalette[]
	][]) {
		html += `    <optgroup label="${categoryLabels[cat]}">\n`;
		for (const p of palettes) {
			const colorIndicator = p.colors.map(() => '\u25A0').join('');
			const selected = p.id === 'sveltopia' ? ' selected' : '';
			html += `      <option value="${p.id}"${selected}>${colorIndicator} ${p.name}</option>\n`;
		}
		html += '    </optgroup>\n';
	}
	return html;
}

// Build HTML
const html = `<!DOCTYPE html>
<html>
<head>
  <title>Sveltopia Colors - Stress Test</title>
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
    .controls {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #e5e5e5;
      flex-wrap: wrap;
      align-items: center;
    }
    .control-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .control-group label {
      cursor: pointer;
      user-select: none;
    }
    .palette-select {
      padding: 8px 12px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      min-width: 220px;
    }
    .palette-notes {
      font-size: 12px;
      color: #888;
      font-style: italic;
    }
    .category-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
    }
    .category-badge.real-brand { background: #d3f9d8; color: #2b8a3e; }
    .category-badge.edge-case { background: #fff3bf; color: #e67700; }
    .category-badge.nightmare { background: #ffc9c9; color: #c92a2a; }
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
      flex-wrap: wrap;
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
    .hue-label.custom-row {
      color: #8e4ec6;
      font-weight: 600;
    }
    .hue-label.radix {
      color: #0090ff;
      font-style: italic;
    }
    .custom-badge {
      display: inline-block;
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 9px;
      font-weight: 500;
      text-transform: uppercase;
      margin-left: 4px;
    }
    .custom-badge.pastel { background: #fce7f3; color: #9d174d; }
    .custom-badge.neon { background: #d9f99d; color: #3f6212; }
    .custom-badge.hue-gap { background: #cffafe; color: #164e63; }
    .swatch {
      height: 32px;
      border-radius: 3px;
      cursor: pointer;
      transition: transform 0.1s;
      position: relative;
    }
    .swatch:hover {
      transform: scale(1.15);
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .swatch.brand-anchor::after {
      content: '\u2605';
      position: absolute;
      top: 2px;
      right: 3px;
      font-size: 10px;
      color: white;
      text-shadow:
        -1px -1px 0 rgba(0,0,0,0.5),
        1px -1px 0 rgba(0,0,0,0.5),
        -1px 1px 0 rgba(0,0,0,0.5),
        1px 1px 0 rgba(0,0,0,0.5);
    }
    .section-divider {
      grid-column: 1 / -1;
      height: 12px;
    }
    .row-radix { }
    .row-generated { }
    .row-radix.hidden, .row-generated.hidden {
      display: none;
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
  <h1>Sveltopia Colors - Stress Test</h1>
  <p class="subtitle">Test palette generation with diverse brand color inputs</p>

  <div class="controls">
    <div class="control-group">
      <label for="paletteSelect">Test Palette:</label>
      <select id="paletteSelect" class="palette-select">
${buildSelectorOptions()}      </select>
      <span id="categoryBadge" class="category-badge real-brand">Real Brand</span>
    </div>
    <div class="control-group">
      <input type="checkbox" id="showRadix" checked>
      <label for="showRadix">Show Radix Reference</label>
    </div>
    <div class="control-group">
      <input type="checkbox" id="showGenerated" checked>
      <label for="showGenerated">Show Generated</label>
    </div>
    <span id="paletteNotes" class="palette-notes"></span>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-value" id="statHues">31</div>
      <div class="stat-label">Hues</div>
    </div>
    <div class="stat">
      <div class="stat-value" id="statColors">372</div>
      <div class="stat-label">Colors</div>
    </div>
    <div class="stat">
      <div class="stat-value" id="statAnchored">3</div>
      <div class="stat-label">Anchored</div>
    </div>
    <div class="stat" id="statCustomContainer" style="display: none;">
      <div class="stat-value" id="statCustom">0</div>
      <div class="stat-label">Custom Rows</div>
    </div>
  </div>

  <h3 style="color: #888; margin-bottom: 12px;">Brand Input Colors</h3>
  <div class="brand-colors" id="brandColors"></div>

  <h3 style="color: #888; margin-bottom: 12px;">Palette Comparison (<span id="hueCount">${orderedHueKeys.length}</span> hues x 12 steps)</h3>

  <!-- Semantic column headers (like Radix) -->
  <div class="semantic-headers">
    <div></div>
    <div class="semantic-header span-2">Backgrounds</div>
    <div class="semantic-header span-3">Interactive</div>
    <div class="semantic-header span-3">Borders</div>
    <div class="semantic-header span-2">Solid</div>
    <div class="semantic-header span-2">Text</div>
  </div>

  <div class="grid" id="paletteGrid">
    <div class="header"></div>
    <div class="header">1</div>
    <div class="header">2</div>
    <div class="header">3</div>
    <div class="header">4</div>
    <div class="header">5</div>
    <div class="header">6</div>
    <div class="header">7</div>
    <div class="header">8</div>
    <div class="header">9</div>
    <div class="header">10</div>
    <div class="header">11</div>
    <div class="header">12</div>
  </div>

  <div class="legend">
    <span class="legend-item">
      <span class="legend-dot" style="background: #0090ff"></span>
      <span>Radix Reference</span>
    </span>
    <span class="legend-item">
      <span class="legend-dot" style="background: #f76b15"></span>
      <span>\u2605 Anchored to brand color</span>
    </span>
    <span class="legend-item">
      <span class="legend-dot" style="background: #8e4ec6"></span>
      <span>Custom Row (out-of-bounds chroma)</span>
    </span>
  </div>

  <div class="tuning-info">
    <h3>Tuning Profile</h3>
    <p>Hue Shift: <span class="tuning-value" id="tuneHue">+0.0\u00B0</span></p>
    <p>Chroma Multiplier: <span class="tuning-value" id="tuneChroma">1.00x</span></p>
    <p>Lightness Shift: <span class="tuning-value" id="tuneLightness">+0.000</span></p>
    <p>Anchored Slots: <span class="tuning-value" id="tuneAnchors">none</span></p>
  </div>

  <script>
    // Embedded palette data
    const ALL_PALETTES = ${JSON.stringify(allPalettes)};
    const RADIX_SCALES = ${radixScalesJson};
    const HUE_DEFS = ${hueDefs};
    const ORDERED_HUE_KEYS = ${JSON.stringify(orderedHueKeys)};
    const NEUTRALS = ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand'];

    // DOM elements
    const paletteSelect = document.getElementById('paletteSelect');
    const showRadix = document.getElementById('showRadix');
    const showGenerated = document.getElementById('showGenerated');
    const paletteGrid = document.getElementById('paletteGrid');
    const brandColorsDiv = document.getElementById('brandColors');
    const categoryBadge = document.getElementById('categoryBadge');
    const paletteNotes = document.getElementById('paletteNotes');

    // Stats elements
    const statHues = document.getElementById('statHues');
    const statColors = document.getElementById('statColors');
    const statAnchored = document.getElementById('statAnchored');
    const statCustom = document.getElementById('statCustom');
    const statCustomContainer = document.getElementById('statCustomContainer');
    const hueCount = document.getElementById('hueCount');

    // Tuning elements
    const tuneHue = document.getElementById('tuneHue');
    const tuneChroma = document.getElementById('tuneChroma');
    const tuneLightness = document.getElementById('tuneLightness');
    const tuneAnchors = document.getElementById('tuneAnchors');

    function renderPalette(palette) {
      // Update brand colors display
      brandColorsDiv.innerHTML = palette.brandColors.map(hex =>
        '<div class="brand-color">' +
          '<div class="brand-swatch" style="background: ' + hex + '"></div>' +
          '<div class="brand-label">' + hex + '</div>' +
        '</div>'
      ).join('');

      // Update stats
      statHues.textContent = palette.stats.totalHues;
      statColors.textContent = palette.stats.totalColors;
      statAnchored.textContent = palette.stats.anchoredHues;
      statCustom.textContent = palette.stats.customHues || 0;
      statCustomContainer.style.display = palette.stats.customHues > 0 ? 'block' : 'none';
      hueCount.textContent = ORDERED_HUE_KEYS.length + (palette.customSlots?.length || 0);

      // Update category badge
      const categoryLabels = {
        'real-brand': 'Real Brand',
        'edge-case': 'Edge Case',
        'nightmare': 'Nightmare'
      };
      categoryBadge.textContent = categoryLabels[palette.category];
      categoryBadge.className = 'category-badge ' + palette.category;

      // Update notes
      paletteNotes.textContent = palette.notes || '';

      // Update tuning info
      const sign = (n) => n > 0 ? '+' : '';
      tuneHue.textContent = sign(palette.tuningProfile.hueShift) + palette.tuningProfile.hueShift.toFixed(1) + '\u00B0';
      tuneChroma.textContent = palette.tuningProfile.chromaMultiplier.toFixed(2) + 'x';
      tuneLightness.textContent = sign(palette.tuningProfile.lightnessShift) + palette.tuningProfile.lightnessShift.toFixed(3);
      tuneAnchors.textContent = palette.anchoredSlots.join(', ') || 'none';

      // Rebuild grid
      let gridHtml = '<div class="header"></div>';
      for (let step = 1; step <= 12; step++) {
        gridHtml += '<div class="header">' + step + '</div>';
      }

      let lastWasNeutral = false;

      for (const hueKey of ORDERED_HUE_KEYS) {
        const generatedScale = palette.scales[hueKey];
        const radixScale = RADIX_SCALES[hueKey];
        const hueDef = HUE_DEFS[hueKey];
        const isAnchored = palette.anchoredSlots.includes(hueKey);
        const anchorStep = palette.anchorStepMap[hueKey];
        const isNeutral = NEUTRALS.includes(hueKey);

        // Section divider
        if (lastWasNeutral && !isNeutral) {
          gridHtml += '<div class="section-divider"></div>';
        }
        lastWasNeutral = isNeutral;

        // Radix row
        const radixHidden = showRadix.checked ? '' : ' hidden';
        gridHtml += '<div class="hue-label radix row-radix' + radixHidden + '">' + hueDef.name + ' (Radix)</div>';
        for (let step = 1; step <= 12; step++) {
          const hex = radixScale[step];
          gridHtml += '<div class="swatch row-radix' + radixHidden + '" style="background: ' + hex + '" title="Radix ' + hueKey + '-' + step + ': ' + hex + '"></div>';
        }

        // Generated row
        const genHidden = showGenerated.checked ? '' : ' hidden';
        const anchoredClass = isAnchored ? ' anchored' : '';
        gridHtml += '<div class="hue-label' + anchoredClass + ' row-generated' + genHidden + '">' + hueDef.name + (isAnchored ? ' \u2605' : '') + '</div>';
        for (let step = 1; step <= 12; step++) {
          const hex = generatedScale[step];
          const isAnchorSwatch = isAnchored && step === anchorStep;
          const anchorClass = isAnchorSwatch ? ' brand-anchor' : '';
          const title = 'Generated ' + hueKey + '-' + step + ': ' + hex + (isAnchorSwatch ? ' (BRAND ANCHOR)' : '');
          gridHtml += '<div class="swatch row-generated' + anchorClass + genHidden + '" style="background: ' + hex + '" title="' + title + '"></div>';
        }
      }

      // Render custom rows (no Radix counterpart)
      if (palette.customSlots && palette.customSlots.length > 0) {
        gridHtml += '<div class="section-divider"></div>';

        for (const customKey of palette.customSlots) {
          const customScale = palette.scales[customKey];
          const customInfo = palette.customRowInfo.find(c => c.rowKey === customKey);
          const anchorStep = palette.anchorStepMap[customKey];
          // Badge type based on reason: low-chroma=pastel, high-chroma=neon, hue-gap=custom
          var badgeType, badgeLabel;
          switch (customInfo?.reason) {
            case 'low-chroma':
              badgeType = 'pastel';
              badgeLabel = 'Pastel';
              break;
            case 'high-chroma':
              badgeType = 'neon';
              badgeLabel = 'Neon';
              break;
            case 'hue-gap':
              badgeType = 'hue-gap';
              badgeLabel = 'Custom';
              break;
            default:
              badgeType = 'custom';
              badgeLabel = 'Custom';
          }

          // Custom row (no Radix reference)
          const genHidden = showGenerated.checked ? '' : ' hidden';
          gridHtml += '<div class="hue-label custom-row row-generated' + genHidden + '">' +
            customKey + ' <span class="custom-badge ' + badgeType + '">' + badgeLabel + '</span></div>';

          for (let step = 1; step <= 12; step++) {
            const hex = customScale[step];
            const isAnchorSwatch = step === anchorStep;
            const anchorClass = isAnchorSwatch ? ' brand-anchor' : '';
            const title = 'Custom ' + customKey + '-' + step + ': ' + hex + (isAnchorSwatch ? ' (BRAND ANCHOR)' : '');
            gridHtml += '<div class="swatch row-generated' + anchorClass + genHidden + '" style="background: ' + hex + '" title="' + title + '"></div>';
          }
        }
      }

      paletteGrid.innerHTML = gridHtml;
    }

    function updateVisibility() {
      document.querySelectorAll('.row-radix').forEach(el => {
        el.classList.toggle('hidden', !showRadix.checked);
      });
      document.querySelectorAll('.row-generated').forEach(el => {
        el.classList.toggle('hidden', !showGenerated.checked);
      });
    }

    function findPalette(id) {
      return ALL_PALETTES.find(p => p.id === id);
    }

    // Event listeners
    paletteSelect.addEventListener('change', () => {
      const palette = findPalette(paletteSelect.value);
      if (palette) renderPalette(palette);
    });

    showRadix.addEventListener('change', updateVisibility);
    showGenerated.addEventListener('change', updateVisibility);

    // Initial render
    const initialPalette = findPalette('sveltopia');
    if (initialPalette) renderPalette(initialPalette);
  </script>

</body>
</html>`;

// Write to file
const outputPath = path.join(process.cwd(), 'palette-grid.html');
fs.writeFileSync(outputPath, html);

console.log(`\nGenerated: ${outputPath}`);
console.log(`Embedded ${allPalettes.length} test palettes`);
console.log('Open with: open palette-grid.html');
