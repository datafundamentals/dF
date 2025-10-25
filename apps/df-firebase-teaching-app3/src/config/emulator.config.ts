/**
 * Emulator Configuration for df-firebase-teaching-app3
 * 
 * Teaching Goal: Demonstrate emulated Auth, Firestore, Storage, and Functions
 * All services use local emulators for development and teaching
 */

import type {EmulatorConfig} from '@df/types/firebase.types';

export const EMULATOR_CONFIG: EmulatorConfig = {
  auth: true,
  firestore: true,
  storage: true,
  functions: true,
};
