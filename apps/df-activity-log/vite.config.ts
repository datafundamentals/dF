import {defineConfig} from 'vite';
import {resolve} from 'node:path';

const distEntry = './dist/main.js';
const sourceEntry = '/src/main.ts';

export default defineConfig({
  publicDir: resolve(__dirname, '../../public'),
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'DfActivityLog',
      fileName: 'df-activity-log.bundled',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
    minify: 'terser',
    terserOptions: {
      ecma: 2020,
      module: true,
      compress: {
        passes: 2,
        drop_console: false,
        drop_debugger: true,
      },
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 4180,
  },
  preview: {
    host: '127.0.0.1',
    port: 4180,
  },
  plugins: [
    {
      name: 'df-activity-log-entry',
      apply: 'serve',
      transformIndexHtml(html) {
        return html.replace(distEntry, sourceEntry);
      },
    },
  ],
});
