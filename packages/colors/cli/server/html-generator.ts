/**
 * HTML Palette Visualizer Generator
 *
 * Generates a self-contained HTML file for visualizing generated palettes.
 * Used by the dev server to serve palette previews.
 */

import {
	generatePalette,
	getPaletteStats,
	BASELINE_HUES,
	RADIX_SCALES,
	RADIX_SCALES_DARK,
	type LightPalette
} from '@sveltopia/colors';

export interface GenerateHtmlOptions {
	brandColors: string[];
	title?: string;
}

interface SerializedPalette {
	brandColors: string[];
	scales: Record<string, Record<number, string>>;
	scalesDark: Record<string, Record<number, string>>;
	anchoredSlots: string[];
	anchoredSlotsDark: string[];
	customSlots: string[];
	customSlotsDark: string[];
	anchorStepMap: Record<string, number>;
	anchorStepMapDark: Record<string, number>;
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

// Radix-style hue ordering
const HUE_ORDER = [
	'gray',
	'mauve',
	'slate',
	'sage',
	'olive',
	'sand',
	'tomato',
	'red',
	'ruby',
	'crimson',
	'pink',
	'plum',
	'purple',
	'violet',
	'iris',
	'indigo',
	'blue',
	'cyan',
	'teal',
	'jade',
	'green',
	'grass',
	'bronze',
	'gold',
	'brown',
	'orange',
	'amber',
	'yellow',
	'lime',
	'mint',
	'sky'
];

const NEUTRALS = ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand'];

/**
 * Generate HTML visualization for brand colors
 */
export function generateHtml(options: GenerateHtmlOptions): string {
	const { brandColors, title = 'Sveltopia Colors' } = options;

	// Generate light and dark palettes
	const paletteLight = generatePalette({ brandColors, mode: 'light' });
	const paletteDark = generatePalette({ brandColors, mode: 'dark' });
	const stats = getPaletteStats(paletteLight);

	// Build anchor step maps
	const anchorStepMap: Record<string, number> = {};
	for (const [, info] of Object.entries(paletteLight.meta.tuningProfile.anchors)) {
		anchorStepMap[info.slot] = info.step;
	}

	const anchorStepMapDark: Record<string, number> = {};
	for (const [, info] of Object.entries(paletteDark.meta.tuningProfile.anchors)) {
		anchorStepMapDark[info.slot] = info.step;
	}

	const palette: SerializedPalette = {
		brandColors,
		scales: paletteLight.scales as unknown as Record<string, Record<number, string>>,
		scalesDark: paletteDark.scales as unknown as Record<string, Record<number, string>>,
		anchoredSlots: paletteLight.meta.anchoredSlots,
		anchoredSlotsDark: paletteDark.meta.anchoredSlots,
		customSlots: paletteLight.meta.customSlots,
		customSlotsDark: paletteDark.meta.customSlots,
		anchorStepMap,
		anchorStepMapDark,
		tuningProfile: {
			hueShift: paletteLight.meta.tuningProfile.hueShift,
			chromaMultiplier: paletteLight.meta.tuningProfile.chromaMultiplier,
			lightnessShift: paletteLight.meta.tuningProfile.lightnessShift
		},
		stats: {
			totalHues: stats.totalHues,
			totalColors: stats.totalColors,
			anchoredHues: stats.anchoredHues,
			customHues: stats.customHues
		}
	};

	// Get ordered hue keys that exist in the palette
	const orderedHueKeys = HUE_ORDER.filter((key) => paletteLight.scales[key]);

	// Build hue definitions for client
	const hueDefs = Object.fromEntries(
		orderedHueKeys.map((key) => [key, BASELINE_HUES[key]])
	);

	return buildHtml(
		palette,
		orderedHueKeys,
		hueDefs,
		title,
		RADIX_SCALES as unknown as Record<string, Record<number, string>>,
		RADIX_SCALES_DARK as unknown as Record<string, Record<number, string>>
	);
}

function buildHtml(
	palette: SerializedPalette,
	orderedHueKeys: string[],
	hueDefs: Record<string, { name: string; hue: number }>,
	title: string,
	radixScales: Record<string, Record<number, string>>,
	radixScalesDark: Record<string, Record<number, string>>
): string {
	return `<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
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
    .control-group label { cursor: pointer; user-select: none; }
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

    /* Color picker section */
    .color-inputs {
      display: flex;
      gap: 12px;
      margin-bottom: 30px;
      flex-wrap: wrap;
      align-items: flex-end;
    }
    .color-input-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .color-input-wrapper {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .color-input-wrapper input[type="color"] {
      width: 50px;
      height: 40px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      padding: 0;
    }
    .color-input-wrapper input[type="text"] {
      width: 90px;
      height: 40px;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 0 8px;
      font-family: monospace;
      font-size: 12px;
    }
    .color-remove-btn {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      background: #fee2e2;
      color: #dc2626;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .color-remove-btn:hover { background: #fecaca; }
    .color-add-btn {
      height: 40px;
      padding: 0 16px;
      border: 2px dashed #ccc;
      border-radius: 6px;
      background: transparent;
      color: #888;
      cursor: pointer;
      font-size: 14px;
    }
    .color-add-btn:hover { border-color: #999; color: #666; }
    .color-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .apply-colors-btn {
      height: 40px;
      padding: 0 20px;
      border: none;
      border-radius: 6px;
      background: #3b82f6;
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .apply-colors-btn:hover { background: #2563eb; }

    /* Generate section */
    .generate-section {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px solid #e5e5e5;
    }
    .generate-section input[type="text"] {
      width: 200px;
      height: 36px;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 0 12px;
      font-size: 13px;
    }
    .generate-btn {
      height: 36px;
      padding: 0 20px;
      border: none;
      border-radius: 6px;
      background: #10b981;
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .generate-btn:hover { background: #059669; }
    .generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .generate-status { font-size: 13px; color: #666; }
    .generate-status.success { color: #10b981; }
    .generate-status.error { color: #ef4444; }

    /* Sticky headers container */
    .palette-container {
      position: relative;
    }
    .sticky-header {
      position: sticky;
      top: 0;
      z-index: 20;
      background: #fafafa;
      padding-bottom: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
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
    .step-numbers {
      display: grid;
      grid-template-columns: 100px repeat(12, 1fr);
      gap: 2px;
      margin-bottom: 4px;
    }
    .step-number {
      text-align: center;
      padding: 8px 4px;
      color: #999;
      font-weight: 500;
      font-size: 10px;
    }
    .grid {
      display: grid;
      grid-template-columns: 100px repeat(12, 1fr);
      gap: 2px;
      font-size: 10px;
    }
    .hue-label {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      color: #666;
      font-size: 11px;
    }
    .hue-label.anchored { color: #f76b15; font-weight: 600; }
    .hue-label.custom-row { color: #8e4ec6; font-weight: 600; }
    .hue-label.radix-row { color: #888; }
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
      content: '★';
      position: absolute;
      top: 2px;
      right: 3px;
      font-size: 10px;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    .section-divider { grid-column: 1 / -1; height: 12px; }
    .radix-divider { grid-column: 1 / -1; height: 2px; }
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
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; }
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
    .mode-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px solid #ccc;
      border-radius: 6px;
      background: #fff;
      cursor: pointer;
      font-size: 14px;
    }
    .mode-btn.dark { background: #1a1a1a; color: #fff; border-color: #444; }

    /* Toast notification */
    .toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #333;
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      opacity: 0;
      transition: transform 0.3s, opacity 0.3s;
      z-index: 1000;
    }
    .toast.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }

    /* Dark mode styles */
    body.dark-mode { background: #111; color: #eee; }
    body.dark-mode .controls, body.dark-mode .stat, body.dark-mode .tuning-info {
      background: #1a1a1a; border-color: #333;
    }
    body.dark-mode .sticky-header { background: #111; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    body.dark-mode .semantic-header { background: #222; color: #999; }
    body.dark-mode .step-number { color: #666; }
    body.dark-mode .hue-label { color: #999; }
    body.dark-mode .hue-label.anchored { color: #f76b15; }
    body.dark-mode .hue-label.custom-row { color: #d19dff; }
    body.dark-mode .color-input-wrapper input[type="text"] { background: #222; border-color: #444; color: #eee; }
    body.dark-mode .color-remove-btn { background: #3f1f1f; color: #f87171; }
    body.dark-mode .color-add-btn { border-color: #444; color: #888; }
    body.dark-mode .generate-section { border-color: #333; }
    body.dark-mode .generate-section input[type="text"] { background: #222; border-color: #444; color: #eee; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="subtitle">Generated color palette from brand colors</p>

  <div class="controls">
    <div class="control-group mode-toggle">
      <button type="button" id="modeToggle" class="mode-btn light">
        <span class="mode-icon">☀️</span>
        <span class="mode-label">Light</span>
      </button>
    </div>
    <div class="control-group">
      <input type="checkbox" id="showRadix">
      <label for="showRadix">Show Radix Baseline</label>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-value" id="statHues">${palette.stats.totalHues}</div>
      <div class="stat-label">Hues</div>
    </div>
    <div class="stat">
      <div class="stat-value" id="statColors">${palette.stats.totalColors}</div>
      <div class="stat-label">Colors</div>
    </div>
    <div class="stat">
      <div class="stat-value" id="statAnchored">${palette.stats.anchoredHues}</div>
      <div class="stat-label">Anchored</div>
    </div>
    <div class="stat" id="statCustomContainer" ${palette.stats.customHues > 0 ? '' : 'style="display:none"'}>
      <div class="stat-value" id="statCustom">${palette.stats.customHues}</div>
      <div class="stat-label">Custom</div>
    </div>
  </div>

  <h3 style="color: #888; margin-bottom: 12px;">Brand Input Colors</h3>
  <div class="color-inputs" id="colorInputs"></div>
  <div class="generate-section">
    <label>Output:</label>
    <input type="text" id="outputDir" value="./src/lib/colors" placeholder="Output directory">
    <button type="button" class="generate-btn" id="generateBtn">Generate CSS/JSON</button>
    <span class="generate-status" id="generateStatus"></span>
  </div>

  <h3 style="color: #888; margin: 30px 0 12px;">Generated Palette (<span id="paletteHueCount">${palette.stats.totalHues}</span> hues × 12 steps)</h3>

  <div class="palette-container">
    <div class="sticky-header">
      <div class="semantic-headers">
        <div></div>
        <div class="semantic-header span-2">Backgrounds</div>
        <div class="semantic-header span-3">Interactive</div>
        <div class="semantic-header span-3">Borders</div>
        <div class="semantic-header span-2">Solid</div>
        <div class="semantic-header span-2">Text</div>
      </div>
      <div class="step-numbers">
        <div></div>
        <div class="step-number">1</div>
        <div class="step-number">2</div>
        <div class="step-number">3</div>
        <div class="step-number">4</div>
        <div class="step-number">5</div>
        <div class="step-number">6</div>
        <div class="step-number">7</div>
        <div class="step-number">8</div>
        <div class="step-number">9</div>
        <div class="step-number">10</div>
        <div class="step-number">11</div>
        <div class="step-number">12</div>
      </div>
    </div>
    <div class="grid" id="paletteGrid"></div>
  </div>

  <div class="legend">
    <span class="legend-item">
      <span class="legend-dot" style="background: #f76b15"></span>
      <span>★ Anchored to brand color</span>
    </span>
    <span class="legend-item">
      <span class="legend-dot" style="background: #8e4ec6"></span>
      <span>Custom Row</span>
    </span>
  </div>

  <div class="tuning-info">
    <h3>Tuning Profile</h3>
    <p>Hue Shift: <span class="tuning-value" id="tuneHue"></span></p>
    <p>Chroma Multiplier: <span class="tuning-value" id="tuneChroma"></span></p>
    <p>Lightness Shift: <span class="tuning-value" id="tuneLightness"></span></p>
    <p>Anchored Slots: <span class="tuning-value" id="tuneAnchors"></span></p>
  </div>

  <div class="toast" id="toast"></div>

  <script>
    const PALETTE = ${JSON.stringify(palette)};
    const ORDERED_HUE_KEYS = ${JSON.stringify(orderedHueKeys)};
    const HUE_DEFS = ${JSON.stringify(hueDefs)};
    const NEUTRALS = ${JSON.stringify(NEUTRALS)};
    const RADIX_SCALES = ${JSON.stringify(radixScales)};
    const RADIX_SCALES_DARK = ${JSON.stringify(radixScalesDark)};
    const MAX_COLORS = 7;

    let currentMode = 'light';
    let showRadix = false;
    let brandColors = [...PALETTE.brandColors];

    const modeToggle = document.getElementById('modeToggle');
    const paletteGrid = document.getElementById('paletteGrid');
    const showRadixCheckbox = document.getElementById('showRadix');
    const colorInputsContainer = document.getElementById('colorInputs');
    const toast = document.getElementById('toast');

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('Copied: ' + text);
      });
    }

    function renderColorInputs() {
      let html = '';
      brandColors.forEach((color, i) => {
        html += '<div class="color-input-group">';
        html += '<div class="color-input-wrapper">';
        html += '<input type="color" value="' + color + '" data-index="' + i + '" class="color-picker">';
        html += '<input type="text" value="' + color + '" data-index="' + i + '" class="color-text" placeholder="#000000">';
        if (brandColors.length > 1) {
          html += '<button type="button" class="color-remove-btn" data-index="' + i + '">×</button>';
        }
        html += '</div></div>';
      });

      if (brandColors.length < MAX_COLORS) {
        html += '<button type="button" class="color-add-btn" id="addColorBtn">+ Add Color</button>';
      }
      html += '<button type="button" class="apply-colors-btn" id="applyColorsBtn">Apply Colors</button>';

      colorInputsContainer.innerHTML = html;

      // Event listeners
      colorInputsContainer.querySelectorAll('.color-picker').forEach(el => {
        el.addEventListener('input', (e) => {
          const idx = parseInt(e.target.dataset.index);
          brandColors[idx] = e.target.value;
          e.target.parentElement.querySelector('.color-text').value = e.target.value;
        });
      });

      colorInputsContainer.querySelectorAll('.color-text').forEach(el => {
        el.addEventListener('change', (e) => {
          const idx = parseInt(e.target.dataset.index);
          let value = e.target.value.trim();
          // Basic validation - convert to hex if needed
          if (!value.startsWith('#')) value = '#' + value;
          if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
            brandColors[idx] = value;
            e.target.parentElement.querySelector('.color-picker').value = value;
          }
        });
      });

      colorInputsContainer.querySelectorAll('.color-remove-btn').forEach(el => {
        el.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.index);
          brandColors.splice(idx, 1);
          renderColorInputs();
        });
      });

      const addBtn = document.getElementById('addColorBtn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          brandColors.push('#888888');
          renderColorInputs();
        });
      }

      document.getElementById('applyColorsBtn').addEventListener('click', () => {
        // Reload the page with new colors
        const params = new URLSearchParams(window.location.search);
        params.set('colors', brandColors.join(','));
        window.location.search = params.toString();
      });
    }

    function render() {
      const scales = currentMode === 'dark' ? PALETTE.scalesDark : PALETTE.scales;
      const anchoredSlots = currentMode === 'dark' ? PALETTE.anchoredSlotsDark : PALETTE.anchoredSlots;
      const anchorStepMap = currentMode === 'dark' ? PALETTE.anchorStepMapDark : PALETTE.anchorStepMap;
      const customSlots = currentMode === 'dark' ? PALETTE.customSlotsDark : PALETTE.customSlots;
      const radixScales = currentMode === 'dark' ? RADIX_SCALES_DARK : RADIX_SCALES;

      // Tuning info
      const sign = (n) => n > 0 ? '+' : '';
      document.getElementById('tuneHue').textContent = sign(PALETTE.tuningProfile.hueShift) + PALETTE.tuningProfile.hueShift.toFixed(1) + '°';
      document.getElementById('tuneChroma').textContent = PALETTE.tuningProfile.chromaMultiplier.toFixed(2) + 'x';
      document.getElementById('tuneLightness').textContent = sign(PALETTE.tuningProfile.lightnessShift) + PALETTE.tuningProfile.lightnessShift.toFixed(3);
      document.getElementById('tuneAnchors').textContent = anchoredSlots.join(', ') || 'none';

      let html = '';

      let lastWasNeutral = false;
      for (const hueKey of ORDERED_HUE_KEYS) {
        const scale = scales[hueKey];
        const hueDef = HUE_DEFS[hueKey];
        const isAnchored = anchoredSlots.includes(hueKey);
        const anchorStep = anchorStepMap[hueKey];
        const isNeutral = NEUTRALS.includes(hueKey);

        if (lastWasNeutral && !isNeutral) html += '<div class="section-divider"></div>';
        lastWasNeutral = isNeutral;

        const labelClass = isAnchored ? ' anchored' : '';
        html += '<div class="hue-label' + labelClass + '">' + hueDef.name + (isAnchored ? ' ★' : '') + '</div>';

        for (let step = 1; step <= 12; step++) {
          const hex = scale[step];
          const isAnchor = isAnchored && step === anchorStep;
          const anchorClass = isAnchor ? ' brand-anchor' : '';
          html += '<div class="swatch' + anchorClass + '" style="background: ' + hex + '" data-hex="' + hex + '" title="' + hueKey + '-' + step + ': ' + hex + ' (click to copy)"></div>';
        }

        // Radix baseline row (if enabled)
        if (showRadix && radixScales[hueKey]) {
          html += '<div class="hue-label radix-row">Radix ' + hueDef.name + '</div>';
          for (let step = 1; step <= 12; step++) {
            const hex = radixScales[hueKey][step];
            html += '<div class="swatch" style="background: ' + hex + '" data-hex="' + hex + '" title="Radix ' + hueKey + '-' + step + ': ' + hex + ' (click to copy)"></div>';
          }
        }
      }

      // Custom rows
      if (customSlots && customSlots.length > 0) {
        html += '<div class="section-divider"></div>';
        for (const key of customSlots) {
          const scale = scales[key];
          const anchorStep = anchorStepMap[key];
          html += '<div class="hue-label custom-row">' + key + '</div>';
          for (let step = 1; step <= 12; step++) {
            const hex = scale[step];
            const isAnchor = step === anchorStep;
            html += '<div class="swatch' + (isAnchor ? ' brand-anchor' : '') + '" style="background: ' + hex + '" data-hex="' + hex + '" title="' + key + '-' + step + ': ' + hex + ' (click to copy)"></div>';
          }
        }
      }

      paletteGrid.innerHTML = html;

      // Add click-to-copy handlers
      paletteGrid.querySelectorAll('.swatch').forEach(el => {
        el.addEventListener('click', () => {
          copyToClipboard(el.dataset.hex);
        });
      });
    }

    modeToggle.addEventListener('click', () => {
      currentMode = currentMode === 'light' ? 'dark' : 'light';
      modeToggle.className = 'mode-btn ' + currentMode;
      modeToggle.querySelector('.mode-icon').textContent = currentMode === 'dark' ? '🌙' : '☀️';
      modeToggle.querySelector('.mode-label').textContent = currentMode === 'dark' ? 'Dark' : 'Light';
      document.body.classList.toggle('dark-mode', currentMode === 'dark');
      render();
    });

    showRadixCheckbox.addEventListener('change', () => {
      showRadix = showRadixCheckbox.checked;
      render();
    });

    // Generate button handler
    document.getElementById('generateBtn').addEventListener('click', async () => {
      const btn = document.getElementById('generateBtn');
      const status = document.getElementById('generateStatus');
      const outputDir = document.getElementById('outputDir').value;

      btn.disabled = true;
      status.textContent = 'Generating...';
      status.className = 'generate-status';

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outputDir, colors: brandColors })
        });

        const result = await response.json();
        if (result.success) {
          const msg = result.overwritten
            ? 'Overwrote: ' + result.files.join(', ')
            : 'Generated: ' + result.files.join(', ');
          status.textContent = msg;
          status.className = 'generate-status success';
        } else {
          status.textContent = 'Error: ' + result.error;
          status.className = 'generate-status error';
        }
      } catch (err) {
        status.textContent = 'Error: ' + err.message;
        status.className = 'generate-status error';
      }

      btn.disabled = false;
    });

    renderColorInputs();
    render();
  </script>
</body>
</html>`;
}
