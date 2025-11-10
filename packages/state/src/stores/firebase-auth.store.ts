/**
 * Firebase Authentication Store
 *
 * Centralized state management for Firebase Authentication using signals.
 * This store follows the signals-first architecture pattern for reactive state updates.
 *
 * @module firebase-auth.store
 *
 * @example Basic Usage
 * ```typescript
 * import {initializeAuth, signIn, firebaseAuthState} from '@df/state';
 * import {SignalWatcher} from '@lit-labs/signals';
 *
 * // 1. Initialize auth (in app entry point)
 * const app = getFirebaseApp(config);
 * initializeAuth(app);
 *
 * // 2. Use in components
 * export class MyComponent extends SignalWatcher(LitElement) {
 *   render() {
 *     const {authUser, authState} = firebaseAuthState.get();
 *     return authState === 'authenticated'
 *       ? html`<p>Welcome ${authUser?.email}</p>`
 *       : html`<df-sign-in></df-sign-in>`;
 *   }
 * }
 *
 * // 3. Call actions
 * await signIn({email: 'user@example.com', password: 'password123'});
 * ```
 *
 * @see {@link https://github.com/lit/lit/tree/main/packages/labs/signals | @lit-labs/signals Documentation}
 * @see {@link https://firebase.google.com/docs/auth | Firebase Auth Documentation}
 */

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
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithGoogleRedirect as firebaseSignInWithGoogleRedirect,
  signOut as firebaseSignOut,
  resetPassword as firebaseResetPassword,
  updateUserProfile,
  connectAuthToEmulator,
  type Auth,
  type Unsubscribe,
} from '@df/firebase/auth';
import {
  getInitializedFirebaseApp,
  shouldUseEmulatorForService,
} from './firebase-init.js';

/**
 * Internal signal holding the current authenticated user.
 * @internal
 */
const authUserSignal = signal<FirebaseUser | null>(null);

/**
 * Internal signal holding the current authentication state.
 * Possible values: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'
 * @internal
 */
const authStateSignal = signal<AuthState>('idle');

/**
 * Internal signal holding the most recent error message.
 * Null when no error exists.
 * @internal
 */
const errorSignal = signal<string | null>(null);

/**
 * Internal signal indicating whether auth has completed initial state check.
 * Useful for showing loading states while auth initializes.
 * @internal
 */
const initializedSignal = signal<boolean>(false);

let demoMode = false;

// Reference to Firebase app and auth instance
let firebaseAppRef: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let unsubscribeAuthListener: Unsubscribe | null = null;

/**
 * Stores user info and auth token in browser storage.
 * Token stored for external integrations to consume.
 *
 * **Note:** app1 exception - Uses Auth Emulator for email/password development.
 * See `apps/df-firebase-teaching-app1` for details.
 *
 * @internal
 */
async function storeAuthToken(user: FirebaseUser): Promise<void> {
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
 * Ensures auth is initialized with lazy loading.
 * Safe to call multiple times - will only initialize once.
 *
 * @internal
 */
function ensureAuthInitialized(): void {
  if (demoMode) {
    return;
  }

  if (authInstance && unsubscribeAuthListener) {
    // Already initialized
    return;
  }

  const app = getInitializedFirebaseApp();

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
  demoMode = false;

  // Connect to emulator if configured
  if (shouldUseEmulatorForService('auth')) {
    connectAuthToEmulator(authInstance, {
      host: '127.0.0.1',
      port: 9155,
    });
  }

  // Set up auth state listener
  authStateSignal.set('loading');
  unsubscribeAuthListener = onAuthStateChange(app, async (user) => {
    authUserSignal.set(user);
    authStateSignal.set(user ? 'authenticated' : 'unauthenticated');
    initializedSignal.set(true);
    errorSignal.set(null);

    // Store or clear auth token based on user state
    if (user) {
      await storeAuthToken(user);
    } else {
      clearAuthToken();
    }
  });
}

/**
 * Computed state that combines all auth signals.
 *
 * This is the primary way to access authentication state in components.
 * Automatically updates when any underlying signal changes.
 *
 * @returns {FirebaseAuthState} Combined auth state object
 * @property {FirebaseUser | null} authUser - The current authenticated user or null
 * @property {AuthState} authState - Current state: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'
 * @property {string | null} error - Error message if authState is 'error', otherwise null
 * @property {boolean} initialized - True after initial auth state check completes
 *
 * @example
 * ```typescript
 * const {authUser, authState, error} = firebaseAuthState.get();
 *
 * if (authState === 'loading') return html`<loading-spinner></loading-spinner>`;
 * if (authState === 'error') return html`<error-message>${error}</error-message>`;
 * if (authState === 'authenticated') return html`<p>Welcome ${authUser?.email}</p>`;
 * return html`<sign-in-form></sign-in-form>`;
 * ```
 */
export const firebaseAuthState = computed<FirebaseAuthState>(() => {
  return {
    authUser: authUserSignal.get(),
    authState: authStateSignal.get(),
    error: errorSignal.get(),
    initialized: initializedSignal.get(),
  };
});

/**
 * Initialize the auth store with a Firebase app instance.
 *
 * This function:
 * 1. Sets up Firebase Auth instance
 * 2. Establishes auth state listener
 * 3. Updates signals when user signs in/out
 * 4. Cleans up previous listener if re-initializing
 *
 * **Important:** Call this once in your app's entry point before rendering any components.
 *
 * @param {FirebaseApp} app - The initialized Firebase app instance
 *
 * @example
 * ```typescript
 * // In main.ts or index.ts
 * import {initializeApp} from 'firebase/app';
 * import {initializeAuth} from '@df/state';
 *
 * const app = initializeApp(firebaseConfig);
 * initializeAuth(app);
 *
 * // Now render your app
 * render(html`<my-app></my-app>`, document.body);
 * ```
 *
 * @example With Emulator
 * ```typescript
 * import {getAuth, connectAuthEmulator} from 'firebase/auth';
 *
 * const app = initializeApp(firebaseConfig);
 *
 * if (import.meta.env.VITE_USE_EMULATOR === 'true') {
 *   const auth = getAuth(app);
 *   connectAuthEmulator(auth, 'http://127.0.0.1:9155');
 * }
 *
 * initializeAuth(app);
 * ```
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

  // Connect to emulator if configured
  if (shouldUseEmulatorForService('auth')) {
    connectAuthToEmulator(authInstance, {
      host: '127.0.0.1',
      port: 9155,
    });
  }

  // Set up auth state listener
  authStateSignal.set('loading');
  unsubscribeAuthListener = onAuthStateChange(app, async (user) => {
    authUserSignal.set(user);
    authStateSignal.set(user ? 'authenticated' : 'unauthenticated');
    initializedSignal.set(true);
    errorSignal.set(null);

    // Store or clear auth token based on user state
    if (user) {
      await storeAuthToken(user);
    } else {
      clearAuthToken();
    }
  });
}

/**
 * Clean up auth listener and reset all state.
 *
 * Primarily used in tests to reset auth state between test cases.
 * You generally don't need to call this in production code.
 *
 * @example Testing Pattern
 * ```typescript
 * import {describe, it, afterEach} from 'vitest';
 * import {initializeAuth, cleanupAuth} from './firebase-auth.store';
 *
 * describe('My Component', () => {
 *   afterEach(() => {
 *     cleanupAuth(); // Reset state after each test
 *   });
 *
 *   it('should render sign-in form when unauthenticated', () => {
 *     // Test implementation
 *   });
 * });
 * ```
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
  demoMode = false;
}

export function __setAuthDemoState(state: FirebaseAuthState): void {
  if (firebaseAppRef || authInstance || unsubscribeAuthListener) {
    throw new Error('Cannot set auth demo state after auth has been initialized.');
  }

  demoMode = true;
  authUserSignal.set(state.authUser);
  authStateSignal.set(state.authState);
  errorSignal.set(state.error);
  initializedSignal.set(state.initialized);
}

export function __resetAuthDemoState(): void {
  if (!demoMode) {
    return;
  }

  demoMode = false;
  authUserSignal.set(null);
  authStateSignal.set('idle');
  errorSignal.set(null);
  initializedSignal.set(false);
}

/**
 * Sign in a user with email and password.
 *
 * Updates auth state signals automatically on success or failure.
 * Components using SignalWatcher will re-render when state changes.
 *
 * @param {SignInCredentials} credentials - Object containing email and password
 * @param {string} credentials.email - User's email address
 * @param {string} credentials.password - User's password (min 6 characters)
 *
 * @throws {Error} If auth not initialized or Firebase auth fails
 * @returns {Promise<void>} Resolves on successful sign-in, rejects on failure
 *
 * @example
 * ```typescript
 * try {
 *   await signIn({
 *     email: 'user@example.com',
 *     password: 'password123'
 *   });
 *   console.log('Signed in successfully');
 *   // Navigate to protected route
 * } catch (error) {
 *   console.error('Sign in failed:', error);
 *   // Error is also in firebaseAuthState.get().error
 * }
 * ```
 *
 * @example With Emulator Test Credentials
 * ```typescript
 * // These users exist after running seed script
 * await signIn({
 *   email: 'alice.anderson@example.com',
 *   password: 'password123'
 * });
 * ```
 */
export async function signIn(credentials: SignInCredentials): Promise<void> {
  ensureAuthInitialized();

  if (!authInstance) {
    throw new Error('Auth initialization failed');
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
    await storeAuthToken(userCredential.user);
  } catch (error) {
    authStateSignal.set('error');
    const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
    errorSignal.set(errorMessage);
    throw error;
  }
}

/**
 * Create a new user account with email and password.
 *
 * Optionally sets display name if provided. Updates auth state signals
 * automatically. User is signed in immediately after account creation.
 *
 * @param {SignUpData} data - Registration data
 * @param {string} data.email - User's email address
 * @param {string} data.password - User's password (min 6 characters)
 * @param {string} [data.displayName] - Optional display name for user profile
 *
 * @throws {Error} If auth not initialized, email already exists, or Firebase auth fails
 * @returns {Promise<void>} Resolves when account created and user signed in
 *
 * @example
 * ```typescript
 * try {
 *   await signUp({
 *     email: 'newuser@example.com',
 *     password: 'securepassword',
 *     displayName: 'John Doe'
 *   });
 *   console.log('Account created and signed in');
 * } catch (error) {
 *   if (error.code === 'auth/email-already-in-use') {
 *     console.error('Email already registered');
 *   }
 * }
 * ```
 */
export async function signUp(data: SignUpData): Promise<void> {
  ensureAuthInitialized();

  if (!authInstance) {
    throw new Error('Auth initialization failed');
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
    await storeAuthToken(userCredential.user);
  } catch (error) {
    authStateSignal.set('error');
    const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
    errorSignal.set(errorMessage);
    throw error;
  }
}

/**
 * Sign out the currently authenticated user.
 *
 * Clears auth signals and updates state to 'unauthenticated'.
 * Components will automatically re-render to show unauthenticated UI.
 *
 * @throws {Error} If auth not initialized or Firebase sign-out fails
 * @returns {Promise<void>} Resolves when user successfully signed out
 *
 * @example
 * ```typescript
 * try {
 *   await signOut();
 *   console.log('User signed out');
 *   // Navigate to home page or sign-in page
 * } catch (error) {
 *   console.error('Sign out failed:', error);
 * }
 * ```
 */
export async function signOut(): Promise<void> {
  ensureAuthInitialized();

  if (!authInstance) {
    throw new Error('Auth initialization failed');
  }

  authStateSignal.set('loading');
  errorSignal.set(null);

  try {
    await firebaseSignOut(authInstance);
    // Auth state listener will update signals
    authUserSignal.set(null);
    authStateSignal.set('unauthenticated');
    clearAuthToken();
  } catch (error) {
    authStateSignal.set('error');
    const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
    errorSignal.set(errorMessage);
    throw error;
  }
}

/**
 * Send a password reset email to the user.
 *
 * Firebase will send an email with a link to reset the password.
 * Does not sign out the current user.
 *
 * @param {PasswordResetRequest} request - Object containing email
 * @param {string} request.email - Email address to send reset link to
 *
 * @throws {Error} If auth not initialized or email not found
 * @returns {Promise<void>} Resolves when reset email sent successfully
 *
 * @example
 * ```typescript
 * try {
 *   await resetPassword({email: 'user@example.com'});
 *   console.log('Password reset email sent');
 *   // Show success message to user
 * } catch (error) {
 *   if (error.code === 'auth/user-not-found') {
 *     console.error('No account with that email');
 *   }
 * }
 * ```
 */
export async function resetPassword(request: PasswordResetRequest): Promise<void> {
  ensureAuthInitialized();
  
  if (!authInstance) {
    throw new Error('Auth initialization failed');
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
 * Clear the current error state.
 *
 * Useful for dismissing error messages in the UI after user acknowledges them.
 *
 * @example
 * ```typescript
 * // In a component
 * render() {
 *   const {error} = firebaseAuthState.get();
 *
 *   if (error) {
 *     return html`
 *       <div class="error">
 *         <p>${error}</p>
 *         <button @click=${clearError}>Dismiss</button>
 *       </div>
 *     `;
 *   }
 * }
 * ```
 */
export function clearError(): void {
  errorSignal.set(null);
}

/**
 * Get the current authenticated user.
 *
 * Convenience getter that returns the authUser from firebaseAuthState.
 * Returns null if no user is signed in.
 *
 * @returns {FirebaseUser | null} Current user object or null
 *
 * @example
 * ```typescript
 * const user = getCurrentAuthUser();
 * if (user) {
 *   console.log('User ID:', user.uid);
 *   console.log('Email:', user.email);
 *   console.log('Display Name:', user.displayName);
 * }
 * ```
 */
export function getCurrentAuthUser(): FirebaseUser | null {
  return authUserSignal.get();
}

/**
 * Check if a user is currently authenticated.
 *
 * Convenience helper for conditional rendering or route guards.
 * Returns true only if authState === 'authenticated'.
 *
 * @returns {boolean} True if user authenticated, false otherwise
 *
 * @example Guard Pattern
 * ```typescript
 * async function loadUserData() {
 *   if (!isAuthenticated()) {
 *     throw new Error('User must be signed in');
 *   }
 *   // Fetch user-specific data
 * }
 * ```
 *
 * @example Conditional Rendering
 * ```typescript
 * render() {
 *   return isAuthenticated()
 *     ? html`<protected-content></protected-content>`
 *     : html`<df-sign-in></df-sign-in>`;
 * }
 * ```
 */
export function isAuthenticated(): boolean {
  return authStateSignal.get() === 'authenticated';
}

/**
 * Check if auth is currently in loading state.
 *
 * Returns true during sign-in, sign-up, sign-out operations, or initial auth check.
 * Useful for showing loading spinners.
 *
 * @returns {boolean} True if loading, false otherwise
 *
 * @example
 * ```typescript
 * render() {
 *   if (isAuthLoading()) {
 *     return html`<md-circular-progress indeterminate></md-circular-progress>`;
 *   }
 *
 *   const user = getCurrentAuthUser();
 *   return user
 *     ? html`<p>Welcome ${user.email}</p>`
 *     : html`<df-sign-in></df-sign-in>`;
 * }
 * ```
 */
export function isAuthLoading(): boolean {
  return authStateSignal.get() === 'loading';
}

/**
 * Sign in with Google using popup window.
 *
 * **Production:** Opens real Google OAuth popup, user selects Google account
 * **Emulator:** Shows test account picker (no actual Google servers involved)
 *
 * This is the recommended method for Google Sign-In on desktop/web.
 * For mobile apps, consider using signInWithGoogleRedirect() instead.
 *
 * @param {string[]} [scopes] - Optional Google API scopes for additional permissions
 *
 * @throws {Error} If auth not initialized, popup blocked, or user cancels
 * @returns {Promise<void>} Resolves when signed in successfully
 *
 * @example Basic Usage
 * ```typescript
 * // In a component
 * async handleGoogleSignIn() {
 *   try {
 *     await signInWithGoogle();
 *     console.log('Signed in with Google');
 *     // User info available in firebaseAuthState.get().authUser
 *   } catch (error) {
 *     if (error.code === 'auth/popup-blocked') {
 *       console.error('Popup blocked by browser');
 *     } else if (error.code === 'auth/popup-closed-by-user') {
 *       console.error('User cancelled sign-in');
 *     }
 *   }
 * }
 * ```
 *
 * @example With Additional Scopes
 * ```typescript
 * // Request access to user's Google Calendar
 * await signInWithGoogle([
 *   'https://www.googleapis.com/auth/calendar.readonly'
 * ]);
 * ```
 *
 * @example Production Setup Required
 * ```
 * 1. Firebase Console → Authentication → Sign-in method
 * 2. Enable "Google" provider
 * 3. Add your production domain to authorized domains
 * 4. Deploy - Google Sign-In will work automatically!
 * ```
 */
export async function signInWithGoogle(scopes: string[] = []): Promise<void> {
  ensureAuthInitialized();

  if (!authInstance) {
    throw new Error('Auth initialization failed');
  }

  authStateSignal.set('loading');
  errorSignal.set(null);

  try {
    const userCredential = await firebaseSignInWithGoogle(authInstance, scopes);

    // Auth state listener will update signals
    authUserSignal.set(userCredential.user);
    authStateSignal.set('authenticated');
    await storeAuthToken(userCredential.user);
  } catch (error) {
    authStateSignal.set('error');
    const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
    errorSignal.set(errorMessage);
    throw error;
  }
}

/**
 * Sign in with Google using redirect (eliminates COOP popup warnings).
 *
 * **Redirect Flow:**
 * 1. Call this function → redirects to Google OAuth
 * 2. User authorizes → redirects back to your app
 * 3. On return, Firebase SDK automatically detects and completes sign-in
 *
 * **No COOP warnings!** Since there's no popup, browser security policies don't interfere.
 *
 * @param {string[]} [scopes] - Optional Google API scopes for additional permissions
 *
 * @throws {Error} If auth not initialized
 * @returns {Promise<void>} Redirects to Google (does not return)
 *
 * @example Basic Usage
 * ```typescript
 * // User clicks sign-in button
 * await signInWithGoogleRedirect();
 * // Page redirects to Google, then back
 * // Firebase SDK handles the rest automatically
 * ```
 *
 * @example Mobile-Friendly
 * ```typescript
 * // Perfect for mobile where popups are unreliable
 * <df-google-signin use-redirect></df-google-signin>
 * ```
 */
export async function signInWithGoogleRedirect(scopes: string[] = []): Promise<void> {
  ensureAuthInitialized();

  if (!authInstance) {
    throw new Error('Auth initialization failed');
  }

  authStateSignal.set('loading');
  errorSignal.set(null);

  try {
    await firebaseSignInWithGoogleRedirect(authInstance, scopes);
    // Function never returns - page redirects to Google
    // Token will be stored by auth state listener on return
  } catch (error) {
    authStateSignal.set('error');
    const errorMessage = error instanceof Error ? error.message : 'Google redirect sign-in failed';
    errorSignal.set(errorMessage);
    throw error;
  }
}
