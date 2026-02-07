<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<span
	class={cn(
		'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</span>
