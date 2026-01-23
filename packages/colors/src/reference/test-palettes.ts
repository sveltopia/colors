/**
 * Test Palettes for Stress Testing
 *
 * A curated collection of brand color inputs to validate palette generation
 * across diverse scenarios: real brands, edge cases, and nightmare scenarios.
 */

export interface TestPalette {
	id: string;
	name: string;
	colors: string[];
	category: 'real-brand' | 'edge-case' | 'nightmare';
	notes?: string;
}

export const TEST_PALETTES: TestPalette[] = [
	// ============================================
	// Tier 1: Real Brands
	// These should produce attractive, usable palettes
	// ============================================
	{
		id: 'sveltopia',
		name: 'Sveltopia',
		colors: ['#FF6A00', '#43A047', '#1A1A1A'],
		category: 'real-brand',
		notes: 'Our reference palette'
	},
	{
		id: 'stripe',
		name: 'Stripe',
		colors: ['#635BFF', '#00D4FF'],
		category: 'real-brand',
		notes: 'Purple primary + cyan accent'
	},
	{
		id: 'spotify',
		name: 'Spotify',
		colors: ['#1DB954', '#191414'],
		category: 'real-brand',
		notes: 'Signature green + near-black'
	},
	{
		id: 'claude',
		name: 'Claude',
		colors: ['#C15F3C', '#B1ADA1', '#F4F3EE'],
		category: 'real-brand',
		notes: 'Signature terracotta + warm taupe + cream'
	},
	{
		id: 'slack',
		name: 'Slack',
		colors: ['#4A154B', '#E01E5A', '#ECB22E', '#36C5F0'],
		category: 'real-brand',
		notes: 'Multi-color brand (4 colors)'
	},
	{
		id: 'linear',
		name: 'Linear',
		colors: ['#5E6AD2'],
		category: 'real-brand',
		notes: 'Single indigo/violet'
	},
	{
		id: 'figma',
		name: 'Figma',
		colors: ['#F24E1E', '#A259FF', '#1ABCFE', '#0ACF83'],
		category: 'real-brand',
		notes: 'Multi-color brand (4 colors)'
	},
	{
		id: 'tiktok',
		name: 'TikTok',
		colors: ['#000000', '#FE2C55', '#25F4EE'],
		category: 'real-brand',
		notes: 'Black + signature pink-red + cyan (glitch aesthetic)'
	},
	{
		id: 'starbucks',
		name: 'Starbucks',
		colors: ['#006241', '#00754A'],
		category: 'real-brand',
		notes: 'Two greens - similar hues, different L/C'
	},
	{
		id: 'instagram',
		name: 'Instagram',
		colors: ['#833AB4', '#E1306C', '#F77737', '#FCAF45'],
		category: 'real-brand',
		notes: 'Gradient colors (purple → yellow) - 4 color stress test'
	},
	{
		id: 'google',
		name: 'Google',
		colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'],
		category: 'real-brand',
		notes: 'Elementary colors spread across wheel (blue, red, yellow, green)'
	},
	{
		id: 'canva',
		name: 'Canva',
		colors: ['#00C4CC', '#7D2AE8'],
		category: 'real-brand',
		notes: 'Teal + purple - analogous cool hues'
	},
	{
		id: 'apple',
		name: 'Apple',
		colors: ['#000000', '#A6A6A6'],
		category: 'real-brand',
		notes: 'Minimal - black + gray (elegant neutrals)'
	},
	{
		id: 'mcdonalds',
		name: "McDonald's",
		colors: ['#FFC72C', '#DA291C'],
		category: 'real-brand',
		notes: 'Bright yellow + red'
	},

	// ============================================
	// Tier 2: Edge Cases
	// Colors that push boundaries of the algorithm
	// ============================================
	{
		id: 'near-black',
		name: 'Near-black',
		colors: ['#0A0A0A'],
		category: 'edge-case',
		notes: 'Darker than step 12'
	},
	{
		id: 'near-white',
		name: 'Near-white',
		colors: ['#FAFAFA'],
		category: 'edge-case',
		notes: 'Lighter than step 1'
	},
	{
		id: 'pastel',
		name: 'Pastel pink',
		colors: ['#FFD1DC'],
		category: 'edge-case',
		notes: 'Low chroma, high lightness'
	},
	{
		id: 'neon',
		name: 'Neon green',
		colors: ['#39FF14'],
		category: 'edge-case',
		notes: 'Extreme saturation'
	},
	{
		id: 'between-hues',
		name: 'Saddle brown',
		colors: ['#8B4513'],
		category: 'edge-case',
		notes: 'Between orange/brown hue slots'
	},
	{
		id: 'muddy',
		name: 'Muddy olive',
		colors: ['#556B2F'],
		category: 'edge-case',
		notes: 'Low chroma, ambiguous hue'
	},
	{
		id: 'hot-pink',
		name: 'Hot pink',
		colors: ['#FF69B4'],
		category: 'edge-case',
		notes: 'Between pink/crimson'
	},
	{
		id: 'teal-cyan',
		name: 'Teal boundary',
		colors: ['#008B8B'],
		category: 'edge-case',
		notes: 'Hue boundary between teal/cyan'
	},
	{
		id: 'pure-gray',
		name: 'Pure gray',
		colors: ['#808080'],
		category: 'edge-case',
		notes: 'No hue information (achromatic)'
	},
	{
		id: 'temp-conflict',
		name: 'Warm+Cool',
		colors: ['#FF6B00', '#0066FF'],
		category: 'edge-case',
		notes: 'Does tuning fight itself?'
	},

	// ============================================
	// Tier 3: Nightmare Scenarios
	// Deliberately difficult inputs
	// ============================================
	{
		id: 'christmas',
		name: 'Christmas',
		colors: ['#FF0000', '#00FF00'],
		category: 'nightmare',
		notes: 'Clashing complementary hues'
	},
	{
		id: 'rainbow',
		name: 'Rainbow (7)',
		colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
		category: 'nightmare',
		notes: 'Maximum 7 colors'
	},
	{
		id: 'duplicate-slot',
		name: 'Two oranges',
		colors: ['#FF6600', '#FF5500'],
		category: 'nightmare',
		notes: 'Both map to same hue slot'
	},
	{
		id: 'opposite',
		name: 'Yellow+Navy',
		colors: ['#FFFF00', '#000080'],
		category: 'nightmare',
		notes: 'Colors 180° apart on wheel'
	},
	{
		id: 'exact-radix',
		name: 'Exact Radix',
		colors: ['#30A46C'],
		category: 'nightmare',
		notes: 'Zero tuning needed - exact Radix green-9'
	}
];

/** Get test palette by ID */
export function getTestPalette(id: string): TestPalette | undefined {
	return TEST_PALETTES.find((p) => p.id === id);
}

/** Get all palettes in a category */
export function getPalettesByCategory(category: TestPalette['category']): TestPalette[] {
	return TEST_PALETTES.filter((p) => p.category === category);
}
