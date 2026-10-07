import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {
  createBucketLocatorWranglerConfigs,
  deploymentConfigPath,
  loadBucketLocatorDeploymentConfig,
  publicBucketLocatorConfig,
  validateBucketLocatorDeploymentConfig,
} from '../src/bucket-locator-deployment-config.mjs';

const profile = JSON.parse(readFileSync(deploymentConfigPath, 'utf8'));

describe('Bucket Locator deployment profile', () => {
  it('loads the checked-in production profile and exposes only public browser config', () => {
    expect(publicBucketLocatorConfig(loadBucketLocatorDeploymentConfig())).toEqual({
      backendOrigin: 'https://btrg.org',
    });
  });

  it('rejects localhost and cross-origin backend settings', () => {
    expect(() => validateBucketLocatorDeploymentConfig({...profile, siteOrigin: 'http://localhost:4178'}))
      .toThrow(/HTTPS origin|localhost/);
    expect(() => publicBucketLocatorConfig({...profile, backendOrigin: 'https://api.example.test'}))
      .toThrow();
  });

  it('changes Worker route hosts while preserving shared D1/R2 resources', () => {
    const config = {
      ...profile,
      siteOrigin: 'https://foo.com',
      sharedStorage: {...profile.sharedStorage, d1DatabaseId: 'a4d72b14-2764-47df-9863-b84e94e92507'},
    };
    const workers = createBucketLocatorWranglerConfigs(config);

    expect(workers.api.routes).toEqual([{pattern: 'foo.com/api/*', zone_name: 'foo.com'}]);
    expect(workers.api.d1_databases[0]).toMatchObject({
      database_name: profile.sharedStorage.d1DatabaseName,
      database_id: config.sharedStorage.d1DatabaseId,
    });
    expect(workers.api.r2_buckets[0].bucket_name).toBe(profile.sharedStorage.r2BucketName);
  });

  it('generates local Workers with the simulated identity and no production routes', () => {
    const workers = createBucketLocatorWranglerConfigs(profile, {environment: 'local'});

    expect(workers.api.vars.ALLOWED_USERS).toBe('sahar.ayazian@gmail.com');
    expect(workers.api.routes).toBeUndefined();
    expect(workers.api.access.dev.identity.email).toBe('sahar.ayazian@gmail.com');
    expect(workers.auth.routes).toBeUndefined();
    expect(workers.auth.access.dev.identity.email).toBe('sahar.ayazian@gmail.com');
  });

  it('generates production Workers with the approved identities and btrg.org routes', () => {
    const config = {
      ...profile,
      sharedStorage: {...profile.sharedStorage, d1DatabaseId: 'a4d72b14-2764-47df-9863-b84e94e92507'},
    };
    const workers = createBucketLocatorWranglerConfigs(config);

    expect(workers.api.vars.ALLOWED_USERS).toBe(profile.approvedUsers.join(','));
    expect(workers.api.routes).toEqual([{pattern: 'btrg.org/api/*', zone_name: 'btrg.org'}]);
    expect(workers.api.access).toBeUndefined();
    expect(workers.auth.routes[0]).toEqual({pattern: 'btrg.org/cf-auth/_protected/*', zone_name: 'btrg.org'});
    expect(workers.auth.access).toBeUndefined();
  });

  it('refuses to generate production Worker configs until D1 is provisioned', () => {
    const unprovisionedProfile = {
      ...profile,
      sharedStorage: {...profile.sharedStorage, d1DatabaseId: null},
    };
    expect(() => createBucketLocatorWranglerConfigs(unprovisionedProfile))
      .toThrow(/real D1 UUID before Worker deployment/);
  });
});