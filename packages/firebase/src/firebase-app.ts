import {getApp, getApps, initializeApp, deleteApp, type FirebaseApp} from 'firebase/app';
import type {FirebaseConfig} from '@df/types/firebase.types';

const DEFAULT_APP_NAME = '[DEFAULT]';

type CachedApp = {
  app: FirebaseApp;
  config: FirebaseConfig;
};

const appCache = new Map<string, CachedApp>();

/**
 * Retrieve the cached Firebase app or initialize it when absent. Ensures
 * singleton semantics per app name while warning when the requested config
 * differs from the original initialization.
 */
export function getFirebaseApp(config: FirebaseConfig, appName: string = DEFAULT_APP_NAME): FirebaseApp {
  const cached = appCache.get(appName);
  if (cached) {
    warnOnConfigMismatch(appName, cached.config, config);
    return cached.app;
  }

  const existing = getApps().find((app) => app.name === appName);
  if (existing) {
    appCache.set(appName, {app: existing, config});
    warnOnConfigMismatch(appName, existing.options as FirebaseConfig, config);
    return existing;
  }

  const app = initializeApp(config, appName);
  appCache.set(appName, {app, config});
  return app;
}

/**
 * Alias of {@link getFirebaseApp} for callers that prefer the initialize*
 * naming convention.
 */
export const initializeFirebaseApp = getFirebaseApp;

/**
 * Returns an existing Firebase app instance if one is already registered.
 */
export function getExistingFirebaseApp(appName: string = DEFAULT_APP_NAME): FirebaseApp | undefined {
  const cached = appCache.get(appName)?.app;
  if (cached) {
    return cached;
  }

  try {
    return getApp(appName);
  } catch {
    return undefined;
  }
}

/**
 * Determines whether a Firebase app has been initialized for the given name.
 */
export function hasFirebaseApp(appName: string = DEFAULT_APP_NAME): boolean {
  return Boolean(appCache.has(appName) || getApps().some((app) => app.name === appName));
}

/**
 * Removes a cached Firebase app and deletes the underlying instance. Useful in
 * tests where a clean slate is required between runs.
 */
export async function resetFirebaseApp(appName: string = DEFAULT_APP_NAME): Promise<void> {
  const cached = getExistingFirebaseApp(appName);
  if (!cached) {
    return;
  }

  appCache.delete(appName);
  await deleteApp(cached);
}

function warnOnConfigMismatch(appName: string, previous: FirebaseConfig, next: FirebaseConfig): void {
  if (configsMatch(previous, next)) {
    return;
  }

  console.warn(
    `[firebase-app] Firebase app "${appName}" already initialized with a different configuration. ` +
      'Subsequent calls will reuse the original instance. Ensure this is intentional.'
  );
}

const CONFIG_KEYS: (keyof FirebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
  'measurementId',
];

function configsMatch(a: FirebaseConfig | undefined, b: FirebaseConfig | undefined): boolean {
  if (!a || !b) {
    return false;
  }

  return CONFIG_KEYS.every((key) => a[key] === b[key]);
}

export {DEFAULT_APP_NAME};
