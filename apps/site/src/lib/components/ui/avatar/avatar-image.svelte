<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLImgAttributes } from 'svelte/elements';

	interface Props extends HTMLImgAttributes {
		class?: string;
	}

	let { class: className, ...restProps }: Props = $props();
</script>

<img class={cn('aspect-square h-full w-full', className)} {...restProps} />
