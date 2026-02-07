<script lang="ts">
	import { Select } from 'bits-ui';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<Select.Group>
	{@render children?.()}
</Select.Group>
