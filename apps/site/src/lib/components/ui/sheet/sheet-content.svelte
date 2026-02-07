<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { X } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';

	interface Props {
		side?: 'left' | 'right' | 'top' | 'bottom';
		class?: string;
		children?: Snippet;
	}

	let { side = 'right', class: className, children, ...restProps }: Props = $props();

	const sideClasses = {
		left: 'inset-y-0 left-0 h-full w-3/4 sm:max-w-md border-r data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
		right: 'inset-y-0 right-0 h-full w-3/4 sm:max-w-md border-l data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
		top: 'inset-x-0 top-0 w-full border-b data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
		bottom: 'inset-x-0 bottom-0 w-full border-t data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom'
	};
</script>

<Dialog.Portal>
	<Dialog.Overlay
		class="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
	/>
	<Dialog.Content
		class={cn(
			'fixed z-50 flex flex-col bg-background shadow-lg duration-200 focus:outline-none',
			sideClasses[side],
			className
		)}
		{...restProps}
	>
		{@render children?.()}
		<Dialog.Close
			class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
		>
			<X class="h-5 w-5" />
			<span class="sr-only">Close</span>
		</Dialog.Close>
	</Dialog.Content>
</Dialog.Portal>
