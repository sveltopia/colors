<script lang="ts">
  import { Lightbulb } from 'lucide-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'neutral' | 'slate' | 'orange';
    icon?: typeof Lightbulb;
    noMargin?: boolean;
    children: Snippet;
  }

  let { variant = 'primary', icon, noMargin = false, children }: Props = $props();

  const variants = {
    primary: {
      bg: 'bg-primary-800/5',
      iconColor: 'text-primary-800 dark:text-primary-600'
    },
    neutral: {
      bg: 'bg-muted',
      iconColor: 'text-muted-foreground'
    },
    slate: {
      bg: 'bg-slate-500/5',
      iconColor: 'text-slate-600 dark:text-slate-400'
    },
    orange: {
      bg: 'bg-orange-500/5',
      iconColor: 'text-orange-600 dark:text-orange-400'
    }
  };

  const currentVariant = $derived(variants[variant]);
  const IconComponent = $derived(icon || Lightbulb);
</script>

<div class="not-prose rounded-lg {currentVariant.bg} p-6" class:my-6={!noMargin}>
  <div class="flex items-start gap-3">
    <IconComponent class="mt-0.5 h-5 w-5 shrink-0 {currentVariant.iconColor}" />
    <div class="text-sm leading-relaxed text-foreground">
      {@render children()}
    </div>
  </div>
</div>
