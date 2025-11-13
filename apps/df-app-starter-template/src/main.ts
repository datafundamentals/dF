import {initializeFirebaseForApp} from '@df/state';
import {EMULATOR_CONFIG} from './config/firebase.config.js';
import '@df/ui-lit/remove-replace-me';
import '@df/ui-lit/df-auth-wrapper';
import './rename-me-app-container.js';

// Initialize Firebase with emulator configuration
// This must happen before any Firebase stores are accessed
initializeFirebaseForApp(EMULATOR_CONFIG);
