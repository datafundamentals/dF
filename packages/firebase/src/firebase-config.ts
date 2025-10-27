/**
 * Firebase Configuration Loader
 * 
 * Centralized Firebase configuration for all teaching apps
 * Reads from environment variables with VITE_ prefix (required by Vite)
 * 
 * Single source of truth for Firebase project configuration
 * Each app reads from its own .env.local or .env.emulator file
 * 
 * For emulator development:
 * - Placeholder/dummy config values are sufficient
 * - Emulators do not validate these values
 * - See .env.example for sample values
 * 
 * For production deployment:
 * - Real values from Firebase Console are required
 * - Set VITE_FIREBASE_* variables in .env.production
 */

import type { FirebaseConfig } from '@df/types/firebase.types';

/**
 * Required environment variable keys
 * VITE_ prefix required by Vite to expose to client-side code
 */
const REQUIRED_ENV_VARS = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
} as const;

/**
 * Validates that all required environment variables are present
 * @throws Error with helpful message if any variables are missing
 */
function validateFirebaseEnv(): void {
  const missing: string[] = [];

  for (const [cleanName, envVar] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!import.meta.env[envVar]) {
      missing.push(`  - ${cleanName} (set ${envVar} in .env)`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables:\n${missing.join('\n')}\n\n` +
        `Please ensure you have a .env.local or .env.emulator file.\n` +
        `Copy from .env.example to get started:\n` +
        `  cp .env.example .env.local\n\n` +
        `For emulator mode: Placeholder values are sufficient.\n` +
        `For production: Use real values from Firebase Console.\n\n` +
        `See apps/df-firebase-teaching-app3/README.md for details.`
    );
  }
}

/**
 * Loads Firebase configuration from environment variables
 * Validates required variables and returns typed config object
 * 
 * @throws Error if required environment variables are missing
 * @returns FirebaseConfig object for initializeApp()
 * 
 * @example
 * ```typescript
 * const config = loadFirebaseConfig();
 * const app = initializeApp(config);
 * ```
 */
export function loadFirebaseConfig(): FirebaseConfig {
  validateFirebaseEnv();

  // Use production Auth config if VITE_USE_EMULATOR is true but EMULATOR_CONFIG.auth is false
  // This logic should be handled in the app entry point, so here we just use the current env vars
  // Apps should set VITE_FIREBASE_API_KEY and VITE_FIREBASE_AUTH_DOMAIN to production values if Google login is needed
  // and emulators for other services are enabled

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}
