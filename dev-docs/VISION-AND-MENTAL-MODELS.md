# Sveltopia Colors - Vision & Mental Models

## The Core Insight

**"A fully tuned color environment, not just a palette."**

---

## The Guitar Analogy

Tailwind gives you a guitar. Radix gives you a guitar. We give you a guitar *tuned to your brand's key* - every string, every fret, harmonized to your specific frequency.

Use 5 chords or 50, they all resonate together.

The guitar is fully tuned for your next album even if you only used 5 chords for your first one.

---

## The Bon Iver Effect

Bon Iver tunes his guitar differently than standard tuning, but it's **internally consistent**. Every string is offset by the same amount, so chords still work - they just have a different character.

Our palettes work the same way: each brand gets a unique "tuning" (hue shift, chroma multiplier, lightness adjustment), but the **structure is consistent**:

* Step 9 is always your solid button color
* Step 12 is always your text color
* Developers can rely on the patterns while the brand personality comes through

---

## Why Full Coverage Matters

### The "Waste" Concern - Solved by Tree-Shaking

Modern build tools only bundle what's used. The 700 colors you *don't* use cost nothing in production. But they're there when you need them.

### Future-Proof by Design

* **Year 1:** Blue and gold design
* **Year 3:** Introduce that green from the logo
* No regeneration needed - the green was always there, already tuned to your brand's signature

### Rebrand Without Refactoring

If semantic slots are stable (`success = green.9`, `button.primary = primary.9`), a rebrand is:

```bash
npx sveltopia-colors generate --input new-brand.json
```

Regenerate, deploy. Every component automatically uses the new tuned colors. **Zero code changes.**

### Design System Stability

Designers can explore freely within the environment. "Let's try teal for this section" - it already exists and already harmonizes. No back-to-the-color-tool friction.

---

## The Core Challenge

### The Problem

Brand colors are typically eyeballed by talented designers - they look good together, but they're not mathematically "harmonious" in the sense that we can't just alter every color by X amount and have all inputs fit perfectly into a balanced system.

If we "push and pull" our root hues to best match brand inputs, it may pull the system "out of alignment" - creating uneven gaps between hues.

### Potential Solution: The Calibration Slider

Two extremes:

1. **Full Environment Balance** - Preserves perfect system harmony but uses slightly altered versions of brand inputs ("we had to make your green slightly less blue")
2. **Exact Brand Match** - Uses brand colors exactly but throws harmony slightly out of balance

Users can slide to find their preferred middle ground.

This gives users **agency over the tradeoff** rather than us making an opinionated choice that won't work for everyone.

---

## Output Structure

| Input | Process | Output |
| -- | -- | -- |
| 1-7 brand colors | Analyze -> Calculate tuning profile -> Apply to 30 baseline hues -> Generate 12 tints each -> Derive dark mode | **720 colors** (30 hues x 12 tints x 2 modes) |

Plus:

* **Semantic aliases** (success, warning, error, info)
* **Component presets** (button.primary, text.muted, etc.) - Phase 2
* **Documentation** so thorough that AI agents can use it instantly

---

## Differentiation from Harmonizer/Competition

Harmonizer is **tool-first** - it shows you the machinery (APCA values, chroma decimals, P3 indicators).

We are **outcome-first**:

* Input simplicity: 1-7 color pickers, paste hex/oklch, done
* Output clarity: "Here's your palette" with copy-to-clipboard tokens
* Svelte-first: Native Panda CSS export
* Non-technical friendly: Church CMS customers can provide brand colors and get a working system

---

*This document captures the foundational thinking. Implementation details live in the POC issues and `dev-docs/ALGORITHMIC-COLOR-SYSTEM.md`.*
