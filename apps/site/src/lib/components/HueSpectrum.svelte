<script lang="ts">
  import { Star } from 'lucide-svelte';

  // All 31 hue scales at step 9 - ordered to match Radix
  const allHues = [
    // Neutrals
    { name: 'gray', color: 'var(--gray-9)', isBrand: true },
    { name: 'mauve', color: 'var(--mauve-9)' },
    { name: 'slate', color: 'var(--slate-9)' },
    { name: 'sage', color: 'var(--sage-9)' },
    { name: 'olive', color: 'var(--olive-9)' },
    { name: 'sand', color: 'var(--sand-9)' },
    // Reds
    { name: 'tomato', color: 'var(--tomato-9)' },
    { name: 'red', color: 'var(--red-9)' },
    { name: 'ruby', color: 'var(--ruby-9)' },
    { name: 'crimson', color: 'var(--crimson-9)' },
    // Pinks/Purples
    { name: 'pink', color: 'var(--pink-9)' },
    { name: 'plum', color: 'var(--plum-9)' },
    { name: 'purple', color: 'var(--purple-9)' },
    { name: 'violet', color: 'var(--violet-9)' },
    // Blues
    { name: 'iris', color: 'var(--iris-9)' },
    { name: 'indigo', color: 'var(--indigo-9)' },
    { name: 'blue', color: 'var(--blue-9)' },
    { name: 'cyan', color: 'var(--cyan-9)' },
    // Teals/Greens
    { name: 'teal', color: 'var(--teal-9)' },
    { name: 'jade', color: 'var(--jade-9)' },
    { name: 'green', color: 'var(--green-9)' },
    { name: 'grass', color: 'var(--grass-9)', isBrand: true },
    // Warm neutrals
    { name: 'bronze', color: 'var(--bronze-9)' },
    { name: 'gold', color: 'var(--gold-9)' },
    { name: 'brown', color: 'var(--brown-9)' },
    // Oranges/Yellows
    { name: 'orange', color: 'var(--orange-9)', isBrand: true },
    { name: 'amber', color: 'var(--amber-9)' },
    { name: 'yellow', color: 'var(--yellow-9)' },
    { name: 'lime', color: 'var(--lime-9)' },
    // Cyans
    { name: 'mint', color: 'var(--mint-9)' },
    { name: 'sky', color: 'var(--sky-9)' }
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
