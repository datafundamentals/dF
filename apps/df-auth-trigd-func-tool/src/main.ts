import {initializeFirebaseForApp} from '@df/state';
import {EMULATOR_CONFIG} from './config/firebase.config.js';
import '@df/ui-lit';

const rawAuthPort = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT ?? '9156';
const authEmulatorPort = Number(rawAuthPort);
if (Number.isFinite(authEmulatorPort) && authEmulatorPort > 0) {
  globalThis.__DF_AUTH_EMULATOR_PORT__ = authEmulatorPort;
}

// Initialize Firebase with emulator configuration so df-auth-wrapper hooks into the
// Auth + Functions emulator pair immediately on load.
initializeFirebaseForApp(EMULATOR_CONFIG);
