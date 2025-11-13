import type {EmulatorConfig} from '@df/types/firebase.types';

/**
 * Identifiers for the supported Firebase runtime environments.
 *  - `fb-emulator`: Prod Auth + local emulators for the rest.
 *  - `fb-cloud`: All services use live Firebase backends.
 */
export type FirebaseEnvironment = 'fb-emulator' | 'fb-cloud';

/**
 * Description of how each environment should connect to Firebase services.
 */
export interface EnvironmentConfig extends EmulatorConfig {
  label: string;
  description: string;
}

/**
 * Canonical map of Firebase environments to their emulator settings.
 * Auth is never emulated per monorepo policy.
 */
export const ENVIRONMENT_CONFIGS: Record<FirebaseEnvironment, EnvironmentConfig> = {
  'fb-emulator': {
    auth: false,
    firestore: true,
    storage: true,
    functions: true,
    label: 'Emulator Mode (fb-emulator)',
    description:
      'Using production authentication with local emulators for Firestore, Storage, and Functions.',
  },
  'fb-cloud': {
    auth: false,
    firestore: false,
    storage: false,
    functions: false,
    label: 'Cloud Mode (fb-cloud)',
    description: 'All Firebase services are connected to the live cloud environment.',
  },
} as const;

/**
 * Resolves the current Firebase environment configuration the app should use.
 * Defaults to `fb-emulator` when the Vite env var is missing or invalid.
 */
export function getFirebaseEnvironmentConfig(): EnvironmentConfig {
  const env = import.meta.env?.VITE_FIREBASE_ENV as FirebaseEnvironment | undefined;
  if (!env || !(env in ENVIRONMENT_CONFIGS)) {
    return ENVIRONMENT_CONFIGS['fb-emulator'];
  }
  return ENVIRONMENT_CONFIGS[env];
}
