<script lang="ts">
  import { browser } from '$app/environment';
  import { Plus, X, Pipette } from 'lucide-svelte';

  interface Props {
    colors: string[];
    onChange: (colors: string[]) => void;
  }

  let { colors, onChange }: Props = $props();

  const MAX_COLORS = 3;

  // Validate hex color format
  function isValidHex(hex: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }

  // Get a safe value for color picker (must always be valid #rrggbb)
  function getSafePickerValue(hex: string | undefined | null): string {
    if (!hex) return '#000000';
    return isValidHex(hex) ? hex.toLowerCase() : '#000000';
  }

  // Handle color change at index
  function handleColorChange(index: number, value: string) {
    const newColors = [...colors];
    // Ensure # prefix
    if (value && !value.startsWith('#')) {
      value = '#' + value;
    }
    newColors[index] = value.toUpperCase();
    onChange(newColors);
  }

  // Handle color picker change
  function handlePickerChange(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    handleColorChange(index, input.value);
  }

  // Add a new color slot
  function addColor() {
    if (colors.length < MAX_COLORS) {
      onChange([...colors, '']);
    }
  }

  // Remove color at index
  function removeColor(index: number) {
    if (colors.length > 1) {
      const newColors = colors.filter((_, i) => i !== index);
      onChange(newColors);
    }
  }
</script>

<div class="space-y-3">
  <div class="flex items-center gap-2">
    <Pipette class="h-4 w-4 text-muted-foreground" />
    <h2 class="text-sm font-medium">Brand Colors</h2>
  </div>

  <div class="space-y-2">
    {#each colors as color, index (index)}
      {@const isValid = isValidHex(color)}
      <div class="flex items-center gap-2">
        <!-- Color picker (client-only to avoid SSR hydration warning) -->
        <label class="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-md border {!isValid && color.length > 1 ? 'border-red-500' : 'border-border'}">
          {#if browser}
            <input
              type="color"
              value={getSafePickerValue(color)}
              onchange={(e) => handlePickerChange(index, e)}
              class="absolute -inset-2 h-14 w-14 cursor-pointer"
              aria-label="Color picker for brand color {index + 1}"
            />
          {/if}
          <div
            class="absolute inset-0"
            style="background-color: {isValid ? color : '#ffffff'};"
          ></div>
        </label>

        <!-- Text input -->
        <input
          type="text"
          value={color}
          oninput={(e) => handleColorChange(index, (e.target as HTMLInputElement).value)}
          placeholder="#FF6A00"
          maxlength={7}
          aria-label="Hex value for brand color {index + 1}"
          class="h-9 flex-1 rounded-md border bg-background px-3 font-mono text-sm uppercase placeholder:text-muted-foreground {!isValid && color.length > 1 ? 'border-red-500' : 'border-border'}"
        />

        <!-- Remove button -->
        {#if colors.length > 1}
          <button
            type="button"
            onclick={() => removeColor(index)}
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Remove color"
          >
            <X class="h-4 w-4" />
          </button>
        {:else}
          <div class="w-9"></div>
        {/if}
      </div>

      {#if !isValid && color.length > 1}
        <p class="text-xs text-red-500">Invalid hex format (use #RRGGBB)</p>
      {/if}
    {/each}
  </div>

  <!-- Add color button -->
  {#if colors.length < MAX_COLORS}
    <button
      type="button"
      onclick={addColor}
      class="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Plus class="h-4 w-4" />
      <span>Add color ({colors.length}/{MAX_COLORS})</span>
    </button>
  {/if}
</div>
