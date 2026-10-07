import terser from '@rollup/plugin-terser';
import summary from 'rollup-plugin-summary';
import {visualizer} from 'rollup-plugin-visualizer';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  loadBucketLocatorDeploymentConfig,
  publicBucketLocatorConfig,
} from '../../tools/deploy-scripts/src/bucket-locator-deployment-config.mjs';

const appDirectory = dirname(fileURLToPath(import.meta.url));
const mode = process.env.MODE ?? process.env.NODE_ENV ?? 'production';
const deploymentConfig = loadBucketLocatorDeploymentConfig();
const envObject = {
  MODE: mode,
  PROD: mode === 'production',
  DEV: mode !== 'production',
  VITE_BUCKET_LOCATOR_BACKEND_ORIGIN: publicBucketLocatorConfig(deploymentConfig).backendOrigin,
};

export default {
  input: 'dist/main.js',
  output: {
    file: 'dist/bundle/df-bucket-locator.js',
    format: 'es',
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
        'Reflect.decorate': 'undefined',
      },
    }),
    terser({ecma: 2021, module: true, warnings: true}),
    summary({showBrotliSize: true, showGzippedSize: true}),
    visualizer({
      filename: 'dist/bundle/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') console.error(`(!) ${warning.message}`);
  },
};