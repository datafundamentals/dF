/** Public profile fields returned by the Cloudflare Access session Worker. */
export interface CfUser {
  email: string;
  name?: string;
  picture?: string;
  sub: string;
}

/** Lifecycle states exposed by the Cloudflare auth signal store. */
export type CfAuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export interface CfAuthState {
  authUser: CfUser | null;
  authState: CfAuthStatus;
  error: string | null;
  initialized: boolean;
}

export interface CfAuthConfig {
  /** Access-protected endpoint that returns the current user's profile. */
  sessionUrl: string;
  /** Access-protected endpoint used to begin sign-in. */
  loginUrl: string;
  /** Cloudflare Access logout endpoint. */
  logoutUrl: string;
  /** Maximum time to wait for a popup sign-in handshake. */
  popupTimeoutMs?: number;
}
