<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<Dialog.Description class={cn('text-sm text-muted-foreground', className)} {...restProps}>
	{@render children?.()}
</Dialog.Description>
