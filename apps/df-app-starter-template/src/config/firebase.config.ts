import type {EmulatorConfig} from '@df/types';

/**
 * Firebase App Starter Template - Minimal emulator configuration
 * Uses emulator for data services (firestore, storage)
 * Does NOT use auth emulator (connects to production Firebase Auth)
 * Does NOT use functions (app has no Cloud Functions)
 */
export const EMULATOR_CONFIG: EmulatorConfig = {
  auth: false, // Template app uses production Auth - no emulator needed
  firestore: true,
  storage: true,
  functions: false, // App has no Cloud Functions
};
