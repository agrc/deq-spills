import react from '@vitejs/plugin-react';
import loadVersion from 'vite-plugin-package-version';
import { configDefaults, defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), loadVersion()],
  resolve: {
    // this is only applicable when pnpm-linking the utah-design-package
    dedupe: ['firebase', '@arcgis/core'],
  },
  test: {
    environment: 'happy-dom',
    exclude: [...configDefaults.exclude, 'functions/lib/**'],
    server: {
      deps: {
        // inline: ['@esri/calcite-components', '@arcgis/core'],
      },
    },
  },
});
