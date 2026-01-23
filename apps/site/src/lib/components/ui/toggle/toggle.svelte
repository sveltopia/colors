<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import type { ToggleVariant, ToggleSize } from './index';

	interface Props extends HTMLButtonAttributes {
		pressed?: boolean;
		variant?: ToggleVariant;
		size?: ToggleSize;
		class?: string;
		children?: Snippet;
	}

	let {
		pressed = $bindable(false),
		variant = 'default',
		size = 'default',
		class: className,
		children,
		...restProps
	}: Props = $props();

	const baseStyles =
		'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground';

	const variantStyles: Record<ToggleVariant, string> = {
		default: 'bg-transparent',
		outline: 'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground'
	};

	const sizeStyles: Record<ToggleSize, string> = {
		default: 'h-9 px-3',
		sm: 'h-8 px-2',
		lg: 'h-10 px-3'
	};

	function handleClick() {
		pressed = !pressed;
	}
</script>

<button
	type="button"
	aria-pressed={pressed}
	data-state={pressed ? 'on' : 'off'}
	onclick={handleClick}
	class={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</button>
