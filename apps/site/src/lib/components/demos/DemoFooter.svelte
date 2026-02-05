<script lang="ts">
	import { Github, Twitter, Linkedin, SwatchBook } from 'lucide-svelte';

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
</script>

<!-- Section 8: Demo Footer (follows page theme) -->
<footer class="bg-gray-100 px-6 py-12 dark:bg-gray-50">
	<div class="mx-auto max-w-6xl">
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-6">
			<!-- Brand Column -->
			<div class="lg:col-span-2">
				<a href="#" class="mb-4 inline-flex items-center gap-2 text-xl font-bold text-secondary-800">
					<SwatchBook class="h-6 w-6" />
					Sveltopia Colors
				</a>
				<p class="mb-6 max-w-xs text-sm text-gray-800">
					Generate beautiful, accessible color palettes tuned to your brand in seconds.
				</p>
				<!-- Social Icons -->
				<div class="flex gap-4">
					{#each socialLinks as social (social.label)}
						<a
							href="#"
							class="text-secondary-800 transition-colors hover:text-secondary-900"
							aria-label={social.label}
						>
							<social.icon class="h-5 w-5" />
						</a>
					{/each}
				</div>
			</div>

			<!-- Link Columns -->
			{#each Object.entries(footerLinks) as [category, links] (category)}
				<div>
					<h3 class="mb-4 font-semibold text-secondary-800">{category}</h3>
					<ul class="space-y-3">
						{#each links as link (link)}
							<li>
								<a
									href="#"
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

		<!-- Bottom Bar -->
		<div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-500 pt-8 sm:flex-row">
			<p class="text-sm text-gray-800">
				&copy; {new Date().getFullYear()} Sveltopia. All rights reserved.
			</p>
			<p class="text-sm text-gray-700">
				Built with the generated color system
			</p>
		</div>
	</div>
</footer>
