# Sveltopia Colors

[![npm version](https://img.shields.io/npm/v/@sveltopia/colors.svg)](https://www.npmjs.com/package/@sveltopia/colors)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-sveltopia-181717?logo=github)](https://github.com/sveltopia)

Generate complete, accessible color palettes from 1-7 brand colors. Drop-in compatible with Radix Colors, Tailwind CSS, and Panda CSS.

## Documentation

- **[Full Documentation & Examples](https://colors.sveltopia.dev)** - Interactive palette builder and guides
- **[Package README](./packages/colors/README.md)** - Quick start, CLI reference, and API docs

## Quick Start

```bash
npm install @sveltopia/colors
```

Generate a palette with the CLI:

```bash
npx @sveltopia/colors generate --colors "#FF4F00"
```

Or preview interactively:

```bash
npx @sveltopia/colors dev --colors "#FF4F00"
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
