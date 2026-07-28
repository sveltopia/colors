# Changelog

All notable changes to @sveltopia/colors will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-07-27

### Added

- `gamutMapOklch(color, gamut)` — map a color into a displayable gamut by reducing chroma while
  holding lightness and hue, so the fallback reads as the same hue at the same lightness rather than
  a shifted one. Returns `{ color, mapped }`, where `mapped` reports whether the input was actually
  out of gamut.
- `inGamut(color, gamut)` — whether a color is reachable in the target gamut. OKLCH describes far
  more colors than any screen can show, so a valid OKLCH triplet is often not renderable.
- Both take a target gamut of `'srgb'` (default, safe everywhere) or `'display-p3'`.
- `Gamut` and `GamutMapResult` types.

### Changed

- The package now declares `"sideEffects": false`, so bundlers can drop it entirely from
  applications that import none of its exports.

`toHex()` is deliberately unchanged and still clips RGB channels, which distorts hue and lightness
at the gamut edge; palette generation depends on that behaviour. Reach for `gamutMapOklch()` when
you want the perceptually correct fallback instead.

## [0.2.0] - 2026-04-08

### Added

- `exportSveltopiaUI(palette, options)` — export a generated palette as structured data for
  @sveltopia/ui: every hue in both light and dark, as OKLCH and hex, plus brand role assignments
  (which hue row each role resolves to) and generation metadata. Takes a `neutralHue` option
  (default `gray`) for the surface, border, and text families. The @sveltopia/ui CLI consumes this
  to build Panda presets.

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

[unreleased]: https://github.com/sveltopia/colors/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/sveltopia/colors/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/sveltopia/colors/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/sveltopia/colors/releases/tag/v0.1.0
