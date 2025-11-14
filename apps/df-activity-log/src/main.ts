import '@df/ui-lit';
import '@df/ui-lit/df-auth-wrapper';
import {initializeFirebaseForApp} from '@df/state';
import './df-activity-log-app.js';

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingVars = requiredEnvVars.filter((key) => !import.meta.env[key]);

if (missingVars.length) {
  throw new Error(
    `Missing Firebase environment variables: ${missingVars.join(', ')}. ` +
      'Copy .env.development.example to .env.development and supply real credentials before running pnpm dev.',
  );
}

// Auto-detect emulator usage from VITE_USE_EMULATOR in the .env files
initializeFirebaseForApp();
