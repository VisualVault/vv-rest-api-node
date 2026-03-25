import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verbose = process.env.VV_TEST_VERBOSE === 'true';

export default defineConfig({
  test: {
    // Enable globals to avoid importing describe, it, expect
    globals: true,

    // Suppress console.log unless VV_TEST_VERBOSE=true
    silent: !verbose,

    // Test environment
    environment: 'node',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'lib/**/*.js'
      ],
      exclude: [
        'lib/**/*.test.js',
        'lib/**/*.backup',
        'node_modules/**'
      ],
      thresholds: {
        functions: 70,
        lines: 70,
        branches: 70,
        statements: 70
      }
    },

    // Test match patterns - integration tests only
    include: ['tests/integration/**/*.test.js'],
    exclude: ['node_modules/**'],

    // Load environment variables before tests
    setupFiles: ['./tests/integration/setup.js'],

    // Longer timeout for integration tests (API calls)
    testTimeout: 60000,
    hookTimeout: 120000,

    // Run tests sequentially to avoid rate limiting
    maxConcurrency: 1,
    fileParallelism: false,
    sequence: {
      shuffle: false
    },

    // Show full error diffs
    reporters: ['verbose']
  },

  // Resolve configuration for ESM
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './lib'),
      '@tests': path.resolve(__dirname, './tests')
    }
  }
});
