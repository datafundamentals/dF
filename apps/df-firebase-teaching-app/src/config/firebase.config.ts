/**
 * Firebase Configuration
 *
 * Reads Firebase configuration from environment variables and validates required values.
 *
 * Environment Variables (all prefixed with VITE_ for Vite compatibility):
 * - VITE_FIREBASE_API_KEY: Firebase API key
 * - VITE_FIREBASE_AUTH_DOMAIN: Firebase Auth domain
 * - VITE_FIREBASE_PROJECT_ID: Firebase project ID
 * - VITE_FIREBASE_STORAGE_BUCKET: Firebase Storage bucket
 * - VITE_FIREBASE_MESSAGING_SENDER_ID: Firebase messaging sender ID
 * - VITE_FIREBASE_APP_ID: Firebase app ID
 * - VITE_USE_EMULATOR: 'true' for emulator mode, 'false' for production
 * - VITE_FIREBASE_EMULATOR_UI: Emulator UI URL (optional, default: http://127.0.0.1:5400)
 *
 * For emulator development (VITE_USE_EMULATOR=true):
 * - Placeholder/dummy config values are sufficient
 * - Emulators do not validate these values
 * - See .env.example for sample values
 *
 * For production deployment (VITE_USE_EMULATOR=false):
 * - Real values from Firebase Console are required
 * - See .env.production.example for instructions
 * - Implemented in Ticket 13
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface EnvironmentConfig {
  firebase: FirebaseConfig;
  useEmulator: boolean;
  emulatorUiUrl: string;
}

/**
 * Required environment variable keys
 */
const REQUIRED_ENV_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

/**
 * Validates that all required environment variables are present
 * @throws Error if any required variable is missing
 */
function validateEnvironmentVariables(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.join('\n')}\n\n` +
        `Please ensure you have a .env.emulator file in the app root.\n` +
        `Copy .env.example to .env.emulator to get started:\n` +
        `  cp .env.example .env.emulator\n\n` +
        `For more information, see the README.md file.`
    );
  }
}

/**
 * Loads Firebase configuration from environment variables
 * @throws Error if required variables are missing
 */
function loadFirebaseConfig(): FirebaseConfig {
  validateEnvironmentVariables();

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
}

/**
 * Determines if emulator mode is enabled
 * Defaults to true if not explicitly set to 'false'
 */
function isEmulatorEnabled(): boolean {
  const value = import.meta.env.VITE_USE_EMULATOR;
  // Default to true (emulator mode) for safety
  // Only disable if explicitly set to 'false'
  return value !== 'false';
}

/**
 * Gets the Emulator UI URL from environment
 * Defaults to http://127.0.0.1:5400
 */
function loadEmulatorUiUrl(): string {
  return import.meta.env.VITE_FIREBASE_EMULATOR_UI || 'http://127.0.0.1:5400';
}

/**
 * Complete environment configuration
 * Lazily loaded on first access
 */
let cachedConfig: EnvironmentConfig | null = null;

/**
 * Gets the complete environment configuration
 * Validates and caches on first access
 * @throws Error if required environment variables are missing
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  if (!cachedConfig) {
    cachedConfig = {
      firebase: loadFirebaseConfig(),
      useEmulator: isEmulatorEnabled(),
      emulatorUiUrl: loadEmulatorUiUrl(),
    };

    // Log configuration in development (but mask sensitive values in production)
    if (import.meta.env.DEV) {
      console.log('[firebase-config] Configuration loaded:', {
        projectId: cachedConfig.firebase.projectId,
        useEmulator: cachedConfig.useEmulator,
        emulatorUiUrl: cachedConfig.useEmulator ? cachedConfig.emulatorUiUrl : '(not used)',
        apiKey: cachedConfig.firebase.apiKey ? '***' : '(missing)',
      });
    }
  }

  return cachedConfig;
}

/**
 * Gets just the Firebase configuration
 * @throws Error if required environment variables are missing
 */
export function getFirebaseConfig(): FirebaseConfig {
  return getEnvironmentConfig().firebase;
}

/**
 * Checks if emulator mode is enabled
 */
export function useEmulator(): boolean {
  return getEnvironmentConfig().useEmulator;
}

/**
 * Gets the Emulator UI URL
 */
export function getEmulatorUiUrl(): string {
  return getEnvironmentConfig().emulatorUiUrl;
}
