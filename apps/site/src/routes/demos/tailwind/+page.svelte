<script lang="ts">
	import MiniHero from '$lib/components/demos/MiniHero.svelte';
	import WebAppComponents from '$lib/components/demos/WebAppComponents.svelte';
	import ProductCards from '$lib/components/demos/ProductCards.svelte';
	import AlphaShowcase from '$lib/components/demos/AlphaShowcase.svelte';
	import GradientSection from '$lib/components/demos/GradientSection.svelte';
	import FeatureGrid from '$lib/components/demos/FeatureGrid.svelte';
	import TestimonialBlock from '$lib/components/demos/TestimonialBlock.svelte';
	import ActionButtons from '$lib/components/demos/ActionButtons.svelte';
</script>

<svelte:head>
	<title>Tailwind CSS Demo | Sveltopia Colors</title>
	<meta
		name="description"
		content="See Sveltopia Colors in action with pure Tailwind CSS. Switch brand presets to watch the entire UI transform."
	/>
</svelte:head>

<div class="min-h-screen">
	<!-- Section 1: Mini Hero -->
	<MiniHero />

	<!-- Section 2: Web-App Components -->
	<WebAppComponents />

	<!-- Section 3: Product Cards Grid -->
	<ProductCards />

	<!-- Section 4: Alpha Colors Showcase -->
	<AlphaShowcase />

	<!-- Section 5: Two-Color Gradient Section -->
	<GradientSection />

	<!-- Section 6: Multi-Color Feature Section -->
	<FeatureGrid />

	<!-- Section 7: Testimonial Block (Dark Mode) -->
	<TestimonialBlock />

	<!-- Section 8: Action Buttons Row -->
	<ActionButtons />
</div>
