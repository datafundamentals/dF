import {defineConfig, devices} from 'playwright/test';

type WebServerConfig = {
  command: string;
  url: string;
  reuseExistingServer: boolean;
  timeout: number;
};

const PROJECT_WEB_SERVERS: Record<string, WebServerConfig> = {
  'df-npm-info-app': {
    command: 'pnpm --filter @df/df-npm-info-app run start:test',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  'df-teaching-app': {
    command: 'pnpm --filter @df/df-teaching-app run start:test',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  'df-lit-starter': {
    command: 'pnpm --filter @df/df-lit-starter run start:test',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  'df-firebase-teaching-app': {
    command: 'pnpm --filter @df/df-firebase-teaching-app run start:test',
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
};

function parseRequestedProjects(argv: string[]): string[] {
  const projects = new Set<string>();
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--project' || arg === '-p') {
      const value = argv[i + 1];
      if (value) {
        value.split(',').forEach((name) => projects.add(name));
      }
      i += 1;
      continue;
    }

    if (arg.startsWith('--project=') || arg.startsWith('-p=')) {
      const value = arg.split('=')[1];
      if (value) {
        value.split(',').forEach((name) => projects.add(name));
      }
    }
  }

  return [...projects];
}

const requestedProjects = parseRequestedProjects(process.argv);
const selectedWebServers = requestedProjects.length
  ? requestedProjects.flatMap((name) => PROJECT_WEB_SERVERS[name] ?? [])
  : Object.values(PROJECT_WEB_SERVERS);

export default defineConfig({
  testDir: '.',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', {open: 'never'}]] : [['list']],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'df-npm-info-app',
      testDir: 'apps/df-npm-info-app/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4173',
      },
    },
    {
      name: 'df-teaching-app',
      testDir: 'apps/df-teaching-app/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4174',
      },
    },
    {
      name: 'df-lit-starter',
      testDir: 'apps/df-lit-starter/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4175',
      },
    },
    {
      name: 'df-firebase-teaching-app',
      testDir: 'apps/df-firebase-teaching-app/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4176',
      },
    },
  ],
  webServer: selectedWebServers.length ? selectedWebServers : undefined,
});
