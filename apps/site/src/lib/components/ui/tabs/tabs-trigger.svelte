<script lang="ts">
	import { cn } from '$lib/utils';
	import { getContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		value: string;
		class?: string;
		children?: Snippet;
	}

	let { value, class: className, children, ...restProps }: Props = $props();

	const tabs = getContext<{ value: string }>('tabs');
	const isActive = $derived(tabs?.value === value);

	function handleClick() {
		if (tabs) {
			// Update the context value
			(tabs as { value: string }).value = value;
		}
	}
</script>

<button
	type="button"
	role="tab"
	aria-selected={isActive}
	onclick={handleClick}
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
		isActive
			? 'bg-background text-foreground shadow'
			: 'text-muted-foreground hover:text-foreground',
		className
	)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</button>
