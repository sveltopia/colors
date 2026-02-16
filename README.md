# Sveltopia Colors

[![npm version](https://img.shields.io/npm/v/@sveltopia/colors.svg)](https://www.npmjs.com/package/@sveltopia/colors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-sveltopia-181717?logo=github)](https://github.com/sveltopia)

Generate complete, accessible color palettes from 1-7 brand colors. Drop-in compatible with Radix Colors, Tailwind CSS, and Panda CSS.

## Documentation

- **[Full Documentation & Examples](https://colors.sveltopia.dev)** - Interactive palette builder and guides
- **[Package README](./packages/colors/README.md)** - Quick start, CLI reference, and API docs

## Quick Start

Generate a palette (no install needed):

```bash
npx @sveltopia/colors generate
```

Or pass brand colors directly:

```bash
npx @sveltopia/colors generate --colors "#FF4F00"
```

Preview interactively with the dev server:

```bash
npx @sveltopia/colors dev
```

To pin a version for your team, install as a dev dependency:

```bash
npm install -D @sveltopia/colors
```

## Repository Structure

```
colors/
├── packages/colors/    # The @sveltopia/colors library
└── apps/site/          # Documentation site (colors.sveltopia.dev)
```

## Development

```bash
pnpm install
pnpm dev        # Start all apps
pnpm build      # Build all packages
pnpm test       # Run tests
```

## License

MIT
