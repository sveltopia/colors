<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children?: Snippet;
	}

	let { class: className, children, ...restProps }: Props = $props();
</script>

<Dialog.Trigger class={className} {...restProps}>
	{@render children?.()}
</Dialog.Trigger>
