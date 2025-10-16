import type {FirebaseApp} from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type Auth,
  type IdTokenResult,
  type Unsubscribe,
  type User,
  type UserCredential,
} from 'firebase/auth';

import type {EmulatorHostConfig} from '@df/types/firebase.types';
import {formatEmulatorOrigin} from '../emulator-detection.js';

const connectedInstances = new WeakSet<Auth>();

/**
 * Google Auth Provider instance (singleton pattern)
 * Reuse across the app for consistent OAuth configuration
 */
let googleProvider: GoogleAuthProvider | null = null;

/**
 * Get or create the Google Auth Provider instance
 * Optionally configure scopes for additional Google API access
 */
export function getGoogleProvider(scopes: string[] = []): GoogleAuthProvider {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    // Add any default scopes here if needed
    // googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
  }

  // Add additional scopes if requested
  scopes.forEach(scope => googleProvider!.addScope(scope));

  return googleProvider;
}

/** Returns the shared Auth instance for the provided Firebase app. */
export function getFirebaseAuth(app: FirebaseApp): Auth {
  return getAuth(app);
}

/** Convenience accessor for the current user on the default Auth instance. */
export function getCurrentUser(app: FirebaseApp): User | null {
  return getFirebaseAuth(app).currentUser;
}

/**
 * Connects the supplied Auth instance to the emulator when not already linked.
 */
export function connectAuthToEmulator(auth: Auth, config: EmulatorHostConfig, suppressWarnings = true): void {
  if (connectedInstances.has(auth)) {
    return;
  }

  connectAuthEmulator(auth, formatEmulatorOrigin(config), {disableWarnings: suppressWarnings});
  connectedInstances.add(auth);
}

/**
 * Subscribe to auth state changes while automatically returning the unsubscribe
 * handler for ergonomic cleanup in teaching demos.
 */
export function onAuthStateChange(
  app: FirebaseApp,
  callback: (user: User | null) => void
): Unsubscribe {
  return getFirebaseAuth(app).onAuthStateChanged(callback);
}

/**
 * Sign in a user with email and password
 */
export async function signInWithEmail(
  auth: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Create a new user account with email and password
 */
export async function createUserWithEmail(
  auth: Auth,
  email: string,
  password: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user
 */
export async function signOut(auth: Auth): Promise<void> {
  return firebaseSignOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(auth: Auth, email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

/**
 * Update user profile (display name, photo URL)
 */
export async function updateUserProfile(
  user: User,
  profile: {displayName?: string | null; photoURL?: string | null}
): Promise<void> {
  return updateProfile(user, profile);
}

/**
 * Sign in with Google using popup window (recommended for desktop)
 *
 * This works in both emulator and production:
 * - Emulator: Shows simplified test account picker (no real Google OAuth)
 * - Production: Opens real Google OAuth popup
 *
 * @param auth - Firebase Auth instance
 * @param scopes - Optional Google API scopes (e.g., ['https://www.googleapis.com/auth/calendar'])
 * @returns UserCredential with user info and OAuth tokens
 *
 * @example
 * ```typescript
 * const auth = getFirebaseAuth(app);
 * const credential = await signInWithGoogle(auth);
 * console.log('User:', credential.user.displayName);
 * console.log('Email:', credential.user.email);
 * console.log('Photo:', credential.user.photoURL);
 * ```
 */
export async function signInWithGoogle(
  auth: Auth,
  scopes: string[] = []
): Promise<UserCredential> {
  const provider = getGoogleProvider(scopes);
  return signInWithPopup(auth, provider);
}

/**
 * Sign in with Google using redirect (recommended for mobile)
 *
 * After redirect, use getRedirectResult() to retrieve the UserCredential.
 *
 * @param auth - Firebase Auth instance
 * @param scopes - Optional Google API scopes
 *
 * @example
 * ```typescript
 * // Initiate redirect
 * await signInWithGoogleRedirect(auth);
 *
 * // On return, retrieve result (in app initialization)
 * const result = await getRedirectResult(auth);
 * if (result) {
 *   console.log('Signed in as:', result.user.email);
 * }
 * ```
 */
export async function signInWithGoogleRedirect(
  auth: Auth,
  scopes: string[] = []
): Promise<void> {
  const provider = getGoogleProvider(scopes);
  return signInWithRedirect(auth, provider);
}

export type {Auth, IdTokenResult, Unsubscribe, User, UserCredential};
