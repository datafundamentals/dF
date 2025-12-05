import '@df/ui-lit';
import '@df/ui-lit/df-auth-wrapper';
import {initializeFirebaseForApp} from '@df/state';
import './df-chat-app.js';

// Auto-detects VITE_USE_EMULATOR from environment
initializeFirebaseForApp();

