import type {EnvironmentConfig} from '@df/firebase';
import type {EmulatorConfig} from '@df/types';
import {getEmulatorConfigForRuntime} from '@df/firebase';

const environmentConfig = getEmulatorConfigForRuntime();

/**
 * Resolved Firebase environment configuration for this app.
 * Automatically detects emulator mode from VITE_USE_EMULATOR env var:
 * - true: Uses local emulators for Firestore, Storage, Functions
 * - false or missing: Uses live Firebase cloud services
 */
export const ENVIRONMENT_CONFIG: EnvironmentConfig = environmentConfig;

/**
 * Emulator configuration consumed by initializeFirebaseForApp.
 * Alias for ENVIRONMENT_CONFIG for backward compatibility.
 */
export const EMULATOR_CONFIG: EmulatorConfig = environmentConfig;
