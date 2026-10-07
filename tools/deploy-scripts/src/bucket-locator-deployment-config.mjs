import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../../');
export const deploymentConfigPath = resolve(
  projectRoot,
  'services/workers/df-bucket-locator/deployment/production.json'
);

export function loadBucketLocatorDeploymentConfig(path = deploymentConfigPath) {
  let config;
  try {
    config = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`Cannot load Bucket Locator deployment config at ${path}: ${error.message}`);
  }
  validateBucketLocatorDeploymentConfig(config);
  return config;
}

export function validateBucketLocatorDeploymentConfig(config, options = {}) {
  const errors = [];
  rejectUnknownKeys(config, [
    'schemaVersion', 'accountId', 'siteOrigin', 'approvedUsers', 'routes', 'workers',
    'localDevelopment', 'sharedStorage',
  ], 'deployment profile', errors);
  if (config?.schemaVersion !== 1) errors.push('schemaVersion must be 1');

  const origin = parseOrigin(config?.siteOrigin, errors);
  if (!isCloudflareId(config?.accountId)) errors.push('accountId must be a 32-character Cloudflare account ID');

  const approvedUsers = config?.approvedUsers;
  if (!Array.isArray(approvedUsers) || approvedUsers.length !== 2) {
    errors.push('approvedUsers must contain exactly two email addresses');
  } else if (approvedUsers.some((email) => typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.push('approvedUsers contains an invalid email address');
  }

  const routes = config?.routes;
  if (!isRoutePath(routes?.api) || !routes.api.endsWith('/*')) errors.push('routes.api must be an origin-relative wildcard path');
  if (!isRoutePath(routes?.auth) || !routes.auth.endsWith('/*')) errors.push('routes.auth must be an origin-relative wildcard path');
  if (!isRoutePath(routes?.logout) || routes.logout.endsWith('/*')) errors.push('routes.logout must be an origin-relative path');

  if (!/^[a-z][a-z0-9-]{2,62}$/.test(config?.workers?.apiName ?? '')) errors.push('workers.apiName is invalid');
  if (!/^[a-z][a-z0-9-]{2,62}$/.test(config?.workers?.authName ?? '')) errors.push('workers.authName is invalid');
  if (!Array.isArray(config?.workers?.additionalAuthRoutes)) errors.push('workers.additionalAuthRoutes must be an array');
  else {
    for (const route of config.workers.additionalAuthRoutes) {
      if (typeof route?.pattern !== 'string' || !route.pattern.includes('/') || !route?.zone_name) {
        errors.push('each additionalAuthRoutes entry needs a route pattern and zone_name');
      }
    }
  }

  if (!/^[0-9a-f]{64}$/i.test(config?.localDevelopment?.accessAudience ?? '')) {
    errors.push('localDevelopment.accessAudience must be a 64-character Access audience');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config?.localDevelopment?.identity?.email ?? '')) {
    errors.push('localDevelopment.identity.email must be a valid local test identity');
  }
  if (typeof config?.localDevelopment?.identity?.name !== 'string' || !config.localDevelopment.identity.name.trim()) {
    errors.push('localDevelopment.identity.name is required');
  }
  if (!isD1DatabaseId(config?.localDevelopment?.d1DatabaseId)) {
    errors.push('localDevelopment.d1DatabaseId must be a local-only D1 UUID');
  }

  const storage = config?.sharedStorage;
  if (storage?.d1Binding !== 'DB') errors.push('sharedStorage.d1Binding must be DB');
  if (!/^[a-z][a-z0-9-]{2,62}$/.test(storage?.d1DatabaseName ?? '')) errors.push('sharedStorage.d1DatabaseName is invalid');
  if (storage?.r2Binding !== 'PHOTOS') errors.push('sharedStorage.r2Binding must be PHOTOS');
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(storage?.r2BucketName ?? '')) errors.push('sharedStorage.r2BucketName is invalid');
  if (options.requireWorkerResources && !isD1DatabaseId(storage?.d1DatabaseId)) {
    errors.push('sharedStorage.d1DatabaseId must be a real D1 UUID before Worker deployment');
  } else if (storage?.d1DatabaseId !== null && !isD1DatabaseId(storage?.d1DatabaseId)) {
    errors.push('sharedStorage.d1DatabaseId must be null or a D1 UUID');
  }

  if (errors.length) throw new Error(`Invalid Bucket Locator deployment config:\n- ${errors.join('\n- ')}`);
  return {...config, siteOrigin: origin.origin};
}

export function publicBucketLocatorConfig(config) {
  validateBucketLocatorDeploymentConfig(config);
  return {backendOrigin: config.siteOrigin};
}

export function createBucketLocatorWranglerConfigs(config, {environment = 'production'} = {}) {
  const isLocal = environment === 'local';
  if (environment !== 'local' && environment !== 'production') {
    throw new Error(`Unsupported Wrangler config environment: ${environment}`);
  }
  validateBucketLocatorDeploymentConfig(config, {requireWorkerResources: !isLocal});
  const hostname = new URL(config.siteOrigin).hostname;
  const accessDev = {
    aud: config.localDevelopment.accessAudience,
    identity: config.localDevelopment.identity,
  };
  return {
    api: {
      $schema: 'node_modules/wrangler/config-schema.json',
      name: config.workers.apiName,
      account_id: config.accountId,
      main: 'src/worker.ts',
      compatibility_date: '2026-08-28',
      workers_dev: isLocal,
      observability: {enabled: true},
      ...(isLocal ? {} : {routes: [{pattern: `${hostname}${config.routes.api}`, zone_name: hostname}]}),
      vars: {ALLOWED_USERS: (isLocal ? [config.localDevelopment.identity.email] : config.approvedUsers).join(',')},
      d1_databases: [{
        binding: config.sharedStorage.d1Binding,
        database_name: config.sharedStorage.d1DatabaseName,
        database_id: isLocal ? config.localDevelopment.d1DatabaseId : config.sharedStorage.d1DatabaseId,
        migrations_dir: 'migrations',
      }],
      r2_buckets: [{binding: config.sharedStorage.r2Binding, bucket_name: config.sharedStorage.r2BucketName}],
      ...(isLocal ? {access: {dev: accessDev}} : {}),
      triggers: {crons: ['17 * * * *']},
    },
    auth: {
      $schema: 'node_modules/wrangler/config-schema.json',
      name: config.workers.authName,
      account_id: config.accountId,
      main: 'src/worker.ts',
      compatibility_date: '2026-08-28',
      workers_dev: isLocal,
      observability: {enabled: true},
      ...(isLocal ? {access: {dev: accessDev}} : {
        routes: [
          {pattern: `${hostname}${config.routes.auth}`, zone_name: hostname},
          ...config.workers.additionalAuthRoutes,
        ],
      }),
    },
  };
}

function parseOrigin(value, errors) {
  if (typeof value !== 'string') {
    errors.push('siteOrigin must be an HTTPS origin');
    return null;
  }
  try {
    const origin = new URL(value);
    if (origin.protocol !== 'https:' || origin.origin !== value || origin.pathname !== '/') {
      errors.push('siteOrigin must be a canonical HTTPS origin without path, query, or fragment');
    }
    if (origin.hostname === 'localhost' || origin.hostname.endsWith('.localhost') || origin.hostname.startsWith('127.')) {
      errors.push('siteOrigin cannot be localhost for production configuration');
    }
    return origin;
  } catch {
    errors.push('siteOrigin must be a valid HTTPS origin');
    return null;
  }
}

function rejectUnknownKeys(value, allowedKeys, label, errors) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  for (const key of Object.keys(value)) {
    if (!allowedKeys.includes(key)) errors.push(`${label} contains unsupported property '${key}'`);
  }
}

function isRoutePath(value) {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.includes('..');
}

function isCloudflareId(value) {
  return typeof value === 'string' && /^[0-9a-f]{32}$/i.test(value) && !/^0+$/.test(value);
}

function isD1DatabaseId(value) {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value) &&
    !/^0{8}-0{4}-0{4}-0{4}-0{12}$/.test(value);
}