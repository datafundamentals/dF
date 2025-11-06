import '@df/ui-lit';
import '@df/ui-lit/df-auth-wrapper';
import {
  getInitializedFirebaseApp,
  initializeChatStore,
  initializeFirebaseForApp,
  shouldUseEmulatorForService,
} from '@df/state';
import {EMULATOR_CONFIG, FIREBASE_CONFIG} from './config/firebase.config.js';
import './df-chat-app.js';

initializeFirebaseForApp(EMULATOR_CONFIG, FIREBASE_CONFIG);

const firebaseApp = getInitializedFirebaseApp();
const useFirestoreEmulator = shouldUseEmulatorForService('firestore');

void initializeChatStore(firebaseApp, useFirestoreEmulator).catch((error) => {
  console.error('[df-chat-app] Failed to initialize chat store', error);
});
