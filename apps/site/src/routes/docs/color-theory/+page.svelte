<script lang="ts">
  import CodeViewer from '$lib/components/CodeViewer.svelte';
  import KeyConcept from '$lib/components/KeyConcept.svelte';
  import PrevNext from '$lib/components/PrevNext.svelte';
  import { Lightbulb, ExternalLink } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Color Theory | Sveltopia Colors</title>
  <meta name="description" content="Why OKLCH, the Radix 12-step scale, and APCA contrast. Understand the color science behind Sveltopia Colors." />
  <meta property="og:title" content="Color Theory | Sveltopia Colors" />
  <meta property="og:description" content="Why OKLCH, the Radix 12-step scale, and APCA contrast. Understand the color science behind Sveltopia Colors." />
</svelte:head>

<div class="prose max-w-none dark:prose-invert">
  <h1>Color Theory</h1>

  <p class="lead">
    Sveltopia Colors is built on three foundations: the OKLCH color space, the Radix 12-step scale
    system, and APCA contrast validation. Here's why each matters:
  </p>

  <h2>Why OKLCH?</h2>

  <p>
    Most color tools use HSL or RGB. These color spaces have a fundamental problem: they aren't
    <strong>perceptually uniform</strong>. A yellow and a blue at the same HSL lightness value
    <em>look</em> completely different in brightness to the human eye.
  </p>

  <p>
    OKLCH (Oklab Lightness, Chroma, Hue) solves this. It's a perceptual color space where:
  </p>

  <ul>
    <li>
      <strong>L (Lightness)</strong> &mdash; 0 to 1. Two colors with the same L value actually look
      equally bright.
    </li>
    <li>
      <strong>C (Chroma)</strong> &mdash; 0 to ~0.4. How vivid the color is. Zero is gray.
    </li>
    <li>
      <strong>H (Hue)</strong> &mdash; 0 to 360 degrees. The color wheel position.
    </li>
  </ul>
</div>

<div class="not-prose mt-4">
  <KeyConcept icon={Lightbulb}>
    <p>
      <strong>Practical impact:</strong> When you generate a 12-step scale in OKLCH, step 5 of
      every hue (orange, blue, green) looks the same brightness. In HSL, they'd look wildly
      different. This is what makes the scales <em>feel</em> consistent across your whole palette.
    </p>
  </KeyConcept>
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <p>
    OKLCH also supports the P3 wide-gamut color space, giving you access to more vivid colors on
    modern displays. The generated CSS includes P3 fallbacks automatically.
  </p>

  <h2 id="the-radix-12-step-scale">The Radix 12-step scale</h2>

  <p>
    Radix Colors pioneered a 12-step scale where each step has a specific semantic purpose.
    Sveltopia Colors follows this system, mapped to a 50–950 naming convention for Tailwind
    compatibility:
  </p>

  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>Step</th>
          <th>Tailwind</th>
          <th>Purpose</th>
          <th>Example use</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>50</td>
          <td>App background</td>
          <td>Page body, full-bleed background</td>
        </tr>
        <tr>
          <td>2</td>
          <td>100</td>
          <td>Subtle background</td>
          <td>Sidebar, striped table rows</td>
        </tr>
        <tr>
          <td>3</td>
          <td>200</td>
          <td>Component background</td>
          <td>Card, input field, code block background</td>
        </tr>
        <tr>
          <td>4</td>
          <td>300</td>
          <td>Hovered component</td>
          <td>Card hover, button hover background</td>
        </tr>
        <tr>
          <td>5</td>
          <td>400</td>
          <td>Active/selected</td>
          <td>Active tab, selected list item</td>
        </tr>
        <tr>
          <td>6</td>
          <td>500</td>
          <td>Subtle borders</td>
          <td>Dividers, card borders</td>
        </tr>
        <tr>
          <td>7</td>
          <td>600</td>
          <td>Strong borders</td>
          <td>Input borders, focus rings</td>
        </tr>
        <tr>
          <td>8</td>
          <td>700</td>
          <td>Hovered borders</td>
          <td>Focus rings, hovered input borders</td>
        </tr>
        <tr>
          <td>9</td>
          <td>800</td>
          <td>Primary solid</td>
          <td>Buttons, links, primary actions</td>
        </tr>
        <tr>
          <td>10</td>
          <td>850*</td>
          <td>Hovered solid</td>
          <td>Button hover states</td>
        </tr>
        <tr>
          <td>11</td>
          <td>900</td>
          <td>Low-contrast text</td>
          <td>Secondary text, labels, captions</td>
        </tr>
        <tr>
          <td>12</td>
          <td>950</td>
          <td>High-contrast text</td>
          <td>Headings, primary body text</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="text-sm text-muted-foreground">
    *850 is not part of Tailwind's default color scale. We added it to preserve the full Radix 12-step system &mdash; without it, the "hovered solid" state (step 10) would have no Tailwind equivalent.
  </p>
</div>

<div class="not-prose mt-4">
  <KeyConcept variant="neutral">
    <p>
      <strong>Why 12 steps?</strong> Fewer steps (like 5 or 7) don't provide enough granularity
      for real UI work &mdash; you end up needing "between" values. More than 12 creates decision
      paralysis without meaningful perceptual differences. Twelve is the sweet spot that covers
      every UI need with clear semantic purpose for each step.
    </p>
  </KeyConcept>
</div>

<div class="prose mt-6 max-w-none dark:prose-invert">
  <h2>APCA contrast</h2>

  <p>
    WCAG 2.x uses a contrast ratio (like 4.5:1) that has known problems. It rates some readable
    combinations as failing and some hard-to-read combinations as passing, especially with colored
    text.
  </p>

  <p>
    <strong>APCA</strong> (Accessible Perceptual Contrast Algorithm) is the replacement being
    developed for WCAG 3. It accounts for:
  </p>

  <ul>
    <li>
      <strong>Polarity</strong> &mdash; dark text on light backgrounds is perceived differently than light
      text on dark backgrounds
    </li>
    <li>
      <strong>Font size and weight</strong> &mdash; larger, bolder text needs less contrast than small body
      text
    </li>
    <li>
      <strong>Perceptual lightness</strong> &mdash; uses the OKLCH model for accurate luminance
      calculations
    </li>
  </ul>

  <p>
    Sveltopia Colors uses these APCA thresholds:
  </p>

  <div class="overflow-x-auto">
    <table>
      <thead>
        <tr>
          <th>Use case</th>
          <th>APCA threshold</th>
          <th>Typical context</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Body text</td>
          <td>75</td>
          <td>14–16px paragraph text</td>
        </tr>
        <tr>
          <td>Large text / UI</td>
          <td>60</td>
          <td>18px+ headings, buttons, icons</td>
        </tr>
        <tr>
          <td>Decorative</td>
          <td>45</td>
          <td>Non-text elements, borders, dividers</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p>
    Critical text contrast pairs &mdash; steps 11–12 (text colors) against steps 1–2 (backgrounds) &mdash; are validated and auto-adjusted during generation to meet these thresholds. Button solid steps (9–10) are validated but flagged as warnings rather than auto-corrected, since saturated hues naturally have lower contrast that APCA accounts for through font size and weight. See the
    <a href="/docs/accessibility">Accessibility</a> page for safe combination guidelines.
  </p>

  <h2>Further reading</h2>

  <ul>
    <li>
      <a href="https://oklch.com" target="_blank" rel="noopener noreferrer">oklch.com</a> &mdash; interactive OKLCH color picker
    </li>
    <li>
      <a href="https://www.radix-ui.com/colors" target="_blank" rel="noopener noreferrer">Radix Colors</a> &mdash; the 12-step scale system we build on
    </li>
    <li>
      <a href="https://git.apcacontrast.com" target="_blank" rel="noopener noreferrer">APCA Contrast</a> &mdash; the accessible contrast algorithm
    </li>
  </ul>
</div>

<div class="mt-12">
  <PrevNext
    prev={{ label: 'Frameworks', href: '/docs/frameworks' }}
    next={{ label: 'Alpha Colors', href: '/docs/alpha' }}
  />
</div>
