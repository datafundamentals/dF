/**
 * Vitest setup file for @df/state
 *
 * Initializes Firebase emulator configuration before tests run.
 * This ensures stores can properly detect and configure emulator endpoints.
 */

import {setEmulatorConfig, setFirebaseConfig, resetFirebaseAppInstance} from './src/stores/firebase-init';
import {afterEach, beforeEach, vi} from 'vitest';

function createStorageMock(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: vi.fn(() => {
      store.clear();
    }),
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, String(value));
    }),
  };
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: createStorageMock(),
});

Object.defineProperty(globalThis, 'sessionStorage', {
  configurable: true,
  value: createStorageMock(),
});

// Set up Firebase config for tests (placeholder values for emulator testing)
setFirebaseConfig({
  apiKey: 'test-api-key',
  authDomain: 'test-auth-domain.firebaseapp.com',
  projectId: 'test-project-id',
  storageBucket: 'test-storage-bucket.appspot.com',
  messagingSenderId: 'test-sender-id',
  appId: 'test-app-id',
});

// Set up emulator config for tests
// All services use emulators in test environment
setEmulatorConfig({
  auth: true,
  firestore: true,
  storage: true,
  functions: true,
});

// Clean up Firebase app instance after each test (but keep emulator config)
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  // Reset only the app instance between tests, keeping emulator config
  // so subsequent tests don't need to re-initialize it
  resetFirebaseAppInstance();
});
