import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import {enforceMD3Rule} from './packages/config/eslint-rules/enforce-md3.js';

const md3Plugin = {
  rules: {
    'enforce-md3': enforceMD3Rule,
  },
};

export default [
  // Base configuration for all files
  js.configs.recommended,

  // TypeScript configuration
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Core TypeScript rules
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '^_'}],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',

      // General rules
      'no-prototype-builtins': 'off',
    },
  },

  // MD3 enforcement for UI components
  {
    files: [
      'packages/ui-lit/src/**/*.ts',
      'apps/df-firebase-teaching-app1/src/**/*.ts',
      'apps/df-firebase-teaching-app2/src/**/*.ts',
      'apps/df-firebase-teaching-app3/src/**/*.ts',
      'apps/df-firebase-teaching-app4/src/**/*.ts',
      'apps/df-firebase-teaching-app5/src/**/*.ts',
    ],
    ignores: [
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/*.stories.ts',
      '**/*.testing-guide.ts',
      '**/*.md.ts',
    ],
    plugins: {
      '@df/md3': md3Plugin,
    },
    rules: {
      '@df/md3/enforce-md3': 'error',
    },
  },

  // Browser environment for UI packages
  {
    files: ['packages/ui-lit/**/*.ts', 'apps/lit-starter/**/*.ts'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        HTMLElement: 'readonly',
        customElements: 'readonly',
      },
    },
  },

  // Node environment for config files
  {
    files: ['**/*.config.js', '**/*.config.mjs', '**/rollup.config.js', '**/web-test-runner.config.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
      },
    },
  },

  // Test files - relax some rules
  {
    files: ['**/*_test.ts', '**/*.test.ts', '**/*.spec.ts', '**/test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  // Storybook specific
  {
    files: ['apps/storybook/**/*.ts', 'apps/storybook/**/*.tsx'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
  },
];
