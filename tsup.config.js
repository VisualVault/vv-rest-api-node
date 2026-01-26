import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';

export default defineConfig({
    entry: {
        'index': 'lib/index.js',
        'VVRestApi': 'lib/VVRestApi.js',
        'constants': 'lib/constants.js'
    },
    format: ['esm', 'cjs'],
    dts: true,  // Generate types from JSDoc with tsconfig.json
    clean: true,
    outDir: 'dist',
    splitting: false,
    sourcemap: true,
    // Shim import.meta.url for CJS builds
    shims: true,
    onSuccess: async () => {
        // Copy config.yml to dist folder
        copyFileSync('lib/config.yml', 'dist/config.yml');
        console.log('Copied config.yml to dist/');
    }
});
