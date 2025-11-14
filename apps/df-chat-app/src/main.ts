import '@df/ui-lit';
import '@df/ui-lit/df-auth-wrapper';
import {
  getInitializedFirebaseApp,
  initializeChatStore,
  initializeFirebaseForApp,
  shouldUseEmulatorForService,
} from '@df/state';
import './df-chat-app.js';

// Auto-detects VITE_USE_EMULATOR from environment
initializeFirebaseForApp();

const firebaseApp = getInitializedFirebaseApp();
const useFirestoreEmulator = shouldUseEmulatorForService('firestore');

void initializeChatStore(firebaseApp, useFirestoreEmulator).catch((error) => {
  console.error('[df-chat-app] Failed to initialize chat store', error);
});
