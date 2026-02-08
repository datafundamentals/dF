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

/**
 * Generate YYMMDDHHMM tag from current date/time
 * Used as fallback if no bundle manifest exists
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

// Parse .env.deploy files (simple key=value parser)
function parseEnvFile(filePath) {
  const env = {};
  if (!existsSync(filePath)) return env;

  try {
    const content = readFileSync(filePath, 'utf-8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) return;
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
  } catch (err) {
    // Silently ignore parse errors
  }

  return env;
}

// Merge env configs: global defaults + app-specific overrides
function loadEnvConfig(appDir) {
  const globalEnv = parseEnvFile(join(PROJECT_ROOT, '.env.deploy'));
  const appEnv = parseEnvFile(join(appDir, '.env.deploy'));
  // App-level values override global defaults
  return { ...globalEnv, ...appEnv };
}

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

function printUsage(missing = '') {
  if (missing) {
    console.log(`❌ Error: ${missing}`);
    console.log('');
  }
  console.log('Usage: pnpm deploy:copy-bundle <app-name> [target-path]');
  console.log('');
  console.log('Arguments:');
  console.log('  <app-name>   Required. App folder name (e.g., df-firebase-teaching-app)');
  console.log('  [target-path] Optional. Override DEFAULT_MPA_PATH from .env.deploy');
  console.log('');
  console.log('Examples:');
  console.log('  pnpm deploy:copy-bundle df-app-starter-template');
  console.log('    (uses DEFAULT_MPA_PATH from .env.deploy)');
  console.log('');
  console.log('  pnpm deploy:copy-bundle df-app-starter-template ../my-11ty-site/public/app');
  console.log('    (uses explicit path, overrides .env.deploy)');
  console.log('');
  console.log('Available apps:');
  getAvailableApps().forEach(app => console.log(`  - ${app}`));
  console.log('');
}

const args = process.argv.slice(2);
if (args.length < 1) {
  printUsage('At least one parameter required: <app-name>');
  process.exit(1);
}

const appName = args[0];
const targetPathRaw = args[1]; // May be undefined
const appDir = join(APPS_DIR, appName);
const sourceDir = join(appDir, 'dist');

// Load environment configuration (global + app-specific overrides)
const envConfig = loadEnvConfig(appDir);

// Determine target path: explicit arg > env config > error
let targetBasePath;
if (targetPathRaw) {
  targetBasePath = resolve(process.cwd(), targetPathRaw);
} else if (envConfig.DEFAULT_MPA_PATH) {
  targetBasePath = resolve(PROJECT_ROOT, envConfig.DEFAULT_MPA_PATH);
} else {
  printUsage('Missing target path: provide as argument or set DEFAULT_MPA_PATH in .env.deploy');
  process.exit(1);
}

// Each app gets its own subdirectory to avoid collisions in MPA
const targetPath = join(targetBasePath, appName);
console.log(`📍 Target app directory: ${targetPath}`);

// Validate app exists
if (!existsSync(appDir)) {
  console.log(`❌ Error: App '${appName}' not found`);
  console.log('');
  console.log('Available apps:');
  getAvailableApps().forEach(app => console.log(`  - ${app}`));
  process.exit(1);
}

// Validate app has package.json with build script
const pkgJsonPath = join(appDir, 'package.json');
if (!existsSync(pkgJsonPath)) {
  console.log(`❌ Error: ${pkgJsonPath} not found`);
  process.exit(1);
}

const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
const hasRollup = pkgJson.scripts && pkgJson.scripts['build:rollup'];

// Determine source directory based on build type
// Rollup builds to dist/bundle, Vite builds to dist
const buildSourceDir = hasRollup ? join(appDir, 'dist/bundle') : join(appDir, 'dist');

// Validate bundle exists (must run bundle:release first)
if (!existsSync(buildSourceDir)) {
  console.log(`❌ Error: No bundle found at ${buildSourceDir}`);
  console.log('');
  console.log('Run "pnpm bundle:release ' + appName + '" first to create a release bundle.');
  process.exit(1);
}

// Validate bundle manifest exists (ensures this is an intentional release)
const bundleManifestPath = join(buildSourceDir, '.bundle-manifest.json');
if (!existsSync(bundleManifestPath)) {
  console.log(`❌ Error: No bundle manifest found at ${bundleManifestPath}`);
  console.log('');
  console.log('The bundle exists but has no release manifest.');
  console.log('Run "pnpm bundle:release ' + appName + '" to create a proper release bundle.');
  process.exit(1);
}

// Validate MPA bundle templates exist
const bundleInnerPath = join(appDir, '_bundle/inner.html');
const bundleOuterPath = join(appDir, '_bundle/outer.html');

if (!existsSync(bundleInnerPath)) {
  console.log(`❌ Error: Missing MPA template: ${bundleInnerPath}`);
  console.log('');
  console.log('MPA deployments require _bundle/inner.html and _bundle/outer.html templates.');
  console.log('Copy these from an existing app (e.g., df-chat-app) or create them manually.');
  console.log('');
  console.log('See guides/STANDARDS_STYLES.md for MPA deployment patterns.');
  process.exit(1);
}

if (!existsSync(bundleOuterPath)) {
  console.log(`❌ Error: Missing MPA template: ${bundleOuterPath}`);
  console.log('');
  console.log('MPA deployments require _bundle/inner.html and _bundle/outer.html templates.');
  console.log('Copy these from an existing app (e.g., df-chat-app) or create them manually.');
  console.log('');
  console.log('See guides/STANDARDS_STYLES.md for MPA deployment patterns.');
  process.exit(1);
}

// Create target directory if needed
if (!existsSync(targetPath)) {
  mkdirSync(targetPath, { recursive: true });
}

// Copy bundle files (JS, maps, stats)
console.log(`📋 Copying from ${buildSourceDir} to ${targetPath}...`);
cpSync(buildSourceDir, targetPath, { recursive: true });

// Copy and transform inner.html to app root
console.log(`📋 Copying inner.html to ${targetPath}...`);
let innerContent = readFileSync(bundleInnerPath, 'utf-8');
// Remove HTML comments
innerContent = innerContent.replace(/<!--[\s\S]*?-->/g, '');
// Replace entire <script type="module"> tag with correct src
// This is robust to placeholder text changes and whitespace variations
const transformedInnerContent = innerContent.replace(
  /<script[^>]*type="module"[^>]*>\s*<\/script>/,
  `<script type="module" src="./${appName}.js"></script>`
);
writeFileSync(join(targetPath, 'inner.html'), transformedInnerContent);

// Create move-me/{app-name}/ directory structure
const moveMeDir = join(targetPath, 'move-me', appName);
mkdirSync(moveMeDir, { recursive: true });

// Read outer.html template and rewrite iframe src and height with config values
console.log(`📋 Creating index.html in move-me/${appName}/...`);
let outerContent = readFileSync(bundleOuterPath, 'utf-8');
// Remove HTML comments
outerContent = outerContent.replace(/<!--[\s\S]*?-->/g, '');

// Get values from env config (app override takes precedence over global)
const mpaPath = envConfig.DEFAULT_MPA_PATH || '';
const iframeHeight = envConfig.BUNDLE_IFRAME_HEIGHT || '600px';

// Extract web path from DEFAULT_MPA_PATH
// DEFAULT_MPA_PATH is monorepo-relative (e.g., ../sites/btrg/static/wc)
// We need the web-absolute path (e.g., /static/wc)
// Extract everything from /static/ onwards
const webPathMatch = mpaPath.match(/\/static\/.*/);
const webPath = webPathMatch ? webPathMatch[0] : mpaPath;

// Build the actual src path: web-absolute path + app name + inner.html
const iframeSrc = `${webPath}/${appName}/inner.html`;

// Replace template placeholders with actual values
// These regexes are robust to changes in placeholder text and whitespace
let indexContent = outerContent
  // Replace iframe src attribute with actual deployment path
  .replace(
    /src="[^"]*"/,
    `src="${iframeSrc}"`
  )
  // Replace iframe height attribute with actual configured height
  .replace(
    /height="[^"]*"/,
    `height="${iframeHeight}"`
  );

writeFileSync(join(moveMeDir, 'index.html'), indexContent);

// Copy example integration file if it exists and update the script hash
const exampleFile = join(appDir, 'guides/example-integration.html');
if (existsSync(exampleFile)) {
  const targetExampleName = `example-${appName}-integration.html`;
  const targetExampleFile = join(targetPath, targetExampleName);
  cpSync(exampleFile, targetExampleFile);

  // Only try to update hash if we are using Vite (build:bundle)
  if (!hasRollup) {
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
        console.log(`📄 Copied ${targetExampleName} (updated script hash to ${actualHash})`);
      } else {
        console.log(`📄 Copied ${targetExampleName} (warning: could not detect script hash)`);
      }
    }
  } else {
     // For Rollup, update the script tag to point to the simple bundle name
     let exampleContent = readFileSync(targetExampleFile, 'utf-8');
     // Replace the old hashed path with the new simple path
     // Matches ./assets/index-....js OR just assets/index-....js
     exampleContent = exampleContent.replace(/(\.\/)?assets\/index-[^"]*\.js/g, `./${appName}.js`);
     writeFileSync(targetExampleFile, exampleContent);
     console.log(`📄 Copied ${targetExampleName} (updated script source to ./${appName}.js)`);
  }
}

// Read bundle manifest (already validated to exist at script start)
const bundleManifest = JSON.parse(readFileSync(bundleManifestPath, 'utf-8'));
const bundleTag = bundleManifest.bundleTag;
console.log(`📋 Deploying release: tag ${bundleTag}`);

// Write deploy manifest to target
const deployManifest = {
  deployedTag: bundleTag,
  deployedAt: new Date().toISOString(),
  appName,
  sourceBundle: buildSourceDir,
};
const deployManifestPath = join(targetPath, '.deploy-manifest.json');
writeFileSync(deployManifestPath, JSON.stringify(deployManifest, null, 2) + '\n');
console.log(`📋 Deploy manifest written: ${deployManifestPath}`);

// Show what was copied
console.log('');
console.log('✅ Bundle deployment complete!');
console.log('');
console.log('Deployment structure created:');
console.log(`  ${targetPath}/`);
console.log(`    ├── inner.html                    (iframe inner - component + script)`);
console.log(`    ├── ${appName}.js                 (main bundle)`);
console.log(`    ├── ${appName}.js.map             (source map)`);
console.log(`    ├── stats.html                    (bundle analysis)`);
console.log(`    └── move-me/`);
console.log(`        └── ${appName}/`);
console.log(`            └── index.html            (ready to deploy - move this folder to production)`);
console.log('');
console.log('📋 Next steps:');
console.log(`  1. Review: ${join(moveMeDir, 'index.html')}`);
console.log(`  2. Copy: move-me/${appName}/ → your 11ty site structure`);
console.log(`  3. The iframe src is absolute: /static/wc/${appName}/inner.html`);
console.log('');
console.log('All files in app directory:');
try {
  const files = readdirSync(targetPath);
  files.slice(0, 15).forEach(file => console.log(`  - ${file}`));
  if (files.length > 15) console.log(`  ... and ${files.length - 15} more`);
} catch {
  console.log('Error listing files');
}
console.log('');
