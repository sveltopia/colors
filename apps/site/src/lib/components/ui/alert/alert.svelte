<script lang="ts">
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { AlertVariant } from './index';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: AlertVariant;
		class?: string;
		children?: Snippet;
	}

	let { variant = 'default', class: className, children, ...restProps }: Props = $props();

	const baseStyles =
		'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7';

	const variantStyles: Record<AlertVariant, string> = {
		default: 'bg-background text-foreground',
		destructive:
			'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive'
	};
</script>

<div
	role="alert"
	class={cn(baseStyles, variantStyles[variant], className)}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</div>
