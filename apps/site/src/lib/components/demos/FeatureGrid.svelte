<script lang="ts">
	import {
		Palette,
		Accessibility,
		Moon,
		Layers,
		Code2,
		Sparkles
	} from 'lucide-svelte';

	const features = [
		{
			icon: Palette,
			title: 'Brand Tuned',
			description: 'Every hue adapts to your brand\'s warmth, saturation, and brightness preferences.',
			color: 'orange'
		},
		{
			icon: Accessibility,
			title: 'APCA Accessible',
			description: 'Contrast ratios validated against APCA standards for better readability.',
			color: 'blue'
		},
		{
			icon: Moon,
			title: 'Dark Mode Ready',
			description: 'Automatic dark mode variants with proper inversion and contrast.',
			color: 'purple'
		},
		{
			icon: Layers,
			title: 'Alpha Scales',
			description: 'Semi-transparent variants for overlays, borders, and subtle backgrounds.',
			color: 'green'
		},
		{
			icon: Code2,
			title: 'Framework Agnostic',
			description: 'Export to Tailwind CSS, vanilla CSS variables, or JSON for any framework.',
			color: 'cyan'
		},
		{
			icon: Sparkles,
			title: 'P3 Wide Gamut',
			description: 'Vibrant colors on modern displays with automatic sRGB fallbacks.',
			color: 'pink'
		}
	];

	function getColorClasses(color: string) {
		const classes: Record<string, { bg: string; border: string; icon: string; title: string }> = {
			orange: { bg: 'bg-orange-200/50', border: 'border-orange-500', icon: 'text-orange-800', title: 'text-orange-900' },
			blue: { bg: 'bg-blue-200/50', border: 'border-blue-500', icon: 'text-blue-800', title: 'text-blue-900' },
			purple: { bg: 'bg-purple-200/50', border: 'border-purple-500', icon: 'text-purple-800', title: 'text-purple-900' },
			green: { bg: 'bg-green-200/50', border: 'border-green-500', icon: 'text-green-800', title: 'text-green-900' },
			cyan: { bg: 'bg-cyan-200/50', border: 'border-cyan-500', icon: 'text-cyan-800', title: 'text-cyan-900' },
			pink: { bg: 'bg-pink-200/50', border: 'border-pink-500', icon: 'text-pink-800', title: 'text-pink-900' }
		};
		return classes[color] || classes.orange;
	}
</script>

<!-- Section 6: Multi-Color Feature Section -->
<section class="bg-gray-100 px-6 py-16">
	<div class="mx-auto max-w-6xl">
		<div class="mb-12 text-center">
			<h2 class="text-2xl font-bold text-gray-950 sm:text-3xl">Full Palette Diversity</h2>
			<p class="mt-2 text-gray-900">Each feature uses a different hue from the generated palette</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature (feature.title)}
				{@const colors = getColorClasses(feature.color)}
				<div
					class="rounded-xl border p-6 transition-all hover:shadow-lg {colors.bg} {colors.border}"
				>
					<div class="mb-4 inline-flex rounded-lg p-2.5 {colors.bg}">
						<svelte:component
							this={feature.icon}
							class="h-6 w-6 {colors.icon}"
						/>
					</div>

					<h3 class="mb-2 font-semibold {colors.title}">
						{feature.title}
					</h3>

					<p class="text-sm text-gray-900">
						{feature.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>
