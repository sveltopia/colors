<script lang="ts">
  import { Sliders } from 'lucide-svelte';
  import type { TuningProfile as TuningProfileType } from '@sveltopia/colors';

  interface Props {
    tuningProfile: TuningProfileType;
  }

  let { tuningProfile }: Props = $props();

  // Format values for display
  const formattedHueShift = $derived.by(() => {
    const value = tuningProfile.hueShift;
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}°`;
  });

  const formattedChroma = $derived.by(() => {
    const value = tuningProfile.chromaMultiplier;
    return `${value.toFixed(2)}×`;
  });

  const formattedLightness = $derived.by(() => {
    const value = tuningProfile.lightnessShift;
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(3)}`;
  });

  // Calculate gauge positions (normalized to 0-100)
  // Hue shift: -30 to +30 degrees maps to 0-100
  const hueGaugePosition = $derived.by(() => {
    const clamped = Math.max(-30, Math.min(30, tuningProfile.hueShift));
    return ((clamped + 30) / 60) * 100;
  });

  // Chroma: 0.5 to 1.5 maps to 0-100
  const chromaGaugePosition = $derived.by(() => {
    const clamped = Math.max(0.5, Math.min(1.5, tuningProfile.chromaMultiplier));
    return ((clamped - 0.5) / 1.0) * 100;
  });

  // Lightness: -0.1 to +0.1 maps to 0-100
  const lightnessGaugePosition = $derived.by(() => {
    const clamped = Math.max(-0.1, Math.min(0.1, tuningProfile.lightnessShift));
    return ((clamped + 0.1) / 0.2) * 100;
  });
</script>

<div class="space-y-4">
  <div class="flex items-center gap-2">
    <Sliders class="h-4 w-4 text-muted-foreground" />
    <h3 class="text-sm font-medium">Tuning Profile</h3>
  </div>

  <p class="text-xs text-muted-foreground">
    How your brand colors shift the entire palette from baseline Radix
  </p>

  <div class="space-y-3">
    <!-- Hue Shift -->
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Hue Shift</span>
        <span class="font-mono font-medium">{formattedHueShift}</span>
      </div>
      <div class="relative h-2 w-full rounded-full bg-secondary">
        <!-- Center marker at 50% -->
        <div class="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border"></div>
        <!-- Indicator -->
        <div
          class="absolute top-0 h-full w-2 -translate-x-1/2 rounded-full bg-primary"
          style="left: {hueGaugePosition}%;"
        ></div>
      </div>
      <div class="flex justify-between text-[10px] text-muted-foreground">
        <span>-30°</span>
        <span>0°</span>
        <span>+30°</span>
      </div>
    </div>

    <!-- Chroma Multiplier -->
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Chroma</span>
        <span class="font-mono font-medium">{formattedChroma}</span>
      </div>
      <div class="relative h-2 w-full rounded-full bg-secondary">
        <!-- Center marker at 50% (1.0×) -->
        <div class="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border"></div>
        <!-- Indicator -->
        <div
          class="absolute top-0 h-full w-2 -translate-x-1/2 rounded-full bg-primary"
          style="left: {chromaGaugePosition}%;"
        ></div>
      </div>
      <div class="flex justify-between text-[10px] text-muted-foreground">
        <span>0.5×</span>
        <span>1.0×</span>
        <span>1.5×</span>
      </div>
    </div>

    <!-- Lightness Shift -->
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs">
        <span class="text-muted-foreground">Lightness</span>
        <span class="font-mono font-medium">{formattedLightness}</span>
      </div>
      <div class="relative h-2 w-full rounded-full bg-secondary">
        <!-- Center marker at 50% -->
        <div class="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-border"></div>
        <!-- Indicator -->
        <div
          class="absolute top-0 h-full w-2 -translate-x-1/2 rounded-full bg-primary"
          style="left: {lightnessGaugePosition}%;"
        ></div>
      </div>
      <div class="flex justify-between text-[10px] text-muted-foreground">
        <span>-0.1</span>
        <span>0</span>
        <span>+0.1</span>
      </div>
    </div>
  </div>
</div>
