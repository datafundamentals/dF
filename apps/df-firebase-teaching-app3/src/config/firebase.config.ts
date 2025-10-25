/**
 * Firebase Configuration for df-firebase-teaching-app3
 * 
 * Delegates to shared utilities in @df/firebase/app-firebase-config
 * to avoid code duplication across teaching apps.
 * 
 * App-specific configuration:
 * - Emulator flags: ./emulator.config.ts
 * 
 * Shared configuration (from @df/firebase):
 * - Firebase config: reads VITE_* environment variables
 * - Emulator ports: auto-generated from packages/firebase/firebase.json
 */

import {
  getFirebaseConfig as getSharedConfig,
  useEmulator as useSharedEmulator,
  initializeAppFirebase as initializeShared,
  getEnvironmentConfig as getSharedEnvConfig,
  getEmulatorUiUrl as getSharedEmulatorUiUrl,
  type EnvironmentConfig,
} from '@df/firebase/app-firebase-config';
import {EMULATOR_CONFIG} from './emulator.config.js';
import type {FirebaseConfig} from '@df/types/firebase.types';

/**
 * Gets the Firebase configuration
 * Delegates to shared utility
 */
export function getFirebaseConfig(): FirebaseConfig {
  return getSharedConfig();
}

/**
 * Checks if emulator mode is enabled
 * Based on app-specific EMULATOR_CONFIG
 */
export function useEmulator(): boolean {
  return useSharedEmulator(EMULATOR_CONFIG);
}

/**
 * Initialize Firebase with app-specific emulator configuration
 */
export function initializeAppFirebase() {
  return initializeShared(EMULATOR_CONFIG);
}

/**
 * Gets complete environment configuration
 * Legacy compatibility
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  return getSharedEnvConfig(EMULATOR_CONFIG);
}

/**
 * Gets the Emulator UI URL
 */
export function getEmulatorUiUrl(): string {
  return getSharedEmulatorUiUrl();
}

// Re-export type for convenience
export type {EnvironmentConfig};
