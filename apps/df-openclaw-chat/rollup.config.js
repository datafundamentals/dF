import terser from '@rollup/plugin-terser';
import summary from 'rollup-plugin-summary';
import {visualizer} from 'rollup-plugin-visualizer';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
import {readFileSync} from 'node:fs';
import {resolve as resolvePath} from 'node:path';

dotenv.config({path: '.env.production'});
dotenv.config();

const firebaseEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_ENV',
  'VITE_SUPERUSER_EMAIL',
  'VITE_OPENCLAW_AGENTS',
];

const mode = process.env.MODE ?? process.env.NODE_ENV ?? 'production';
const rawMarkdownSuffix = '.md?raw';

const envObject = {
  MODE: mode,
  PROD: mode === 'production',
  DEV: mode !== 'production',
  VITE_USE_EMULATOR: process.env.VITE_USE_EMULATOR ?? 'false',
  VITE_FIREBASE_EMULATOR_UI: process.env.VITE_FIREBASE_EMULATOR_UI,
  ...Object.fromEntries(firebaseEnvKeys.map((key) => [key, process.env[key]])),
};

function rawMarkdown() {
  return {
    name: 'raw-markdown',
    resolveId(source) {
      if (!source.endsWith(rawMarkdownSuffix)) {
        return null;
      }

      return source;
    },
    load(id) {
      if (!id.endsWith(rawMarkdownSuffix)) {
        return null;
      }

      const markdownPath = resolvePath('src', id.slice(0, -'?raw'.length));
      const markdown = readFileSync(markdownPath, 'utf8');
      return `export default ${JSON.stringify(markdown)};`;
    },
  };
}

export default {
  input: 'dist/main.js',
  output: {
    file: 'dist/bundle/df-openclaw-chat.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    rawMarkdown(),
    resolve(),
    replace({
      preventAssignment: true,
      delimiters: ['', ''],
      values: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        'import.meta.env': `(${JSON.stringify(envObject)})`,
      },
    }),
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
    }),
    summary({
      showBrotliSize: true,
      showGzippedSize: true,
    }),
    visualizer({
      filename: 'dist/bundle/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
};
