import {defineConfig} from 'vite';
import {resolve} from 'node:path';

const distEntry = './dist/df-npm-info-app.js';
const sourceEntry = '/src/df-npm-info-app.ts';

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
  plugins: [
    {
      name: 'df-npm-info-entry',
      apply: 'serve',
      transformIndexHtml(html) {
        return html.replace(distEntry, sourceEntry);
      },
    },
  ],
});
