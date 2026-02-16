<script lang="ts">
	import { Zap, Globe, Shield, Rocket } from 'lucide-svelte';

	const stats = [
		{ value: '99.9%', label: 'Uptime SLA', icon: Shield },
		{ value: '50ms', label: 'Avg Response', icon: Zap },
		{ value: '190+', label: 'Countries', icon: Globe },
		{ value: '10M+', label: 'API Calls/Day', icon: Rocket }
	];
</script>

<!-- Section 5: Near-Hue Gradient Section -->
<section class="relative overflow-hidden">
	<!-- Light mode gradient: -900 (step 11, rich text colors) -->
	<div
		class="absolute inset-0 dark:hidden"
		style="background: linear-gradient(to right, var(--color-secondary-900), var(--color-adjacent-900));"
	></div>
	<!-- Dark mode gradient: -500 (step 6, subtle borders - darker in dark mode) -->
	<div
		class="absolute inset-0 hidden dark:block"
		style="background: linear-gradient(to right, var(--color-secondary-500), var(--color-adjacent-500));"
	></div>

	<!-- Decorative elements -->
	<div class="absolute inset-0 opacity-10">
		<div
			class="absolute left-1/4 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-white blur-3xl"
		></div>
		<div
			class="absolute bottom-0 right-1/4 h-64 w-64 translate-y-1/2 rounded-full bg-white blur-3xl"
		></div>
	</div>

	<!-- Content -->
	<div class="relative px-6 py-16 sm:py-24">
		<div class="mx-auto max-w-6xl">
			<div class="text-center">
				<h2 class="text-3xl font-bold text-white sm:text-4xl">
					Near-Hue Gradient Harmony
				</h2>
				<p class="mx-auto mt-4 max-w-2xl text-lg text-white/80">
					Adjacent Radix hues blend seamlessly, creating natural gradients that maintain
					accessibility and visual coherence across your entire palette.
				</p>
			</div>

			<!-- Stats Grid -->
			<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each stats as stat (stat.label)}
					<div class="rounded-xl bg-white/10 p-6 backdrop-blur-sm">
						<div class="flex items-center gap-3">
							<div class="rounded-lg bg-white/20 p-2">
								<stat.icon class="h-5 w-5 text-white" />
							</div>
							<div>
								<div class="text-2xl font-bold text-white">{stat.value}</div>
								<div class="text-sm text-white/70">{stat.label}</div>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Gradient demonstration -->
			<div class="mt-12 rounded-xl bg-white/10 p-6 backdrop-blur-sm">
				<h3 class="font-semibold text-white">Gradient Recipe</h3>
				<p class="mt-2 text-sm text-white/80">
					This section blends
					<code class="rounded bg-white/20 px-1.5 py-0.5">secondary</code>
					to
					<code class="rounded bg-white/20 px-1.5 py-0.5">adjacent</code>
					&mdash; using step 9 in dark mode (solid backgrounds) and step 11 in light mode (text colors) for consistent saturation.
				</p>
			</div>
		</div>
	</div>
</section>
