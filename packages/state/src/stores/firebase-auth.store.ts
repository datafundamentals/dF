import {computed, signal} from '@lit-labs/signals';
import type {FirebaseApp} from 'firebase/app';
import type {
  AuthState,
  FirebaseAuthState,
  SignInCredentials,
  SignUpData,
  PasswordResetRequest,
  FirebaseUser,
} from '@df/types';
import {
  getFirebaseAuth,
  onAuthStateChange,
  signInWithEmail,
  createUserWithEmail,
  signOut as firebaseSignOut,
  resetPassword as firebaseResetPassword,
  updateUserProfile,
  type Auth,
  type Unsubscribe,
} from '@df/firebase/auth';

// Internal signal state
const authUserSignal = signal<FirebaseUser | null>(null);
const authStateSignal = signal<AuthState>('idle');
const errorSignal = signal<string | null>(null);
const initializedSignal = signal<boolean>(false);

// Reference to Firebase app and auth instance
let firebaseAppRef: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let unsubscribeAuthListener: Unsubscribe | null = null;

/**
 * Computed state that combines all auth signals
 * Following the signals-first architecture pattern
 */
export const firebaseAuthState = computed<FirebaseAuthState>(() => ({
  authUser: authUserSignal.get(),
  authState: authStateSignal.get(),
  error: errorSignal.get(),
  initialized: initializedSignal.get(),
}));

/**
 * Initialize the auth store with a Firebase app instance
 * This sets up the auth state listener
 */
export function initializeAuth(app: FirebaseApp): void {
  if (firebaseAppRef === app && unsubscribeAuthListener) {
    // Already initialized with this app
    return;
  }

  // Clean up previous listener if exists
  if (unsubscribeAuthListener) {
    unsubscribeAuthListener();
  }

  firebaseAppRef = app;
  authInstance = getFirebaseAuth(app);

  // Set up auth state listener
  authStateSignal.set('loading');
  unsubscribeAuthListener = onAuthStateChange(app, (user) => {
    authUserSignal.set(user);
    authStateSignal.set(user ? 'authenticated' : 'unauthenticated');
    initializedSignal.set(true);
    errorSignal.set(null);
  });
}

/**
 * Clean up auth listener (useful for tests)
 */
export function cleanupAuth(): void {
  if (unsubscribeAuthListener) {
    unsubscribeAuthListener();
    unsubscribeAuthListener = null;
  }
  firebaseAppRef = null;
  authInstance = null;
  authUserSignal.set(null);
  authStateSignal.set('idle');
  errorSignal.set(null);
  initializedSignal.set(false);
}

/**
 * Sign in with email and password
 */
export async function signIn(credentials: SignInCredentials): Promise<void> {
  if (!authInstance) {
    throw new Error('Auth not initialized. Call initializeAuth() first.');
  }

  authStateSignal.set('loading');
  errorSignal.set(null);

  try {
    const userCredential = await signInWithEmail(
      authInstance,
      credentials.email,
      credentials.password
    );

    // Auth state listener will update signals
    authUserSignal.set(userCredential.user);
    authStateSignal.set('authenticated');
  } catch (error) {
    authStateSignal.set('error');
    const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
    errorSignal.set(errorMessage);
    throw error;
  }
}

/**
 * Sign up (create new user) with email and password
 */
export async function signUp(data: SignUpData): Promise<void> {
  if (!authInstance) {
    throw new Error('Auth not initialized. Call initializeAuth() first.');
  }

  authStateSignal.set('loading');
  errorSignal.set(null);

  try {
    const userCredential = await createUserWithEmail(
      authInstance,
      data.email,
      data.password
    );

    // Update profile with display name if provided
    if (data.displayName && userCredential.user) {
      await updateUserProfile(userCredential.user, {
        displayName: data.displayName,
      });
    }

    // Auth state listener will update signals
    authUserSignal.set(userCredential.user);
    authStateSignal.set('authenticated');
  } catch (error) {
    authStateSignal.set('error');
    const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
    errorSignal.set(errorMessage);
    throw error;
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  if (!authInstance) {
    throw new Error('Auth not initialized. Call initializeAuth() first.');
  }

  authStateSignal.set('loading');
  errorSignal.set(null);

  try {
    await firebaseSignOut(authInstance);
    // Auth state listener will update signals
    authUserSignal.set(null);
    authStateSignal.set('unauthenticated');
  } catch (error) {
    authStateSignal.set('error');
    const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
    errorSignal.set(errorMessage);
    throw error;
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(request: PasswordResetRequest): Promise<void> {
  if (!authInstance) {
    throw new Error('Auth not initialized. Call initializeAuth() first.');
  }

  errorSignal.set(null);

  try {
    await firebaseResetPassword(authInstance, request.email);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
    errorSignal.set(errorMessage);
    throw error;
  }
}

/**
 * Clear any error state
 */
export function clearError(): void {
  errorSignal.set(null);
}

/**
 * Get current auth user (convenience getter)
 */
export function getCurrentAuthUser(): FirebaseUser | null {
  return authUserSignal.get();
}

/**
 * Check if user is authenticated (convenience getter)
 */
export function isAuthenticated(): boolean {
  return authStateSignal.get() === 'authenticated';
}

/**
 * Check if auth is loading (convenience getter)
 */
export function isAuthLoading(): boolean {
  return authStateSignal.get() === 'loading';
}
