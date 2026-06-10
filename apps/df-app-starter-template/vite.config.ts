import {defineConfig} from 'vite';
import {resolve} from 'node:path';

const distEntry = './dist/main.js';
const sourceEntry = '/src/main.ts';
const PORT = 4177;

export default defineConfig({
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
    },
  },
  optimizeDeps: {
    entries: [resolve(__dirname, 'index.html')],
  },
  publicDir: resolve(__dirname, '../../public'),
  server: {
    host: '127.0.0.1',
    port: PORT,
  },
  preview: {
    host: '127.0.0.1',
    port: PORT,
  },
  /**
   * Environment file loading configuration
   *
   * Vite loads environment files in this order:
   * 1. .env.local (developer overrides, .gitignored)
   * 2. .env.development (development defaults) – NOT USED; we use .env instead
   * 3. .env (shared defaults for all environments)
   *
   * For this app:
   * - .env contains dev defaults (VITE_USE_EMULATOR=true for emulator-first DX)
   * - .env.local can override to test cloud Firebase
   *
   * For production builds:
   * - Use .env.production instead of .env
   * - No .env.development file needed
   */
  envDir: '.',
  envPrefix: 'VITE_',
  plugins: [
    {
      name: 'df-firebase-teaching-entry',
      apply: 'serve',
      transformIndexHtml(html) {
        return html.replace(distEntry, sourceEntry);
      },
    },
  ],
});
