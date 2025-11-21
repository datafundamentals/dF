#!/usr/bin/env node
/* global console */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, cpSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '../../../');
const APPS_DIR = join(PROJECT_ROOT, 'apps');

function runCommand(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', cwd: PROJECT_ROOT, ...options });
    return true;
  } catch {
    return false;
  }
}

function getAvailableApps() {
  if (!existsSync(APPS_DIR)) return [];
  return readdirSync(APPS_DIR).filter(file => {
    return file.startsWith('df-') && statSync(join(APPS_DIR, file)).isDirectory();
  });
}

function printUsage() {
  console.log('❌ Error: Two parameters required');
  console.log('');
  console.log('Usage: node copy-app-bundle.mjs <app-name> <target-path>');
  console.log('');
  console.log('Examples:');
  console.log('  node copy-app-bundle.mjs df-firebase-teaching-app ../my-11ty-site/public/firebase-app');
  console.log('  node copy-app-bundle.mjs df-npm-info-app /Users/pete/sites/blog/static/demos/npm-info');
  console.log('');
  console.log('Available apps:');
  getAvailableApps().forEach(app => console.log(`  - ${app}`));
  console.log('');
}

const args = process.argv.slice(2);
if (args.length < 2) {
  printUsage();
  process.exit(1);
}

const [appName, targetPathRaw] = args;
const targetPath = resolve(process.cwd(), targetPathRaw); // Resolve target relative to where command is run
const appDir = join(APPS_DIR, appName);
const sourceDir = join(appDir, 'dist');

// Validate app exists
if (!existsSync(appDir)) {
  console.log(`❌ Error: App '${appName}' not found`);
  console.log('');
  console.log('Available apps:');
  getAvailableApps().forEach(app => console.log(`  - ${app}`));
  process.exit(1);
}

// Validate app has package.json with build:bundle script
const pkgJsonPath = join(appDir, 'package.json');
if (!existsSync(pkgJsonPath)) {
  console.log(`❌ Error: ${pkgJsonPath} not found`);
  process.exit(1);
}

const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
if (!pkgJson.scripts || !pkgJson.scripts['build:bundle']) {
  console.log(`❌ Error: App '${appName}' does not have a 'build:bundle' script`);
  console.log('');
  console.log(`Add to ${pkgJsonPath}:`);
  console.log('  "scripts": {');
  console.log('    "build:bundle": "vite build --mode production"');
  console.log('  }');
  process.exit(1);
}

// Build fresh bundle
console.log(`📦 Building fresh bundle for ${appName}...`);
const buildSuccess = runCommand(`pnpm --filter "@df/${appName}" build:bundle`);
if (!buildSuccess) {
  console.log('❌ Build failed.');
  process.exit(1);
}

// Validate source exists
if (!existsSync(sourceDir)) {
  console.log(`❌ Error: ${sourceDir} not found after build`);
  console.log('Build may have failed. Check output above.');
  process.exit(1);
}

// Create target directory if needed
if (!existsSync(targetPath)) {
  mkdirSync(targetPath, { recursive: true });
}

// Copy files
console.log(`📋 Copying to ${targetPath}...`);
cpSync(sourceDir, targetPath, { recursive: true });

// Copy example integration file if it exists and update the script hash
const exampleFile = join(appDir, 'guides/example-integration.html');
if (existsSync(exampleFile)) {
  const targetExampleFile = join(targetPath, 'example-integration.html');
  cpSync(exampleFile, targetExampleFile);

  // Extract the actual script hash from the built index.html
  const builtIndex = join(targetPath, 'index.html');
  if (existsSync(builtIndex)) {
    const indexContent = readFileSync(builtIndex, 'utf-8');
    const match = indexContent.match(/assets\/index-[^"]*\.js/);
    
    if (match) {
      const actualHash = match[0];
      let exampleContent = readFileSync(targetExampleFile, 'utf-8');
      exampleContent = exampleContent.replace(/assets\/index-[^"]*\.js/g, actualHash);
      writeFileSync(targetExampleFile, exampleContent);
      console.log(`📄 Copied example-integration.html (updated script hash to ${actualHash})`);
    } else {
      console.log('📄 Copied example-integration.html (warning: could not detect script hash)');
    }
  } else {
    console.log('📄 Copied example-integration.html');
  }
}

// Show what was copied
console.log('');
console.log('✅ Bundle copied successfully!');
console.log('');
console.log('Files in target:');
try {
  const files = readdirSync(targetPath);
  files.slice(0, 10).forEach(file => console.log(file));
  if (files.length > 10) console.log('...');
} catch (e) {
  console.log('Error listing files');
}
console.log('');
