<script lang="ts">
	import { Plus, Trash2, Download, Settings, ChevronRight, ExternalLink } from 'lucide-svelte';
</script>

<!-- Section 8: Action Buttons Row -->
<section class="bg-gray-50 px-6 py-16">
	<div class="mx-auto max-w-6xl">
		<div class="mb-12 text-center">
			<h2 class="text-2xl font-bold text-gray-950 sm:text-3xl">Button Variants</h2>
			<p class="mt-2 text-gray-900">Full spectrum of button styles using generated colors</p>
		</div>

		<!-- Button Groups -->
		<div class="space-y-8">
			<!-- Primary Variants -->
			<div class="rounded-xl border border-gray-500 bg-gray-100 p-6">
				<h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
					Primary Actions
				</h3>
				<div class="flex flex-wrap gap-4">
					<button
						class="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-primary-850 hover:shadow-md"
					>
						<Plus class="h-4 w-4" />
						Create New
					</button>
					<button
						class="inline-flex items-center gap-2 rounded-lg bg-secondary-800 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-secondary-850 hover:shadow-md"
					>
						<Download class="h-4 w-4" />
						Download
					</button>
					<button
						class="inline-flex items-center gap-2 rounded-lg bg-green-800 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-green-850 hover:shadow-md"
					>
						Confirm
						<ChevronRight class="h-4 w-4" />
					</button>
				</div>
			</div>

			<!-- Secondary & Outline -->
			<div class="rounded-xl border border-gray-500 bg-gray-100 p-6">
				<h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
					Secondary & Outline
				</h3>
				<div class="flex flex-wrap gap-4">
					<button
						class="inline-flex items-center gap-2 rounded-lg bg-gray-300 px-4 py-2.5 font-medium text-gray-950 transition-colors hover:bg-gray-400"
					>
						<Settings class="h-4 w-4" />
						Settings
					</button>
					<button
						class="inline-flex items-center gap-2 rounded-lg border-2 border-primary-600 px-4 py-2.5 font-medium text-primary-900 transition-colors hover:bg-primary-200/50"
					>
						Outline Primary
					</button>
					<button
						class="inline-flex items-center gap-2 rounded-lg border-2 border-gray-600 px-4 py-2.5 font-medium text-gray-950 transition-colors hover:bg-gray-200"
					>
						Outline Secondary
					</button>
				</div>
			</div>

			<!-- Destructive & Ghost -->
			<div class="rounded-xl border border-gray-500 bg-gray-100 p-6">
				<h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
					Destructive & Ghost
				</h3>
				<div class="flex flex-wrap gap-4">
					<button
						class="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-red-850"
					>
						<Trash2 class="h-4 w-4" />
						Delete
					</button>
					<button
						class="inline-flex items-center gap-2 rounded-lg border-2 border-red-600 px-4 py-2.5 font-medium text-red-900 transition-colors hover:bg-red-200/50"
					>
						<Trash2 class="h-4 w-4" />
						Delete Outline
					</button>
					<button
						class="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-gray-900 transition-colors hover:bg-gray-300 hover:text-gray-950"
					>
						Ghost Button
					</button>
				</div>
			</div>

			<!-- Link & Sizes -->
			<div class="rounded-xl border border-gray-500 bg-gray-100 p-6">
				<h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
					Link Style & Sizes
				</h3>
				<div class="flex flex-wrap items-center gap-4">
					<button
						class="inline-flex items-center gap-1 font-medium text-primary-900 underline-offset-4 hover:underline"
					>
						Link Button
						<ExternalLink class="h-4 w-4" />
					</button>
					<span class="text-gray-500">|</span>
					<button
						class="rounded-md bg-primary-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-850"
					>
						Small
					</button>
					<button
						class="rounded-lg bg-primary-800 px-4 py-2.5 font-medium text-white hover:bg-primary-850"
					>
						Default
					</button>
					<button
						class="rounded-lg bg-primary-800 px-6 py-3 text-lg font-medium text-white hover:bg-primary-850"
					>
						Large
					</button>
				</div>
			</div>

			<!-- Disabled States -->
			<div class="rounded-xl border border-gray-500 bg-gray-100 p-6">
				<h3 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-900">
					Disabled States
				</h3>
				<div class="flex flex-wrap gap-4">
					<button
						disabled
						class="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-primary-800 px-4 py-2.5 font-medium text-white opacity-50"
					>
						Disabled Primary
					</button>
					<button
						disabled
						class="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border-2 border-gray-600 px-4 py-2.5 font-medium text-gray-950 opacity-50"
					>
						Disabled Outline
					</button>
					<button
						disabled
						class="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-gray-300 px-4 py-2.5 font-medium text-gray-950 opacity-50"
					>
						Disabled Secondary
					</button>
				</div>
			</div>
		</div>
	</div>
</section>
