import type {FirebaseApp} from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
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

export type {Auth, IdTokenResult, Unsubscribe, User, UserCredential};
