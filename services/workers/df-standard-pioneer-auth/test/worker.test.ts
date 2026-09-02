import {describe, expect, it, vi} from 'vitest';
import {handleRequest, type WorkerContext} from '../src/worker';

const request = (path: string, init?: RequestInit) =>
  new Request(`https://example.com${path}`, init);

const authenticatedContext: WorkerContext = {
  access: {getIdentity: vi.fn().mockResolvedValue({email: 'user@example.com'})},
};

describe('df-standard-pioneer-auth Worker', () => {
  it('returns the authenticated Access identity', async () => {
    const context: WorkerContext = {
      access: {
        getIdentity: vi.fn().mockResolvedValue({
          email: 'user@example.com',
          name: 'Example User',
          picture: 'https://example.com/avatar.png',
          user_uuid: 'user-123',
        }),
      },
    };

    const response = await handleRequest(request('/cf-auth/whoami'), context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      email: 'user@example.com',
      name: 'Example User',
      picture: 'https://example.com/avatar.png',
      sub: 'user-123',
    });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('rejects requests without an Access context', async () => {
    const response = await handleRequest(request('/cf-auth/whoami'), {});
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({error: 'not-authenticated'});
  });

  it('returns the popup completion page', async () => {
    const response = await handleRequest(
      request('/cf-auth/login?mode=popup'),
      authenticatedContext
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toContain(
      'df-standard-pioneer-auth-wrapper:login-complete'
    );
  });

  it('redirects only to the same origin', async () => {
    const safe = await handleRequest(
      request('/cf-auth/login?returnTo=https%3A%2F%2Fexample.com%2Fdashboard'),
      authenticatedContext
    );
    const unsafe = await handleRequest(
      request('/cf-auth/login?returnTo=https%3A%2F%2Fevil.example%2F'),
      authenticatedContext
    );

    expect(safe.headers.get('Location')).toBe('https://example.com/dashboard');
    expect(unsafe.headers.get('Location')).toBe('https://example.com/');
  });

  it('rejects unsupported methods', async () => {
    const response = await handleRequest(
      request('/cf-auth/whoami', {method: 'POST'}),
      {}
    );
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET, HEAD');
  });
});
