/**
 * Google Authentication Store
 *
 * Simplified auth store for Google Sign-In only (no emulator support).
 * This store manages authentication state using signals and handles token storage
 * in localStorage and sessionStorage for external consumption.
 *
 * @module google-auth.store
 *
 * @example Basic Usage
 * ```typescript
 * import {initializeGoogleAuth, signInWithGoogle, googleAuthUser} from '@df/state';
 * import {SignalWatcher} from '@lit-labs/signals';
 *
 * // 1. Initialize auth (in app entry point)
 * const app = initializeApp(firebaseConfig);
 * initializeGoogleAuth(app);
 *
 * // 2. Use in components
 * export class MyComponent extends SignalWatcher(LitElement) {
 *   render() {
 *     const user = googleAuthUser.get();
 *     return user
 *       ? html`<p>Welcome ${user.displayName}</p>`
 *       : html`<button @click=${signInWithGoogle}>Sign In</button>`;
 *   }
 * }
 * ```
 */

import {signal} from '@lit-labs/signals';
import {initializeApp, type FirebaseApp} from 'firebase/app';
import type {User} from 'firebase/auth';
import {
  getFirebaseAuth,
  onAuthStateChange,
  signInWithGoogle as firebaseSignInWithGoogle,
  signOut as firebaseSignOut,
  type Auth,
  type Unsubscribe,
} from '@df/firebase/auth';
import {GOOGLE_AUTH_FIREBASE_CONFIG} from './google-auth-config.js';

/**
 * Signal holding the current Google authenticated user.
 * Null when no user is signed in.
 */
export const googleAuthUser = signal<User | null>(null);

// Internal references
let firebaseAppRef: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let unsubscribeAuthListener: Unsubscribe | null = null;

/**
 * Stores user info and auth token in browser storage.
 * This matches the legacy pattern for external consumption.
 *
 * @internal
 */
async function storeAuthToken(user: User): Promise<void> {
  try {
    const idToken = await user.getIdToken(true);
    localStorage.setItem('User', JSON.stringify(user));
    sessionStorage.setItem('Authorization', `Bearer ${idToken}`);
    document.cookie = `authToken=${idToken}; path=/; secure; samesite=strict; max-age=3600`;
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
}

/**
 * Clears user info and auth token from browser storage.
 *
 * @internal
 */
function clearAuthToken(): void {
  localStorage.removeItem('User');
  sessionStorage.removeItem('Authorization');
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Initialize Google authentication.
 * Creates a separate Firebase app instance for Google auth (using config from .env.production)
 * and sets up the auth state listener.
 *
 * IMPORTANT: This uses a SEPARATE Firebase project from your app's main Firebase config.
 * The Google auth config is read from packages/state/.env.production at build time.
 *
 * @example
 * ```typescript
 * import {initializeGoogleAuth} from '@df/state';
 *
 * // No parameters needed - uses built-in config
 * await initializeGoogleAuth();
 * ```
 */
export async function initializeGoogleAuth(): Promise<void> {
  if (firebaseAppRef) {
    console.warn('Google auth already initialized');
    return;
  }

  // Initialize separate Firebase app for Google auth
  // This uses the config from packages/state/.env.production (generated at build time)
  firebaseAppRef = initializeApp(GOOGLE_AUTH_FIREBASE_CONFIG, 'google-auth-app');
  authInstance = getFirebaseAuth(firebaseAppRef);

  // Set up auth state listener
  unsubscribeAuthListener = onAuthStateChange(firebaseAppRef, async (user) => {
    googleAuthUser.set(user);

    if (user) {
      await storeAuthToken(user);
    } else {
      clearAuthToken();
    }
  });
}

/**
 * Sign in with Google using popup flow.
 * Opens Google OAuth popup for authentication.
 *
 * @throws Error if auth is not initialized or sign-in fails
 *
 * @example
 * ```typescript
 * import {googleSignIn} from '@df/state';
 *
 * async function handleSignIn() {
 *   try {
 *     await googleSignIn();
 *     console.log('Signed in successfully');
 *   } catch (error) {
 *     console.error('Sign in failed:', error);
 *   }
 * }
 * ```
 */
export async function googleSignIn(): Promise<void> {
  if (!authInstance) {
    throw new Error('Google auth not initialized. Call initializeGoogleAuth() first.');
  }

  try {
    const userCredential = await firebaseSignInWithGoogle(authInstance);
    googleAuthUser.set(userCredential.user);
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

/**
 * Sign out the current user.
 * Clears auth state and removes stored tokens.
 *
 * @example
 * ```typescript
 * import {googleSignOut} from '@df/state';
 *
 * async function handleSignOut() {
 *   await googleSignOut();
 *   console.log('Signed out');
 * }
 * ```
 */
export async function googleSignOut(): Promise<void> {
  if (!authInstance) {
    throw new Error('Google auth not initialized');
  }

  try {
    await firebaseSignOut(authInstance);
    googleAuthUser.set(null);
    clearAuthToken();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

/**
 * Clean up auth listener.
 * Call this when unmounting the app or in tests.
 *
 * @example
 * ```typescript
 * import {cleanupGoogleAuth} from '@df/state';
 *
 * // In app cleanup or tests
 * cleanupGoogleAuth();
 * ```
 */
export function cleanupGoogleAuth(): void {
  if (unsubscribeAuthListener) {
    unsubscribeAuthListener();
    unsubscribeAuthListener = null;
  }
  firebaseAppRef = null;
  authInstance = null;
  googleAuthUser.set(null);
  clearAuthToken();
}

/**
 * Get the current authenticated user (convenience getter).
 *
 * @returns The current user or null
 */
export function getCurrentGoogleUser(): User | null {
  return googleAuthUser.get();
}

/**
 * Check if a user is currently authenticated.
 *
 * @returns true if user is signed in
 */
export function isGoogleAuthenticated(): boolean {
  return googleAuthUser.get() !== null;
}
