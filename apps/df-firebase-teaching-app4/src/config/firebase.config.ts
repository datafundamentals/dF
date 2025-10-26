import type {EmulatorConfig} from '@df/types';

/**
 * Firebase Teaching App 4 - Stage 3: Near-production testing
 * Production auth with local data stores
 */
export const EMULATOR_CONFIG: EmulatorConfig = {
  auth: false, // Production auth
  firestore: true,
  storage: true,
  functions: false, // Production functions
};
