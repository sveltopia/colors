<script lang="ts">
	import { ArrowRight, SwatchBook, ShoppingCart, Star, Heart, Check, Info, AlertCircle, CheckCircle, XCircle, Quote, ChevronRight, Zap, Globe, Shield, Rocket, Palette, Accessibility, Moon, Layers, CodeXml, Sparkles, Bell, User, Settings, Github, Twitter, Linkedin } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Alert from '$lib/components/ui/alert';
	import * as Tabs from '$lib/components/ui/tabs';
	import * as Avatar from '$lib/components/ui/avatar';

	// Form state
	let emailValue = $state('');
	let passwordValue = $state('');
	let rememberMe = $state(true);
	let notificationsEnabled = $state(true);
	let marketingEnabled = $state(false);
	let activeTab = $state('account');
	let favorites = $state<number[]>([1]);

	// Products data
	const products = [
		{ id: 1, name: 'Premium Headphones', price: 299, rating: 4.8, reviews: 124, image: 'headphones' },
		{ id: 2, name: 'Wireless Keyboard', price: 149, rating: 4.6, reviews: 89, image: 'keyboard' },
		{ id: 3, name: 'Smart Watch Pro', price: 399, rating: 4.9, reviews: 256, image: 'watch' },
		{ id: 4, name: 'Portable Speaker', price: 79, rating: 4.5, reviews: 67, image: 'speaker' }
	];

	// Features data
	const features = [
		{ icon: Palette, title: 'Brand Tuned', description: "Every hue adapts to your brand's warmth, saturation, and brightness preferences.", link: 'View palette', color: 'orange' },
		{ icon: Accessibility, title: 'APCA Accessible', description: 'Contrast ratios validated against APCA standards for better readability.', link: 'View standards', color: 'blue' },
		{ icon: Moon, title: 'Dark Mode Ready', description: 'Automatic dark mode variants with proper inversion and contrast.', link: 'View modes', color: 'purple' },
		{ icon: Layers, title: 'Alpha Scales', description: 'Semi-transparent variants for overlays, borders, and subtle backgrounds.', link: 'View scales', color: 'green' },
		{ icon: CodeXml, title: 'Framework Ready', description: 'Export to Tailwind CSS, vanilla CSS variables, or JSON for any stack.', link: 'View exports', color: 'cyan' },
		{ icon: Sparkles, title: 'P3 Wide Gamut', description: 'Vibrant colors on modern displays with automatic sRGB fallbacks.', link: 'View gamut', color: 'pink' }
	];

	// Stats data
	const stats = [
		{ value: '99.9%', label: 'Uptime SLA', icon: Shield },
		{ value: '50ms', label: 'Avg Response', icon: Zap },
		{ value: '190+', label: 'Countries', icon: Globe },
		{ value: '10M+', label: 'API Calls/Day', icon: Rocket }
	];

	// Alpha color panels
	const colorPanels = [
		{ name: 'Primary', hue: 'primary' },
		{ name: 'Secondary', hue: 'secondary' },
		{ name: 'Blue', hue: 'blue' },
		{ name: 'Purple', hue: 'purple' }
	];

	// Footer links
	const footerLinks = {
		Product: ['Features', 'Pricing', 'Changelog', 'Documentation'],
		Company: ['About', 'Blog', 'Careers', 'Press'],
		Resources: ['Community', 'Support', 'API Reference', 'Status'],
		Legal: ['Privacy', 'Terms', 'Cookies', 'Licenses']
	};

	const socialLinks = [
		{ icon: Github, label: 'GitHub' },
		{ icon: Twitter, label: 'Twitter' },
		{ icon: Linkedin, label: 'LinkedIn' }
	];

	function toggleFavorite(id: number) {
		if (favorites.includes(id)) {
			favorites = favorites.filter((f) => f !== id);
		} else {
			favorites = [...favorites, id];
		}
	}

	function getColorVars(color: string) {
		return {
			iconBg: `var(--color-${color}-200)`,
			iconBgDark: `var(--color-${color}-300)`,
			icon: `var(--color-${color}-800)`,
			link: `var(--color-${color}-800)`,
			linkHover: `var(--color-${color}-900)`
		};
	}
</script>

<svelte:head>
	<title>shadcn-svelte Demo | Sveltopia Colors</title>
	<meta
		name="description"
		content="See Sveltopia Colors with shadcn-svelte components. Switch brand presets to watch the UI transform."
	/>
</svelte:head>

<div class="min-h-screen">
	<!-- Section 1: Mini Hero -->
	<section class="relative overflow-hidden">
		<!-- Gradient Background -->
		<div class="absolute inset-0 bg-linear-to-br from-primary-200 via-primary-300 to-primary-400 dark:from-slate-50 dark:via-slate-100 dark:to-slate-200"></div>

		<div class="relative px-6 py-16 sm:py-24 lg:py-32">
			<div class="mx-auto max-w-3xl text-center">
				<!-- Badge -->
				<Badge class="mb-6 gap-2 border-primary-600 bg-primary-200/50 text-primary-850 dark:border-primary-700 dark:bg-primary-900/10 dark:text-primary-800">
					<SwatchBook class="h-4 w-4" />
					New color system available
				</Badge>

				<h1 class="text-4xl font-bold tracking-tight text-gray-950 dark:text-slate-950 sm:text-5xl lg:text-6xl">
					Build beautiful interfaces with
					<span class="text-primary-850 dark:text-primary-800">your brand colors</span>
				</h1>

				<p class="mx-auto mt-6 max-w-xl text-lg text-gray-900 dark:text-slate-900">
					Transform any brand color into a complete, accessible color palette. Works seamlessly with
					Tailwind CSS and shadcn-svelte.
				</p>

				<div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button class="gap-2 bg-primary-800 text-white shadow-lg hover:bg-primary-850 hover:shadow-xl">
						Get Started
						<ArrowRight class="h-5 w-5" />
					</Button>
					<Button variant="outline" class="border-2 border-primary-800 bg-white/80 text-primary-900 backdrop-blur hover:border-primary-700 hover:bg-white dark:border-primary-700 dark:bg-slate-100/80 dark:text-primary-800 dark:hover:border-primary-600 dark:hover:bg-slate-100">
						View Documentation
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 2: Web-App Components -->
	<section class="overflow-hidden bg-gray-50 px-6 py-16">
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold text-gray-950 sm:text-3xl">Web App Components</h2>
			</div>

			<div class="grid gap-8 lg:grid-cols-2">
				<!-- Login Card -->
				<Card.Root class="min-w-0 border-gray-500 bg-gray-100">
					<Card.Header>
						<Card.Title>Sign In</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div>
							<label for="email" class="mb-1.5 block text-sm font-medium text-gray-900">Email</label>
							<Input id="email" type="email" bind:value={emailValue} placeholder="you@example.com" class="border-gray-600 bg-gray-50 text-gray-950 placeholder:text-gray-800 focus:border-primary-700 focus:ring-primary-400/50" />
						</div>
						<div>
							<label for="password" class="mb-1.5 block text-sm font-medium text-gray-900">Password</label>
							<Input id="password" type="password" bind:value={passwordValue} placeholder="Enter your password" class="border-gray-600 bg-gray-50 text-gray-950 placeholder:text-gray-800 focus:border-primary-700 focus:ring-primary-400/50" />
						</div>

						<!-- Remember me checkbox -->
						<div class="flex items-center gap-2">
							<button
								type="button"
								onclick={() => (rememberMe = !rememberMe)}
								class="flex h-5 w-5 items-center justify-center rounded border transition-colors {rememberMe
									? 'border-primary-800 bg-primary-800'
									: 'border-gray-600 bg-gray-50'}"
							>
								{#if rememberMe}
									<Check class="h-3.5 w-3.5 text-white" />
								{/if}
							</button>
							<span class="text-sm text-gray-900 select-none">Remember me</span>
						</div>

						<Button class="w-full bg-primary-800 hover:bg-primary-850">Sign In</Button>
					</Card.Content>

					<!-- Toggle Switches -->
					<Card.Footer class="flex-col gap-3 border-t border-gray-500 pt-6">
						<div class="flex w-full items-center justify-between">
							<span class="text-sm text-gray-900">Enable notifications</span>
							<button
								type="button"
								aria-label="Toggle notifications"
								onclick={() => (notificationsEnabled = !notificationsEnabled)}
								class="relative h-6 w-11 rounded-full transition-colors {notificationsEnabled
									? 'bg-secondary-800'
									: 'bg-gray-500'}"
							>
								<span
									class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform {notificationsEnabled
										? 'translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>
						<div class="flex w-full items-center justify-between">
							<span class="text-sm text-gray-900">Marketing emails</span>
							<button
								type="button"
								aria-label="Toggle marketing emails"
								onclick={() => (marketingEnabled = !marketingEnabled)}
								class="relative h-6 w-11 rounded-full transition-colors {marketingEnabled
									? 'bg-secondary-800'
									: 'bg-gray-500'}"
							>
								<span
									class="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform {marketingEnabled
										? 'translate-x-5'
										: 'translate-x-0'}"
								></span>
							</button>
						</div>
					</Card.Footer>
				</Card.Root>

				<!-- Tabs + Alerts -->
				<div class="min-w-0 space-y-6">
					<Card.Root class="border-gray-500 bg-gray-100">
						<Card.Content class="pt-6">
							<Tabs.Root bind:value={activeTab}>
								<Tabs.List class="flex w-full bg-gray-200">
									<Tabs.Trigger value="account" class="min-w-0 flex-1 gap-2 whitespace-normal px-2 text-gray-900 aria-selected:bg-gray-50 aria-selected:text-primary-900 sm:px-3">
										<User class="h-4 w-4 shrink-0" />
										<span class="truncate">Account</span>
									</Tabs.Trigger>
									<Tabs.Trigger value="notifications" class="min-w-0 flex-1 gap-2 whitespace-normal px-2 text-gray-900 aria-selected:bg-gray-50 aria-selected:text-primary-900 sm:px-3">
										<Bell class="h-4 w-4 shrink-0" />
										<span class="truncate">Notifications</span>
									</Tabs.Trigger>
									<Tabs.Trigger value="settings" class="min-w-0 flex-1 gap-2 whitespace-normal px-2 text-gray-900 aria-selected:bg-gray-50 aria-selected:text-primary-900 sm:px-3">
										<Settings class="h-4 w-4 shrink-0" />
										<span class="truncate">Settings</span>
									</Tabs.Trigger>
								</Tabs.List>
								<Tabs.Content value="account" class="rounded-lg bg-gray-50 p-4">
									<p class="text-sm text-gray-900">Manage your account settings and preferences.</p>
								</Tabs.Content>
								<Tabs.Content value="notifications" class="rounded-lg bg-gray-50 p-4">
									<p class="text-sm text-gray-900">Configure how you receive notifications.</p>
								</Tabs.Content>
								<Tabs.Content value="settings" class="rounded-lg bg-gray-50 p-4">
									<p class="text-sm text-gray-900">Advanced settings and configuration options.</p>
								</Tabs.Content>
							</Tabs.Root>
						</Card.Content>
					</Card.Root>

					<!-- Alerts -->
					<div class="space-y-3">
						<Alert.Root class="border-blue-500 bg-blue-200/50">
							<Info class="h-5 w-5 text-blue-900" />
							<Alert.Title class="text-blue-950">Information</Alert.Title>
							<Alert.Description class="text-blue-900">Your session will expire in 15 minutes.</Alert.Description>
						</Alert.Root>

						<Alert.Root class="border-green-500 bg-green-200/50">
							<CheckCircle class="h-5 w-5 text-green-900" />
							<Alert.Title class="text-green-950">Success</Alert.Title>
							<Alert.Description class="text-green-900">Your changes have been saved.</Alert.Description>
						</Alert.Root>

						<Alert.Root class="border-amber-500 bg-amber-200/50">
							<AlertCircle class="h-5 w-5 text-amber-900" />
							<Alert.Title class="text-amber-950">Warning</Alert.Title>
							<Alert.Description class="text-amber-900">Please review before continuing.</Alert.Description>
						</Alert.Root>

						<Alert.Root class="border-red-500 bg-red-200/50">
							<XCircle class="h-5 w-5 text-red-900" />
							<Alert.Title class="text-red-950">Error</Alert.Title>
							<Alert.Description class="text-red-900">Something went wrong. Please try again.</Alert.Description>
						</Alert.Root>
					</div>
				</div>
			</div>

			<!-- Data Table -->
			<Card.Root class="mt-8 border-gray-500 bg-gray-100">
				<Card.Header>
					<Card.Title>Team Members</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="overflow-x-auto">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b border-gray-500">
									<th class="min-w-35 pb-3 pl-3 pr-4 text-left font-medium text-gray-900">Name</th>
									<th class="pb-3 pr-4 text-left font-medium text-gray-900">Role</th>
									<th class="pb-3 pr-4 text-left font-medium text-gray-900">Status</th>
									<th class="pb-3 pr-3 text-right font-medium text-gray-900">Actions</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-400">
								<tr class="hover:bg-gray-200/50">
									<td class="min-w-35 py-3 pl-3 pr-4">
										<div class="flex items-center gap-3">
											<div class="h-8 w-8 shrink-0 rounded-full bg-primary-300 flex items-center justify-center text-primary-900 font-medium text-xs">JD</div>
											<span class="text-gray-950">Jane DePloi</span>
										</div>
									</td>
									<td class="py-3 pr-4 text-gray-900">DevOps</td>
									<td class="py-3 pr-4">
										<Badge class="bg-green-200/50 text-green-900">Active</Badge>
									</td>
									<td class="py-3 pr-3 text-right">
										<button class="text-primary-800 hover:text-primary-900 font-medium">Edit</button>
									</td>
								</tr>
								<tr class="hover:bg-gray-200/50">
									<td class="min-w-35 py-3 pl-3 pr-4">
										<div class="flex items-center gap-3">
											<div class="h-8 w-8 shrink-0 rounded-full bg-secondary-300 flex items-center justify-center text-secondary-900 font-medium text-xs">AS</div>
											<span class="text-gray-950">Alex Ternary</span>
										</div>
									</td>
									<td class="py-3 pr-4 text-gray-900">Developer</td>
									<td class="py-3 pr-4">
										<Badge class="bg-green-200/50 text-green-900">Active</Badge>
									</td>
									<td class="py-3 pr-3 text-right">
										<button class="text-primary-800 hover:text-primary-900 font-medium">Edit</button>
									</td>
								</tr>
								<tr class="hover:bg-gray-200/50">
									<td class="min-w-35 py-3 pl-3 pr-4">
										<div class="flex items-center gap-3">
											<div class="h-8 w-8 shrink-0 rounded-full bg-tertiary-300 flex items-center justify-center text-tertiary-900 font-medium text-xs">MJ</div>
											<span class="text-gray-950">Mike Kern</span>
										</div>
									</td>
									<td class="py-3 pr-4 text-gray-900">Designer</td>
									<td class="py-3 pr-4">
										<Badge class="bg-amber-200/50 text-amber-900">Away</Badge>
									</td>
									<td class="py-3 pr-3 text-right">
										<button class="text-primary-800 hover:text-primary-900 font-medium">Edit</button>
									</td>
								</tr>
								<tr class="hover:bg-gray-200/50">
									<td class="min-w-35 py-3 pl-3 pr-4">
										<div class="flex items-center gap-3">
											<div class="h-8 w-8 shrink-0 rounded-full bg-gray-300 flex items-center justify-center text-gray-900 font-medium text-xs">SL</div>
											<span class="text-gray-950">Val Propp</span>
										</div>
									</td>
									<td class="py-3 pr-4 text-gray-900">Marketing</td>
									<td class="py-3 pr-4">
										<Badge class="bg-gray-200/50 text-gray-900">Offline</Badge>
									</td>
									<td class="py-3 pr-3 text-right">
										<button class="text-primary-800 hover:text-primary-900 font-medium">Edit</button>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- Section 3: Product Cards -->
	<section class="overflow-hidden bg-gray-100 px-6 py-16">
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold text-gray-950 sm:text-3xl">Featured Products</h2>
				<p class="mt-2 text-gray-900">E-commerce card components with hover states</p>
			</div>

			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each products as product (product.id)}
					<Card.Root class="group overflow-hidden border-gray-500 bg-gray-50 transition-all hover:border-primary-600 hover:shadow-lg">
						<div class="relative aspect-square bg-linear-to-br from-primary-100 to-primary-200">
							<div class="absolute inset-0 flex items-center justify-center text-9xl text-gray-700">
								{#if product.image === 'headphones'}🎧{:else if product.image === 'keyboard'}⌨️{:else if product.image === 'watch'}⌚{:else}🔊{/if}
							</div>

							<!-- Favorite Button -->
							<button
								onclick={() => toggleFavorite(product.id)}
								class="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm transition-all hover:bg-white hover:shadow-md"
							>
								<Heart class="h-5 w-5 transition-colors {favorites.includes(product.id) ? 'fill-primary-800 text-primary-800' : 'text-gray-800'}" />
							</button>

							<!-- New Badge -->
							{#if product.id === 3}
								<Badge class="absolute left-3 top-3 bg-secondary-800 text-white">New</Badge>
							{/if}
						</div>

						<Card.Content class="p-4">
							<h3 class="font-semibold text-gray-950 group-hover:text-primary-900">{product.name}</h3>
							<div class="mt-1 flex items-center gap-1.5">
								<div class="flex">
									{#each Array(5) as _, i}
										<Star class="h-4 w-4 {i < Math.floor(product.rating) ? 'fill-amber-800 text-amber-800' : 'text-gray-500'}" />
									{/each}
								</div>
								<span class="text-sm text-gray-900">({product.reviews})</span>
							</div>
							<div class="mt-4 flex items-center justify-between">
								<span class="text-lg font-bold text-gray-950">${product.price}</span>
								<Button size="sm" class="gap-1.5 bg-primary-800 hover:bg-primary-850">
									<ShoppingCart class="h-4 w-4" />
									Add
								</Button>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
	</section>

	<!-- Section 4: Alpha Colors -->
	<section class="overflow-hidden bg-gray-50 px-6 py-16">
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold text-gray-950 sm:text-3xl">Alpha Colors</h2>
				<p class="mt-2 text-gray-900">Semi-transparent badges that work on any colored background</p>
			</div>

			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each colorPanels as panel (panel.name)}
					<div
						class="relative overflow-hidden rounded-xl p-6"
						style="background-color: var(--color-{panel.hue}-800);"
					>
						<!-- Decorative circles using alpha -->
						<div
							class="absolute -right-8 -top-8 h-32 w-32 rounded-full"
							style="background-color: var(--color-{panel.hue}-200); opacity: 0.2;"
						></div>
						<div
							class="absolute -bottom-4 -left-4 h-24 w-24 rounded-full"
							style="background-color: var(--color-{panel.hue}-200); opacity: 0.2;"
						></div>

						<!-- Content -->
						<div class="relative">
							<span
								class="inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
								style="background-color: color-mix(in srgb, var(--color-{panel.hue}-200) 25%, transparent);"
							>
								{panel.name} Alpha
							</span>

							<p class="mt-4 font-semibold text-white">Badges overlay perfectly</p>
							<p class="mt-1 text-sm text-white/80">Using {panel.hue}-200/25 on {panel.hue}-800</p>

							<!-- Multiple alpha badges -->
							<div class="mt-4 flex flex-wrap gap-2">
								{#each ['New', 'Featured', 'Sale'] as label}
									<span
										class="rounded-md px-2 py-0.5 text-xs font-medium text-white"
										style="background-color: color-mix(in srgb, var(--color-{panel.hue}-200) 25%, transparent);"
									>
										{label}
									</span>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>

			<!-- Technical explanation -->
			<Card.Root class="mt-8 border-gray-500 bg-gray-100">
				<Card.Content class="p-6">
					<h3 class="font-semibold text-gray-950">How It Works</h3>
					<p class="mt-2 text-sm text-gray-900">
						Alpha color scales (e.g., <code class="rounded bg-gray-300 px-1.5 py-0.5">bg-orange-200/25</code>)
						are created using Tailwind's built-in opacity modifiers. They blend naturally with any background
						and work great for overlays, badges, and subtle backgrounds. The palette generates OKLCH colors
						that look beautiful at any opacity level.
					</p>
				</Card.Content>
			</Card.Root>
		</div>
	</section>

	<!-- Section 5: Near-Hue Gradient Harmony -->
	<section class="relative overflow-hidden">
		<!-- Light mode gradient -->
		<div
			class="absolute inset-0 dark:hidden"
			style="background: linear-gradient(to right, var(--color-secondary-900), var(--color-adjacent-900));"
		></div>
		<!-- Dark mode gradient -->
		<div
			class="absolute inset-0 hidden dark:block"
			style="background: linear-gradient(to right, var(--color-secondary-500), var(--color-adjacent-500));"
		></div>

		<!-- Decorative elements -->
		<div class="absolute inset-0 opacity-10">
			<div class="absolute left-1/4 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-white blur-3xl"></div>
			<div class="absolute bottom-0 right-1/4 h-64 w-64 translate-y-1/2 rounded-full bg-white blur-3xl"></div>
		</div>

		<div class="relative px-6 py-16 sm:py-24">
			<div class="mx-auto max-w-6xl text-center">
				<h2 class="text-3xl font-bold text-white sm:text-4xl">Near-Hue Gradient Harmony</h2>
				<p class="mx-auto mt-4 max-w-2xl text-lg text-white/80">
					Adjacent Radix hues blend seamlessly, creating natural gradients that maintain
					accessibility and visual coherence across your entire palette.
				</p>

				<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{#each stats as stat (stat.label)}
						{@const Icon = stat.icon}
						<Card.Root class="border-white/20 bg-white/10 backdrop-blur-sm">
							<Card.Content class="flex items-center gap-3 p-6">
								<div class="rounded-lg bg-white/20 p-2">
									<Icon class="h-5 w-5 text-white" />
								</div>
								<div class="text-left">
									<div class="text-2xl font-bold text-white">{stat.value}</div>
									<div class="text-sm text-white/70">{stat.label}</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>

				<!-- Gradient demonstration -->
				<Card.Root class="mt-12 border-white/20 bg-white/10 backdrop-blur-sm">
					<Card.Content class="p-6">
						<h3 class="font-semibold text-white">Gradient Recipe</h3>
						<p class="mt-2 text-sm text-white/80">
							This section blends
							<code class="rounded bg-white/20 px-1.5 py-0.5">secondary</code>
							to
							<code class="rounded bg-white/20 px-1.5 py-0.5">adjacent</code>
							— using step 9 in dark mode (solid backgrounds) and step 11 in light mode (text colors) for consistent saturation.
						</p>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</section>

	<!-- Section 6: Full Palette Harmony -->
	<section id="features" class="overflow-hidden bg-gray-50 px-6 py-20 dark:bg-gray-100">
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
					{@const colors = getColorVars(feature.color)}
					{@const Icon = feature.icon}
					<div class="group">
						<!-- Icon -->
						<div
							class="mb-4 inline-flex rounded-xl p-3"
							style="background-color: {colors.iconBg};"
						>
							<Icon class="h-7 w-7" style="color: {colors.icon};" />
						</div>

						<!-- Title -->
						<h3 class="mb-2 font-semibold text-gray-950">{feature.title}</h3>

						<!-- Description -->
						<p class="mb-3 text-sm leading-relaxed text-gray-800">{feature.description}</p>

						<!-- Link -->
						<a
							href="#features"
							class="inline-flex items-center gap-1 text-sm font-medium transition-colors"
							style="color: {colors.link};"
							onmouseenter={(e) => e.currentTarget.style.color = colors.linkHover}
							onmouseleave={(e) => e.currentTarget.style.color = colors.link}
						>
							{feature.link}
							<ChevronRight class="h-4 w-4" />
						</a>
					</div>
				{/each}
			</div>
		</div>
	</section>

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
				<div class="-mt-4 mb-8 inline-flex rounded-full p-4" style="background-color: color-mix(in srgb, var(--color-primary-800) 10%, transparent);">
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
					<Avatar.Root class="h-14 w-14">
						<Avatar.Fallback
							class="text-xl font-bold text-white"
							style="background: linear-gradient(to bottom right, var(--color-primary-800), var(--color-primary-adjacent-800));"
						>
							JD
						</Avatar.Fallback>
					</Avatar.Root>
					<div class="text-left">
						<div class="font-semibold text-gray-950">Jane D. Zein</div>
						<div class="text-sm text-gray-900">Design Lead at TechCorp</div>
					</div>
				</div>

				<!-- Company logos -->
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
		<Card.Root class="relative mx-auto mt-12 max-w-2xl border-gray-500 bg-gray-100">
			<Card.Content class="p-4 text-center">
				<p class="text-sm text-gray-900">
					This section uses the <code class="rounded bg-gray-300 px-1.5 py-0.5">dark</code> class
					to force dark mode styling, regardless of the page's current theme. The colors automatically
					switch to their dark mode variants.
				</p>
			</Card.Content>
		</Card.Root>
	</section>

	<!-- Section 8: Footer -->
	<footer id="demo-footer" class="overflow-hidden bg-gray-100 px-6 py-12 dark:bg-gray-50">
		<div class="mx-auto max-w-6xl">
			<div class="grid gap-8 lg:grid-cols-6">
				<!-- Brand Column -->
				<div class="lg:col-span-2">
					<a href="#demo-footer" class="mb-4 inline-flex items-center gap-2 text-xl font-bold text-secondary-800">
						<SwatchBook class="h-6 w-6" />
						Sveltopia Colors
					</a>
					<p class="mb-6 max-w-xs text-sm text-gray-800">
						Generate beautiful, accessible color palettes tuned to your brand in seconds.
					</p>
					<!-- Social Icons -->
					<div class="flex gap-4">
						{#each socialLinks as social (social.label)}
							{@const Icon = social.icon}
							<a
								href="#demo-footer"
								class="text-secondary-800 transition-colors hover:text-secondary-900"
								aria-label={social.label}
							>
								<Icon class="h-5 w-5" />
							</a>
						{/each}
					</div>
				</div>

				<!-- Link Columns (2-up on mobile) -->
				<div class="col-span-full grid grid-cols-2 gap-8 lg:col-span-4 lg:grid-cols-4">
					{#each Object.entries(footerLinks) as [category, links] (category)}
						<div>
							<h3 class="mb-4 font-semibold text-secondary-800">{category}</h3>
							<ul class="space-y-3">
								{#each links as link (link)}
									<li>
										<a
											href="#demo-footer"
											class="text-sm text-gray-800 transition-colors hover:text-gray-950"
										>
											{link}
										</a>
									</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			</div>

			<!-- Bottom Bar -->
			<div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-500 pt-8 sm:flex-row">
				<p class="text-sm text-gray-800">
					&copy; {new Date().getFullYear()} <a href="https://colors.sveltopia.dev" class="text-secondary-800 hover:text-secondary-900">Sveltopia</a>. All rights reserved.
				</p>
				<p class="text-sm text-gray-700">
					Built with the <a href="https://github.com/sveltopia/colors" class="text-secondary-800 hover:text-secondary-900">generated color system</a>
				</p>
			</div>
		</div>
	</footer>
</div>
