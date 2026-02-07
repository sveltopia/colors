<script lang="ts">
	import { Select } from 'bits-ui';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		position?: 'item-aligned' | 'popper';
		side?: 'top' | 'right' | 'bottom' | 'left';
		sideOffset?: number;
		align?: 'start' | 'center' | 'end';
		children?: Snippet;
	}

	let {
		class: className,
		position = 'popper',
		side = 'bottom',
		sideOffset = 4,
		align = 'start',
		children
	}: Props = $props();
</script>

<Select.Portal>
	<Select.Content
		{side}
		{sideOffset}
		{align}
		class={cn(
			'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
			'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
			'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
			position === 'popper' &&
				'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
			className
		)}
	>
		<Select.Viewport
			class={cn('p-1', position === 'popper' && 'h-[var(--bits-select-trigger-height)] w-full min-w-[var(--bits-select-trigger-width)]')}
		>
			{@render children?.()}
		</Select.Viewport>
	</Select.Content>
</Select.Portal>
