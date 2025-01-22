import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
  },
  publicDir: 'public',
  test: {
    root: '.',
    include: ['tests/**/*.test.js', 'tests/**/*.spec.js'],
    environment: "node",
  }
});
