import {defineConfig} from 'vite';
import {resolve} from 'node:path';

const distEntry = './dist/main.js';
const sourceEntry = '/src/main.ts';

export default defineConfig({
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html'),
      output: {
        inlineDynamicImports: true,
      },
    },
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'DfChatApp',
      fileName: 'df-chat-app.bundled',
      formats: ['es'],
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
  optimizeDeps: {
    entries: [resolve(__dirname, 'index.html')],
  },
  publicDir: resolve(__dirname, '../../public'),
  server: {
    host: '127.0.0.1',
    port: 4181,
  },
  preview: {
    host: '127.0.0.1',
    port: 4181,
  },
  plugins: [
    {
      name: 'df-chat-app-entry',
      apply: 'serve',
      transformIndexHtml(html) {
        return html.replace(distEntry, sourceEntry);
      },
    },
  ],
});
