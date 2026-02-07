<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		placeholder?: string;
		class?: string;
		children?: Snippet;
	}

	let { placeholder, class: className, children }: Props = $props();
</script>

<span class={cn('pointer-events-none', className)}>
	{#if children}
		{@render children()}
	{:else if placeholder}
		<span class="text-muted-foreground">{placeholder}</span>
	{/if}
</span>
