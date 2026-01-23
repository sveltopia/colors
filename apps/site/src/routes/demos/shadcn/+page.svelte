<script lang="ts">
	import { ArrowRight, Sparkles, ShoppingCart, Star, Heart, Check, Info, AlertCircle, CheckCircle, XCircle, Quote, Plus, Trash2, Download, Settings, ChevronRight, ExternalLink, Zap, Globe, Shield, Rocket, Palette, Accessibility, Moon, Layers, Code2, Bell, User } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import * as Alert from '$lib/components/ui/alert';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Toggle } from '$lib/components/ui/toggle';
	import * as Avatar from '$lib/components/ui/avatar';
	import IntegrationGuide from '$lib/components/demos/IntegrationGuide.svelte';

	// Form state
	let emailValue = $state('');
	let passwordValue = $state('');
	let notificationsEnabled = $state(true);
	let marketingEnabled = $state(false);
	let activeTab = $state('account');
	let favorites = $state<number[]>([]);

	// Products data
	const products = [
		{ id: 1, name: 'Premium Headphones', price: 299, rating: 4.8, reviews: 124, image: 'headphones' },
		{ id: 2, name: 'Wireless Keyboard', price: 149, rating: 4.6, reviews: 89, image: 'keyboard' },
		{ id: 3, name: 'Smart Watch Pro', price: 399, rating: 4.9, reviews: 256, image: 'watch' },
		{ id: 4, name: 'Portable Speaker', price: 79, rating: 4.5, reviews: 67, image: 'speaker' }
	];

	// Features data
	const features = [
		{ icon: Palette, title: 'Brand Tuned', description: 'Every hue adapts to your brand.', color: 'orange' },
		{ icon: Accessibility, title: 'APCA Accessible', description: 'Validated contrast ratios.', color: 'blue' },
		{ icon: Moon, title: 'Dark Mode Ready', description: 'Automatic dark variants.', color: 'purple' },
		{ icon: Layers, title: 'Alpha Scales', description: 'Semi-transparent variants.', color: 'green' },
		{ icon: Code2, title: 'Framework Agnostic', description: 'Export to any format.', color: 'cyan' },
		{ icon: Sparkles, title: 'P3 Wide Gamut', description: 'Vibrant modern colors.', color: 'pink' }
	];

	// Stats data
	const stats = [
		{ value: '99.9%', label: 'Uptime SLA', icon: Shield },
		{ value: '50ms', label: 'Avg Response', icon: Zap },
		{ value: '190+', label: 'Countries', icon: Globe },
		{ value: '10M+', label: 'API Calls/Day', icon: Rocket }
	];

	// Color panels for alpha showcase
	// First 2 panels use semantic tokens (primary, secondary) to show brand colors
	// Last 2 panels use fixed hues (blue, purple) to show system colors still work
	const colorPanels = [
		{ name: 'Primary', hue: 'primary' },
		{ name: 'Secondary', hue: 'secondary' },
		{ name: 'Blue', hue: 'blue' },
		{ name: 'Purple', hue: 'purple' }
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
			bg: `var(--color-${color}-200)`,
			border: `var(--color-${color}-500)`,
			icon: `var(--color-${color}-800)`,
			title: `var(--color-${color}-900)`
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
		<div class="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-200)] via-[var(--color-primary-300)] to-[var(--color-primary-400)]"></div>
		<div class="relative px-6 py-16 sm:py-24 lg:py-32">
			<div class="mx-auto max-w-3xl text-center">
				<Badge class="mb-6 gap-2 border-[var(--color-secondary-500)] bg-[var(--color-secondary-200)] text-[var(--color-secondary-900)]">
					<Sparkles class="h-4 w-4" />
					shadcn-svelte Components
				</Badge>

				<h1 class="text-4xl font-bold tracking-tight text-[var(--color-gray-950)] sm:text-5xl lg:text-6xl">
					Build beautiful interfaces with
					<span class="text-[var(--color-primary-900)]">shadcn-svelte</span>
				</h1>

				<p class="mx-auto mt-6 max-w-xl text-lg text-[var(--color-gray-900)]">
					All components use your generated color palette through CSS variables.
				</p>

				<div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Button class="gap-2 bg-[var(--color-primary-800)] text-white hover:bg-[var(--color-primary-850)]">
						Get Started
						<ArrowRight class="h-5 w-5" />
					</Button>
					<Button variant="outline" class="border-[var(--color-primary-600)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-200)]">
						View Documentation
					</Button>
				</div>
			</div>
		</div>
	</section>

	<!-- Integration Guide: How to set up shadcn with generated colors -->
	<IntegrationGuide framework="shadcn" />

	<!-- Section 2: Web-App Components -->
	<section class="bg-[var(--color-gray-50)] px-6 py-16">
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold text-[var(--color-gray-950)] sm:text-3xl">shadcn Components</h2>
				<p class="mt-2 text-[var(--color-gray-900)]">Cards, inputs, tabs, and alerts</p>
			</div>

			<div class="grid gap-8 lg:grid-cols-2">
				<!-- Login Card -->
				<Card.Root class="border-[var(--color-gray-500)] bg-[var(--color-gray-100)]">
					<Card.Header>
						<Card.Title>Sign In</Card.Title>
						<Card.Description>Enter your credentials to continue</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div>
							<label for="email" class="mb-1.5 block text-sm font-medium text-[var(--color-gray-900)]">Email</label>
							<Input id="email" type="email" bind:value={emailValue} placeholder="you@example.com" class="border-[var(--color-gray-600)] bg-[var(--color-gray-50)] focus:border-[var(--color-primary-700)]" />
						</div>
						<div>
							<label for="password" class="mb-1.5 block text-sm font-medium text-[var(--color-gray-900)]">Password</label>
							<Input id="password" type="password" bind:value={passwordValue} placeholder="Enter password" class="border-[var(--color-gray-600)] bg-[var(--color-gray-50)] focus:border-[var(--color-primary-700)]" />
						</div>
						<Button class="w-full bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-850)]">Sign In</Button>
					</Card.Content>
					<Card.Footer class="flex-col gap-3 border-t border-[var(--color-gray-500)] pt-6">
						<div class="flex w-full items-center justify-between">
							<span class="text-sm text-[var(--color-gray-900)]">Notifications</span>
							<Toggle bind:pressed={notificationsEnabled} class={notificationsEnabled ? 'bg-[var(--color-primary-800)]' : ''}>
								{notificationsEnabled ? 'On' : 'Off'}
							</Toggle>
						</div>
						<div class="flex w-full items-center justify-between">
							<span class="text-sm text-[var(--color-gray-900)]">Marketing</span>
							<Toggle bind:pressed={marketingEnabled} class={marketingEnabled ? 'bg-[var(--color-primary-800)]' : ''}>
								{marketingEnabled ? 'On' : 'Off'}
							</Toggle>
						</div>
					</Card.Footer>
				</Card.Root>

				<!-- Tabs + Alerts -->
				<div class="space-y-6">
					<Card.Root class="border-[var(--color-gray-500)] bg-[var(--color-gray-100)]">
						<Card.Content class="pt-6">
							<Tabs.Root bind:value={activeTab}>
								<Tabs.List class="bg-[var(--color-gray-200)]">
									<Tabs.Trigger value="account">
										<User class="mr-2 h-4 w-4" />
										Account
									</Tabs.Trigger>
									<Tabs.Trigger value="notifications">
										<Bell class="mr-2 h-4 w-4" />
										Notifications
									</Tabs.Trigger>
									<Tabs.Trigger value="settings">
										<Settings class="mr-2 h-4 w-4" />
										Settings
									</Tabs.Trigger>
								</Tabs.List>
								<Tabs.Content value="account" class="rounded-lg bg-[var(--color-gray-50)] p-4">
									<p class="text-sm text-[var(--color-gray-900)]">Manage your account settings.</p>
								</Tabs.Content>
								<Tabs.Content value="notifications" class="rounded-lg bg-[var(--color-gray-50)] p-4">
									<p class="text-sm text-[var(--color-gray-900)]">Configure notifications.</p>
								</Tabs.Content>
								<Tabs.Content value="settings" class="rounded-lg bg-[var(--color-gray-50)] p-4">
									<p class="text-sm text-[var(--color-gray-900)]">Advanced settings.</p>
								</Tabs.Content>
							</Tabs.Root>
						</Card.Content>
					</Card.Root>

					<!-- Alerts -->
					<div class="space-y-3">
						<Alert.Root class="border-[var(--color-blue-500)] bg-[var(--color-blue-200)]">
							<Info class="h-5 w-5 text-[var(--color-blue-900)]" />
							<Alert.Title class="text-[var(--color-blue-950)]">Information</Alert.Title>
							<Alert.Description class="text-[var(--color-blue-900)]">Session expires in 15 minutes.</Alert.Description>
						</Alert.Root>

						<Alert.Root class="border-[var(--color-green-500)] bg-[var(--color-green-200)]">
							<CheckCircle class="h-5 w-5 text-[var(--color-green-900)]" />
							<Alert.Title class="text-[var(--color-green-950)]">Success</Alert.Title>
							<Alert.Description class="text-[var(--color-green-900)]">Changes saved successfully.</Alert.Description>
						</Alert.Root>

						<Alert.Root class="border-[var(--color-amber-500)] bg-[var(--color-amber-200)]">
							<AlertCircle class="h-5 w-5 text-[var(--color-amber-900)]" />
							<Alert.Title class="text-[var(--color-amber-950)]">Warning</Alert.Title>
							<Alert.Description class="text-[var(--color-amber-900)]">Review before continuing.</Alert.Description>
						</Alert.Root>

						<Alert.Root variant="destructive" class="border-[var(--color-red-500)] bg-[var(--color-red-200)]">
							<XCircle class="h-5 w-5 text-[var(--color-red-900)]" />
							<Alert.Title class="text-[var(--color-red-950)]">Error</Alert.Title>
							<Alert.Description class="text-[var(--color-red-900)]">Something went wrong.</Alert.Description>
						</Alert.Root>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 3: Product Cards with shadcn Card -->
	<section class="bg-[var(--color-gray-100)] px-6 py-16">
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold text-[var(--color-gray-950)] sm:text-3xl">Product Cards</h2>
				<p class="mt-2 text-[var(--color-gray-900)]">Using shadcn Card components</p>
			</div>

			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each products as product (product.id)}
					<Card.Root class="group overflow-hidden border-[var(--color-gray-500)] bg-[var(--color-gray-50)] transition-all hover:border-[var(--color-primary-600)] hover:shadow-lg">
						<div class="relative aspect-square bg-gradient-to-br from-[var(--color-gray-200)] to-[var(--color-gray-300)]">
							<div class="absolute inset-0 flex items-center justify-center text-4xl text-[var(--color-gray-700)]">
								{#if product.image === 'headphones'}🎧{:else if product.image === 'keyboard'}⌨️{:else if product.image === 'watch'}⌚{:else}🔊{/if}
							</div>
							<button
								onclick={() => toggleFavorite(product.id)}
								class="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white"
							>
								<Heart class="h-5 w-5 {favorites.includes(product.id) ? 'fill-[var(--color-red-800)] text-[var(--color-red-800)]' : 'text-[var(--color-gray-800)]'}" />
							</button>
							{#if product.id === 3}
								<Badge class="absolute left-3 top-3 bg-[var(--color-primary-800)] text-white">New</Badge>
							{/if}
						</div>
						<Card.Content class="p-4">
							<Card.Title class="text-base group-hover:text-[var(--color-primary-900)]">{product.name}</Card.Title>
							<div class="mt-1 flex items-center gap-1.5">
								<div class="flex">
									{#each Array(5) as _, i}
										<Star class="h-4 w-4 {i < Math.floor(product.rating) ? 'fill-[var(--color-amber-800)] text-[var(--color-amber-800)]' : 'text-[var(--color-gray-500)]'}" />
									{/each}
								</div>
								<span class="text-sm text-[var(--color-gray-900)]">({product.reviews})</span>
							</div>
							<div class="mt-4 flex items-center justify-between">
								<span class="text-lg font-bold text-[var(--color-gray-950)]">${product.price}</span>
								<Button size="sm" class="gap-1.5 bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-850)]">
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

	<!-- Section 4: Alpha Colors Showcase -->
	<section class="bg-[var(--color-gray-50)] px-6 py-16">
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold text-[var(--color-gray-950)] sm:text-3xl">Alpha Colors</h2>
				<p class="mt-2 text-[var(--color-gray-900)]">Semi-transparent badges on colored backgrounds</p>
			</div>

			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
				{#each colorPanels as panel (panel.name)}
					<div class="relative overflow-hidden rounded-xl p-6" style="background-color: {panel.bg};">
						<div class="absolute -right-8 -top-8 h-32 w-32 rounded-full" style="background-color: {panel.badgeBg};"></div>
						<div class="absolute -bottom-4 -left-4 h-24 w-24 rounded-full" style="background-color: {panel.badgeBg};"></div>
						<div class="relative">
							<Badge class="rounded-full" style="background-color: {panel.badgeBg}; color: {panel.badgeText};">
								{panel.name} Alpha
							</Badge>
							<p class="mt-4 font-semibold text-white">Badges overlay perfectly</p>
							<div class="mt-4 flex flex-wrap gap-2">
								{#each ['New', 'Featured', 'Sale'] as label}
									<Badge variant="secondary" class="rounded-md" style="background-color: {panel.badgeBg}; color: {panel.badgeText};">
										{label}
									</Badge>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Section 5: Gradient Section -->
	<section class="relative overflow-hidden">
		<div class="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-800)] via-[var(--color-primary-850)] to-[var(--color-secondary-800)]"></div>
		<div class="relative px-6 py-16 sm:py-24">
			<div class="mx-auto max-w-6xl text-center">
				<h2 class="text-3xl font-bold text-white sm:text-4xl">Near-Hue Gradient Harmony</h2>
				<p class="mx-auto mt-4 max-w-2xl text-lg text-white/80">Adjacent Radix hues blend seamlessly.</p>

				<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{#each stats as stat (stat.label)}
						<Card.Root class="border-white/20 bg-white/10 backdrop-blur-sm">
							<Card.Content class="flex items-center gap-3 p-6">
								<div class="rounded-lg bg-white/20 p-2">
									<svelte:component this={stat.icon} class="h-5 w-5 text-white" />
								</div>
								<div class="text-left">
									<div class="text-2xl font-bold text-white">{stat.value}</div>
									<div class="text-sm text-white/70">{stat.label}</div>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- Section 6: Feature Grid -->
	<section class="bg-[var(--color-gray-100)] px-6 py-16">
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold text-[var(--color-gray-950)] sm:text-3xl">Full Palette Diversity</h2>
				<p class="mt-2 text-[var(--color-gray-900)]">Each feature uses a different hue</p>
			</div>

			<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each features as feature (feature.title)}
					{@const colors = getColorVars(feature.color)}
					<Card.Root class="transition-all hover:shadow-lg" style="background-color: {colors.bg}; border-color: {colors.border};">
						<Card.Content class="p-6">
							<div class="mb-4 inline-flex rounded-lg p-2.5" style="background-color: {colors.bg};">
								<svelte:component this={feature.icon} class="h-6 w-6" style="color: {colors.icon};" />
							</div>
							<Card.Title class="mb-2" style="color: {colors.title};">{feature.title}</Card.Title>
							<Card.Description>{feature.description}</Card.Description>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>
	</section>

	<!-- Section 7: Testimonial (Dark) -->
	<section class="dark relative overflow-hidden bg-[var(--color-gray-50)] px-6 py-16">
		<div class="absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20" style="background: radial-gradient(circle, var(--color-primary-800), transparent);"></div>
		<div class="relative mx-auto max-w-4xl text-center">
			<div class="mb-8 inline-flex rounded-full bg-[var(--color-primary-200)] p-4">
				<Quote class="h-8 w-8 text-[var(--color-primary-800)]" />
			</div>
			<blockquote class="text-2xl font-medium leading-relaxed text-[var(--color-gray-950)] sm:text-3xl">
				"Sveltopia Colors transformed our design workflow. Complete palettes from just our brand colors."
			</blockquote>
			<div class="mt-8 flex items-center justify-center gap-4">
				<Avatar.Root class="h-14 w-14">
					<Avatar.Fallback class="bg-gradient-to-br from-[var(--color-primary-800)] to-[var(--color-secondary-800)] text-xl font-bold text-white">JD</Avatar.Fallback>
				</Avatar.Root>
				<div class="text-left">
					<div class="font-semibold text-[var(--color-gray-950)]">Jane Doe</div>
					<div class="text-sm text-[var(--color-gray-900)]">Design Lead at TechCorp</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Section 8: Button Variants -->
	<section class="bg-[var(--color-gray-50)] px-6 py-16">
		<div class="mx-auto max-w-6xl">
			<div class="mb-12 text-center">
				<h2 class="text-2xl font-bold text-[var(--color-gray-950)] sm:text-3xl">Button Variants</h2>
				<p class="mt-2 text-[var(--color-gray-900)]">shadcn Button with all variants</p>
			</div>

			<div class="space-y-8">
				<Card.Root class="border-[var(--color-gray-500)] bg-[var(--color-gray-100)]">
					<Card.Header>
						<Card.Title class="text-sm uppercase tracking-wide text-[var(--color-gray-900)]">Primary Actions</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-wrap gap-4">
						<Button class="gap-2 bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-850)]">
							<Plus class="h-4 w-4" />
							Create New
						</Button>
						<Button class="gap-2 bg-[var(--color-secondary-800)] hover:bg-[var(--color-secondary-850)]">
							<Download class="h-4 w-4" />
							Download
						</Button>
						<Button class="gap-2 bg-[var(--color-green-800)] hover:bg-[var(--color-green-850)]">
							Confirm
							<ChevronRight class="h-4 w-4" />
						</Button>
					</Card.Content>
				</Card.Root>

				<Card.Root class="border-[var(--color-gray-500)] bg-[var(--color-gray-100)]">
					<Card.Header>
						<Card.Title class="text-sm uppercase tracking-wide text-[var(--color-gray-900)]">Secondary & Outline</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-wrap gap-4">
						<Button variant="secondary" class="gap-2">
							<Settings class="h-4 w-4" />
							Settings
						</Button>
						<Button variant="outline" class="border-[var(--color-primary-600)] text-[var(--color-primary-900)] hover:bg-[var(--color-primary-200)]">
							Outline Primary
						</Button>
						<Button variant="outline">
							Outline Secondary
						</Button>
					</Card.Content>
				</Card.Root>

				<Card.Root class="border-[var(--color-gray-500)] bg-[var(--color-gray-100)]">
					<Card.Header>
						<Card.Title class="text-sm uppercase tracking-wide text-[var(--color-gray-900)]">Destructive & Ghost</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-wrap gap-4">
						<Button variant="destructive" class="gap-2">
							<Trash2 class="h-4 w-4" />
							Delete
						</Button>
						<Button variant="outline" class="gap-2 border-[var(--color-red-600)] text-[var(--color-red-900)] hover:bg-[var(--color-red-200)]">
							<Trash2 class="h-4 w-4" />
							Delete Outline
						</Button>
						<Button variant="ghost">Ghost Button</Button>
					</Card.Content>
				</Card.Root>

				<Card.Root class="border-[var(--color-gray-500)] bg-[var(--color-gray-100)]">
					<Card.Header>
						<Card.Title class="text-sm uppercase tracking-wide text-[var(--color-gray-900)]">Link & Sizes</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-wrap items-center gap-4">
						<Button variant="link" class="gap-1 text-[var(--color-primary-900)]">
							Link Button
							<ExternalLink class="h-4 w-4" />
						</Button>
						<span class="text-[var(--color-gray-500)]">|</span>
						<Button size="sm" class="bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-850)]">Small</Button>
						<Button class="bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-850)]">Default</Button>
						<Button size="lg" class="bg-[var(--color-primary-800)] hover:bg-[var(--color-primary-850)]">Large</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</section>
</div>
