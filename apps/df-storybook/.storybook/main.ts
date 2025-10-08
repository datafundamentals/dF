import {mergeConfig} from 'vite';
import {fileURLToPath, URL} from 'node:url';
import type {StorybookConfig} from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  staticDirs: [
    fileURLToPath(new URL('../../../public', import.meta.url)),
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (baseConfig) =>
    mergeConfig(baseConfig, {
      resolve: {
        alias: {
          '@df/ui-lit': fileURLToPath(
            new URL('../../../packages/ui-lit/src', import.meta.url),
          ),
          '@df/state': fileURLToPath(
            new URL('../../../packages/state/src/index.ts', import.meta.url),
          ),
          '@df/types': fileURLToPath(
            new URL('../../../packages/types/src/index.ts', import.meta.url),
          ),
          '@df/utils': fileURLToPath(
            new URL('../../../packages/utils/src/index.ts', import.meta.url),
          ),
        },
      },
    }),
};

export default config;
