<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		class?: string;
		children?: Snippet;
	}

	let { value, class: className, children, ...restProps }: Props = $props();

	const tabs = getContext<{ value: string }>('tabs');
	const isActive = $derived(tabs?.value === value);
</script>

{#if isActive}
	<div
		role="tabpanel"
		class={cn(
			'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			className
		)}
		{...restProps}
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
{/if}
