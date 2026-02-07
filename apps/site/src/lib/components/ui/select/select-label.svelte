<script lang="ts">
	import { Select } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children }: Props = $props();
</script>

<Select.GroupHeading class={cn('px-2 py-1.5 text-sm font-semibold', className)}>
	{@render children?.()}
</Select.GroupHeading>
