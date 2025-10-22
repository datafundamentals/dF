# Google Auth Token Exchange

## Problem

`df-auth-wrapper` uses a **separate Firebase project** for Google authentication, while consuming apps (like the teaching app) have their own Firebase projects for data services (Firestore, Storage, Functions).

Firebase SDKs require authentication context to be from the same Firebase project as the services they're calling. Without the token exchange, users authenticated via Google auth can't access the teaching app's Firestore/Storage/Functions.

## Solution: Custom Token Exchange

We bridge the two Firebase projects using Firebase's Custom Token flow:

```
┌──────────────────┐
│  User Signs In   │
│  (Google OAuth)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│   Google Auth Project        │
│   (packages/state)           │
│   - User authenticated       │
│   - ID Token generated       │
└────────┬─────────────────────┘
         │ ID Token
         ▼
┌──────────────────────────────┐
│   Cloud Function             │
│   (exchangeGoogleToken)      │
│   1. Verify ID Token         │
│   2. Extract UID             │
│   3. Create Custom Token     │
└────────┬─────────────────────┘
         │ Custom Token
         ▼
┌──────────────────────────────┐
│   Teaching App Project       │
│   - signInWithCustomToken()  │
│   - User now authenticated   │
│   - Firestore/Storage work   │
└──────────────────────────────┘
```

## Implementation

### 1. Cloud Function (`exchangeGoogleToken`)

**Location:** `apps/df-firebase-teaching-app/functions/src/callable/exchangeGoogleToken.ts`

**What it does:**
- Receives ID Token from Google auth project
- Verifies token with Admin SDK
- Creates Custom Token for teaching app project
- Returns Custom Token to client

**Security:**
- Token verification ensures authenticity
- No authentication required to call (the ID Token IS the auth)
- Custom claims added for security rules

### 2. Client-Side Token Exchange

**Location:** `apps/df-firebase-teaching-app/src/auth-token-exchange.ts`

**What it does:**
- Watches `googleAuthUser` signal
- When user signs in, extracts ID Token
- Calls `exchangeGoogleToken` Cloud Function
- Uses returned Custom Token to sign into teaching app auth
- Enables Firestore/Storage/Functions automatically

**Initialization:**
```typescript
// In init-google-auth.ts
await initializeGoogleAuth();      // Google auth project
initializeTokenExchange();         // Bridge to teaching app
```

### 3. Automatic Flow

When user clicks "Sign in with Google":

1. `df-auth-wrapper` handles Google OAuth
2. `googleAuthUser` signal updates
3. Token exchange detects change (polling every 500ms)
4. ID Token retrieved via `googleUser.getIdToken()`
5. Cloud Function called: `exchangeGoogleToken({ idToken })`
6. Custom Token returned
7. `signInWithCustomToken(teachingAuth, customToken)` called
8. Teaching app Auth instance now has user
9. Firestore/Storage/Functions automatically include auth context

## For Other Apps Consuming `df-auth-wrapper`

Each app needs to implement this same pattern:

1. **Create Cloud Function** in your app's Firebase project:
   ```typescript
   // Copy exchangeGoogleToken.ts to your functions/src/callable/
   export {exchangeGoogleToken} from './callable/exchangeGoogleToken.js';
   ```

2. **Create Token Exchange Module** in your app:
   ```typescript
   // Copy auth-token-exchange.ts to your src/
   import {initializeTokenExchange} from './auth-token-exchange.js';
   ```

3. **Initialize in Entry Point**:
   ```typescript
   await initializeGoogleAuth();  // From @df/state
   initializeTokenExchange();     // Your app's bridge
   ```

## Why This Pattern?

**Decoupling:** `df-auth-wrapper` stays completely independent:
- No knowledge of consuming apps
- No app-specific configuration
- Just manages Google OAuth

**Flexibility:** Each app controls:
- Its own Firebase project
- Its own Cloud Function deployment
- Its own token exchange timing

**Security:** 
- ID Tokens verified before Custom Token creation
- No token replay attacks (tokens expire)
- Custom claims propagate to security rules

## Testing

To verify the flow is working:

1. Open browser console
2. Sign in via `df-auth-wrapper`
3. Watch for logs:
   ```
   [token-exchange] Google user detected, exchanging token...
   [token-exchange] Successfully signed into teaching app
   [token-exchange] Token exchange complete
   ```
4. Check that Firestore/Storage operations work without 403 errors

## Troubleshooting

**403 errors persist:**
- Check Cloud Function is deployed: `firebase deploy --only functions:exchangeGoogleToken`
- Verify Functions emulator is running: `firebase emulators:start`
- Check console for token exchange errors

**Token exchange not triggering:**
- Verify `initializeTokenExchange()` is called
- Check `googleAuthUser.get()` has value after login
- Look for errors in `handleGoogleAuthLogin()`

**Custom Token fails:**
- Ensure Admin SDK is initialized in Cloud Function
- Verify ID Token is valid (not expired)
- Check Cloud Function logs for verification errors
