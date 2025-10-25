/**
 * Unified Firebase Initialization
 * 
 * Provides centralized Firebase initialization with granular emulator support
 * Supports per-service emulator configuration for different teaching scenarios
 * 
 * Architecture:
 * - Production config from @df/firebase/firebase-config (reads .env)
 * - Emulator ports from @df/firebase/emulator-config (auto-generated)
 * - App-specific emulator flags from app's emulator.config.ts
 * 
 * Teaching app patterns:
 * - teaching-app: All services emulated
 * - teaching-app2/3: Functions in production, rest emulated
 * - teaching-app4: Auth in production, rest emulated
 * - teaching-app5: All services in production
 */

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, type Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, type Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, type FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions';
import type { FirebaseConfig, EmulatorConfig } from '@df/types/firebase.types';
import { DF_EMULATOR_PORTS, DF_EMULATOR_HOST } from './emulator-config.js';

export interface InitializeFirebaseOptions {
  /** Firebase project configuration (from loadFirebaseConfig) */
  config: FirebaseConfig;
  /** Optional granular emulator configuration (per teaching app) */
  emulators?: EmulatorConfig;
}

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
  functions: Functions;
}

/**
 * Initializes Firebase with optional per-service emulator configuration
 * Uses standard DF emulator ports from firebase.json (auto-generated)
 * 
 * @param options - Configuration and optional emulator settings
 * @returns Initialized Firebase services
 * 
 * @example
 * ```typescript
 * import { loadFirebaseConfig } from '@df/firebase/firebase-config';
 * import { initializeFirebase } from '@df/firebase/init';
 * import { EMULATOR_CONFIG } from './config/emulator.config';
 * 
 * const config = loadFirebaseConfig();
 * const { app, auth, firestore } = initializeFirebase({
 *   config,
 *   emulators: EMULATOR_CONFIG,
 * });
 * ```
 */
export function initializeFirebase(options: InitializeFirebaseOptions): FirebaseServices {
  const { config, emulators } = options;

  // Initialize Firebase app
  const app = initializeApp(config);

  // Initialize services
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const storage = getStorage(app);
  const functions = getFunctions(app);

  // Connect to emulators based on granular config
  if (emulators?.auth) {
    connectAuthEmulator(auth, `http://${DF_EMULATOR_HOST}:${DF_EMULATOR_PORTS.auth}`, {
      disableWarnings: true,
    });
  }

  if (emulators?.firestore) {
    connectFirestoreEmulator(firestore, DF_EMULATOR_HOST, DF_EMULATOR_PORTS.firestore);
  }

  if (emulators?.storage) {
    connectStorageEmulator(storage, DF_EMULATOR_HOST, DF_EMULATOR_PORTS.storage);
  }

  if (emulators?.functions) {
    connectFunctionsEmulator(functions, DF_EMULATOR_HOST, DF_EMULATOR_PORTS.functions);
  }

  return { app, auth, firestore, storage, functions };
}
