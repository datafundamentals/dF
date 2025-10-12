import {firebaseAuthState} from '../stores/firebase-auth.store.js';

/**
 * Auth guard result
 */
export interface AuthGuardResult {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth is still loading/initializing */
  isLoading: boolean;
  /** Whether auth is initialized (initial check complete) */
  isInitialized: boolean;
  /** Reason for denial if not authenticated */
  reason?: 'not-authenticated' | 'loading' | 'not-initialized';
}

/**
 * Check if user is authenticated (synchronous)
 *
 * This is a simple guard that returns the current authentication state.
 * Use this for immediate checks in UI components or routing logic.
 *
 * @returns AuthGuardResult with current auth status
 *
 * @example
 * ```ts
 * const guard = checkAuth();
 * if (!guard.isAuthenticated) {
 *   console.log('Access denied:', guard.reason);
 *   // Redirect to sign-in page
 * }
 * ```
 */
export function checkAuth(): AuthGuardResult {
  const authState = firebaseAuthState.get();

  if (!authState.initialized) {
    return {
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      reason: 'not-initialized',
    };
  }

  if (authState.authState === 'loading') {
    return {
      isAuthenticated: false,
      isLoading: true,
      isInitialized: true,
      reason: 'loading',
    };
  }

  const authenticated = authState.authState === 'authenticated';

  return {
    isAuthenticated: authenticated,
    isLoading: false,
    isInitialized: true,
    reason: authenticated ? undefined : 'not-authenticated',
  };
}

/**
 * Wait for auth to initialize, then check if user is authenticated
 *
 * This is useful for routing guards that need to wait for Firebase
 * to restore the session before deciding whether to allow access.
 *
 * @param timeoutMs - Maximum time to wait for initialization (default: 5000ms)
 * @returns Promise<AuthGuardResult> resolving when auth is initialized
 *
 * @example
 * ```ts
 * const guard = await waitForAuth();
 * if (!guard.isAuthenticated) {
 *   // Redirect to sign-in page
 * }
 * ```
 */
export async function waitForAuth(timeoutMs = 5000): Promise<AuthGuardResult> {
  const startTime = Date.now();

  // Poll until initialized or timeout
  while (!firebaseAuthState.get().initialized) {
    if (Date.now() - startTime > timeoutMs) {
      return {
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        reason: 'not-initialized',
      };
    }

    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  return checkAuth();
}

/**
 * Higher-order function that wraps an async function with an auth check
 *
 * Use this to protect async operations that require authentication.
 * The wrapped function will only execute if the user is authenticated.
 *
 * @param fn - The function to protect
 * @param onUnauthorized - Optional callback when auth fails
 * @returns Wrapped function that checks auth before executing
 *
 * @example
 * ```ts
 * const protectedFetch = requireAuth(
 *   async () => {
 *     const data = await fetchUserData();
 *     return data;
 *   },
 *   () => {
 *     console.log('Please sign in');
 *     navigateToSignIn();
 *   }
 * );
 *
 * await protectedFetch();
 * ```
 */
export function requireAuth<T>(
  fn: () => Promise<T>,
  onUnauthorized?: (result: AuthGuardResult) => void
): () => Promise<T | null> {
  return async () => {
    const guard = checkAuth();

    if (!guard.isAuthenticated) {
      if (onUnauthorized) {
        onUnauthorized(guard);
      }
      return null;
    }

    return fn();
  };
}

/**
 * Convenience function for checking auth in components
 *
 * Returns simplified boolean flags for common UI patterns.
 *
 * @returns Object with boolean flags for different auth states
 *
 * @example
 * ```ts
 * const {canAccess, shouldShowLogin, shouldShowLoading} = getAuthStatus();
 *
 * if (shouldShowLoading) return html`<div>Loading...</div>`;
 * if (shouldShowLogin) return html`<df-sign-in></df-sign-in>`;
 * if (canAccess) return html`<protected-content></protected-content>`;
 * ```
 */
export function getAuthStatus() {
  const guard = checkAuth();

  return {
    /** User is authenticated and can access protected content */
    canAccess: guard.isAuthenticated,
    /** Should show login/sign-in UI */
    shouldShowLogin: !guard.isAuthenticated && !guard.isLoading && guard.isInitialized,
    /** Should show loading indicator */
    shouldShowLoading: guard.isLoading || !guard.isInitialized,
    /** User is definitely not authenticated (not just loading) */
    isUnauthenticated: !guard.isAuthenticated && !guard.isLoading && guard.isInitialized,
  };
}
