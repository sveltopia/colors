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
		id: 'slack',
		name: 'Slack',
		colors: ['#4A154B', '#E01E5A', '#ECB22E', '#36C5F0'],
		category: 'real-brand',
		notes: 'Multi-color brand (4 colors)'
	},
	{
		id: 'notion',
		name: 'Notion',
		colors: ['#000000', '#FA5252'],
		category: 'real-brand',
		notes: 'Pure black + red accent'
	},
	{
		id: 'linear',
		name: 'Linear',
		colors: ['#5E6AD2'],
		category: 'real-brand',
		notes: 'Single indigo/violet'
	},
	{
		id: 'vercel',
		name: 'Vercel',
		colors: ['#000000'],
		category: 'real-brand',
		notes: 'Minimal - pure black only'
	},
	{
		id: 'figma',
		name: 'Figma',
		colors: ['#F24E1E', '#A259FF', '#1ABCFE', '#0ACF83'],
		category: 'real-brand',
		notes: 'Multi-color brand (4 colors)'
	},
	{
		id: 'cocacola',
		name: 'Coca-Cola',
		colors: ['#F40009'],
		category: 'real-brand',
		notes: 'Iconic red'
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
