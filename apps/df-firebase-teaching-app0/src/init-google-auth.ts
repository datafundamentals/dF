/**
 * Google Authentication Initialization for Teaching App
 *
 * This file provides a centralized initialization pattern for df-auth-wrapper
 * in the teaching app context. Each consuming app should create its own
 * initialization file that:
 * 1. Reads its own Firebase config (from .env using loadFirebaseConfig)
 * 2. Passes config to initializeGoogleAuth(config) from @df/state
 *
 * PATTERN: "Consumer Configures"
 * - The consuming app (teaching app) owns the Firebase config (.env files)
 * - The package (@df/state) receives FirebaseConfig
 * - No hardcoded config or build-time generation
 *
 * Usage in HTML:
 * ```html
 * <script type="module">
 *   import { initializeGoogleAuthForTeachingApp } from './src/init-google-auth.js';
 *   await initializeGoogleAuthForTeachingApp();
 * </script>
 * ```
 */

import {initializeGoogleAuth} from '@df/state';
import {loadFirebaseConfig} from '@df/firebase/firebase-config';
import {initializeTokenExchange} from './auth-token-exchange.js';

/**
 * Initializes Google Authentication for the teaching app
 * 
 * This wrapper does two things:
 * 1. Loads Firebase config from .env and initializes Google auth
 * 2. Sets up automatic token exchange to bridge Google auth with teaching app auth
 *
 * ARCHITECTURE:
 * - Google auth uses same Firebase config as rest of app (from .env files)
 * - Teaching app uses apps/df-firebase-teaching-app0/.env.* (emulator or production)
 * - Token exchange bridges auth systems via Cloud Function when needed
 * - Unified configuration approach - no duplication
 *
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeGoogleAuthForTeachingApp(): Promise<void> {
  // Load Firebase config from environment variables
  const config = loadFirebaseConfig();
  
  // Initialize Google auth with loaded config
  await initializeGoogleAuth(config);
  
  // Set up automatic token exchange
  // This watches googleAuthUser and exchanges tokens automatically
  initializeTokenExchange();
}
