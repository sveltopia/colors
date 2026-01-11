/**
 * Systematic verification of ALL curves against Radix source
 * Reports any step with >2° hue diff or >0.02 lightness diff
 */
import { parse, oklch } from 'culori';
import { generateScaleAPCA, RADIX_LIGHTNESS_CURVES, RADIX_CHROMA_CURVES, RADIX_HUE_CURVES, RADIX_REFERENCE_CHROMAS } from '../src/core/generate.js';

const RADIX_HEX: Record<string, string[]> = {
  gray: ['#fcfcfc','#f9f9f9','#f0f0f0','#e8e8e8','#e0e0e0','#d9d9d9','#cecece','#bbbbbb','#8d8d8d','#838383','#646464','#202020'],
  mauve: ['#fdfcfd','#faf9fb','#f2eff3','#eae7ec','#e3dfe6','#dbd8e0','#d0cdd7','#bcbac7','#8e8c99','#84828e','#65636d','#211f26'],
  slate: ['#fcfcfd','#f9f9fb','#f0f0f3','#e8e8ec','#e0e1e6','#d9d9e0','#cdced6','#b9bbc6','#8b8d98','#80838d','#60646c','#1c2024'],
  sage: ['#fbfdfc','#f7f9f8','#eef1f0','#e6e9e8','#dfe2e0','#d7dad9','#cbcfcd','#b8bcba','#868e8b','#7c8481','#5f6563','#1a211e'],
  olive: ['#fcfdfc','#f8faf8','#eff1ef','#e7e9e7','#dfe2df','#d7dad7','#cccfcc','#b9bcb8','#898e87','#7f847d','#60655f','#1d211c'],
  sand: ['#fdfdfc','#f9f9f8','#f1f0ef','#e9e8e6','#e2e1de','#dad9d6','#cfceca','#bcbbb5','#8d8d86','#82827c','#63635e','#21211f'],
  tomato: ['#fffcfc','#fff8f7','#feebe7','#ffdcd3','#ffcdc2','#fdbdaf','#f5a898','#ec8e7b','#e54d2e','#dd4425','#d13415','#5c271f'],
  red: ['#fffcfc','#fff7f7','#feebec','#ffdbdc','#ffcdce','#fdbdbe','#f4a9aa','#eb8e90','#e5484d','#dc3e42','#ce2c31','#641723'],
  ruby: ['#fffcfd','#fff7f8','#feeaed','#ffdce1','#ffced6','#f8bfc8','#efacb8','#e592a3','#e54666','#dc3b5d','#ca244d','#64172b'],
  crimson: ['#fffcfd','#fef7f9','#ffe9f0','#fedce7','#f9ceda','#f0bfcc','#e5acba','#d892a5','#e93d82','#df3478','#cb1d63','#621639'],
  pink: ['#fffcfe','#fef7fb','#fee9f5','#fbdcef','#f6cee7','#efbfdd','#e7acd0','#dd93c2','#d6409f','#cf3897','#c2298a','#651249'],
  plum: ['#fefcff','#fdf7fd','#fbebfb','#f7def8','#f2d1f3','#e9c2ec','#deade3','#cf91d8','#ab4aba','#a144af','#953ea3','#53195d'],
  purple: ['#fefcfe','#fbf7fe','#f7edfe','#f2e2fc','#ead5f9','#e0c4f4','#d1afec','#be93e4','#8e4ec6','#8347b9','#8145b5','#402060'],
  violet: ['#fdfcfe','#faf8ff','#f4f0fe','#ebe4ff','#e1d9ff','#d4cafe','#c2b5f5','#aa99ec','#6e56cf','#654dc4','#6550b9','#2f265f'],
  iris: ['#fdfdff','#f8f8ff','#f0f1fe','#e6e7ff','#dadcff','#cbcfff','#b8bfff','#9da7ff','#5b5bd6','#5151cd','#5753c6','#272962'],
  indigo: ['#fdfdfe','#f7f9ff','#edf2fe','#e1e9ff','#d2deff','#c1d0ff','#abbdf9','#8da4ef','#3e63dd','#3a5ccc','#3451b2','#1f2d5c'],
  blue: ['#fbfdff','#f4faff','#e6f4fe','#d5efff','#c2e5ff','#acd8fc','#8ec8f6','#5eb1ef','#0090ff','#0588f0','#0d74ce','#113264'],
  cyan: ['#fafdfe','#f2fafb','#def7f9','#caf1f6','#b5e9f0','#9ddde7','#84cdda','#3db9cf','#00a2c7','#0797b9','#107d98','#0d3c48'],
  teal: ['#fafefd','#f3fbf9','#e0f8f3','#ccf3ea','#b8eae0','#a1ded2','#83cdc1','#53b9ab','#12a594','#0d9b8a','#008573','#0d3d38'],
  jade: ['#fbfefd','#f4fbf7','#e6f7ed','#d6f1e3','#c3e9d7','#acdec8','#8bceb6','#56ba9f','#29a383','#26997b','#208368','#1d3b31'],
  green: ['#fbfefc','#f4fbf6','#e6f6eb','#d6f1df','#c4e8d1','#afddc3','#8ecea3','#5bb98b','#30a46c','#2b9a66','#218358','#193b2d'],
  grass: ['#fbfefb','#f5fbf5','#e9f6e9','#daf1db','#c9e8ca','#b2ddb5','#94ce9a','#65ba74','#46a758','#3e9b4f','#2a7e3b','#203c25'],
  lime: ['#fcfdfa','#f8faf3','#eef6d6','#e2f0bd','#d3e7a6','#c2da91','#abc978','#8db654','#bdee63','#b0e64c','#5c7c2f','#37401c'],
  yellow: ['#fdfdf9','#fefce9','#fffab8','#fff394','#ffe770','#f3d768','#d5ae39','#aa8b26','#ffe629','#ffdc00','#9e6c00','#473b1f'],
  amber: ['#fefdfb','#fefbe9','#fff7c2','#ffee9c','#fbe577','#f3d673','#e9c162','#e2a336','#ffc53d','#ffba18','#ab6400','#4f3422'],
  orange: ['#fefcfb','#fff7ed','#ffefd6','#ffdfb5','#ffd19a','#ffc182','#f5a623','#f76b15','#f76b15','#ef5f00','#cc4e00','#582d1d'],
  sky: ['#f9feff','#f1fafd','#e1f6fd','#d1f0fa','#bee7f5','#a9daed','#8dcae3','#60b3d7','#7ce2fe','#74daf8','#00749e','#1d3e56'],
  mint: ['#f9fefd','#f2fbf9','#ddf9f2','#c8f4e9','#b3ecde','#9ce0d0','#7ecfbd','#4cbba5','#86ead4','#7de0cb','#027864','#16433c'],
  brown: ['#fefdfc','#fcf9f6','#f6eee7','#f0e4d9','#ebdaca','#e4cdb7','#dcbc9f','#cea37e','#ad7f58','#a07553','#815e46','#3e332e'],
  bronze: ['#fdfcfc','#fdf7f5','#f6edea','#efe4df','#e7d9d3','#dfcdc5','#d3beb3','#c2a899','#a18072','#977669','#846358','#43302b'],
  gold: ['#fdfdfc','#fdfaf3','#f9f0e0','#f5e5c8','#eedcaf','#e5cf98','#d9bd7c','#c9a554','#978149','#8c7a43','#71633b','#3b352b']
};

function toOklch(hex: string) {
  const parsed = parse(hex);
  if (!parsed) return null;
  const lch = oklch(parsed);
  return { l: lch.l, c: lch.c || 0, h: lch.h || 0 };
}

function hueDiff(a: number, b: number): number {
  let diff = a - b;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff;
}

console.log('=== SYSTEMATIC CURVE VERIFICATION ===');
console.log('Checking ALL hues against Radix source (no tuning applied)\n');

let totalIssues = 0;
const issues: string[] = [];

for (const [hue, hexColors] of Object.entries(RADIX_HEX)) {
  // Generate with useFullCurve=true (pure Radix reproduction)
  const scale = generateScaleAPCA({
    parentColor: hexColors[8],
    hueKey: hue,
    useFullCurve: true
  });

  let hueIssues: string[] = [];

  for (let i = 0; i < 12; i++) {
    const step = i + 1;
    const radix = toOklch(hexColors[i])!;
    const gen = scale.steps[i];

    const lDiff = gen.oklch.l - radix.l;
    const hDiff = hueDiff(gen.oklch.h, radix.h);
    const cDiff = gen.oklch.c - radix.c;

    // Flag: L > 0.02, H > 3°, or C > 0.015
    const hasIssue = Math.abs(lDiff) > 0.02 || Math.abs(hDiff) > 3 || Math.abs(cDiff) > 0.015;

    if (hasIssue) {
      let parts = [];
      if (Math.abs(lDiff) > 0.02) parts.push(`L${lDiff > 0 ? '+' : ''}${lDiff.toFixed(3)}`);
      if (Math.abs(hDiff) > 3) parts.push(`H${hDiff > 0 ? '+' : ''}${hDiff.toFixed(1)}°`);
      if (Math.abs(cDiff) > 0.015) parts.push(`C${cDiff > 0 ? '+' : ''}${cDiff.toFixed(3)}`);
      hueIssues.push(`Step ${step}: ${parts.join(', ')}`);
      totalIssues++;
    }
  }

  if (hueIssues.length > 0) {
    console.log(`❌ ${hue}:`);
    hueIssues.forEach(i => console.log(`   ${i}`));
  } else {
    console.log(`✓ ${hue}`);
  }
}

console.log(`\n=== ${totalIssues} total issues ===`);
