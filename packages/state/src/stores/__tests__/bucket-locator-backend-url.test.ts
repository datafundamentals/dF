import {afterEach, describe, expect, it} from 'vitest';
import {resolveBackendUrl} from '../../utils/bucket-locator-backend-url';

describe('Bucket Locator backend URL', () => {
  afterEach(() => {
    delete window.__DF_BUCKET_LOCATOR_CONFIG__;
  });

  it('uses the consuming page origin when no explicit origin is configured', () => {
    expect(resolveBackendUrl('/api/parts')).toBe(
      new URL('/api/parts', window.location.origin).toString()
    );
  });

  it('resolves paths from the configured same origin', () => {
    window.__DF_BUCKET_LOCATOR_CONFIG__ = {backendOrigin: window.location.origin};
    expect(resolveBackendUrl('/cf-auth/_protected/whoami')).toBe(
      new URL('/cf-auth/_protected/whoami', window.location.origin).toString()
    );
  });

  it('rejects a backend on another origin to prevent third-party Access cookies', () => {
    window.__DF_BUCKET_LOCATOR_CONFIG__ = {backendOrigin: 'https://api.example.test'};
    expect(() => resolveBackendUrl('/api/parts')).toThrow(/requires its backend to share the page origin/);
  });
});