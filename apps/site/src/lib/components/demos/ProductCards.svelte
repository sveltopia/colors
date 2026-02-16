<script lang="ts">
	import { ShoppingCart, Star, Heart } from 'lucide-svelte';

	const products = [
		{
			id: 1,
			name: 'Premium Headphones',
			price: 299,
			rating: 4.8,
			reviews: 124,
			image: 'headphones'
		},
		{
			id: 2,
			name: 'Wireless Keyboard',
			price: 149,
			rating: 4.6,
			reviews: 89,
			image: 'keyboard'
		},
		{
			id: 3,
			name: 'Smart Watch Pro',
			price: 399,
			rating: 4.9,
			reviews: 256,
			image: 'watch'
		},
		{
			id: 4,
			name: 'Portable Speaker',
			price: 79,
			rating: 4.5,
			reviews: 67,
			image: 'speaker'
		}
	];

	let favorites = $state<number[]>([1]);

	function toggleFavorite(id: number) {
		if (favorites.includes(id)) {
			favorites = favorites.filter((f) => f !== id);
		} else {
			favorites = [...favorites, id];
		}
	}
</script>

<!-- Section 3: Product Cards Grid -->
<section class="overflow-hidden bg-gray-100 px-6 py-16">
	<div class="mx-auto max-w-6xl">
		<div class="mb-12 text-center">
			<h2 class="text-2xl font-bold text-gray-950 sm:text-3xl">Featured Products</h2>
			<p class="mt-2 text-gray-900">E-commerce card components with hover states</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{#each products as product (product.id)}
				<div
					class="group overflow-hidden rounded-xl border border-gray-500 bg-gray-50 shadow-sm transition-all hover:border-primary-600 hover:shadow-lg"
				>
					<!-- Image Placeholder -->
					<div class="relative aspect-square bg-linear-to-br from-primary-100 to-primary-200">
						<div
							class="absolute inset-0 flex items-center justify-center text-9xl text-gray-700"
						>
							{#if product.image === 'headphones'}
								🎧
							{:else if product.image === 'keyboard'}
								⌨️
							{:else if product.image === 'watch'}
								⌚
							{:else}
								🔊
							{/if}
						</div>

						<!-- Favorite Button -->
						<button
							onclick={() => toggleFavorite(product.id)}
							class="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm transition-all hover:bg-white hover:shadow-md"
							aria-label="Toggle favorite"
						>
							<Heart
								class="h-5 w-5 transition-colors {favorites.includes(product.id)
									? 'fill-primary-800 text-primary-800'
									: 'text-gray-800'}"
							/>
						</button>

						<!-- New Badge -->
						{#if product.id === 3}
							<span
								class="absolute left-3 top-3 rounded-full bg-secondary-800 px-2.5 py-1 text-xs font-semibold text-white"
							>
								New
							</span>
						{/if}
					</div>

					<!-- Content -->
					<div class="p-4">
						<h3 class="font-semibold text-gray-950 group-hover:text-primary-900">
							{product.name}
						</h3>

						<!-- Rating -->
						<div class="mt-1 flex items-center gap-1.5">
							<div class="flex">
								{#each Array(5) as _, i}
									<Star
										class="h-4 w-4 {i < Math.floor(product.rating)
											? 'fill-amber-800 text-amber-800'
											: 'text-gray-500'}"
									/>
								{/each}
							</div>
							<span class="text-sm text-gray-900">({product.reviews})</span>
						</div>

						<!-- Price + Add to Cart -->
						<div class="mt-4 flex items-center justify-between">
							<span class="text-lg font-bold text-gray-950">${product.price}</span>
							<button
								class="flex items-center gap-1.5 rounded-lg bg-primary-800 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-850"
							>
								<ShoppingCart class="h-4 w-4" />
								Add
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
