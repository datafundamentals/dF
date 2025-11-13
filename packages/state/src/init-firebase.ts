/**
 * Firebase Initialization Helper
 *
 * Convenience function for apps to initialize Firebase with automatic emulator detection.
 * Apps should call this once early in their lifecycle (e.g., in main.ts).
 *
 * **New Behavior (v4):** Emulator config is optional. If not provided, the function automatically
 * detects emulator mode from the `VITE_USE_EMULATOR` environment variable:
 * - When `VITE_USE_EMULATOR=true`: Enables emulators for Firestore, Storage, and Functions
 * - When `VITE_USE_EMULATOR=false` (or missing): Disables all emulators (prod mode)
 *
 * @example
 * ```typescript
 * // In main.ts - minimal setup
 * import {initializeFirebaseForApp} from '@df/state';
 *
 * // Automatically detects emulator mode from VITE_USE_EMULATOR env var
 * initializeFirebaseForApp();
 * ```
 *
 * @example
 * ```typescript
 * // With custom Firebase config
 * import {initializeFirebaseForApp} from '@df/state';
 * import {FIREBASE_CONFIG} from './config/firebase.config';
 *
 * // Emulator mode from env, Firebase config explicit
 * initializeFirebaseForApp(undefined, FIREBASE_CONFIG);
 * ```
 *
 * @example
 * ```typescript
 * // Legacy: explicit emulator config (still supported)
 * import {initializeFirebaseForApp} from '@df/state';
 * import {EMULATOR_CONFIG, FIREBASE_CONFIG} from './config/firebase.config';
 *
 * initializeFirebaseForApp(EMULATOR_CONFIG, FIREBASE_CONFIG);
 * ```
 */

import type {EmulatorConfig, FirebaseConfig} from '@df/types';
import {setEmulatorConfig, setFirebaseConfig} from './stores/firebase-init.js';
import {getEmulatorConfigForRuntime} from '@df/firebase';

/**
 * Initialize Firebase for your app with automatic emulator detection.
 *
 * This sets the configs globally so that all Firebase stores
 * (auth, firestore, storage, functions) can auto-initialize correctly.
 *
 * @param emulatorConfig - Optional configuration specifying which services use emulators.
 *   If not provided, automatically derives from `VITE_USE_EMULATOR` environment variable.
 * @param firebaseConfig - Optional Firebase project config. If not provided, will use loadFirebaseConfig() from @df/firebase
 *
 * @example
 * ```typescript
 * import {initializeFirebaseForApp} from '@df/state';
 *
 * // Call early in app lifecycle - emulator mode auto-detected from VITE_USE_EMULATOR
 * initializeFirebaseForApp();
 *
 * // Now components can use Firebase stores without explicit initialization
 * render(html`<my-app></my-app>`, document.body);
 * ```
 */
export function initializeFirebaseForApp(emulatorConfig?: EmulatorConfig, firebaseConfig?: FirebaseConfig): void {
  // If no emulator config provided, auto-detect from VITE_USE_EMULATOR env var
  const resolvedEmulatorConfig = emulatorConfig ?? getEmulatorConfigForRuntime();

  setEmulatorConfig(resolvedEmulatorConfig);
  if (firebaseConfig) {
    setFirebaseConfig(firebaseConfig);
  }
}
