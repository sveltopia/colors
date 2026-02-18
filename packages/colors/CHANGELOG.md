# Changelog

All notable changes to @sveltopia/colors will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-02-17

### Added

- Initial release of @sveltopia/colors
- Generate complete 31-hue, 12-step color palettes from 1-3 brand colors
- OKLCH-based perceptual color generation for smooth, uniform scales
- APCA contrast validation with automatic accessibility safeguards
- Light and dark mode generated automatically
- P3 wide gamut color support for modern displays
- Export formats: CSS, JSON, Tailwind v4, Tailwind v3, Radix, Panda CSS, shadcn-svelte
- Interactive CLI with `generate` and `dev` commands
- Dev server for live palette preview (`npx @sveltopia/colors dev`)
- Config file support (`colors.config.json`)
- Brand color anchoring at specific scale steps
- Semantic role assignment (primary, secondary, tertiary, accent, adjacent)
- Alpha color scale generation
- Near-hue gradient harmony via adjacent hue computation
- Tuning profiles for fine-grained palette control

[Unreleased]: https://github.com/sveltopia/colors/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/sveltopia/colors/releases/tag/v0.1.0
