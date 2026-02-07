<script lang="ts">
  import { Star } from 'lucide-svelte';

  // All 31 hue scales at step 800 (primary action color) - ordered to match Radix
  const allHues = [
    // Neutrals
    { name: 'gray', color: 'var(--color-gray-800)', isBrand: true },
    { name: 'mauve', color: 'var(--color-mauve-800)' },
    { name: 'slate', color: 'var(--color-slate-800)' },
    { name: 'sage', color: 'var(--color-sage-800)' },
    { name: 'olive', color: 'var(--color-olive-800)' },
    { name: 'sand', color: 'var(--color-sand-800)' },
    // Reds
    { name: 'tomato', color: 'var(--color-tomato-800)' },
    { name: 'red', color: 'var(--color-red-800)' },
    { name: 'ruby', color: 'var(--color-ruby-800)' },
    { name: 'crimson', color: 'var(--color-crimson-800)' },
    // Pinks/Purples
    { name: 'pink', color: 'var(--color-pink-800)' },
    { name: 'plum', color: 'var(--color-plum-800)' },
    { name: 'purple', color: 'var(--color-purple-800)' },
    { name: 'violet', color: 'var(--color-violet-800)' },
    // Blues
    { name: 'iris', color: 'var(--color-iris-800)' },
    { name: 'indigo', color: 'var(--color-indigo-800)' },
    { name: 'blue', color: 'var(--color-blue-800)' },
    { name: 'cyan', color: 'var(--color-cyan-800)' },
    // Teals/Greens
    { name: 'teal', color: 'var(--color-teal-800)' },
    { name: 'jade', color: 'var(--color-jade-800)' },
    { name: 'green', color: 'var(--color-green-800)' },
    { name: 'grass', color: 'var(--color-grass-800)', isBrand: true },
    // Warm neutrals
    { name: 'bronze', color: 'var(--color-bronze-800)' },
    { name: 'gold', color: 'var(--color-gold-800)' },
    { name: 'brown', color: 'var(--color-brown-800)' },
    // Oranges/Yellows
    { name: 'orange', color: 'var(--color-orange-800)', isBrand: true },
    { name: 'amber', color: 'var(--color-amber-800)' },
    { name: 'yellow', color: 'var(--color-yellow-800)' },
    { name: 'lime', color: 'var(--color-lime-800)' },
    // Cyans
    { name: 'mint', color: 'var(--color-mint-800)' },
    { name: 'sky', color: 'var(--color-sky-800)' }
  ];
</script>

<div>
  <div class="flex flex-wrap justify-center gap-1.5">
    {#each allHues as hue (hue.name)}
      <div
        class="relative h-5 w-5 rounded transition-transform hover:z-10 hover:scale-125 sm:h-6 sm:w-6"
        style="background-color: {hue.color};"
        title={hue.name}
      >
        {#if hue.isBrand}
          <div class="absolute inset-0 flex items-center justify-center">
            <Star
              class="h-3 w-3 fill-current sm:h-3.5 sm:w-3.5"
              style="color: white; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));"
            />
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
