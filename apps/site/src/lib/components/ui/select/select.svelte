<script lang="ts">
	import { Select } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		onValueChange?: (value: string) => void;
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		disabled?: boolean;
		name?: string;
		required?: boolean;
		children?: Snippet;
	}

	let {
		value = $bindable(),
		onValueChange,
		open = $bindable(false),
		onOpenChange,
		disabled = false,
		name,
		required = false,
		children
	}: Props = $props();
</script>

<Select.Root
	type="single"
	bind:value
	{onValueChange}
	bind:open
	{onOpenChange}
	{disabled}
	{name}
	{required}
>
	{@render children?.()}
</Select.Root>
