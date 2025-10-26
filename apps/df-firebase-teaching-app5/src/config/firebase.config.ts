import type {EmulatorConfig} from '@df/types';

/**
 * Firebase Teaching App 5 - Stage 4: Full production
 * All services use production Firebase infrastructure
 */
export const EMULATOR_CONFIG: EmulatorConfig = {
  auth: false,
  firestore: false,
  storage: false,
  functions: false,
};
