# Sveltopia Colors - Product Architecture

## The Three Tiers

The library serves users at different stages of commitment with the same core functionality delivered through different interfaces.

---

## Tier 1: CLI (Headless Generation)

**Command:**

```bash
npx @sveltopia/colors generate \
  --input "#FF6A00,#43A047,#1A1A1A" \
  --preset panda \
  --output ./tokens/colors.ts
```

**Use case:** CI/CD, scripting, "I know exactly what I want"

**Features:**

* Fast, deterministic, reproducible
* Multiple output presets: Panda CSS, Tailwind, CSS variables, JSON
* Accepts calibration value via flag: `--calibration 0.7`
* **No UI** - purely command-line

**Audience:** Power users, automated pipelines, developers who've already dialed in their settings via the playground.

---

## Tier 2: Local Playground (Bundled with Package)

**Command:**

```bash
npx @sveltopia/colors playground
# -> Opens localhost:3000 with interactive UI
```

**Use case:** Exploration, calibration slider experimentation, "let me tweak this until it feels right"

**Features:**

* Color picker inputs (1-7 brand colors)
* Live grid preview (Radix-style 30 hues x 12 steps)
* Calibration slider (brand fidelity <-> system harmony)
* Light/dark mode toggle
* Export button -> downloads file or copies CLI command

**Key insight:** The playground is **bundled into the npm package itself**. Developers don't install a separate site - they run a command and a local UI appears. Similar to how `npx storybook` works.

**Audience:** Developers who've installed the library and want to visually experiment before committing to a configuration.

---

## Tier 3: Web Playground (Hosted)

**URL:** colors.sveltopia.dev

**Use case:** "I'm evaluating this library" / "I don't want to install anything yet"

**Features:**

* Same playground UI as Tier 2
* No installation required
* Download artifact button
* "Copy CLI command" button for reproducibility
* Marketing/landing page
* Documentation and guides

**Key insight:** Tier 3 is just a **hosted version of Tier 2's UI**, plus marketing content. The core playground component is shared.

**Audience:** Prospective users evaluating the library, developers who want a quick preview without installing.

---

## Package Structure

```
packages/colors/
├── src/
│   ├── core/           # Algorithm (generatePalette, etc.)
│   ├── cli/            # CLI commands (generate, playground)
│   └── playground/     # Embedded UI (pre-built, served locally)
├── bin/
│   └── sveltopia-colors.js   # CLI entry point
└── package.json

apps/site/
├── src/
│   └── routes/
│       ├── +page.svelte      # Landing/marketing
│       ├── playground/       # Same UI component, hosted
│       └── docs/             # Documentation
└── package.json
```

---

## Why This Architecture

1. **Same UI, two delivery modes** - Build the playground once, deploy it two ways (local via `playground` command, hosted at colors.sveltopia.dev). Tier 1 is headless CLI with no UI.
2. **Progressive commitment** - Users can:
   * Try on the web (no install) -> Tier 3
   * Install and explore locally -> Tier 2
   * Graduate to CLI for automation -> Tier 1
3. **Calibration slider lives in the playground** - Visual discovery of the right brand fidelity <-> harmony balance. CLI accepts the resulting value as a flag.
4. **Self-contained library** - Developers who install `@sveltopia/colors` get everything they need. The site is for marketing and docs, not required functionality.
5. **Downloadable artifacts work everywhere** - Same output format whether generated from web, local playground, or CLI.

---

*This document defines the product delivery architecture. See "Vision & Mental Models" for foundational thinking and Linear issues for implementation details.*
