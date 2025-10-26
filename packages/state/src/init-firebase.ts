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
 * import {EMULATOR_CONFIG} from './config/firebase.config';
 * 
 * initializeFirebaseForApp(EMULATOR_CONFIG);
 * ```
 */

import type {EmulatorConfig} from '@df/types';
import {setEmulatorConfig} from './stores/firebase-init.js';

/**
 * Initialize Firebase for your app with emulator configuration.
 * 
 * This sets the emulator config globally so that all Firebase stores
 * (auth, firestore, storage, functions) can auto-initialize correctly.
 * 
 * @param emulatorConfig - Configuration specifying which services use emulators
 * 
 * @example
 * ```typescript
 * import {initializeFirebaseForApp} from '@df/state';
 * import {EMULATOR_CONFIG} from './config/firebase.config';
 * 
 * // Call early in app lifecycle
 * initializeFirebaseForApp(EMULATOR_CONFIG);
 * 
 * // Now components can use Firebase stores without explicit initialization
 * render(html`<my-app></my-app>`, document.body);
 * ```
 */
export function initializeFirebaseForApp(emulatorConfig: EmulatorConfig): void {
  setEmulatorConfig(emulatorConfig);
}
