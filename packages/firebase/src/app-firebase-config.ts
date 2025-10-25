/**
 * Shared Firebase Configuration Utilities for Teaching Apps
 * 
 * Provides common configuration and initialization patterns to avoid
 * duplication across multiple teaching apps.
 * 
 * Each app only needs to:
 * 1. Define app-specific EMULATOR_CONFIG (which services use emulators)
 * 2. Import these utilities instead of reimplementing them
 * 
 * Single source of truth:
 * - Firebase config: loadFirebaseConfig() (reads VITE_* env vars)
 * - Emulator ports: firebase.json (auto-generated to TypeScript)
 * - App-specific flags: Each app's emulator.config.ts
 */

import {loadFirebaseConfig} from './firebase-config.js';
import {initializeFirebase} from './init.js';
import type {FirebaseConfig, EmulatorConfig} from '@df/types/firebase.types';

/**
 * Cached Firebase configuration
 * Loaded lazily on first access
 */
let cachedConfig: FirebaseConfig | null = null;

/**
 * Gets the Firebase configuration
 * Reads from VITE_* environment variables (Vite requirement)
 * 
 * @throws Error if required environment variables are missing
 */
export function getFirebaseConfig(): FirebaseConfig {
  if (!cachedConfig) {
    cachedConfig = loadFirebaseConfig();
  }
  return cachedConfig;
}

/**
 * Checks if emulator mode is enabled for the given configuration
 * Returns true if ANY service is configured to use emulators
 * 
 * @param emulatorConfig - App-specific emulator configuration
 */
export function useEmulator(emulatorConfig: EmulatorConfig): boolean {
  return emulatorConfig.auth || emulatorConfig.firestore || 
         emulatorConfig.storage || emulatorConfig.functions;
}

/**
 * Initialize Firebase with app-specific emulator configuration
 * 
 * @param emulatorConfig - Which services should use emulators
 * @returns Initialized Firebase services
 * 
 * @example
 * ```typescript
 * import {initializeAppFirebase} from '@df/firebase/app-firebase-config';
 * import {EMULATOR_CONFIG} from './config/emulator.config';
 * 
 * const {app, auth, firestore} = initializeAppFirebase(EMULATOR_CONFIG);
 * ```
 */
export function initializeAppFirebase(emulatorConfig: EmulatorConfig) {
  const config = getFirebaseConfig();
  return initializeFirebase({
    config,
    emulators: emulatorConfig,
  });
}

/**
 * Legacy compatibility: Environment configuration interface
 * Provided for backward compatibility with existing code
 */
export interface EnvironmentConfig {
  firebase: FirebaseConfig;
  useEmulator: boolean;
  emulatorUiUrl: string;
}

/**
 * Gets complete environment configuration
 * Legacy compatibility helper
 * 
 * @param emulatorConfig - App-specific emulator configuration
 */
export function getEnvironmentConfig(emulatorConfig: EmulatorConfig): EnvironmentConfig {
  return {
    firebase: getFirebaseConfig(),
    useEmulator: useEmulator(emulatorConfig),
    emulatorUiUrl: getEmulatorUiUrl(),
  };
}

/**
 * Gets the Emulator UI URL
 * Uses standard DF monorepo port (5400)
 */
export function getEmulatorUiUrl(): string {
  return 'http://127.0.0.1:5400';
}
