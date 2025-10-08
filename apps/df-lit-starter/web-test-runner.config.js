/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/* global console */

import {playwrightLauncher} from '@web/test-runner-playwright';

const mode = process.env.MODE || 'dev';
if (!['dev', 'prod'].includes(mode)) {
  throw new Error(`MODE must be "dev" or "prod", was "${mode}"`);
}

const plugins = [];
try {
  const {legacyPlugin} = await import('@web/dev-server-legacy');
  plugins.push(
    legacyPlugin({
      polyfills: {
        webcomponents: true,
        custom: [
          {
            name: 'lit-polyfill-support',
            path: 'node_modules/lit/polyfill-support.js',
            test: "!('attachShadow' in Element.prototype) || !('getRootNode' in Element.prototype) || window.ShadyDOM && window.ShadyDOM.force",
            module: false,
          },
        ],
      },
    })
  );
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code !== 'ERR_MODULE_NOT_FOUND') {
    throw error;
  }
  if (process.env.DEBUG_WTR_LEGACY) {
    console.info(
      'Skipping legacy polyfills; install @web/dev-server-legacy to restore legacy browser coverage.'
    );
  }
}

// Uncomment for testing on Sauce Labs
// Must run `npm i --save-dev @web/test-runner-saucelabs` and set
// SAUCE_USERNAME and SAUCE_USERNAME environment variables
// ===========
// import {createSauceLabsLauncher} from '@web/test-runner-saucelabs';
// const sauceLabsLauncher = createSauceLabsLauncher(
//   {
//     user: process.env.SAUCE_USERNAME,
//     key: process.env.SAUCE_USERNAME,
//   },
//   {
//     'sauce:options': {
//       name: 'unit tests',
//       build: `${process.env.GITHUB_REF ?? 'local'} build ${
//         process.env.GITHUB_RUN_NUMBER ?? ''
//       }`,
//     },
//   }
// );

// Uncomment for testing on BrowserStack
// Must run `npm i --save-dev @web/test-runner-browserstack` and set
// BROWSER_STACK_USERNAME and BROWSER_STACK_ACCESS_KEY environment variables
// ===========
// import {browserstackLauncher as createBrowserstackLauncher} from '@web/test-runner-browserstack';
// const browserstackLauncher = (config) => createBrowserstackLauncher({
//   capabilities: {
//     'browserstack.user': process.env.BROWSER_STACK_USERNAME,
//     'browserstack.key': process.env.BROWSER_STACK_ACCESS_KEY,
//     project: 'my-app',
//     name: 'unit tests',
//     build: `${process.env.GITHUB_REF ?? 'local'} build ${
//       process.env.GITHUB_RUN_NUMBER ?? ''
//     }`,
//     ...config,
//   }
// });

const browsers = {
  // Local browser testing via playwright
  // ===========
  chromium: playwrightLauncher({product: 'chromium'}),
  firefox: playwrightLauncher({product: 'firefox'}),
  webkit: playwrightLauncher({product: 'webkit'}),

  // Uncomment example launchers for running on Sauce Labs
  // ===========
  // chromium: sauceLabsLauncher({browserName: 'chrome', browserVersion: 'latest', platformName: 'Windows 10'}),
  // firefox: sauceLabsLauncher({browserName: 'firefox', browserVersion: 'latest', platformName: 'Windows 10'}),
  // safari: sauceLabsLauncher({browserName: 'safari', browserVersion: 'latest', platformName: 'macOS 10.15'}),

  // Uncomment example launchers for running on Sauce Labs
  // ===========
  // chromium: browserstackLauncher({browserName: 'Chrome', os: 'Windows', os_version: '10'}),
  // firefox: browserstackLauncher({browserName: 'Firefox', os: 'Windows', os_version: '10'}),
  // safari: browserstackLauncher({browserName: 'Safari', browser_version: '14.0', os: 'OS X', os_version: 'Big Sur'}),
};

// Prepend BROWSERS=x,y to `npm run test` to run a subset of browsers
// e.g. `BROWSERS=chromium,firefox npm run test`
const noBrowser = (b) => {
  throw new Error(`No browser configured named '${b}'; using defaults`);
};
let commandLineBrowsers;
try {
  commandLineBrowsers = process.env.BROWSERS?.split(',').map(
    (b) => browsers[b] ?? noBrowser(b)
  );
} catch (e) {
  console.warn(e);
}

// https://modern-web.dev/docs/test-runner/cli-and-configuration/
export default {
  rootDir: '.',
  hostname: '127.0.0.1',
  files: ['./dist/test/**/*_test.js'],
  nodeResolve: {exportConditions: mode === 'dev' ? ['development'] : []},
  preserveSymlinks: false,
  browsers: commandLineBrowsers ?? Object.values(browsers),
  testFramework: {
    // https://mochajs.org/api/mocha
    config: {
      ui: 'tdd',
      timeout: '60000',
    },
  },
  plugins,
};
