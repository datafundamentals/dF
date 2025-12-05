/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/* global console */

import summary from 'rollup-plugin-summary';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
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
  input: 'src/my-app.ts',
  output: {
    file: 'dist/bundle/df-lit-starter.js',
    format: 'esm',
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
  console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    replace({
      preventAssignment: true,
      delimiters: ['', ''],
      values: {
        'process.env.NODE_ENV': JSON.stringify(mode),
        'import.meta.env': `(${JSON.stringify(envObject)})`,
        'Reflect.decorate': 'undefined',
      },
    }),
    typescript({
      tsconfig: './tsconfig.json',
      outputToFilesystem: true,
      declaration: false,
    }),
    resolve(),
    /**
     * This minification setup serves the static site generation.
     * For bundling and minification, check the README.md file.
     */
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
    summary(),
  ],
};
