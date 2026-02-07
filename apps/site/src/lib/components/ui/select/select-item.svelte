<script lang="ts">
	import { Select } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		label?: string;
		disabled?: boolean;
		class?: string;
		children?: Snippet;
	}

	let { value, label, disabled = false, class: className, children }: Props = $props();
</script>

<Select.Item
	{value}
	{label}
	{disabled}
	class={cn(
		'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none',
		'focus:bg-accent/50 focus:text-accent-foreground dark:focus:bg-accent',
		'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
		'data-[selected]:bg-accent/50 dark:data-[selected]:bg-accent',
		className
	)}
>
	{#if children}
		{@render children()}
	{:else}
		{label}
	{/if}
</Select.Item>
