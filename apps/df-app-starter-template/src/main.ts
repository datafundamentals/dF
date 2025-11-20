import {initializeFirebaseForApp} from '@df/state';
import '@df/ui-lit/remove-replace-me';
import '@df/ui-lit/df-auth-wrapper';
import '@df/ui-lit/df-environment-banner';
import './app-container.js';

// Initialize Firebase with automatic emulator detection
// Reads VITE_USE_EMULATOR from environment:
// - true: Uses local emulators (from .env.emulator)
// - false/missing: Uses cloud Firebase (from .env.production)
// This must happen before any Firebase stores are accessed
initializeFirebaseForApp();
