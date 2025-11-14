import type {EnvironmentConfig} from '@df/firebase';
import type {EmulatorConfig} from '@df/types';
import {getEmulatorConfigForRuntime} from '@df/firebase';

const environmentConfig = getEmulatorConfigForRuntime();

/**
 * Resolved Firebase environment configuration for df-activity-log.
 * Automatically switches between emulator + cloud modes based on VITE_USE_EMULATOR.
 */
export const ENVIRONMENT_CONFIG: EnvironmentConfig = environmentConfig;

/**
 * Backwards-compatible alias for consumers that still expect EMULATOR_CONFIG.
 */
export const EMULATOR_CONFIG: EmulatorConfig = environmentConfig;
