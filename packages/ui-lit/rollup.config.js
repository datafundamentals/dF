import summary from 'rollup-plugin-summary';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';
import {visualizer} from 'rollup-plugin-visualizer';

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
];

const mode = process.env.MODE ?? process.env.NODE_ENV ?? 'production';

const envObject = {
  MODE: mode,
  PROD: mode === 'production',
  DEV: mode !== 'production',
  VITE_USE_EMULATOR: process.env.VITE_USE_EMULATOR ?? 'false',
  VITE_FIREBASE_EMULATOR_UI: process.env.VITE_FIREBASE_EMULATOR_UI,
  ...Object.fromEntries(firebaseEnvKeys.map((key) => [key, process.env[key]])),
};

const commonPlugins = [
  replace({
    preventAssignment: true,
    delimiters: ['', ''],
    values: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env': `(${JSON.stringify(envObject)})`,
      'Reflect.decorate': 'undefined',
    },
  }),
  resolve(),
  terser({
    ecma: 2021,
    module: true,
    warnings: true,
    mangle: {
      properties: {
        regex: /^__/,
      },
    },
  }),
  summary({
    showBrotliSize: true,
    showGzippedSize: true,
  }),
];

function onwarn(warning) {
  if (warning.code !== 'THIS_IS_UNDEFINED') {
    console.error(`(!) ${warning.message}`);
  }
}

/* global console */
export default [
  {
    input: 'dist/df-auth-wrapper.js',
    output: {
      file: 'dist/df-auth-wrapper.bundled.js',
      format: 'esm',
    },
    onwarn,
    plugins: commonPlugins,
  },
  {
    input: 'dist/df-dashboard.js',
    output: {
      file: 'dist/df-dashboard.bundled.js',
      format: 'esm',
    },
    onwarn,
    plugins: commonPlugins,
  },
];
