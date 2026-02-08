#!/usr/bin/env node
/**
 * Creates a release bundle for an app
 * 1. Runs build:rollup to create the bundle
 * 2. Writes .bundle-manifest.json with YYMMDDHHMM tag
 *
 * Usage: pnpm bundle:release <app-name>
 * Example: pnpm bundle:release df-chat-app
 */
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../../');
const APPS_DIR = join(PROJECT_ROOT, 'apps');

/**
 * Generate YYMMDDHHMM tag from current date/time
 * @returns {string} Tag like "2602061430"
 */
function generateBundleTag() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yy}${mm}${dd}${hh}${min}`;
}

function getAvailableApps() {
  if (!existsSync(APPS_DIR)) return [];
  return readdirSync(APPS_DIR).filter((file) => {
    return file.startsWith('df-') && statSync(join(APPS_DIR, file)).isDirectory();
  });
}

function printUsage(missing = '') {
  if (missing) {
    console.log(`❌ Error: ${missing}`);
    console.log('');
  }
  console.log('Usage: pnpm bundle:release <app-name>');
  console.log('');
  console.log('This command:');
  console.log('  1. Runs build:rollup to create the bundle');
  console.log('  2. Writes .bundle-manifest.json with a YYMMDDHHMM tag');
  console.log('');
  console.log('Example:');
  console.log('  pnpm bundle:release df-chat-app');
  console.log('');
  console.log('Available apps:');
  getAvailableApps().forEach((app) => console.log(`  - ${app}`));
  console.log('');
}

const args = process.argv.slice(2);
if (args.length < 1) {
  printUsage('App name required');
  process.exit(1);
}

const appName = args[0];
const appDir = join(APPS_DIR, appName);

// Validate app exists
if (!existsSync(appDir)) {
  printUsage(`App '${appName}' not found`);
  process.exit(1);
}

// Step 1: Run build:rollup
console.log(`📦 Building bundle for ${appName}...`);
console.log('');

try {
  execSync(`pnpm --filter @df/${appName} build:rollup`, {
    stdio: 'inherit',
    cwd: PROJECT_ROOT,
  });
} catch {
  console.log('');
  console.log('❌ Build failed.');
  process.exit(1);
}

// Step 2: Write manifest
const bundleDir = join(appDir, 'dist', 'bundle');
const manifestPath = join(bundleDir, '.bundle-manifest.json');

if (!existsSync(bundleDir)) {
  console.log(`❌ Error: Bundle directory not found: ${bundleDir}`);
  console.log('Build may have failed.');
  process.exit(1);
}

const bundleTag = generateBundleTag();
const manifest = {
  bundleTag,
  createdAt: new Date().toISOString(),
  appName,
};

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log('');
console.log('✅ Release bundle created!');
console.log(`   App: ${appName}`);
console.log(`   Tag: ${bundleTag}`);
console.log(`   Manifest: ${manifestPath}`);
console.log('');
