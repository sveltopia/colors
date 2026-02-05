<script lang="ts">
	import {
		Palette,
		Accessibility,
		Moon,
		Layers,
		Code2,
		Sparkles,
		ChevronRight
	} from 'lucide-svelte';

	const features = [
		{
			icon: Palette,
			title: 'Brand Tuned',
			description:
				"Every hue adapts to your brand's warmth, saturation, and brightness preferences.",
			link: 'View palette',
			color: 'orange'
		},
		{
			icon: Accessibility,
			title: 'APCA Accessible',
			description: 'Contrast ratios validated against APCA standards for better readability.',
			link: 'View standards',
			color: 'blue'
		},
		{
			icon: Moon,
			title: 'Dark Mode Ready',
			description: 'Automatic dark mode variants with proper inversion and contrast.',
			link: 'View modes',
			color: 'purple'
		},
		{
			icon: Layers,
			title: 'Alpha Scales',
			description: 'Semi-transparent variants for overlays, borders, and subtle backgrounds.',
			link: 'View scales',
			color: 'green'
		},
		{
			icon: Code2,
			title: 'Framework Ready',
			description: 'Export to Tailwind CSS, vanilla CSS variables, or JSON for any stack.',
			link: 'View exports',
			color: 'cyan'
		},
		{
			icon: Sparkles,
			title: 'P3 Wide Gamut',
			description: 'Vibrant colors on modern displays with automatic sRGB fallbacks.',
			link: 'View gamut',
			color: 'pink'
		}
	];

	function getColorClasses(color: string) {
		const classes: Record<string, { iconBg: string; icon: string; link: string }> = {
			orange: {
				iconBg: 'bg-orange-200 dark:bg-orange-300/20',
				icon: 'text-orange-800',
				link: 'text-orange-800 hover:text-orange-900'
			},
			blue: {
				iconBg: 'bg-blue-200 dark:bg-blue-300/20',
				icon: 'text-blue-800',
				link: 'text-blue-800 hover:text-blue-900'
			},
			purple: {
				iconBg: 'bg-purple-200 dark:bg-purple-300/20',
				icon: 'text-purple-800',
				link: 'text-purple-800 hover:text-purple-900'
			},
			green: {
				iconBg: 'bg-green-200 dark:bg-green-300/20',
				icon: 'text-green-800',
				link: 'text-green-800 hover:text-green-900'
			},
			cyan: {
				iconBg: 'bg-cyan-200 dark:bg-cyan-300/20',
				icon: 'text-cyan-800',
				link: 'text-cyan-800 hover:text-cyan-900'
			},
			pink: {
				iconBg: 'bg-pink-200 dark:bg-pink-300/20',
				icon: 'text-pink-800',
				link: 'text-pink-800 hover:text-pink-900'
			}
		};
		return classes[color] || classes.orange;
	}
</script>

<!-- Section 6: Full Palette Harmony -->
<section class="bg-gray-50 px-6 py-20 dark:bg-gray-100">
	<div class="mx-auto max-w-6xl">
		<div class="mb-16 text-center">
			<h2 class="text-2xl font-bold text-gray-950 sm:text-3xl">Every Color, Perfectly Tuned</h2>
			<p class="mx-auto mt-3 max-w-2xl text-gray-800">
				The complete palette harmonizes with your brand. Use any hue confidently — they're all
				designed to work together.
			</p>
		</div>

		<div class="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
			{#each features as feature (feature.title)}
				{@const colors = getColorClasses(feature.color)}
				<div class="group">
					<!-- Icon -->
					<div class="mb-4 inline-flex rounded-xl p-3 {colors.iconBg}">
						<svelte:component this={feature.icon} class="h-7 w-7 {colors.icon}" />
					</div>

					<!-- Title -->
					<h3 class="mb-2 font-semibold text-gray-950">
						{feature.title}
					</h3>

					<!-- Description -->
					<p class="mb-3 text-sm leading-relaxed text-gray-800">
						{feature.description}
					</p>

					<!-- Link -->
					<a
						href="#features"
						class="inline-flex items-center gap-1 text-sm font-medium transition-colors {colors.link}"
					>
						{feature.link}
						<ChevronRight class="h-4 w-4" />
					</a>
				</div>
			{/each}
		</div>
	</div>
</section>
