import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The project is built from a local mirror whose src/ is a junction to the
  // Google-Drive source. Keep the mirror's paths instead of resolving the
  // junction back to G:\, so node_modules resolves on the local disk.
  resolve: { preserveSymlinks: true },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    globals: true,
  },
});
