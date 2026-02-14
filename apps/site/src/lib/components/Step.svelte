<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		number: number;
		title: string;
		children: Snippet;
	}

	let { number, title, children }: Props = $props();
</script>

<section class="step">
	<h3>{number}. {title}</h3>
	<div class="mt-3 space-y-4">
		{@render children()}
	</div>
</section>

<style>
	.step {
		margin-top: 2rem;
	}

	h3 {
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.75;
		letter-spacing: -0.01em;
	}
</style>
