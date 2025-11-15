import {initializeFirebaseForApp} from '@df/state';
import '@df/ui-lit/df-auth-wrapper';
import '@df/ui-lit/df-environment-banner';
import '@df/ui-lit/df-seed-data';
import './df-firebase-teaching-app.js';

// Initialize Firebase with automatic emulator detection
// Reads VITE_USE_EMULATOR from environment:
// - true: Uses local emulators for Firestore, Storage, Functions (from .env.emulator)
// - false/missing: Uses cloud Firebase for all services (from .env.production)
// Auth always uses production (no auth emulator per STANDARDS_STYLES.md)
// This must happen before any Firebase stores are accessed
initializeFirebaseForApp();

// Always include the Firestore demo so integration tests can exercise CRUD flows
void import('@df/ui-lit/firebase/df-firestore-demo.js');

// Only load storage and functions demos in dev/production mode, not during tests
if (import.meta.env.MODE !== 'test') {
  void import('./df-storage-demo.js');
  void import('@df/ui-lit/firebase/df-functions-demo.js');
}
