import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		include: ['src/__tests__/**/*.test.ts'],
		exclude: ['**/node_modules/**'],
		coverage: {
			provider: 'v8',
			exclude: [
				'**/*.config.*',
				'**/*.d.ts',
				'**/__tests__/**',
				'**/dist/**',
				'**/node_modules/**'
			]
		}
	}
});
