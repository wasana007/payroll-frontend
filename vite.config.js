import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  define: {
    global: 'window',
  },

  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8282',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  },
});
