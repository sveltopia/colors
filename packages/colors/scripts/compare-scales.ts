/**
 * Compare generated scales against Radix reference.
 * Outputs HTML for visual inspection.
 */

import { generateScale, generateScaleAPCA, RADIX_APCA_TARGETS } from '../src/core/generate.js';
import { toOklch } from '../src/utils/oklch.js';
import * as fs from 'fs';
import * as path from 'path';

// @ts-ignore
import { calcAPCA } from 'apca-w3';

// Radix reference scales
const RADIX_ORANGE = [
	'#fefcfb',
	'#fff7ed',
	'#ffefd6',
	'#ffdfb5',
	'#ffd19a',
	'#ffc182',
	'#f5ae73',
	'#ec9455',
	'#f76b15',
	'#ef5f00',
	'#cc4e00',
	'#582d1d'
];

const RADIX_GREEN = [
	'#fbfefc',
	'#f4fbf6',
	'#e6f6eb',
	'#d6f1df',
	'#c4e8d1',
	'#adddc0',
	'#8eceaa',
	'#5bb98b',
	'#30a46c',
	'#2b9a66',
	'#218358',
	'#193b2d'
];

const SVELTOPIA_ORANGE = '#FF6A00';
const SVELTOPIA_GREEN = '#43A047';

// Generate orange scales
const ourScale = generateScale({ parentColor: SVELTOPIA_ORANGE });
const ourScaleAPCA = generateScaleAPCA({ parentColor: SVELTOPIA_ORANGE });
const radixOrangeScale = generateScale({ parentColor: RADIX_ORANGE[8] });

// Generate green scales
const ourGreenScale = generateScale({ parentColor: SVELTOPIA_GREEN });
const ourGreenScaleAPCA = generateScaleAPCA({ parentColor: SVELTOPIA_GREEN });
const radixGreenScale = generateScale({ parentColor: RADIX_GREEN[8] });

const WHITE = '#ffffff';

function getAPCA(hex: string): number {
	return Math.abs(calcAPCA(hex, WHITE));
}

// Build HTML
let html = `<!DOCTYPE html>
<html>
<head>
  <title>Scale Comparison</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #1a1a1a;
      color: #fff;
      padding: 40px;
    }
    h1, h2 { margin-bottom: 20px; }
    .comparison {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 30px;
      margin-bottom: 40px;
    }
    .scale {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .scale-title {
      font-size: 14px;
      margin-bottom: 10px;
      color: #888;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .swatch {
      width: 60px;
      height: 36px;
      border-radius: 4px;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .info {
      font-size: 11px;
      font-family: monospace;
      color: #888;
    }
    .step-num {
      width: 20px;
      font-size: 12px;
      color: #666;
    }
    table {
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 8px 12px;
      border: 1px solid #333;
      text-align: left;
      font-size: 12px;
    }
    th { background: #2a2a2a; }
    .good { color: #4ade80; }
    .warn { color: #fbbf24; }
    .bad { color: #f87171; }
  </style>
</head>
<body>
  <h1>Scale Generation Comparison</h1>

  <h2>Visual Comparison</h2>
  <div class="comparison">
    <div>
      <div class="scale-title">Radix Orange (Reference)</div>
      <div class="scale">
`;

// Radix reference
for (let i = 0; i < 12; i++) {
	const hex = RADIX_ORANGE[i];
	const oklch = toOklch(hex);
	const apca = getAPCA(hex);
	html += `
        <div class="step">
          <span class="step-num">${i + 1}</span>
          <div class="swatch" style="background: ${hex}"></div>
          <span class="info">${hex} L:${oklch?.l.toFixed(2)} APCA:${apca.toFixed(0)}</span>
        </div>`;
}

html += `
      </div>
    </div>

    <div>
      <div class="scale-title">Our Scale (Simple) - ${SVELTOPIA_ORANGE}</div>
      <div class="scale">
`;

// Our simple scale
for (const step of ourScale.steps) {
	html += `
        <div class="step">
          <span class="step-num">${step.step}</span>
          <div class="swatch" style="background: ${step.hex}"></div>
          <span class="info">${step.hex} L:${step.oklch.l.toFixed(2)} APCA:${step.apca.toFixed(0)}</span>
        </div>`;
}

html += `
      </div>
    </div>

    <div>
      <div class="scale-title">Our Scale (APCA) - ${SVELTOPIA_ORANGE}</div>
      <div class="scale">
`;

// Our APCA scale
for (const step of ourScaleAPCA.steps) {
	html += `
        <div class="step">
          <span class="step-num">${step.step}</span>
          <div class="swatch" style="background: ${step.hex}"></div>
          <span class="info">${step.hex} L:${step.oklch.l.toFixed(2)} APCA:${step.apca.toFixed(0)}</span>
        </div>`;
}

html += `
      </div>
    </div>

    <div>
      <div class="scale-title">From Radix Step 9 - ${RADIX_ORANGE[8]}</div>
      <div class="scale">
`;

// Scale generated from Radix orange
for (const step of radixOrangeScale.steps) {
	html += `
        <div class="step">
          <span class="step-num">${step.step}</span>
          <div class="swatch" style="background: ${step.hex}"></div>
          <span class="info">${step.hex} L:${step.oklch.l.toFixed(2)} APCA:${step.apca.toFixed(0)}</span>
        </div>`;
}

html += `
      </div>
    </div>
  </div>

  <h2>APCA Comparison Table</h2>
  <table>
    <tr>
      <th>Step</th>
      <th>Target</th>
      <th>Radix</th>
      <th>Our Simple</th>
      <th>Our APCA</th>
    </tr>
`;

for (let i = 0; i < 12; i++) {
	const target = RADIX_APCA_TARGETS[i];
	const radix = getAPCA(RADIX_ORANGE[i]);
	const simple = ourScale.steps[i].apca;
	const apca = ourScaleAPCA.steps[i].apca;

	const getDiffClass = (actual: number, target: number) => {
		if (target < 5) return ''; // Skip near-zero targets
		const diff = Math.abs(actual - target);
		if (diff <= 2) return 'good';
		if (diff <= 5) return 'warn';
		return 'bad';
	};

	html += `
    <tr>
      <td>${i + 1}</td>
      <td>${target.toFixed(1)}</td>
      <td>${radix.toFixed(1)}</td>
      <td class="${getDiffClass(simple, target)}">${simple.toFixed(1)}</td>
      <td class="${getDiffClass(apca, target)}">${apca.toFixed(1)}</td>
    </tr>`;
}

html += `
  </table>

  <h2>Green Scale Comparison</h2>
  <div class="comparison">
    <div>
      <div class="scale-title">Radix Green (Reference)</div>
      <div class="scale">
`;

// Radix green reference
for (let i = 0; i < 12; i++) {
	const hex = RADIX_GREEN[i];
	const oklch = toOklch(hex);
	const apca = getAPCA(hex);
	html += `
        <div class="step">
          <span class="step-num">${i + 1}</span>
          <div class="swatch" style="background: ${hex}"></div>
          <span class="info">${hex} L:${oklch?.l.toFixed(2)} APCA:${apca.toFixed(0)}</span>
        </div>`;
}

html += `
      </div>
    </div>

    <div>
      <div class="scale-title">Our Scale (Simple) - ${SVELTOPIA_GREEN}</div>
      <div class="scale">
`;

// Our simple green scale
for (const step of ourGreenScale.steps) {
	html += `
        <div class="step">
          <span class="step-num">${step.step}</span>
          <div class="swatch" style="background: ${step.hex}"></div>
          <span class="info">${step.hex} L:${step.oklch.l.toFixed(2)} APCA:${step.apca.toFixed(0)}</span>
        </div>`;
}

html += `
      </div>
    </div>

    <div>
      <div class="scale-title">Our Scale (APCA) - ${SVELTOPIA_GREEN}</div>
      <div class="scale">
`;

// Our APCA green scale
for (const step of ourGreenScaleAPCA.steps) {
	html += `
        <div class="step">
          <span class="step-num">${step.step}</span>
          <div class="swatch" style="background: ${step.hex}"></div>
          <span class="info">${step.hex} L:${step.oklch.l.toFixed(2)} APCA:${step.apca.toFixed(0)}</span>
        </div>`;
}

html += `
      </div>
    </div>

    <div>
      <div class="scale-title">From Radix Step 9 - ${RADIX_GREEN[8]}</div>
      <div class="scale">
`;

// Scale generated from Radix green
for (const step of radixGreenScale.steps) {
	html += `
        <div class="step">
          <span class="step-num">${step.step}</span>
          <div class="swatch" style="background: ${step.hex}"></div>
          <span class="info">${step.hex} L:${step.oklch.l.toFixed(2)} APCA:${step.apca.toFixed(0)}</span>
        </div>`;
}

html += `
      </div>
    </div>
  </div>

  <h2>Green APCA Comparison Table</h2>
  <table>
    <tr>
      <th>Step</th>
      <th>Target</th>
      <th>Radix</th>
      <th>Our Simple</th>
      <th>Our APCA</th>
    </tr>
`;

for (let i = 0; i < 12; i++) {
	const target = RADIX_APCA_TARGETS[i];
	const radix = getAPCA(RADIX_GREEN[i]);
	const simple = ourGreenScale.steps[i].apca;
	const apca = ourGreenScaleAPCA.steps[i].apca;

	const getDiffClass = (actual: number, target: number) => {
		if (target < 5) return ''; // Skip near-zero targets
		const diff = Math.abs(actual - target);
		if (diff <= 2) return 'good';
		if (diff <= 5) return 'warn';
		return 'bad';
	};

	html += `
    <tr>
      <td>${i + 1}</td>
      <td>${target.toFixed(1)}</td>
      <td>${radix.toFixed(1)}</td>
      <td class="${getDiffClass(simple, target)}">${simple.toFixed(1)}</td>
      <td class="${getDiffClass(apca, target)}">${apca.toFixed(1)}</td>
    </tr>`;
}

html += `
  </table>

  <h2>Parent Colors</h2>
  <div style="display: flex; gap: 20px; margin-top: 20px;">
    <div>
      <div style="width: 100px; height: 60px; background: ${SVELTOPIA_ORANGE}; border-radius: 8px;"></div>
      <div class="info" style="margin-top: 8px;">Sveltopia Orange: ${SVELTOPIA_ORANGE}</div>
    </div>
    <div>
      <div style="width: 100px; height: 60px; background: ${RADIX_ORANGE[8]}; border-radius: 8px;"></div>
      <div class="info" style="margin-top: 8px;">Radix Orange 9: ${RADIX_ORANGE[8]}</div>
    </div>
    <div>
      <div style="width: 100px; height: 60px; background: ${SVELTOPIA_GREEN}; border-radius: 8px;"></div>
      <div class="info" style="margin-top: 8px;">Sveltopia Green: ${SVELTOPIA_GREEN}</div>
    </div>
    <div>
      <div style="width: 100px; height: 60px; background: ${RADIX_GREEN[8]}; border-radius: 8px;"></div>
      <div class="info" style="margin-top: 8px;">Radix Green 9: ${RADIX_GREEN[8]}</div>
    </div>
  </div>
</body>
</html>`;

// Write to file (outputs to repo root when run from repo root)
const outputPath = path.join(process.cwd(), 'compare-scales.html');
fs.writeFileSync(outputPath, html);
console.log(`Generated: ${outputPath}`);
console.log('Open with: open compare-scales.html');
