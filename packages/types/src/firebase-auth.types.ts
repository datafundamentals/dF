import type {FirebaseUser} from './firebase.types';

/**
 * Authentication state status
 */
export type AuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

/**
 * Complete authentication state
 */
export interface FirebaseAuthState {
  /** Current authenticated user or null */
  authUser: FirebaseUser | null;
  /** Current authentication state */
  authState: AuthState;
  /** Error message if auth operation failed */
  error: string | null;
  /** Whether auth state has been initialized */
  initialized: boolean;
}

/**
 * Sign-in credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Sign-up data
 */
export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Auth error details
 */
export interface AuthError {
  code: string;
  message: string;
}
