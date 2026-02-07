<script lang="ts">
	import { cn } from '$lib/utils';
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		class?: string;
		children?: Snippet;
	}

	let { value = $bindable(''), class: className, children, ...restProps }: Props = $props();

	// Create a reactive context for the active tab
	setContext('tabs', {
		get value() {
			return value;
		},
		set value(v: string) {
			value = v;
		}
	});
</script>

<div class={cn('', className)} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</div>
