import terser from '@rollup/plugin-terser';
import summary from 'rollup-plugin-summary';
import {visualizer} from 'rollup-plugin-visualizer';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';

dotenv.config({path: '.env.production'});
dotenv.config();

const mode = process.env.MODE ?? process.env.NODE_ENV ?? 'production';

const envObject = {
  MODE: mode,
  PROD: mode === 'production',
  DEV: mode !== 'production',
  VITE_USE_EMULATOR: process.env.VITE_USE_EMULATOR ?? 'false',
  VITE_FIREBASE_EMULATOR_UI: process.env.VITE_FIREBASE_EMULATOR_UI,
};

export default {
  input: 'dist/df-npm-info-app.js',
  output: {
    file: 'dist/bundle/df-npm-info-app.js',
    format: 'esm',
    sourcemap: true,
    inlineDynamicImports: true,
  },
  plugins: [
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
