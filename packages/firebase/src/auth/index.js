import { connectAuthEmulator, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendPasswordResetEmail, updateProfile, } from 'firebase/auth';
import { formatEmulatorOrigin } from '../emulator-detection.js';
const connectedInstances = new WeakSet();
/** Returns the shared Auth instance for the provided Firebase app. */
export function getFirebaseAuth(app) {
    return getAuth(app);
}
/** Convenience accessor for the current user on the default Auth instance. */
export function getCurrentUser(app) {
    return getFirebaseAuth(app).currentUser;
}
/**
 * Connects the supplied Auth instance to the emulator when not already linked.
 */
export function connectAuthToEmulator(auth, config, suppressWarnings = true) {
    if (connectedInstances.has(auth)) {
        return;
    }
    connectAuthEmulator(auth, formatEmulatorOrigin(config), { disableWarnings: suppressWarnings });
    connectedInstances.add(auth);
}
/**
 * Subscribe to auth state changes while automatically returning the unsubscribe
 * handler for ergonomic cleanup in teaching demos.
 */
export function onAuthStateChange(app, callback) {
    return getFirebaseAuth(app).onAuthStateChanged(callback);
}
/**
 * Sign in a user with email and password
 */
export async function signInWithEmail(auth, email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}
/**
 * Create a new user account with email and password
 */
export async function createUserWithEmail(auth, email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}
/**
 * Sign out the current user
 */
export async function signOut(auth) {
    return firebaseSignOut(auth);
}
/**
 * Send password reset email
 */
export async function resetPassword(auth, email) {
    return sendPasswordResetEmail(auth, email);
}
/**
 * Update user profile (display name, photo URL)
 */
export async function updateUserProfile(user, profile) {
    return updateProfile(user, profile);
}
//# sourceMappingURL=index.js.map