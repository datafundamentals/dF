import type {User} from 'firebase/auth';

/**
 * Configuration values required to initialize a Firebase application instance.
 * Mirrors the public Firebase web config but keeps optional fields explicit.
 */
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

/**
 * Host/port definition for a single Firebase emulator service.
 */
export interface EmulatorHostConfig {
  host: string;
  port: number;
  /**
   * Some emulators support secure endpoints. Defaults to http when undefined.
   */
  secure?: boolean;
}

/**
 * Aggregate configuration describing all Firebase emulator endpoints that an
 * app may connect to. Fields are optional so consumers can opt-in per service.
 */
export interface EmulatorConfig {
  /**
   * Optional global flag to indicate whether emulator connections should be
   * attempted. When omitted, callers can decide based on their own context.
   */
  enabled?: boolean;
  auth?: EmulatorHostConfig;
  firestore?: EmulatorHostConfig;
  storage?: EmulatorHostConfig;
  functions?: EmulatorHostConfig & {
    /** Region the Functions emulator listens on (defaults to `us-central1`). */
    region?: string;
  };
  hosting?: EmulatorHostConfig;
  ui?: {
    /** Base URL for the Emulator UI, used for health checks and links. */
    url: string;
  };
}

/**
 * Lightweight alias for the Firebase Auth user object so downstream packages
 * can avoid importing from the SDK directly when only the type is required.
 */
export type FirebaseUser = User;
