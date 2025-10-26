import type {EmulatorConfig} from '@df/types';

/**
 * Firebase Teaching App - Stage 1: Full local development
 * All services use emulators for pure offline development
 */
export const EMULATOR_CONFIG: EmulatorConfig = {
  auth: true,
  firestore: true,
  storage: true,
  functions: true,
};
