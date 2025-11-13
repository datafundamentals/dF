import type {EnvironmentConfig} from '@df/firebase';
import type {EmulatorConfig} from '@df/types';
import {getFirebaseEnvironmentConfig} from '@df/firebase';

const environmentConfig = getFirebaseEnvironmentConfig();

/**
 * Resolved Firebase environment configuration for this app.
 * Defaults to emulator mode unless VITE_FIREBASE_ENV overrides it.
 */
export const ENVIRONMENT_CONFIG: EnvironmentConfig = environmentConfig;

/**
 * Backwards compatible alias consumed by initializeFirebaseForApp.
 */
export const EMULATOR_CONFIG: EmulatorConfig = environmentConfig;
