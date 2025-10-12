import type {FirebaseApp} from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

export type {Auth, IdTokenResult, Unsubscribe, User, UserCredential};
