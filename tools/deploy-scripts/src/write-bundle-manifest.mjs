#!/usr/bin/env node
/**
 * Writes a .bundle-manifest.json file to an app's dist/bundle/ directory
 * Records the YYMMDDHHMM timestamp of when the bundle was created
 *
 * Usage: node write-bundle-manifest.mjs <app-name>
 * Example: node write-bundle-manifest.mjs df-chat-app
 */
import { existsSync, writeFileSync } from 'node:fs';
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

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log('Usage: node write-bundle-manifest.mjs <app-name>');
  console.log('Example: node write-bundle-manifest.mjs df-chat-app');
  process.exit(1);
}

const appName = args[0];
const bundleDir = join(APPS_DIR, appName, 'dist', 'bundle');
const manifestPath = join(bundleDir, '.bundle-manifest.json');

// Validate bundle directory exists
if (!existsSync(bundleDir)) {
  console.log(`❌ Error: Bundle directory not found: ${bundleDir}`);
  console.log('Run build:rollup first to create the bundle.');
  process.exit(1);
}

const bundleTag = generateBundleTag();
const manifest = {
  bundleTag,
  createdAt: new Date().toISOString(),
  appName,
};

writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

console.log(`✅ Bundle manifest written: ${manifestPath}`);
console.log(`   Tag: ${bundleTag}`);
