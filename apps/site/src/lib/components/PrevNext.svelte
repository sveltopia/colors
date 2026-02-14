<script lang="ts">
  import { ChevronLeft, ChevronRight } from 'lucide-svelte';

  interface Props {
    prev?: {
      label: string;
      href: string;
    };
    next?: {
      label: string;
      href: string;
    };
  }

  let { prev, next }: Props = $props();
</script>

<nav class="not-prose">
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
    {#if prev}
      <a
        href={prev.href}
        class="group flex flex-col gap-3 rounded-lg bg-gradient-to-br from-primary-800/10 to-primary-700/10 p-6 transition-all hover:from-primary-800/15 hover:to-primary-700/15"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-800/10">
          <ChevronLeft class="h-5 w-5 text-primary-800 dark:text-primary-600" />
        </div>
        <div>
          <div class="mb-1 text-xs font-medium text-muted-foreground">Previous</div>
          <div class="text-base font-semibold text-foreground">{prev.label}</div>
        </div>
      </a>
    {:else}
      <div></div>
    {/if}

    {#if next}
      <a
        href={next.href}
        class="group flex flex-col gap-3 rounded-lg bg-gradient-to-br from-primary-800/10 to-primary-700/10 p-6 transition-all hover:from-primary-800/15 hover:to-primary-700/15"
      >
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-800/10">
          <ChevronRight class="h-5 w-5 text-primary-800 dark:text-primary-600" />
        </div>
        <div>
          <div class="mb-1 text-xs font-medium text-muted-foreground">Next</div>
          <div class="text-base font-semibold text-foreground">{next.label}</div>
        </div>
      </a>
    {/if}
  </div>
</nav>
