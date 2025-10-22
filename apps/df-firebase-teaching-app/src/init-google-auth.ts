/**
 * Google Authentication Initialization for Teaching App
 *
 * This file provides a centralized initialization pattern for df-auth-wrapper
 * in the teaching app context. Each consuming app should create its own
 * initialization file that:
 * 1. Reads its own Firebase config (from .env.production or other source)
 * 2. Initializes Firebase App
 * 3. Calls initializeGoogleAuth(app) from @df/state
 *
 * PATTERN: "Consumer Configures"
 * - The consuming app (teaching app) owns the Firebase config
 * - The package (df-auth-wrapper) receives an initialized FirebaseApp
 * - No coupling between packages and app-level environment variables
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
import {initializeTokenExchange} from './auth-token-exchange.js';

/**
 * Initializes Google Authentication for the teaching app
 * 
 * This wrapper does two things:
 * 1. Initializes Google auth (using packages/state/.env.production config)
 * 2. Sets up automatic token exchange to bridge Google auth with teaching app auth
 *
 * ARCHITECTURE:
 * - Google auth uses packages/state/.env.production (separate Firebase project)
 * - Teaching app uses apps/df-firebase-teaching-app/.env.* (emulator config)
 * - Token exchange bridges the two auth systems via Cloud Function
 * - No coupling between the two configs
 *
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeGoogleAuthForTeachingApp(): Promise<void> {
  // Initialize Google auth (separate Firebase project)
  await initializeGoogleAuth();
  
  // Set up automatic token exchange
  // This watches googleAuthUser and exchanges tokens automatically
  initializeTokenExchange();
}
