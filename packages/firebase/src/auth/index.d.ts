import type { FirebaseApp } from 'firebase/app';
import { type Auth, type IdTokenResult, type Unsubscribe, type User, type UserCredential } from 'firebase/auth';
import type { EmulatorHostConfig } from '@df/types/firebase.types';
/** Returns the shared Auth instance for the provided Firebase app. */
export declare function getFirebaseAuth(app: FirebaseApp): Auth;
/** Convenience accessor for the current user on the default Auth instance. */
export declare function getCurrentUser(app: FirebaseApp): User | null;
/**
 * Connects the supplied Auth instance to the emulator when not already linked.
 */
export declare function connectAuthToEmulator(auth: Auth, config: EmulatorHostConfig, suppressWarnings?: boolean): void;
/**
 * Subscribe to auth state changes while automatically returning the unsubscribe
 * handler for ergonomic cleanup in teaching demos.
 */
export declare function onAuthStateChange(app: FirebaseApp, callback: (user: User | null) => void): Unsubscribe;
/**
 * Sign in a user with email and password
 */
export declare function signInWithEmail(auth: Auth, email: string, password: string): Promise<UserCredential>;
/**
 * Create a new user account with email and password
 */
export declare function createUserWithEmail(auth: Auth, email: string, password: string): Promise<UserCredential>;
/**
 * Sign out the current user
 */
export declare function signOut(auth: Auth): Promise<void>;
/**
 * Send password reset email
 */
export declare function resetPassword(auth: Auth, email: string): Promise<void>;
/**
 * Update user profile (display name, photo URL)
 */
export declare function updateUserProfile(user: User, profile: {
    displayName?: string | null;
    photoURL?: string | null;
}): Promise<void>;
export type { Auth, IdTokenResult, Unsubscribe, User, UserCredential };
//# sourceMappingURL=index.d.ts.map