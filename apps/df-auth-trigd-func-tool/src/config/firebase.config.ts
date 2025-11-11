import type {EmulatorConfig} from '@df/types';

/**
 * Auth-triggered function tool runs only the auth + functions emulators.
 */
export const EMULATOR_CONFIG: EmulatorConfig = {
  auth: true,
  firestore: true,
  storage: false,
  functions: true,
};
