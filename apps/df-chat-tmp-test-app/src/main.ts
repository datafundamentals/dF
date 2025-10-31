import {
  initializeFirebaseForApp,
  getInitializedFirebaseApp,
  shouldUseEmulatorForService,
  initializeChatStore,
} from '@df/state';
import {EMULATOR_CONFIG} from './config/firebase.config.js';
import './df-firebase-teaching-app.js';
import '@df/ui-lit/df-chat-widget';

// Initialize Firebase with emulator configuration
// This must happen before any Firebase stores are accessed
initializeFirebaseForApp(EMULATOR_CONFIG);

// Always include the Firestore demo so integration tests can exercise CRUD flows
void import('./df-firestore-demo.js');

// Only load auth, storage, and functions demos in dev/production mode, not during tests
if (import.meta.env.MODE !== 'test') {
  const app = getInitializedFirebaseApp();
  const useFirestoreEmulator = shouldUseEmulatorForService('firestore');
  void initializeChatStore(app, useFirestoreEmulator).catch((error) => {
    console.error('[df-chat-widget] Failed to initialize chat store', error);
  });

  void import('./df-auth-demo.js');
  void import('./df-storage-demo.js');
  void import('./df-functions-demo.js');
}
