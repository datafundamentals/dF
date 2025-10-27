# Firebase Authentication Patterns

**Status:** ✅ Implemented (Ticket 5)
**Last Updated:** 2025-10-12

## Overview

This document describes the authentication patterns implemented in the Firebase Teaching App. All authentication functionality follows the signals-first architecture and presentation-only component patterns established in the monorepo.

## Architecture

### State Management (`@df/state`)

Authentication state is managed in `packages/state/src/stores/firebase-auth.store.ts` using signals:

**Signals:**
- `authUserSignal` - Current Firebase user or null
- `authStateSignal` - Auth status (`idle`, `loading`, `authenticated`, `unauthenticated`, `error`)
- `errorSignal` - Error message if auth operation failed
- `initializedSignal` - Whether auth has completed initial check

**Computed State:**
```typescript
firebaseAuthState = computed<FirebaseAuthState>(() => ({
  authUser: authUserSignal.get(),
  authState: authStateSignal.get(),
  error: errorSignal.get(),
  initialized: initializedSignal.get(),
}));
```

**Action Functions:**
- `initializeAuth(app: FirebaseApp)` - Initialize auth with Firebase app
- `signIn(credentials: SignInCredentials)` - Sign in with email/password
- `signUp(data: SignUpData)` - Create new user account
- `signOut()` - Sign out current user
- `resetPassword(request: PasswordResetRequest)` - Send password reset email
- `cleanupAuth()` - Clean up auth listener (for tests)

**Convenience Helpers:**
- `getCurrentAuthUser()` - Get current user
- `isAuthenticated()` - Check if user is authenticated
- `isAuthLoading()` - Check if auth is loading
- `clearError()` - Clear error state

### UI Components (`@df/ui-lit`)

All authentication UI components are located in `packages/ui-lit/src/firebase/`:

#### `<df-sign-in>`
Email/password sign-in form.

**Events:**
- `df-sign-in-success` - Dispatched when sign-in succeeds
- `df-sign-in-error` - Dispatched when sign-in fails

**Usage:**
```html
<df-sign-in
  @df-sign-in-success=${handleSuccess}
  @df-sign-in-error=${handleError}
></df-sign-in>
```

#### `<df-sign-up>`
User registration form with email, password, and optional display name.

**Events:**
- `df-sign-up-success` - Dispatched when sign-up succeeds
- `df-sign-up-error` - Dispatched when sign-up fails

**Usage:**
```html
<df-sign-up
  @df-sign-up-success=${handleSuccess}
  @df-sign-up-error=${handleError}
></df-sign-up>
```

#### `<df-sign-out>`
Sign-out button (only visible when authenticated).

**Properties:**
- `variant` - Display style: `'button'` (default) or `'link'`

**Events:**
- `df-sign-out-success` - Dispatched when sign-out succeeds
- `df-sign-out-error` - Dispatched when sign-out fails

**Usage:**
```html
<df-sign-out variant="button"></df-sign-out>
<df-sign-out variant="link"></df-sign-out>
```

#### `<df-user-profile>`
Displays current user's profile information.

**Properties:**
- `compact` - If true, shows minimal version (just display name and avatar)

**Usage:**
```html
<df-user-profile></df-user-profile>
<df-user-profile compact></df-user-profile>
```

#### `<df-password-reset>`
Password reset form that sends reset email.

**Events:**
- `df-password-reset-success` - Dispatched when reset email sent
- `df-password-reset-error` - Dispatched when reset fails

**Usage:**
```html
<df-password-reset
  @df-password-reset-success=${handleSuccess}
  @df-password-reset-error=${handleError}
></df-password-reset>
```

### Auth Guards (`@df/state/utils/auth-guard`)

Auth guards provide utilities for protecting routes and content:

#### `checkAuth(): AuthGuardResult`
Synchronous check of current auth status.

```typescript
const guard = checkAuth();
if (!guard.isAuthenticated) {
  console.log('Access denied:', guard.reason);
  // Redirect to sign-in
}
```

#### `waitForAuth(timeoutMs?: number): Promise<AuthGuardResult>`
Waits for auth to initialize before checking status.

```typescript
const guard = await waitForAuth();
if (!guard.isAuthenticated) {
  // Redirect to sign-in
}
```

#### `requireAuth<T>(fn, onUnauthorized?): () => Promise<T | null>`
Higher-order function that wraps async operations with auth check.

```typescript
const protectedFetch = requireAuth(
  async () => fetchUserData(),
  () => navigateToSignIn()
);

await protectedFetch();
```

#### `getAuthStatus()`
Returns simplified boolean flags for common UI patterns.

```typescript
const {canAccess, shouldShowLogin, shouldShowLoading} = getAuthStatus();

if (shouldShowLoading) return html`<loading-spinner></loading-spinner>`;
if (shouldShowLogin) return html`<df-sign-in></df-sign-in>`;
if (canAccess) return html`<protected-content></protected-content>`;
```

## Integration Example

See `apps/df-firebase-teaching-app4/src/df-auth-demo.ts` for a complete working example that demonstrates:

1. **Initialization:**
```typescript
const config = getFirebaseConfig();
const app = getFirebaseApp(config);

// Connect to emulator if in emulator mode
if (useEmulator()) {
  const auth = getFirebaseAuth(app);
  connectAuthToEmulator(auth, {
    host: '127.0.0.1',
    port: 9155,
  });
}

// Initialize auth store
initializeAuth(app);
```

2. **Using auth state in components:**
```typescript
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState} from '@df/state';

export class MyComponent extends SignalWatcher(LitElement) {
  render() {
    const authState = firebaseAuthState.get();
    const isAuthenticated = authState.authState === 'authenticated';

    return isAuthenticated
      ? html`<protected-content></protected-content>`
      : html`<df-sign-in></df-sign-in>`;
  }
}
```

3. **Handling auth events:**
```typescript
private handleSignInSuccess() {
  console.log('User signed in');
  // Navigate to protected route
}

private handleAuthError(e: CustomEvent) {
  console.error('Auth error:', e.detail.error);
  // Show error notification
}
```

## Testing with Emulators

Authentication works seamlessly with Firebase Emulators:

1. **Start emulators:**
```bash
pnpm --filter @df/df-firebase-teaching-app4 emulators:start
```

2. **Test credentials** (from seed data):
   - Email: `alice.anderson@example.com` (or any seeded user)
   - Password: `password123`

3. **View auth state** in Emulator UI:
   - Open http://127.0.0.1:5400
   - Navigate to Authentication tab
   - See all seeded users and their verification status

## Key Design Decisions

### Why Signals for Auth State?
Signals provide reactive, efficient state updates that automatically trigger component re-renders. This eliminates prop drilling and makes auth state globally accessible.

### Why Presentation-Only Components?
By separating presentation from business logic:
- Components are reusable across different apps
- Business logic is testable in isolation
- UI updates automatically when store state changes

### Auth Guard Implementation
The auth guard utilities provide multiple patterns to suit different use cases:
- Synchronous checks for immediate decisions
- Async checks for route guards that wait for initialization
- HOF pattern for protecting individual operations
- Simplified helpers for common UI patterns

### Session Persistence
Firebase Auth automatically handles session persistence. The auth state listener (`onAuthStateChanged`) fires when the page loads, restoring the session if valid.

### Error Handling
All auth operations:
1. Set loading state
2. Clear previous errors
3. Attempt the operation
4. Update state with success or error
5. Dispatch custom events for UI feedback

## Security Considerations

1. **Emulator Mode**: Always connect to emulator in development (`VITE_USE_EMULATOR=true`)
2. **Password Requirements**: Minimum 6 characters (Firebase requirement)
3. **Error Messages**: Generic messages to avoid leaking information
4. **Session Storage**: Firebase handles secure token storage
5. **HTTPS Only**: Production must use HTTPS

## Future Enhancements (Beyond Ticket 5)

- OAuth providers (Google, GitHub, etc.)
- Phone number authentication
- Multi-factor authentication (MFA)
- Email verification workflows
- Custom claims and role-based access control
- Account linking
- Anonymous auth

## References

- Firebase Auth Documentation: https://firebase.google.com/docs/auth
- Signals Architecture: `/guides/WC_SHARED_DEFAULTS.md`
- Roadmap: `/.z_/WIP/FIREBASE_TEACHING_APP_ROADMAP.md` (Ticket 5)
