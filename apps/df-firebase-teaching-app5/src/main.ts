import {initializeFirebaseForApp} from '@df/state';
import {EMULATOR_CONFIG} from './config/firebase.config.js';
import './df-firebase-teaching-app.js';

// Initialize Firebase with emulator configuration
// This must happen before any Firebase stores are accessed
initializeFirebaseForApp(EMULATOR_CONFIG);

// Always include the Firestore demo so integration tests can exercise CRUD flows
void import('./df-firestore-demo.js');

// Only load auth, storage, and functions demos in dev/production mode, not during tests
if (import.meta.env.MODE !== 'test') {
  void import('./df-auth-demo.js');
  void import('./df-storage-demo.js');
  void import('./df-functions-demo.js');
}
