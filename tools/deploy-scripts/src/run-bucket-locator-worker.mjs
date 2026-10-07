#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {existsSync, unlinkSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';
import {
  createBucketLocatorWranglerConfigs,
  loadBucketLocatorDeploymentConfig,
} from './bucket-locator-deployment-config.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
const args = process.argv.slice(2).filter((arg) => arg !== '--');
const [action, workerTarget, ...flags] = args;
const isAccessConfirmed = flags.includes('--confirm-access-policy');
const isMigrationConfirmed = flags.includes('--apply-migrations');
const profile = loadBucketLocatorDeploymentConfig();

function usage() {
  console.log(`Usage:
  pnpm --filter @df/bucket-locator-worker dev [wrangler args]
  pnpm --filter @df/standard-pioneer-auth-worker dev [wrangler args]
  pnpm --filter @df/bucket-locator-worker preflight
  pnpm deploy:bucket-locator-workers <api|auth|all> --confirm-access-policy [--apply-migrations]`);
}

function run(commandArgs, cwd, stdio = 'inherit') {
  execFileSync('pnpm', ['exec', 'wrangler', ...commandArgs], {cwd, stdio});
}

function workerDirectory(target) {
  if (target === 'api') return join(root, 'services/workers/df-bucket-locator');
  if (target === 'auth') return join(root, 'services/workers/df-standard-pioneer-auth');
  throw new Error(`Unknown Worker target '${target}'`);
}

function createConfigFiles(environment, targets) {
  const workerConfigs = createBucketLocatorWranglerConfigs(profile, {environment});
  return targets.map((target) => {
    const directory = workerDirectory(target);
    const configPath = join(directory, 'wrangler.generated.jsonc');
    writeFileSync(configPath, `${JSON.stringify(workerConfigs[target], null, 2)}\n`);
    return {target, directory, configPath};
  });
}

function cleanupConfigFiles(files) {
  for (const file of files) {
    if (existsSync(file.configPath)) unlinkSync(file.configPath);
  }
}

function readWrangler(commandArgs, cwd) {
  return execFileSync('pnpm', ['exec', 'wrangler', ...commandArgs], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function assertRemoteResources() {
  const errors = [];
  const apiDirectory = workerDirectory('api');
  const whoami = readWrangler(['whoami'], apiDirectory);
  if (!whoami.toLowerCase().includes(profile.accountId.toLowerCase())) {
    throw new Error(`Wrangler is not authenticated to configured account ${profile.accountId}`);
  }

  const databases = JSON.parse(readWrangler(['d1', 'list', '--json'], apiDirectory));
  if (!profile.sharedStorage.d1DatabaseId) {
    const namedDatabase = databases.find((entry) => entry.name === profile.sharedStorage.d1DatabaseName);
    if (namedDatabase) {
      errors.push(`D1 '${profile.sharedStorage.d1DatabaseName}' exists; set its UUID (${namedDatabase.uuid ?? namedDatabase.database_id}) in the deployment profile`);
    } else {
      errors.push(`D1 '${profile.sharedStorage.d1DatabaseName}' is not provisioned; create/select the shared database and set its UUID in the deployment profile`);
    }
  } else {
    const database = databases.find((entry) =>
      entry.name === profile.sharedStorage.d1DatabaseName &&
      (entry.uuid ?? entry.database_id) === profile.sharedStorage.d1DatabaseId
    );
    if (!database) {
      errors.push(`D1 '${profile.sharedStorage.d1DatabaseName}' with configured UUID was not found in the configured account`);
    }
  }

  let buckets;
  try {
    buckets = readWrangler(['r2', 'bucket', 'list'], apiDirectory);
  } catch (error) {
    const details = `${error.stdout ?? ''}${error.stderr ?? ''}${error.message ?? ''}`;
    if (details.includes('10042') || details.toLowerCase().includes('enable r2')) {
      errors.push('R2 is not enabled for this Cloudflare account; enable R2 in the Dashboard, then create/select the shared photo bucket');
      buckets = '';
    } else {
      errors.push(`Could not verify R2 resources: ${details}`);
      buckets = '';
    }
  }
  if (buckets && !buckets.includes(profile.sharedStorage.r2BucketName)) {
    errors.push(`R2 bucket '${profile.sharedStorage.r2BucketName}' was not found in the configured account`);
  }
  if (errors.length) throw new Error(errors.join('\n- '));
}

function runPreflight() {
  try {
    assertRemoteResources();
  } catch (error) {
    console.error(`Cloudflare resource preflight failed: ${error.message}`);
    process.exitCode = 1;
    return;
  }
  console.log('Account, shared D1 database, and shared R2 bucket are present.');
  console.log('Still verify in the Cloudflare dashboard that Access policies on the configured API/auth routes allow exactly the approved users.');
}

function runDev(target) {
  const configFiles = createConfigFiles('local', [target]);
  const [{directory, configPath}] = configFiles;
  try {
    run(['dev', '--config', configPath, ...flags], directory);
  } finally {
    cleanupConfigFiles(configFiles);
  }
}

function runTypegen(target) {
  const configFiles = createConfigFiles('local', [target]);
  const [{directory, configPath}] = configFiles;
  try {
    run(['types', '--config', configPath], directory);
  } finally {
    cleanupConfigFiles(configFiles);
  }
}

function runLocalMigrations() {
  const configFiles = createConfigFiles('local', ['api']);
  const [{directory, configPath}] = configFiles;
  try {
    run([
      'd1', 'migrations', 'apply', profile.sharedStorage.d1DatabaseName,
      '--local', '--config', configPath,
      ...flags,
    ], directory);
  } finally {
    cleanupConfigFiles(configFiles);
  }
}

function runDeployment(target) {
  if (!isAccessConfirmed) {
    throw new Error('Before deploying, configure and verify the Cloudflare Access policy for both approved users, then pass --confirm-access-policy.');
  }
  if ((target === 'api' || target === 'all') && !isMigrationConfirmed) {
    throw new Error('Pass --apply-migrations to explicitly apply pending remote D1 migrations before API deployment.');
  }
  assertRemoteResources();
  const targets = target === 'all' ? ['api', 'auth'] : [target];
  const configFiles = createConfigFiles('production', targets);
  try {
    const apiConfig = configFiles.find((file) => file.target === 'api');
    if (apiConfig && isMigrationConfirmed) {
      run([
        'd1', 'migrations', 'apply', profile.sharedStorage.d1DatabaseName,
        '--remote', '--config', apiConfig.configPath,
      ], apiConfig.directory);
    }
    for (const file of configFiles) {
      run(['deploy', '--config', file.configPath], file.directory);
    }
  } finally {
    cleanupConfigFiles(configFiles);
  }
}

try {
  if (action === '--validate') {
    const {siteOrigin, routes, approvedUsers, sharedStorage} = profile;
    console.log(`Deployment profile is structurally valid for ${profile.siteOrigin}.`);
    console.log(`API route: ${new URL(routes.api.slice(1), siteOrigin).toString()}`);
    console.log(`Auth route: ${new URL(routes.auth.slice(1), siteOrigin).toString()}`);
    console.log(`Approved users: ${approvedUsers.join(', ')}`);
    if (!sharedStorage.d1DatabaseId) {
      console.log('Production Worker deployment blocked: sharedStorage.d1DatabaseId is not provisioned.');
      process.exitCode = 2;
    }
  } else if ((action === 'api' || action === 'auth') && workerTarget === 'dev') {
    runDev(action);
  } else if ((action === 'api' || action === 'auth') && workerTarget === 'typegen') {
    runTypegen(action);
  } else if (action === 'migrate-local') {
    runLocalMigrations();
  } else if (action === 'preflight') {
    runPreflight();
  } else if (action === 'deploy' && ['api', 'auth', 'all'].includes(workerTarget)) {
    runDeployment(workerTarget);
  } else {
    usage();
    process.exitCode = 2;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
