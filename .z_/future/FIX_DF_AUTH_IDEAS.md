# Ticket: Refactor auth-token-exchange.ts - Align with Signals Architecture

## Problem Statement

`apps/df-firebase-teaching-app0/src/auth-token-exchange.ts` implements cross-project Google OAuth token exchange but violates signals-first architecture and contains several anti-patterns. This module is currently only used in `df-firebase-teaching-app` (app1) and was part of a previous attempt to create a separate `df-auth-wrapper`.

**Current Issues:**
1. **Polling anti-pattern** - Uses `setInterval` every 500ms instead of reactive signals
2. **Hardcoded emulator port** - Port 5501 duplicated instead of using constants
3. **No error recovery** - Failed exchanges leave user stuck
4. **Unclear module boundary** - Should this be in packages or remain app-specific?
5. **Incomplete rollout** - Only in app1, unclear if intended for other apps

## Current Implementation Analysis

### What It Does

Implements cross-Firebase-project authentication bridging:

1. **Listens** for Google OAuth sign-ins happening in separate Firebase project (via `df-auth-wrapper`)
2. **Exchanges** Google auth token for custom token in teaching app's Firebase project  
3. **Signs in** user to teaching app's Auth instance, enabling Firestore/Storage/Functions access

**Use case:** Two Firebase projects:
- **Google Auth Project**: Handles OAuth (centralizes user management)
- **Teaching App Project**: Hosts data (Firestore), storage, functions

Users sign in once via Google → automatically authenticated in both projects.

### Why It's App-Specific (Not in Packages)

**Correct placement** - This is app-specific orchestration:
- Hardcoded to specific Firebase project configuration
- Assumes backend has `exchangeGoogleToken` cloud function
- Tightly coupled to app architecture (`df-auth-wrapper` component)
- Not a reusable pattern across arbitrary Firebase setups

Per `guides/FIREBASE_PATTERNS.md`: Teaching/demo-specific code belongs in `apps/[app-name]/src/`.

### Why Only in App1

Teaching progression suggests only app1 demonstrates this advanced multi-project auth pattern:
- **app1**: Full emulator + Google OAuth cross-project
- **app2-5**: Focus on different aspects (hybrid configs, production testing)

## Issues to Fix

### 🔴 Critical: Polling Anti-Pattern (Lines 154-157)

**Current code:**
```typescript
pollIntervalId = setInterval(() => {
  void handleGoogleAuthLogin();
}, 500);
```

**Problems:**
- Violates signals-first architecture
- Wasteful CPU/battery usage (polling every 500ms)
- Can't be stopped/started reactively
- Not aligned with `@lit-labs/signals` patterns

**Solution - Use Signals `effect()`:**
```typescript
import {effect} from '@lit-labs/signals';
import {googleAuthUser} from '@df/state';

let disposeEffect: (() => void) | null = null;

export function initializeTokenExchange(): void {
  // Reactive: runs automatically when googleAuthUser signal changes
  disposeEffect = effect(() => {
    const googleUser = googleAuthUser.get();
    if (googleUser) {
      void handleGoogleAuthLogin();
    }
  });
}

export function cleanupTokenExchange(): void {
  if (disposeEffect) {
    disposeEffect();
    disposeEffect = null;
  }
}
```

**Benefits:**
- ✅ Runs only when auth state changes (not every 500ms)
- ✅ Aligns with signals architecture
- ✅ Properly disposable
- ✅ Self-documenting reactive dependency

### 🟡 Medium: Hardcoded Emulator Port (Line 72)

**Current code:**
```typescript
connectFunctionsEmulator(functions, '127.0.0.1', 5501);
```

**Problem:**
- Port 5501 hardcoded (duplicated from firebase.json)
- Violates DRY principle
- Will be fixed by `CENTRALIZE_PORTS.md` ticket

**Solution:**
```typescript
import {FIREBASE_EMULATOR_PORTS} from '@df/types';

connectFunctionsEmulator(
  functions, 
  '127.0.0.1', 
  FIREBASE_EMULATOR_PORTS.functions
);
```

**Dependency:** Blocked by `CENTRALIZE_PORTS.md` ticket

### 🟡 Medium: No Error Recovery (Line 136)

**Current code:**
```typescript
} catch (error) {
  console.error('Token exchange failed:', error);
  isExchanging = false;
  // User is stuck - no retry mechanism
}
```

**Problem:**
- Transient network failures leave user unauthenticated
- No exponential backoff
- No user feedback beyond console error

**Solution - Add Retry with Backoff:**
```typescript
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

async function handleGoogleAuthLogin(retryCount = 0): Promise<void> {
  if (isExchanging) return;

  const googleUser = googleAuthUser.get();
  if (!googleUser?.uid) return;

  const teachingUser = firebaseAuthState.get().authUser;
  if (teachingUser?.uid) return; // Already authenticated

  isExchanging = true;

  try {
    // ... existing exchange logic ...
    isExchanging = false;
  } catch (error) {
    console.error(`Token exchange failed (attempt ${retryCount + 1}):`, error);
    
    if (retryCount < MAX_RETRIES) {
      const backoffMs = INITIAL_BACKOFF_MS * Math.pow(2, retryCount);
      console.log(`Retrying in ${backoffMs}ms...`);
      
      setTimeout(() => {
        isExchanging = false;
        void handleGoogleAuthLogin(retryCount + 1);
      }, backoffMs);
    } else {
      isExchanging = false;
      // TODO: Dispatch error event for UI to show "Authentication failed" message
      console.error('Token exchange failed after max retries');
    }
  }
}
```

### 🟡 Low: Missing Cleanup on Disconnect

**Current code:**
- No cleanup when component unmounts
- Polling continues even if user navigates away
- Memory leak potential

**Solution:**
```typescript
// In df-firebase-teaching-app.ts or wherever this is initialized
import {initializeTokenExchange, cleanupTokenExchange} from './auth-token-exchange.js';

override connectedCallback() {
  super.connectedCallback();
  initializeTokenExchange();
}

override disconnectedCallback() {
  super.disconnectedCallback();
  cleanupTokenExchange();
}
```

### 🔵 Enhancement: Add User Feedback

**Current behavior:**
- Silent token exchange in background
- User has no idea authentication is happening
- No indication when exchange fails

**Solution - Dispatch Events:**
```typescript
// Define custom events
export type TokenExchangeEvent = 
  | { type: 'token-exchange-start' }
  | { type: 'token-exchange-success'; uid: string }
  | { type: 'token-exchange-error'; error: Error; retriesLeft: number };

// Dispatch from handleGoogleAuthLogin
function dispatchExchangeEvent(event: TokenExchangeEvent): void {
  window.dispatchEvent(new CustomEvent('df-token-exchange', {
    detail: event,
    bubbles: true,
    composed: true,
  }));
}

// Components can listen and show UI:
// - Loading spinner during exchange
// - Success toast on completion
// - Error message with retry option
```

## Decision: Keep in App or Move to Packages?

### Option A: Keep App-Specific (Recommended)

**Reasons:**
- Only used in app1 (teaching demonstration)
- Hardcoded to specific backend function (`exchangeGoogleToken`)
- Not a general-purpose pattern
- Teaching apps are meant to show patterns, not be production-ready

**Action:** Refactor in place, document as teaching example

### Option B: Generalize and Move to Packages

**Would require:**
- Make backend function configurable (pass function name)
- Make Firebase projects configurable
- Create reusable `@df/auth-bridge` package
- Add comprehensive error handling
- Write unit tests

**Trade-off:** More engineering effort for limited reuse value

**Recommendation:** Option A unless you plan to use this pattern in production apps

## Acceptance Criteria

### Must Have
- [ ] Replace polling with signals `effect()`
- [ ] Add cleanup function for `effect()` disposal
- [ ] Add retry logic with exponential backoff (3 attempts)
- [ ] Use `FIREBASE_EMULATOR_PORTS` constant (after centralization ticket)
- [ ] Add JSDoc comments explaining cross-project auth pattern

### Should Have
- [ ] Dispatch custom events for token exchange lifecycle
- [ ] Add proper error types (not just generic Error)
- [ ] Update `df-firebase-teaching-app.ts` to call cleanup on disconnect
- [ ] Add user-facing error messages (not just console.error)

### Nice to Have
- [ ] Add visual indicator in UI during token exchange
- [ ] Make retry count/backoff configurable
- [ ] Add telemetry/analytics for exchange failures
- [ ] Create guide document explaining this pattern

## Implementation Steps

1. **Add signals effect** (replaces polling)
   - Import `effect` from `@lit-labs/signals`
   - Create `initializeTokenExchange()` using effect
   - Create `cleanupTokenExchange()` for disposal

2. **Add retry logic**
   - Implement exponential backoff
   - Add retry counter parameter
   - Log retry attempts

3. **Update component integration**
   - Call `initializeTokenExchange()` in `connectedCallback`
   - Call `cleanupTokenExchange()` in `disconnectedCallback`

4. **Add event dispatching** (optional but recommended)
   - Define event types
   - Dispatch at lifecycle points
   - Update UI components to listen

5. **Documentation**
   - Add JSDoc explaining cross-project auth
   - Link to Firebase multi-project auth docs
   - Note teaching-specific nature

6. **Port centralization** (after `CENTRALIZE_PORTS.md`)
   - Replace hardcoded 5501
   - Import `FIREBASE_EMULATOR_PORTS`

## Testing Strategy

**Manual Testing:**
1. Start emulators with functions emulator on port 5501
2. Sign in via Google OAuth in `df-auth-wrapper`
3. Verify token exchange completes without polling
4. Verify retry logic on simulated network failure
5. Verify cleanup stops effect on component unmount

**Integration Test (Optional):**
```typescript
// tests/integration/auth-token-exchange.spec.ts
test('token exchange reacts to Google auth signal', async ({page}) => {
  // Spy on effect calls
  // Trigger Google auth
  // Verify exchange happens once (not polling)
  // Verify cleanup on unmount
});
```

## Risks & Mitigations

**Risk:** Breaking existing Google OAuth flow in app1
**Mitigation:** Test thoroughly, keep fallback polling behind feature flag initially

**Risk:** `effect()` from `@lit-labs/signals` behaves differently than expected
**Mitigation:** Write small proof-of-concept first, validate behavior

**Risk:** Retry logic creates infinite loops
**Mitigation:** Hard cap at 3 retries, add circuit breaker pattern

## Follow-up Work

After this ticket:
1. **Evaluate rollout to other apps** - Do app2-5 need this pattern?
2. **Consider consolidating auth strategies** - Multiple auth approaches confusing
3. **Document teaching progression** - Make it clear why each app has different auth setup
4. **Production readiness assessment** - If this goes to real apps, needs security review

## Related Tickets

- **Depends on:** `CENTRALIZE_PORTS.md` (for emulator port constant)
- **Related to:** Any work on `df-auth-wrapper` component
- **Blocks:** Production deployment of multi-project auth pattern

---

**Estimated Effort:** 4-6 hours
- 2 hours: Signals effect refactor + cleanup
- 1 hour: Retry logic with backoff
- 1 hour: Event dispatching + UI integration
- 1-2 hours: Testing + documentation

**Priority:** Medium (improves architecture compliance, not blocking)
**Complexity:** Medium (signals pattern is well-understood, retry logic is standard)
