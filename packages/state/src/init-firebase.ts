/**
 * Firebase Initialization Helper
 * 
 * Convenience function for apps to initialize Firebase with emulator config.
 * Apps should call this once early in their lifecycle (e.g., in main.ts).
 * 
 * @example
 * ```typescript
 * // In main.ts
 * import {initializeFirebaseForApp} from '@df/state';
 * import {EMULATOR_CONFIG, FIREBASE_CONFIG} from './config/firebase.config';
 * 
 * initializeFirebaseForApp(EMULATOR_CONFIG, FIREBASE_CONFIG);
 * ```
 */

import type {EmulatorConfig, FirebaseConfig} from '@df/types';
import {setEmulatorConfig, setFirebaseConfig} from './stores/firebase-init.js';

/**
 * Initialize Firebase for your app with emulator and Firebase configuration.
 * 
 * This sets the configs globally so that all Firebase stores
 * (auth, firestore, storage, functions) can auto-initialize correctly.
 * 
 * @param emulatorConfig - Configuration specifying which services use emulators
 * @param firebaseConfig - Optional Firebase project config. If not provided, will use loadFirebaseConfig() from @df/firebase
 * 
 * @example
 * ```typescript
 * import {initializeFirebaseForApp} from '@df/state';
 * import {EMULATOR_CONFIG, FIREBASE_CONFIG} from './config/firebase.config';
 * 
 * // Call early in app lifecycle
 * initializeFirebaseForApp(EMULATOR_CONFIG, FIREBASE_CONFIG);
 * 
 * // Now components can use Firebase stores without explicit initialization
 * render(html`<my-app></my-app>`, document.body);
 * ```
 */
export function initializeFirebaseForApp(emulatorConfig: EmulatorConfig, firebaseConfig?: FirebaseConfig): void {
  setEmulatorConfig(emulatorConfig);
  if (firebaseConfig) {
    setFirebaseConfig(firebaseConfig);
  }
}
