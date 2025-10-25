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
export interface EmulatorHostConfig_Deprecated {
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
 * Granular emulator configuration for teaching apps
 * Allows per-service emulator toggling for different teaching scenarios
 * 
 * Each teaching app defines which services use emulators:
 * - teaching-app: all true (full emulator mode)
 * - teaching-app2: functions false (test deployed cloud functions)
 * - teaching-app3: functions false (test deployed cloud functions)
 * - teaching-app4: auth false (production auth, emulated data)
 * - teaching-app5: all false (full production mode)
 */
export interface EmulatorConfig {
  /** Use Auth emulator (port defined in packages/firebase/firebase.json) */
  auth: boolean;
  /** Use Firestore emulator (port defined in packages/firebase/firebase.json) */
  firestore: boolean;
  /** Use Storage emulator (port defined in packages/firebase/firebase.json) */
  storage: boolean;
  /** Use Functions emulator (port defined in packages/firebase/firebase.json) */
  functions: boolean;
}

/**
 * Emulator port configuration
 * Auto-generated from packages/firebase/firebase.json
 * See packages/firebase/src/emulator-config.ts
 */
export interface EmulatorPorts {
  auth: number;
  firestore: number;
  storage: number;
  functions: number;
  hosting: number;
  ui: number;
}

/**
 * Lightweight alias for the Firebase Auth user object so downstream packages
 * can avoid importing from the SDK directly when only the type is required.
 */
export type FirebaseUser = User;
