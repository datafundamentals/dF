import {defineConfig} from 'vite';
import {resolve} from 'node:path';

const distEntry = './dist/df-practice-app.js';
const sourceEntry = '/src/df-practice-app.ts';

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
      name: 'df-practice-entry',
      apply: 'serve',
      transformIndexHtml(html) {
        return html.replace(distEntry, sourceEntry);
      },
    },
  ],
});
