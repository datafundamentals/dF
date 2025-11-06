import terser from '@rollup/plugin-terser';
import summary from 'rollup-plugin-summary';
import {visualizer} from 'rollup-plugin-visualizer';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

export default {
  input: 'dist/main.js',
  output: {
    file: 'dist/bundle/df-chat-app.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
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