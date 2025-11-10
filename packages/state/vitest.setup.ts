/**
 * Vitest setup file for @df/state
 *
 * Initializes Firebase emulator configuration before tests run.
 * This ensures stores can properly detect and configure emulator endpoints.
 */

import {setEmulatorConfig, setFirebaseConfig, resetFirebaseAppInstance} from './src/stores/firebase-init';
import {afterEach} from 'vitest';

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
afterEach(() => {
  // Reset only the app instance between tests, keeping emulator config
  // so subsequent tests don't need to re-initialize it
  resetFirebaseAppInstance();
});
