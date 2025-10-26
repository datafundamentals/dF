/**
 * Centralized Firebase Initialization
 * 
 * Provides shared Firebase app instance and emulator configuration detection
 * for all Firebase service stores (auth, firestore, storage, functions).
 * 
 * Stores use this to lazy-initialize on first access, eliminating the need
 * for components to handle initialization logic.
 * 
 * @module firebase-init
 */

import type {FirebaseApp} from 'firebase/app';
import {loadFirebaseConfig, useEmulator, getFirebaseApp} from '@df/firebase';
import type {EmulatorConfig} from '@df/types';

/**
 * Singleton Firebase app instance
 * Lazily initialized on first access
 */
let firebaseAppInstance: FirebaseApp | null = null;

/**
 * Emulator configuration for the current app
 * Must be set via setEmulatorConfig() before stores initialize
 */
let emulatorConfig: EmulatorConfig | null = null;

/**
 * Set the emulator configuration for Firebase services.
 * 
 * This must be called early in the app lifecycle (e.g., in main.ts)
 * before any Firebase stores are accessed.
 * 
 * @param config - Emulator configuration specifying which services use emulators
 * 
 * @example
 * ```typescript
 * // In main.ts or app entry point
 * import {setEmulatorConfig} from '@df/state/stores/firebase-init';
 * import {EMULATOR_CONFIG} from './config/firebase.config';
 * 
 * setEmulatorConfig(EMULATOR_CONFIG);
 * ```
 */
export function setEmulatorConfig(config: EmulatorConfig): void {
  emulatorConfig = config;
}

/**
 * Get the current emulator configuration.
 * 
 * @throws {Error} If emulator config not set via setEmulatorConfig()
 * @returns {EmulatorConfig} Current emulator configuration
 */
export function getEmulatorConfig(): EmulatorConfig {
  if (!emulatorConfig) {
    throw new Error(
      'Emulator configuration not set. Call setEmulatorConfig() in your app entry point.\n' +
      'Example:\n' +
      '  import {setEmulatorConfig} from \'@df/state/stores/firebase-init\';\n' +
      '  import {EMULATOR_CONFIG} from \'./config/firebase.config\';\n' +
      '  setEmulatorConfig(EMULATOR_CONFIG);'
    );
  }
  return emulatorConfig;
}

/**
 * Get or initialize the shared Firebase app instance.
 * 
 * Uses singleton pattern - returns existing instance if already initialized.
 * Automatically loads Firebase config from environment variables.
 * 
 * @returns {FirebaseApp} Initialized Firebase app instance
 * @throws {Error} If Firebase config environment variables are missing
 * 
 * @example
 * ```typescript
 * // In a store
 * import {getInitializedFirebaseApp} from './firebase-init';
 * 
 * function ensureAuthInitialized() {
 *   const app = getInitializedFirebaseApp();
 *   const auth = getAuth(app);
 *   // ... rest of initialization
 * }
 * ```
 */
export function getInitializedFirebaseApp(): FirebaseApp {
  if (!firebaseAppInstance) {
    const config = loadFirebaseConfig();
    firebaseAppInstance = getFirebaseApp(config);
  }
  return firebaseAppInstance;
}

/**
 * Check if a specific Firebase service should use emulator.
 * 
 * @param service - Service name: 'auth' | 'firestore' | 'storage' | 'functions'
 * @returns {boolean} True if service should connect to emulator
 * 
 * @example
 * ```typescript
 * if (shouldUseEmulatorForService('auth')) {
 *   connectAuthEmulator(auth, 'http://127.0.0.1:9099');
 * }
 * ```
 */
export function shouldUseEmulatorForService(
  service: keyof EmulatorConfig
): boolean {
  const config = getEmulatorConfig();
  return config[service] === true;
}

/**
 * Check if ANY Firebase service is configured to use emulators.
 * 
 * @returns {boolean} True if at least one service uses emulators
 * 
 * @example
 * ```typescript
 * if (hasAnyEmulatorEnabled()) {
 *   console.log('Running in development mode with emulators');
 * }
 * ```
 */
export function hasAnyEmulatorEnabled(): boolean {
  if (!emulatorConfig) return false;
  return useEmulator(emulatorConfig);
}

/**
 * Reset Firebase app and emulator config.
 * 
 * Primarily used in tests to reset state between test cases.
 * Not typically needed in production code.
 * 
 * @internal
 */
export function resetFirebaseInit(): void {
  firebaseAppInstance = null;
  emulatorConfig = null;
}
