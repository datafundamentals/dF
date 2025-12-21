import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  define: {
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`
      }
    }
  }
});
