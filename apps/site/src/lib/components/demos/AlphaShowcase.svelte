<script lang="ts">
	// This component demonstrates alpha colors which need inline styles
	// for dynamic color application. This is a legitimate use of CSS variables.
	const colorPanels = [
		{ name: 'Primary', hue: 'primary' },
		{ name: 'Secondary', hue: 'secondary' },
		{ name: 'Blue', hue: 'blue' },
		{ name: 'Purple', hue: 'purple' }
	];
</script>

<!-- Section 4: Alpha Colors Showcase (Critical) -->
<section class="overflow-hidden bg-gray-50 px-6 py-16">
	<div class="mx-auto max-w-6xl">
		<div class="mb-12 text-center">
			<h2 class="text-2xl font-bold text-gray-950 sm:text-3xl">Alpha Colors in Action</h2>
			<p class="mt-2 text-gray-900">
				Semi-transparent badges that work on any colored background
			</p>
		</div>

		<!-- Alpha Color Grid - uses inline styles for dynamic color demonstration -->
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each colorPanels as panel (panel.name)}
				{@const bgClass = panel.hue === 'primary' ? 'bg-primary-800' :
								   panel.hue === 'secondary' ? 'bg-secondary-800' :
								   panel.hue === 'blue' ? 'bg-blue-800' : 'bg-purple-800'}
				{@const alphaBgClass = panel.hue === 'primary' ? 'bg-primary-200/20' :
									   panel.hue === 'secondary' ? 'bg-secondary-200/20' :
									   panel.hue === 'blue' ? 'bg-blue-200/20' : 'bg-purple-200/20'}
				<div class="relative overflow-hidden rounded-xl p-6 {bgClass}">
					<!-- Decorative circles using alpha -->
					<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full {alphaBgClass}"></div>
					<div class="absolute -bottom-4 -left-4 h-24 w-24 rounded-full {alphaBgClass}"></div>

					<!-- Content -->
					<div class="relative">
						<span class="inline-block rounded-full px-3 py-1 text-sm font-medium text-white {alphaBgClass}">
							{panel.name} Alpha
						</span>

						<p class="mt-4 font-semibold text-white">
							Badges overlay perfectly
						</p>
						<p class="mt-1 text-sm text-white/80">
							Using {panel.hue}-200/25 on {panel.hue}-800
						</p>

						<!-- Multiple alpha badges -->
						<div class="mt-4 flex flex-wrap gap-2">
							{#each ['New', 'Featured', 'Sale'] as label}
								<span class="rounded-md px-2 py-0.5 text-xs font-medium text-white {alphaBgClass}">
									{label}
								</span>
							{/each}
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Technical explanation -->
		<div class="mt-8 rounded-xl border border-gray-500 bg-gray-100 p-6">
			<h3 class="font-semibold text-gray-950">How It Works</h3>
			<p class="mt-2 text-sm text-gray-900">
				Alpha color scales (e.g., <code class="rounded bg-gray-300 px-1.5 py-0.5">bg-orange-200/25</code>)
				are created using Tailwind's built-in opacity modifiers. They blend naturally with any background
				and work great for overlays, badges, and subtle backgrounds. The palette generates OKLCH colors
				that look beautiful at any opacity level.
			</p>
		</div>
	</div>
</section>
