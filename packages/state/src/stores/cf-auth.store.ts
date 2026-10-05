import {computed, signal} from '@lit-labs/signals';
import type {CfAuthConfig, CfAuthState, CfUser} from '@df/types';

const cfUserSignal = signal<CfUser | null>(null);
const cfAuthStatusSignal = signal<CfAuthState['authState']>('idle');
const cfErrorSignal = signal<string | null>(null);
const cfInitializedSignal = signal(false);

let config: CfAuthConfig | null = null;
let refreshSequence = 0;

export const cfAuthState = computed<CfAuthState>(() => ({
  authUser: cfUserSignal.get(),
  authState: cfAuthStatusSignal.get(),
  error: cfErrorSignal.get(),
  initialized: cfInitializedSignal.get(),
}));

/** Configure Cloudflare Access authentication and check the current session. */
export function initializeCfAuth(nextConfig: CfAuthConfig): Promise<void> {
  config = {...nextConfig};
  return refreshCfAuth();
}

/** Check for an existing session without following Access's login redirect. */
export async function refreshCfAuth(): Promise<void> {
  const activeConfig = requireConfig();
  const sequence = ++refreshSequence;

  cfAuthStatusSignal.set('loading');
  cfErrorSignal.set(null);

  try {
    const response = await fetch(activeConfig.sessionUrl, {
      credentials: 'include',
      redirect: 'manual',
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (sequence !== refreshSequence) return;

    if (
      response.type === 'opaqueredirect' ||
      response.status === 401 ||
      response.status === 403
    ) {
      setUnauthenticated();
      return;
    }

    if (!response.ok) {
      throw new Error(`Session check failed (${response.status})`);
    }

    const user = validateUser(await response.json());
    cfUserSignal.set(user);
    cfAuthStatusSignal.set('authenticated');
    cfInitializedSignal.set(true);
  } catch (error) {
    if (sequence !== refreshSequence) return;
    cfUserSignal.set(null);
    cfAuthStatusSignal.set('error');
    cfErrorSignal.set(errorMessage(error));
    cfInitializedSignal.set(true);
  }
}

/** Start the default full-page Cloudflare Access sign-in flow. */
export function startCfLoginRedirect(
  returnTo: string = window.location.href
): void {
  const activeConfig = requireConfig();
  const url = new URL(activeConfig.loginUrl, window.location.origin);
  url.searchParams.set('returnTo', returnTo);
  window.location.assign(url.toString());
}

/** Start sign-in in a popup and refresh the session after its callback. */
export function startCfLoginPopup(): Promise<void> {
  const activeConfig = requireConfig();
  const url = new URL(activeConfig.loginUrl, window.location.origin);
  url.searchParams.set('mode', 'popup');

  const popup = window.open(
    url.toString(),
    'df-standard-pioneer-auth-wrapper-login',
    'popup,width=480,height=640'
  );

  if (!popup) {
    return Promise.reject(new Error('Sign-in popup was blocked'));
  }

  return new Promise((resolve, reject) => {
    const timeoutMs = activeConfig.popupTimeoutMs ?? 120_000;
    const intervalId = window.setInterval(() => {
      if (popup.closed) finish(new Error('Sign-in popup was closed'));
    }, 500);
    const timeoutId = window.setTimeout(
      () => finish(new Error('Sign-in popup timed out')),
      timeoutMs
    );

    const finish = (error?: Error) => {
      window.removeEventListener('message', onMessage);
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
      if (!popup.closed) popup.close();
      if (error) reject(error);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (
        event.data?.type !== 'df-standard-pioneer-auth-wrapper:login-complete'
      )
        return;

      finish();
      void refreshCfAuth().then(resolve, reject);
    };

    window.addEventListener('message', onMessage);
  });
}

/** End the Access session and return to the current page. */
export function cfLogout(): void {
  const activeConfig = requireConfig();
  window.location.assign(
    new URL(activeConfig.logoutUrl, window.location.origin).toString()
  );
}

export function getCurrentCfUser(): CfUser | null {
  return cfUserSignal.get();
}

export function isCfAuthenticated(): boolean {
  return cfAuthStatusSignal.get() === 'authenticated';
}

/** Reset module state. Intended for teardown and isolated tests. */
export function cleanupCfAuth(): void {
  config = null;
  refreshSequence += 1;
  cfUserSignal.set(null);
  cfAuthStatusSignal.set('idle');
  cfErrorSignal.set(null);
  cfInitializedSignal.set(false);
}

function requireConfig(): CfAuthConfig {
  if (!config) throw new Error('cf-auth: call initializeCfAuth() first');
  return config;
}

function setUnauthenticated(): void {
  cfUserSignal.set(null);
  cfAuthStatusSignal.set('unauthenticated');
  cfErrorSignal.set(null);
  cfInitializedSignal.set(true);
}

function validateUser(value: unknown): CfUser {
  if (!value || typeof value !== 'object')
    throw new Error('Session returned an invalid user');
  const candidate = value as Partial<CfUser>;
  if (
    typeof candidate.email !== 'string' ||
    typeof candidate.sub !== 'string'
  ) {
    throw new Error('Session returned an invalid user');
  }
  return {
    email: candidate.email,
    sub: candidate.sub,
    ...(typeof candidate.name === 'string' ? {name: candidate.name} : {}),
    ...(typeof candidate.picture === 'string'
      ? {picture: candidate.picture}
      : {}),
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Session check failed';
}
