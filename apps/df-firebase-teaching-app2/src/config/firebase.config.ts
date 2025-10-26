import type {EmulatorConfig} from '@df/types';

/**
 * Firebase Teaching App 2 - Stage 2: Hybrid development
 * Local data stores with production cloud functions
 */
export const EMULATOR_CONFIG: EmulatorConfig = {
  auth: true,
  firestore: true,
  storage: true,
  functions: false, // Production functions
};
