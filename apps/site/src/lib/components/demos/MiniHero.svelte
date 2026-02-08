<script lang="ts">
	import { ArrowRight, SwatchBook } from 'lucide-svelte';
</script>

<!-- Section 1: Mini Hero -->
<section class="relative overflow-hidden">
	<!-- Gradient Background: Light = primary tint, Dark = slate (neutral) -->
	<div
		class="absolute inset-0 bg-linear-to-br from-primary-200 via-primary-300 to-primary-400 dark:from-slate-50 dark:via-slate-100 dark:to-slate-200"
	></div>

	<!-- Content -->
	<div class="relative px-6 py-16 sm:py-24 lg:py-32">
		<div class="mx-auto max-w-3xl text-center">
			<!-- Badge -->
			<div class="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-600 bg-primary-200/50 px-4 py-1.5 dark:border-primary-700 dark:bg-primary-900/10">
				<SwatchBook class="h-4 w-4 text-primary-850 dark:text-primary-800" />
				<span class="text-sm font-medium text-primary-850 dark:text-primary-800">New color system available</span>
			</div>

			<!-- Headline -->
			<h1 class="text-4xl font-bold tracking-tight text-gray-950 dark:text-slate-950 sm:text-5xl lg:text-6xl">
				Build beautiful interfaces with
				<span class="text-primary-850 dark:text-primary-800">your brand colors</span>
			</h1>

			<!-- Subtext -->
			<p class="mx-auto mt-6 max-w-xl text-lg text-gray-900 dark:text-slate-900">
				Transform any brand color into a complete, accessible color palette. Works seamlessly with
				Tailwind CSS and shadcn.
			</p>

			<!-- CTA Buttons -->
			<div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
				<button
					class="inline-flex items-center gap-2 rounded-lg bg-primary-800 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all hover:bg-primary-850 hover:shadow-xl"
				>
					Get Started
					<ArrowRight class="h-5 w-5" />
				</button>
				<button
					class="inline-flex items-center gap-2 rounded-lg border-2 border-primary-800 bg-white/80 px-6 py-3 text-base font-semibold text-primary-900 backdrop-blur transition-all hover:border-primary-700 hover:bg-white dark:border-primary-700 dark:bg-slate-100/80 dark:text-primary-800 dark:hover:border-primary-600 dark:hover:bg-slate-100"
				>
					View Documentation
				</button>
			</div>
		</div>
	</div>
</section>
