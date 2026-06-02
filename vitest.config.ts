import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Use jsdom for component tests, node for engine/server tests
    environmentMatchGlobs: [
      ['src/components/**/*.test.{ts,tsx}', 'jsdom'],
      ['src/**/*.test.{ts,tsx}', 'jsdom'],
      ['tests/**/*', 'node'],
      ['**/*.test.{ts,tsx}', 'jsdom'],
    ],
    setupFiles: ['./src/test/setup.ts'],
  },
});
