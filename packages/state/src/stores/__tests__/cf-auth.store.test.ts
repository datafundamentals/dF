import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  cfAuthState,
  cleanupCfAuth,
  getCurrentCfUser,
  initializeCfAuth,
  isCfAuthenticated,
  refreshCfAuth,
} from '../cf-auth.store';

const config = {
  sessionUrl: '/cf-auth/_protected/whoami',
  loginUrl: '/cf-auth/_protected/login',
  logoutUrl: '/cdn-cgi/access/logout',
};

describe('cf-auth.store', () => {
  beforeEach(() => {
    cleanupCfAuth();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanupCfAuth();
    vi.unstubAllGlobals();
  });

  it('loads an authenticated user', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({email: 'user@example.com', sub: 'user-123'}),
        {
          status: 200,
          headers: {'Content-Type': 'application/json'},
        }
      )
    );

    await initializeCfAuth(config);

    expect(cfAuthState.get()).toEqual({
      authUser: {email: 'user@example.com', sub: 'user-123'},
      authState: 'authenticated',
      error: null,
      initialized: true,
    });
    expect(getCurrentCfUser()?.email).toBe('user@example.com');
    expect(isCfAuthenticated()).toBe(true);
    expect(fetch).toHaveBeenCalledWith('/cf-auth/_protected/whoami', {
      credentials: 'include',
      redirect: 'manual',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
  });

  it.each([401, 403])(
    'maps a %s response to unauthenticated',
    async (status) => {
      vi.mocked(fetch).mockResolvedValue(new Response(null, {status}));

      await initializeCfAuth(config);

      expect(cfAuthState.get().authState).toBe('unauthenticated');
      expect(cfAuthState.get().authUser).toBeNull();
      expect(cfAuthState.get().error).toBeNull();
    }
  );

  it('reports invalid session payloads', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({email: 'missing-sub@example.com'}), {
        status: 200,
      })
    );

    await initializeCfAuth(config);

    expect(cfAuthState.get().authState).toBe('error');
    expect(cfAuthState.get().error).toBe('Session returned an invalid user');
  });

  it('requires initialization before a refresh', async () => {
    await expect(refreshCfAuth()).rejects.toThrow(
      'call initializeCfAuth() first'
    );
  });
});
