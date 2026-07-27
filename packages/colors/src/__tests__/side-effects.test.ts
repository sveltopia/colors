import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

/**
 * Guards the `"sideEffects": false` declaration in package.json.
 *
 * That field promises bundlers they may delete this package outright when a
 * consumer imports none of its exports. `@sveltopia/ui` depends on that: it is
 * a barrel, so `import { Button }` reaches ColorPicker -> colors -> culori, and
 * tree-shaking is the only thing keeping ~85KB of conversion code out of every
 * consumer's bundle. Rollup only elides a graph it can prove is inert.
 *
 * A *false* declaration is worse than none, because bundlers then delete code
 * consumers actually needed. So the claim has to stay true as the package
 * grows -- hence this test rather than a one-off manual check.
 */

const srcDir = fileURLToPath(new URL('..', import.meta.url));
const pkgPath = fileURLToPath(new URL('../../package.json', import.meta.url));

const modules = readdirSync(srcDir, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts') && !f.includes('__tests__'))
  .sort();

const BUILTINS = [Object, Array, String, Number, Function, Promise] as const;

describe('package side effects', () => {
  it('declares sideEffects: false', () => {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    expect(pkg.sideEffects).toBe(false);
  });

  it('finds the source modules to check', () => {
    expect(modules.length).toBeGreaterThan(5);
  });

  it('no module touches globalThis or a built-in prototype on import', async () => {
    const globalsBefore = new Set(Object.getOwnPropertyNames(globalThis));
    const protoBefore = BUILTINS.map((c) => Object.getOwnPropertyNames(c.prototype).length);

    for (const mod of modules) {
      await import(join(srcDir, mod));
    }

    const added = Object.getOwnPropertyNames(globalThis).filter((k) => !globalsBefore.has(k));
    const protoAfter = BUILTINS.map((c) => Object.getOwnPropertyNames(c.prototype).length);

    expect(added).toEqual([]);
    expect(protoAfter).toEqual(protoBefore);
  });
});
