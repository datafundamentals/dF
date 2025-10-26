import type {EmulatorConfig} from '@df/types';

/**
 * Activity log always targets the local Firebase emulator suite.
 */
export const EMULATOR_CONFIG: EmulatorConfig = {
  auth: true,
  firestore: true,
  storage: true,
  functions: true,
};
