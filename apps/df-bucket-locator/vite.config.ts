import {defineConfig} from 'vite';

const PORT = 4178;

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: PORT,
    proxy: {
      '/api': 'http://127.0.0.1:8788',
      '/cf-auth': 'http://127.0.0.1:8787',
      '/cdn-cgi': 'http://127.0.0.1:8787',
    },
  },
  preview: {host: '127.0.0.1', port: PORT},
});