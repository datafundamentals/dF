import type {EmulatorConfig} from '@df/types';

/**
 * Firebase Teaching App 1 - Emulator configuration
 * Uses cloud authentication (no auth emulator per STANDARDS_STYLES.md)
 * Local emulators for Firestore, Storage, and Functions
 */
export const EMULATOR_CONFIG: EmulatorConfig = {
  auth: false, // ✅ STANDARDS COMPLIANT: Auth emulator disabled
  firestore: true,
  storage: true,
  functions: true,
};
