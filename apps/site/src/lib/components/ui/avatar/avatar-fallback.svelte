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
		'flex h-full w-full items-center justify-center rounded-full bg-muted',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</span>
