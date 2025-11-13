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
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-teaching-app': {
    command: 'pnpm --filter @df/df-teaching-app run start:test',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-lit-starter': {
    command: 'pnpm --filter @df/df-lit-starter run start:test',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-firebase-teaching-app1': {
    command: 'pnpm --filter @df/df-firebase-teaching-app1 run start:test',
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-chat-tmp-test-app': {
    command: 'pnpm --filter @df/df-chat-tmp-test-app run start:test',
    url: 'http://127.0.0.1:4177',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-firebase-teaching-app2': {
    command: 'pnpm --filter @df/df-firebase-teaching-app2 run start:test',
    url: 'http://127.0.0.1:4182',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-app-starter-template': {
    command: 'pnpm --filter @df/df-app-starter-template run start:test',
    url: 'http://127.0.0.1:4183',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-firebase-teaching-app4': {
    command: 'pnpm --filter @df/df-firebase-teaching-app4 run start:test',
    url: 'http://127.0.0.1:4184',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-firebase-teaching-app5': {
    command: 'pnpm --filter @df/df-firebase-teaching-app5 run start:test',
    url: 'http://127.0.0.1:4185',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-auth-trigd-func-tool': {
    command: 'pnpm --filter @df/df-auth-trigd-func-tool run start:test',
    url: 'http://127.0.0.1:4184',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-activity-log': {
    command: 'pnpm --filter @df/df-activity-log run start:test',
    url: 'http://127.0.0.1:4180',
    reuseExistingServer: true,
    timeout: 120_000,
  },
  'df-chat-app': {
    command: 'pnpm --filter @df/df-chat-app run start:test',
    url: 'http://127.0.0.1:4181',
    reuseExistingServer: true,
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
      name: 'df-firebase-teaching-app1',
      testDir: 'apps/df-firebase-teaching-app1/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4176',
      },
    },
    {
      name: 'df-chat-tmp-test-app',
      testDir: 'apps/df-chat-tmp-test-app/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4177',
      },
    },
    {
      name: 'df-firebase-teaching-app2',
      testDir: 'apps/df-firebase-teaching-app2/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4182',
      },
    },
    {
      name: 'df-app-starter-template',
      testDir: 'apps/df-app-starter-template/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4183',
      },
    },
    {
      name: 'df-firebase-teaching-app4',
      testDir: 'apps/df-firebase-teaching-app4/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4184',
      },
    },
    {
      name: 'df-firebase-teaching-app5',
      testDir: 'apps/df-firebase-teaching-app5/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4185',
      },
    },
    {
      name: 'df-auth-trigd-func-tool',
      testDir: 'apps/df-auth-trigd-func-tool/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4184',
      },
    },
    {
      name: 'df-activity-log',
      testDir: 'apps/df-activity-log/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4180',
      },
    },
    {
      name: 'df-chat-app',
      testDir: 'apps/df-chat-app/tests/integration',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://127.0.0.1:4181',
      },
    },
  ],
  webServer: selectedWebServers.length ? selectedWebServers : undefined,
});
