import {defineConfig, devices, type PlaywrightTestConfig} from 'playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type WebServerConfig = {
  command: string;
  url: string;
  reuseExistingServer: boolean;
  timeout: number;
};

function discoverApps() {
  const appsDir = path.join(__dirname, 'apps');
  const webServers: Record<string, WebServerConfig> = {};
  const projects: NonNullable<PlaywrightTestConfig['projects']> = [];

  if (!fs.existsSync(appsDir)) return {webServers, projects};

  const apps = fs.readdirSync(appsDir).filter((dir) => {
    return fs.statSync(path.join(appsDir, dir)).isDirectory();
  });

  for (const app of apps) {
    const pkgPath = path.join(appsDir, app, 'package.json');
    const viteConfigPath = path.join(appsDir, app, 'vite.config.ts');

    if (fs.existsSync(pkgPath) && fs.existsSync(viteConfigPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (pkg.scripts && pkg.scripts['start:test']) {
          const viteConfig = fs.readFileSync(viteConfigPath, 'utf-8');
          let portMatch = viteConfig.match(/port:\s*(\d+)/) || viteConfig.match(/const\s+PORT\s*=\s*(\d+)/);

          if (!portMatch) {
             // Fallback: Try to find port in package.json start:test script
             const startScript = pkg.scripts['start:test'];
             portMatch = startScript.match(/--port\s+(\d+)/);
          }

          if (portMatch) {
            const port = portMatch[1];
            const url = `http://127.0.0.1:${port}`;

            webServers[app] = {
              command: `pnpm --filter @df/${app} run start:test`,
              url,
              reuseExistingServer: true,
              timeout: 120_000,
            };

            projects.push({
              name: app,
              testDir: `apps/${app}/tests/integration`,
              use: {
                ...devices['Desktop Chrome'],
                baseURL: url,
              },
            });
          }
        }
      } catch (e) {
        console.warn(`Failed to parse config for app ${app}:`, e);
      }
    }
  }
  return {webServers, projects};
}

const {webServers: PROJECT_WEB_SERVERS, projects: DISCOVERED_PROJECTS} = discoverApps();

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
  projects: DISCOVERED_PROJECTS,
  webServer: selectedWebServers.length ? selectedWebServers : undefined,
});
