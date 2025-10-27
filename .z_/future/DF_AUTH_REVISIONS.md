# DF_AUTH_REVISIONS.md

## Purpose

This document provides a comprehensive, step-by-step guide for consolidating and revising authentication across the DF monorepo. It covers:
- Migrating from multiple auth stores to a single signals-first Firebase auth store
- Implementing token storage for external integrations
- Creating a universal slot-based auth wrapper
- Ensuring automatic environment detection (emulator vs production)
- Replacing all legacy login implementations in every app
- Compliance with DF coding standards and guides

---

## 1. Background & Rationale

- **Current State:** Multiple auth stores exist (`google-auth.store.ts`, `firebase-auth.store.ts`), causing confusion and duplication.
- **Goal:** Use a single, signals-first Firebase auth store for all apps, with token storage for external use cases.
- **Pattern:** Presentation-only components consume signals; all state and side effects are managed in stores.
- **Environment:** Apps must auto-detect emulator vs production without code changes.

---

## 2. Migration Steps

### 2.1. Consolidate Auth Stores
- **Remove** `packages/state/src/stores/google-auth.store.ts`.
- **Enhance** `packages/state/src/stores/firebase-auth.store.ts`:
  - Add token storage functions (`storeAuthToken`, `clearAuthToken`).
  - Store tokens in `localStorage`, `sessionStorage`, and cookies on sign-in.
  - Clear tokens on sign-out.
  - Ensure signals (`authUser`, `authState`) are the single source of truth.

### 2.2. Auto-Detect Emulator/Production
- In the Firebase auth store, use:
  ```typescript
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    connectAuthEmulator(auth, 'http://localhost:9099');
  }
  ```
- No app/component code changes required for environment toggling.

### 2.3. Create Universal Slot-Based Auth Wrapper
- Implement `df-auth-wrapper` as a presentation-only Lit component:
  ```typescript
  @customElement('df-auth-wrapper')
  export class DfAuthWrapper extends SignalWatcher(LitElement) {
    render() {
      const {isAuthenticated} = userState.get();
      return isAuthenticated
        ? html`<slot></slot>`
        : html`<md-filled-button @click=${signInWithGoogle}>Sign In</md-filled-button>`;
    }
  }
  ```
- The wrapper only renders its slot when authenticated.
- All app logic remains in slotted children (e.g., `<my-app>`).

### 2.4. Replace All Legacy Login Implementations
- **Search for:** All usages of legacy login components, direct calls to `googleAuthUser`, `initializeGoogleAuth`, etc.
- **Replace with:**
  - `<df-auth-wrapper><my-app></my-app></df-auth-wrapper>`
  - Ensure `my-app` consumes signals (`userState`, etc.) for user info.
- **Remove:** Any direct state management, side effects, or token logic from components.

### 2.5. Token Storage for External Integrations
- Token storage is handled in the store, not in components.
- External systems can read tokens from `localStorage`, `sessionStorage`, or cookies as needed.
- Internal app logic should always use signals.

---

## 3. Reference Implementation

### 3.1. Firebase Auth Store (Enhanced)
```typescript
// ...existing code...
async function storeAuthToken(user: User): Promise<void> {
  const idToken = await user.getIdToken(true);
  localStorage.setItem('User', JSON.stringify(user));
  sessionStorage.setItem('Authorization', `Bearer ${idToken}`);
  document.cookie = `authToken=${idToken}; path=/; secure; samesite=strict; max-age=3600`;
}
function clearAuthToken(): void {
  localStorage.removeItem('User');
  sessionStorage.removeItem('Authorization');
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
const unsubscribe = onAuthStateChanged(auth, async (user) => {
  if (user) {
    userSignal.set(user);
    authStateSignal.set('authenticated');
    await storeAuthToken(user);
  } else {
    userSignal.set(null);
    authStateSignal.set('idle');
    clearAuthToken();
  }
});
```

### 3.2. Slot-Based Auth Wrapper
```typescript
@customElement('df-auth-wrapper')
export class DfAuthWrapper extends SignalWatcher(LitElement) {
  render() {
    const {isAuthenticated} = userState.get();
    return isAuthenticated
      ? html`<slot></slot>`
      : html`<md-filled-button @click=${signInWithGoogle}>Sign In</md-filled-button>`;
  }
}
```

### 3.3. App Usage Example
```html
<df-auth-wrapper>
  <my-app></my-app>
</df-auth-wrapper>
```

### 3.4. Signals in App
```typescript
export class MyApp extends SignalWatcher(LitElement) {
  render() {
    const {isAuthenticated, displayName} = userState.get();
    return html`
      ${isAuthenticated
        ? html`<main>Welcome ${displayName}!</main>`
        : html`<div>Please sign in</div>`}
    `;
  }
}
```

---

## 4. Compliance Checklist
- [ ] All legacy auth stores removed except the enhanced Firebase auth store
- [ ] All login components replaced with `<df-auth-wrapper>`
- [ ] All apps consume signals for user state
- [ ] Token storage handled only in the store
- [ ] Emulator/production auto-detection implemented in the store
- [ ] No side effects or state in components
- [ ] All interactive UI uses Material Design 3 components
- [ ] Documentation updated in guides and READMEs

---

## 5. Testing & Validation
- Test in both emulator and production environments
- Verify token storage in browser dev tools
- Confirm all apps show/hide content based on authentication
- Run Playwright integration tests for login flows
- Audit code for compliance with `WC_SHARED_DEFAULTS.md`, `STANDARDS_STYLES.md`, and other guides

---

## 6. Future Considerations
- Support for additional auth providers (email/password, etc.) can be added to the store
- External integrations can read tokens from storage as needed
- Slot-based wrapper pattern is extensible for other access control needs

---

## 7. References
- `guides/WC_SHARED_DEFAULTS.md`
- `guides/STANDARDS_STYLES.md`
- `guides/AUTHENTICATION_PATTERNS.md`
- `apps/df-firebase-teaching-app0/src/df-auth-demo.ts`
- `packages/ui-lit/src/df-auth-wrapper.ts`

---

## 8. Appendix: Migration Script (Optional)
- Use a workspace-wide search/replace to find and update all legacy login usages
- Example grep:
  ```sh
  grep -r "googleAuthUser" apps/
  grep -r "initializeGoogleAuth" apps/
  grep -r "signInWithGoogle" apps/
  ```
- Replace with slot-based wrapper pattern

---

**End of DF_AUTH_REVISIONS.md**
