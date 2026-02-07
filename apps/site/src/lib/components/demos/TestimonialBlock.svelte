<script lang="ts">
	import { Quote } from 'lucide-svelte';
</script>

<!-- Section 7: Testimonial Block (Forced Dark Mode) -->
<section class="dark relative overflow-hidden bg-gray-50 px-6 py-16">
	<!-- Subtle glow effect using primary color (radial gradient for feathered edge) -->
	<div
		class="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
		style="background: radial-gradient(circle, var(--color-primary-800), transparent);"
	></div>

	<div class="relative mx-auto max-w-4xl">
		<div class="text-center">
			<!-- Quote icon (pulled up into burst area) -->
			<div class="-mt-4 mb-8 inline-flex rounded-full bg-primary-800/10 p-4">
				<Quote class="h-8 w-8 text-primary-800" />
			</div>

			<!-- Testimonial quote -->
			<blockquote class="text-2xl font-medium leading-relaxed text-gray-950 sm:text-3xl">
				"Sveltopia Colors transformed our design workflow. We went from spending hours on color
				decisions to having a complete, accessible palette generated in seconds from just our
				brand orange."
			</blockquote>

			<!-- Author -->
			<div class="mt-8 flex items-center justify-center gap-4">
				<!-- Avatar: primary to primary-adjacent gradient -->
				<div
					class="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
					style="background: linear-gradient(to bottom right, var(--color-primary-800), var(--color-primary-adjacent-800));"
				>
					JD
				</div>

				<div class="text-left">
					<div class="font-semibold text-gray-950">Jane D. Zein</div>
					<div class="text-sm text-gray-900">Design Lead at TechCorp</div>
				</div>
			</div>

			<!-- Company logos (simulated) -->
			<div class="mt-12 border-t border-gray-500 pt-8">
				<p class="mb-4 text-sm text-gray-900">Trusted by teams at</p>
				<div class="flex flex-wrap items-center justify-center gap-8">
					{#each ['Acme Inc', 'TechCorp', 'Designly', 'BuildFast'] as company}
						<span class="text-lg font-semibold text-secondary-800">{company}</span>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Technical note -->
	<div
		class="relative mx-auto mt-12 max-w-2xl rounded-xl border border-gray-500 bg-gray-100 p-4"
	>
		<p class="text-center text-sm text-gray-900">
			This section uses the <code class="rounded bg-gray-300 px-1.5 py-0.5">dark</code> class
			to force dark mode styling, regardless of the page's current theme. The colors automatically
			switch to their dark mode variants.
		</p>
	</div>
</section>
