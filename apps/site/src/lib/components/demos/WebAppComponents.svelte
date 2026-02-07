<script lang="ts">
	import { Check, AlertCircle, Info, CheckCircle, XCircle, Bell, Settings, User } from 'lucide-svelte';

	let emailValue = $state('');
	let passwordValue = $state('');
	let rememberMe = $state(true);
	let notificationsEnabled = $state(true);
	let marketingEnabled = $state(false);
	let activeTab = $state('account');
</script>

<!-- Section 2: Web-App Components -->
<section class="overflow-hidden bg-gray-50 px-6 py-16">
	<div class="mx-auto max-w-6xl">
		<div class="mb-12 text-center">
			<h2 class="text-2xl font-bold text-gray-950 sm:text-3xl">Web App Components</h2>
		</div>

		<div class="grid gap-8 lg:grid-cols-2">
			<!-- Login Form Card -->
			<div class="min-w-0 rounded-xl border border-gray-500 bg-gray-100 p-6 shadow-sm">
				<h3 class="mb-6 text-lg font-semibold text-gray-950">Sign In</h3>

				<form class="space-y-4">
					<div>
						<label for="email" class="mb-1.5 block text-sm font-medium text-gray-900"
							>Email</label
						>
						<input
							id="email"
							type="email"
							bind:value={emailValue}
							placeholder="you@example.com"
							class="w-full rounded-lg border border-gray-600 bg-gray-50 px-4 py-2.5 text-gray-950 placeholder:text-gray-800 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400/50"
						/>
					</div>

					<div>
						<label for="password" class="mb-1.5 block text-sm font-medium text-gray-900"
							>Password</label
						>
						<input
							id="password"
							type="password"
							bind:value={passwordValue}
							placeholder="Enter your password"
							class="w-full rounded-lg border border-gray-600 bg-gray-50 px-4 py-2.5 text-gray-950 placeholder:text-gray-800 focus:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400/50"
						/>
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

					<button
						type="submit"
						class="w-full rounded-lg bg-primary-800 py-2.5 font-medium text-white transition-colors hover:bg-primary-850"
					>
						Sign In
					</button>
				</form>

				<!-- Toggle Switches (using secondary color) -->
				<div class="mt-6 space-y-3 border-t border-gray-500 pt-6">
					<div class="flex items-center justify-between">
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
					<div class="flex items-center justify-between">
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
				</div>
			</div>

			<!-- Tabs + Alerts -->
			<div class="min-w-0 space-y-6">
				<!-- Tab Navigation -->
				<div class="rounded-xl border border-gray-500 bg-gray-100 p-6 shadow-sm">
					<div class="mb-4 flex gap-1 rounded-lg bg-gray-200 p-1">
						{#each [
							{ id: 'account', label: 'Account', icon: User },
							{ id: 'notifications', label: 'Notifications', icon: Bell },
							{ id: 'settings', label: 'Settings', icon: Settings }
						] as tab (tab.id)}
							<button
								onclick={() => (activeTab = tab.id)}
								class="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors sm:px-3 {activeTab ===
								tab.id
									? 'bg-gray-50 text-primary-900 shadow-sm'
									: 'text-gray-900 hover:text-gray-950'}"
							>
								<tab.icon class="h-4 w-4 shrink-0" />
								<span class="truncate">{tab.label}</span>
							</button>
						{/each}
					</div>

					<div class="rounded-lg bg-gray-50 p-4">
						{#if activeTab === 'account'}
							<p class="text-sm text-gray-900">
								Manage your account settings and preferences.
							</p>
						{:else if activeTab === 'notifications'}
							<p class="text-sm text-gray-900">
								Configure how you receive notifications.
							</p>
						{:else}
							<p class="text-sm text-gray-900">
								Advanced settings and configuration options.
							</p>
						{/if}
					</div>
				</div>

				<!-- Alert Banners -->
				<div class="space-y-3">
					<div
						class="flex items-start gap-3 rounded-lg border border-blue-500 bg-blue-200/50 p-4"
					>
						<Info class="mt-0.5 h-5 w-5 shrink-0 text-blue-900" />
						<div>
							<p class="font-medium text-blue-950">Information</p>
							<p class="text-sm text-blue-900">Your session will expire in 15 minutes.</p>
						</div>
					</div>

					<div
						class="flex items-start gap-3 rounded-lg border border-green-500 bg-green-200/50 p-4"
					>
						<CheckCircle class="mt-0.5 h-5 w-5 shrink-0 text-green-900" />
						<div>
							<p class="font-medium text-green-950">Success</p>
							<p class="text-sm text-green-900">Your changes have been saved.</p>
						</div>
					</div>

					<div
						class="flex items-start gap-3 rounded-lg border border-amber-500 bg-amber-200/50 p-4"
					>
						<AlertCircle class="mt-0.5 h-5 w-5 shrink-0 text-amber-900" />
						<div>
							<p class="font-medium text-amber-950">Warning</p>
							<p class="text-sm text-amber-900">Please review before continuing.</p>
						</div>
					</div>

					<div
						class="flex items-start gap-3 rounded-lg border border-red-500 bg-red-200/50 p-4"
					>
						<XCircle class="mt-0.5 h-5 w-5 shrink-0 text-red-900" />
						<div>
							<p class="font-medium text-red-950">Error</p>
							<p class="text-sm text-red-900">Something went wrong. Please try again.</p>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Data Table -->
		<div class="mt-8 rounded-xl border border-gray-500 bg-gray-100 p-6 shadow-sm">
			<h3 class="mb-4 text-lg font-semibold text-gray-950">Team Members</h3>
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
									<span class="text-gray-950">Jane D. Zein</span>
								</div>
							</td>
							<td class="py-3 pr-4 text-gray-900">Admin</td>
							<td class="py-3 pr-4">
								<span class="inline-flex items-center rounded-full bg-green-200/50 px-2 py-0.5 text-xs font-medium text-green-900">Active</span>
							</td>
							<td class="py-3 pr-3 text-right">
								<button class="text-primary-800 hover:text-primary-900 font-medium">Edit</button>
							</td>
						</tr>
						<tr class="hover:bg-gray-200/50">
							<td class="min-w-35 py-3 pl-3 pr-4">
								<div class="flex items-center gap-3">
									<div class="h-8 w-8 shrink-0 rounded-full bg-secondary-300 flex items-center justify-center text-secondary-900 font-medium text-xs">AS</div>
									<span class="text-gray-950">Alex Smith</span>
								</div>
							</td>
							<td class="py-3 pr-4 text-gray-900">Developer</td>
							<td class="py-3 pr-4">
								<span class="inline-flex items-center rounded-full bg-green-200/50 px-2 py-0.5 text-xs font-medium text-green-900">Active</span>
							</td>
							<td class="py-3 pr-3 text-right">
								<button class="text-primary-800 hover:text-primary-900 font-medium">Edit</button>
							</td>
						</tr>
						<tr class="hover:bg-gray-200/50">
							<td class="min-w-35 py-3 pl-3 pr-4">
								<div class="flex items-center gap-3">
									<div class="h-8 w-8 shrink-0 rounded-full bg-tertiary-300 flex items-center justify-center text-tertiary-900 font-medium text-xs">MJ</div>
									<span class="text-gray-950">Mike Johnson</span>
								</div>
							</td>
							<td class="py-3 pr-4 text-gray-900">Designer</td>
							<td class="py-3 pr-4">
								<span class="inline-flex items-center rounded-full bg-amber-200/50 px-2 py-0.5 text-xs font-medium text-amber-900">Away</span>
							</td>
							<td class="py-3 pr-3 text-right">
								<button class="text-primary-800 hover:text-primary-900 font-medium">Edit</button>
							</td>
						</tr>
						<tr class="hover:bg-gray-200/50">
							<td class="min-w-35 py-3 pl-3 pr-4">
								<div class="flex items-center gap-3">
									<div class="h-8 w-8 shrink-0 rounded-full bg-gray-300 flex items-center justify-center text-gray-900 font-medium text-xs">SL</div>
									<span class="text-gray-950">Sarah Lee</span>
								</div>
							</td>
							<td class="py-3 pr-4 text-gray-900">Marketing</td>
							<td class="py-3 pr-4">
								<span class="inline-flex items-center rounded-full bg-gray-200/50 px-2 py-0.5 text-xs font-medium text-gray-900">Offline</span>
							</td>
							<td class="py-3 pr-3 text-right">
								<button class="text-primary-800 hover:text-primary-900 font-medium">Edit</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</section>
