# Firebase Config Emulator Setup for Teaching Apps

**Status:** Technical Debt - Follow-up to DF_AUTH_REVISIONS ticket
**Priority:** Medium
**Depends On:** DF_AUTH_REVISIONS (auth consolidation)

## Problem

After auth consolidation (DF_AUTH_REVISIONS), teaching apps (2-5) wrapped with `df-auth-wrapper` are unable to authenticate with Google Sign-In when using Firebase emulators.

**Error observed:**
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.).
GET https://identitytoolkit.googleapis.com/v1/projects?key=demo-api-key-for-emulator-development 400 (Bad Request)
```

**Root cause:** Firebase config uses `demo-api-key-for-emulator-development`, but auth attempts are reaching real Google servers (`identitytoolkit.googleapis.com`) instead of local emulator.

## Solution Required

Investigate and fix Firebase emulator configuration for Google Sign-In in teaching apps:

1. **Check Firebase config in each teaching app:**
   - `apps/df-firebase-teaching-app2/src/config/firebase.config.ts`
   - `apps/df-firebase-teaching-app3/src/config/firebase.config.ts`
   - `apps/df-firebase-teaching-app4/src/config/firebase.config.ts`
   - `apps/df-firebase-teaching-app5/src/config/firebase.config.ts`

2. **Determine if:**
   - Emulator setup is incomplete for Google OAuth
   - Demo API key needs to be replaced with real Firebase project config (for dev)
   - Additional emulator connection code is needed in `firebase-auth.store.ts`

3. **Verify auth flow works:**
   - Sign in with Google completes successfully
   - User info appears correctly
   - Sign out works
   - All demos (Firestore, Storage, Functions) work after auth

## Notes

- **app1 (df-firebase-teaching-app1)** is the designated app for email/password emulator testing, **not Google Sign-In**
- **app0** will be destroyed and is not included in this follow-up
- Token storage (localStorage, sessionStorage, cookies) was successfully implemented in `firebase-auth.store.ts` and works correctly
- This is purely a configuration/setup issue, not a code issue

## Related Files

- `packages/state/src/stores/firebase-auth.store.ts` - Enhanced with token storage and emulator detection
- `packages/ui-lit/src/df-auth-wrapper.ts` - Updated to use `firebaseAuthState` + `signInWithGoogle()`
- Teaching app configs - Need emulator setup review
