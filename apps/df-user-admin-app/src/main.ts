import {initializeFirebaseForApp} from '@df/state';
import '@df/ui-lit/df-auth-wrapper';
import '@df/ui-lit/df-environment-banner';
import '@df/ui-lit/user-admin-list';
import '@df/ui-lit/role-picker';
import './user-admin-app-shell';

// Initialize Firebase with automatic emulator detection
// Reads VITE_USE_EMULATOR from environment:
// - true: Uses local emulators (from .env.emulator)
// - false/missing: Uses cloud Firebase (from .env.production)
// This must happen before any Firebase stores are accessed
initializeFirebaseForApp();
