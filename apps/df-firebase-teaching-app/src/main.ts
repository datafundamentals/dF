import {initializeFirebaseForApp} from '@df/state';
import '@df/ui-lit/df-auth-wrapper';
import '@df/ui-lit/df-environment-banner';

// Initialize Firebase with automatic emulator detection
// Reads VITE_USE_EMULATOR from environment:
// - true: Uses local emulators for Firestore, Storage, Functions (from .env.emulator)
// - false/missing: Uses cloud Firebase for all services (from .env.production)
// Auth always uses production (no auth emulator per STANDARDS_STYLES.md)
// This must happen before any Firebase stores are accessed
initializeFirebaseForApp();

// Load the app container which hosts all demo components
void import('./app-container.js');
