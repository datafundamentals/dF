import {legacyPlugin} from '@web/dev-server-legacy';

export default {
  nodeResolve: true,
  preserveSymlinks: true,
  plugins: [
    legacyPlugin({
      polyfills: {
        webcomponents: false,
      },
    }),
  ],
};
