import {defineConfig} from 'vite';
import {resolve} from 'node:path';

const distEntry = './dist/main.js';
const sourceEntry = '/src/main.ts';

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
    port: 4176,
  },
  preview: {
    host: '127.0.0.1',
    port: 4176,
  },
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
