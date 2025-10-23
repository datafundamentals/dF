/**
 * Google Auth to Teaching App Token Exchange
 *
 * This module bridges authentication between two Firebase projects:
 * 1. Google Auth Project (df-auth-wrapper's dedicated auth project)
 * 2. Teaching App Project (this app's Firebase project for data/functions)
 *
 * When a user signs in via df-auth-wrapper (Google auth), this automatically:
 * - Detects the login
 * - Exchanges the Google auth token for a teaching app custom token
 * - Signs the user into the teaching app's Auth instance
 * - Enables Firestore/Storage/Functions to work with authenticated context
 *
 * Usage: Import this module in your app's entry point (main.ts)
 */

import {googleAuthUser} from '@df/state';
import {getAuth, signInWithCustomToken, type Auth} from 'firebase/auth';
import {getFunctions, httpsCallable, connectFunctionsEmulator} from 'firebase/functions';
import {getFirebaseApp} from '@df/firebase';
import {getFirebaseConfig, useEmulator} from './config/firebase.config.js';

let isExchanging = false;
let hasExchanged = false;
let pollIntervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Flag indicating when teaching app auth is ready for use
 * Exported for components that need to wait for token exchange
 */
export let teachingAppAuthReady = false;

interface ExchangeTokenResponse {
  customToken: string;
  uid: string;
}

/**
 * Gets teaching app's Auth instance and connects to emulator if configured
 */
let teachingAuthInstance: Auth | null = null;

function getTeachingAuth(): Auth {
  if (!teachingAuthInstance) {
    const config = getFirebaseConfig();
    const app = getFirebaseApp(config);
    teachingAuthInstance = getAuth(app);
    console.log('[token-exchange] Teaching app Auth initialized (no emulator)');
  }
  
  return teachingAuthInstance;
}

/**
 * Exchanges Google Auth ID Token for Teaching App Custom Token
 */
async function exchangeToken(idToken: string): Promise<string> {
  const config = getFirebaseConfig();
  const app = getFirebaseApp(config);
  const functions = getFunctions(app);

  // Connect to emulator if configured
  if (useEmulator()) {
    connectFunctionsEmulator(functions, '127.0.0.1', 5501);
  }

  const exchange = httpsCallable<{idToken: string}, ExchangeTokenResponse>(
    functions,
    'exchangeGoogleToken'
  );

  const result = await exchange({idToken});
  return result.data.customToken;
}

/**
 * Signs user into teaching app's Auth instance using custom token
 */
async function signIntoTeachingApp(customToken: string): Promise<void> {
  const teachingAuth = getTeachingAuth();
  const userCredential = await signInWithCustomToken(teachingAuth, customToken);
  console.log('[token-exchange] Successfully signed into teaching app', {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
  });
}

/**
 * Handles Google auth login and exchanges token
 */
async function handleGoogleAuthLogin(): Promise<void> {
  // Early exit if already exchanging or already exchanged
  if (isExchanging || hasExchanged) {
    console.log('[token-exchange] Skipping - isExchanging:', isExchanging, 'hasExchanged:', hasExchanged);
    return;
  }

  const googleUser = googleAuthUser.get();
  if (!googleUser) {
    hasExchanged = false; // Reset if user signs out
    return;
  }

  // Check if teaching app already has a user
  const teachingAuth = getTeachingAuth();
  
  if (teachingAuth.currentUser) {
    // Already signed in, stop polling
    if (!hasExchanged) {
      console.log('[token-exchange] Teaching app already has authenticated user - stopping polling');
      hasExchanged = true;
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
        pollIntervalId = null;
      }
    }
    return;
  }

  // Set flag BEFORE async operations to prevent race conditions
  isExchanging = true;
  console.log('[token-exchange] Starting token exchange...');

  try {
    console.log('[token-exchange] Google user detected, exchanging token...');

    // Get ID Token from Google auth
    const idToken = await googleUser.getIdToken();

    // Exchange for custom token
    const customToken = await exchangeToken(idToken);

    // Sign into teaching app's Auth
    await signIntoTeachingApp(customToken);

    // Mark as exchanged and stop polling BEFORE releasing lock
    hasExchanged = true;
    
    // Stop polling after successful exchange
    if (pollIntervalId) {
      clearInterval(pollIntervalId);
      pollIntervalId = null;
      console.log('[token-exchange] Token exchange complete - stopped polling');
    }
  } catch (error) {
    console.error('[token-exchange] Failed to exchange token:', error);
    // Don't set hasExchanged = true so we can retry
    isExchanging = false; // Release lock on error
  }
  // Note: Don't reset isExchanging on success - leave it true with hasExchanged
}

/**
 * Initialize token exchange watcher
 *
 * Call this once in your app's entry point to enable automatic
 * token exchange when users sign in via df-auth-wrapper.
 */
export function initializeTokenExchange(): void {
  // Check immediately first
  void handleGoogleAuthLogin();
  
  // Watch for Google auth state changes
  // Note: We use a manual check instead of computed/effect to avoid
  // circular dependencies with the signals system
  pollIntervalId = setInterval(() => {
    void handleGoogleAuthLogin();
  }, 500);
}

/**
 * Reset the exchange state (useful for testing or sign-out scenarios)
 */
export function resetTokenExchange(): void {
  hasExchanged = false;
  isExchanging = false;
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
    console.log('[token-exchange] Reset complete - cleared polling interval');
  }
}
