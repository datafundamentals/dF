# Ticket 1121: Refactor User Admin App to Use Signals-Based State Management

**Status:** Planning
**Related Tickets:** 1117 (df-user-admin-app), 1120 (Fix Multiple Roles)
**Priority:** High
**Scope:** Architecture Refactoring - State Management Consolidation

## Problem Statement

The `apps/df-user-admin-app/src/user-admin-app-shell.ts` component violates the monorepo's signals-based state management standards. Currently, the component:

1. **Mixes presentation and business logic** - The shell component directly calls Firebase Functions, manages loading states, and handles errors
2. **Duplicates local state with `@state()` properties** - Maintains its own copies of `users`, `loading`, `error`, `selectedUser` instead of reading from signals
3. **Lacks reusability** - The user admin data fetching logic cannot be reused by other components (e.g., a different UI for user admin)
4. **Hard to test** - Business logic is embedded in UI code, making unit testing difficult
5. **Inconsistent with monorepo patterns** - Does not follow the signals/stores architecture documented in `guides/WC_SHARED_DEFAULTS.md` and `guides/STANDARDS_STYLES.md`

### Reference to Standards

The monorepo established clear state management patterns:

- **`packages/state/src/stores/firebase-auth.store.ts`** - Authentication state via signals
- **`packages/state/src/stores/npm-info.store.ts`** - Async data fetching via signals
- **`packages/state/src/stores/practice-widget.store.ts`** - Complex state with auto-refresh via signals
- **`guides/WC_SHARED_DEFAULTS.md`** (Lines 39-68, 201-229) - Architecture and naming conventions
- **`guides/STANDARDS_STYLES.md`** (Lines 80-100, 97) - Signals-based reactive architecture

**Current Anti-Pattern in Shell Component:**
```typescript
// ❌ Component doing all the work
export class UserAdminAppShell extends SignalWatcher(LitElement) {
  @state() private users: UserItem[] = [];
  @state() private loading: boolean = true;
  @state() private error: string = '';

  private async loadUsers(): Promise<void> {
    this.loading = true;
    const functions = getFirebaseFunctions(app, 'us-central1');
    // ... Firebase Functions call logic ...
    this.users = result.data.users;
  }
}
```

## Why This Matters

### Maintainability
- When the data structure changes, only the store needs updating
- When UI changes, no risk of breaking data fetching logic
- Clear separation of concerns makes code easier to understand

### Reusability
After Ticket 1120 (many-to-many roles), future components may need:
- A different UI layout for user admin
- Role management in a settings page
- User list in an analytics dashboard

With a dedicated store, all these can consume the same `userAdminState` signal.

### Testing
- Store logic can be unit tested independently
- Component rendering can be tested with mocked signals
- No need to mock Firebase Functions in component tests

### Consistency
All major apps in the monorepo should follow the same pattern for state management. This refactoring brings `df-user-admin-app` into alignment.

## Solution Design

### 1. Create User Admin Store

**File:** `packages/state/src/stores/user-admin.store.ts`

**Structure (following monorepo patterns):**

```typescript
import {computed, signal} from '@lit-labs/signals';
import {getInitializedFirebaseApp, shouldUseEmulatorForService} from './firebase.store.js';
import {getFirebaseFunctions, connectFunctionsToEmulator, callable} from '@df/firebase/functions';
import type {Role} from '@df/types';

// ============================================
// Internal Signals (not exported)
// ============================================

interface UserItem {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  createdAt: string;
}

const usersSignal = signal<UserItem[]>([]);
const loadingSignal = signal<boolean>(false);
const errorSignal = signal<string>('');

// ============================================
// Exported Computed State (view model)
// ============================================

export interface UserAdminState {
  users: UserItem[];
  loading: boolean;
  error: string;
}

/**
 * User admin application state
 * Exposes all user management data needed by the UI
 *
 * Usage:
 * ```typescript
 * const {users, loading, error} = userAdminState.get();
 * ```
 */
export const userAdminState = computed<UserAdminState>(() => ({
  users: usersSignal.get(),
  loading: loadingSignal.get(),
  error: errorSignal.get(),
}));

// ============================================
// Action Functions (side effects / mutations)
// ============================================

/**
 * Load the list of all users from the getUserList Cloud Function
 *
 * @throws Error if the Cloud Function call fails
 */
export async function loadUsers(): Promise<void> {
  loadingSignal.set(true);
  errorSignal.set('');

  try {
    const app = getInitializedFirebaseApp();
    let functions = getFirebaseFunctions(app, 'us-central1');

    // Connect to emulator if configured
    if (shouldUseEmulatorForService('functions')) {
      connectFunctionsToEmulator(functions, {
        host: '127.0.0.1',
        port: 5001,
      });
    }

    const getUserList = callable<
      {searchQuery?: string},
      {users: UserItem[]; nextPageToken?: string}
    >(functions, 'getUserList');

    const result = await getUserList({searchQuery: ''});
    usersSignal.set(result.data.users);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load users';
    errorSignal.set(message);
    console.error('Failed to load users:', error);
    throw error;
  } finally {
    loadingSignal.set(false);
  }
}

/**
 * Update a user's role via the updateUserRole Cloud Function
 * Automatically reloads the user list after successful update
 *
 * @param targetUserId - The UID of the user to modify
 * @param newRole - The new role to assign
 * @throws Error if the Cloud Function call fails
 */
export async function updateUserRole(targetUserId: string, newRole: Role): Promise<void> {
  loadingSignal.set(true);
  errorSignal.set('');

  try {
    const app = getInitializedFirebaseApp();
    let functions = getFirebaseFunctions(app, 'us-central1');

    // Connect to emulator if configured
    if (shouldUseEmulatorForService('functions')) {
      connectFunctionsToEmulator(functions, {
        host: '127.0.0.1',
        port: 5001,
      });
    }

    const updateUserRoleFunc = callable<
      {targetUserId: string; newRole: Role},
      {success: boolean}
    >(functions, 'updateUserRole');

    await updateUserRoleFunc({
      targetUserId,
      newRole,
    });

    // Reload users to show updated role
    await loadUsers();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user role';
    errorSignal.set(message);
    console.error('Failed to update user role:', error);
    throw error;
  } finally {
    loadingSignal.set(false);
  }
}

/**
 * Clear any stored error message
 * Useful for dismissing error notifications in the UI
 */
export function clearError(): void {
  errorSignal.set('');
}
```

### 2. Update Package Exports

**File:** `packages/state/src/index.ts`

Add exports for the new store:

```typescript
// ... existing exports ...
export {userAdminState, loadUsers, updateUserRole, clearError} from './stores/user-admin.store.js';
export type {UserAdminState} from './stores/user-admin.store.js';
```

### 3. Refactor User Admin Shell Component

**File:** `apps/df-user-admin-app/src/user-admin-app-shell.ts`

Simplify to presentation-only:

```typescript
import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {firebaseAuthState, userAdminState, loadUsers, updateUserRole, clearError} from '@df/state';
import {SignalWatcher} from '@lit-labs/signals';
import type {Role} from '@df/types';

interface UserItem {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  createdAt: string;
}

@customElement('user-admin-app-shell')
export class UserAdminAppShell extends SignalWatcher(LitElement) {
  static override styles = css`
    /* ... existing styles ... */
  `;

  @state() private declare selectedUser: {uid: string; email: string; role: Role} | null;

  @state() private declare isRolePickerOpen: boolean;

  constructor() {
    super();
    this.selectedUser = null;
    this.isRolePickerOpen = false;
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);

    // Check auth state after any update
    const {authState, authUser} = firebaseAuthState.get();

    if (authState === 'authenticated' && authUser) {
      // Load users when authentication succeeds
      loadUsers().catch(err => {
        console.error('Failed to load users:', err);
        // Error will be displayed in render() from userAdminState.error
      });
    }
  }

  private handleUserSelected(event: CustomEvent<{uid: string; email: string; currentRole: Role}>): void {
    this.selectedUser = {
      uid: event.detail.uid,
      email: event.detail.email,
      role: event.detail.currentRole,
    };
    this.isRolePickerOpen = true;
  }

  private async handleRoleSelected(event: CustomEvent<{newRole: Role}>): Promise<void> {
    if (!this.selectedUser) return;

    try {
      await updateUserRole(this.selectedUser.uid, event.detail.newRole);
      this.isRolePickerOpen = false;
    } catch (error) {
      // Error is stored in userAdminState.error and will be displayed in render()
      console.error('Failed to update user role:', error);
    }
  }

  private handleCancel(): void {
    this.isRolePickerOpen = false;
    this.selectedUser = null;
  }

  override render() {
    // Access signals to trigger SignalWatcher reactivity
    firebaseAuthState.get();
    const {users, loading, error} = userAdminState.get();

    return html`
      <div class="container">
        <div class="header">
          <h1 class="title">User Administration</h1>
          <p class="subtitle">Manage user roles and permissions</p>
        </div>

        ${error
          ? html`
              <div class="error">
                <span>${error}</span>
                <button class="error-close" @click=${() => clearError()}>
                  ×
                </button>
              </div>
            `
          : ''}

        ${loading
          ? html` <div class="loading">Loading users...</div> `
          : html`
              <df-user-admin-list
                .users=${users}
                .loading=${loading}
                @user-selected=${(e: CustomEvent) => this.handleUserSelected(e)}
              ></df-user-admin-list>
            `}

        <df-role-picker
          ?open=${this.isRolePickerOpen}
          .userEmail=${this.selectedUser?.email || ''}
          .currentRole=${this.selectedUser?.role || 'viewer'}
          @role-selected=${(e: CustomEvent) => this.handleRoleSelected(e)}
          @cancel=${() => this.handleCancel()}
        ></df-role-picker>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'user-admin-app-shell': UserAdminAppShell;
  }
}
```

**Key Changes:**
- Removed `loadUsers()` and `updateUserRole()` methods → Now import from store
- Removed `usersLoaded` flag → Signals handle reactivity automatically
- Removed `@state()` for `users`, `loading`, `error` → Read directly from `userAdminState` signal
- Component only handles UI state: `selectedUser`, `isRolePickerOpen`
- Presentation is purely reactive to signal changes

## Migration Path

### Phase 1: Create the Store (no breaking changes)
1. Create `packages/state/src/stores/user-admin.store.ts`
2. Export from `packages/state/src/index.ts`
3. Verify it builds without errors
4. **No changes to component yet** - store can coexist with old code

### Phase 2: Update the Component
1. Update `user-admin-app-shell.ts` to use the new store
2. Remove all business logic methods
3. Verify rendering still works
4. Test loading users on auth
5. Test role changes still work
6. Test error handling

### Phase 3: Cleanup
1. Remove any unused imports
2. Verify TypeScript compilation
3. Run linting: `pnpm --filter @df/df-user-admin-app lint`
4. Run tests: `pnpm --filter @df/df-user-admin-app test`

## Testing Requirements

### Unit Tests (for store)
- [ ] `loadUsers()` successfully fetches users from Cloud Function
- [ ] `updateUserRole()` calls function and reloads users
- [ ] `clearError()` clears the error message
- [ ] Error states are properly set on function failures
- [ ] Loading state is set/cleared appropriately

### Integration Tests (component + store)
- [ ] Component calls `loadUsers()` when authenticated
- [ ] `userAdminState` updates trigger component re-render
- [ ] Error messages display when user list fails to load
- [ ] Role picker updates user and reloads list
- [ ] Error dismissal works via `clearError()`

### Manual Testing
- [ ] Sign in to app
- [ ] User list loads automatically
- [ ] Select a user and change their role
- [ ] Verify role change is reflected in list
- [ ] Create an error scenario (e.g., network failure) and verify error displays

## Success Criteria

- [ ] `packages/state/src/stores/user-admin.store.ts` created with signals-based architecture
- [ ] `userAdminState` computed signal exports `UserAdminState` interface
- [ ] `loadUsers()` and `updateUserRole()` action functions properly encapsulate Firebase Functions calls
- [ ] `user-admin-app-shell.ts` component reduced to presentation-only (no business logic)
- [ ] Component only maintains UI state (`selectedUser`, `isRolePickerOpen`)
- [ ] Component reads data exclusively from `userAdminState` signal
- [ ] TypeScript compilation successful
- [ ] Linting passes: `pnpm --filter @df/df-user-admin-app lint`
- [ ] Integration tests pass
- [ ] Manual testing confirms all features work end-to-end
- [ ] Code follows monorepo patterns (naming, structure, JSDoc)

## Implementation Notes

### Naming Conventions
Follow `guides/STANDARDS_STYLES.md` (Line 97):
- Internal signals: `camelCaseSignal` (e.g., `usersSignal`)
- Exported computed state: `somethingState` (e.g., `userAdminState`)
- Action functions: Verb-based (e.g., `loadUsers`, `updateUserRole`, `clearError`)

### Documentation
- Add JSDoc to store functions explaining parameters, return values, and errors
- Add inline comments for non-obvious signal logic
- Document the three-layer pattern (internal signals → computed export → action functions)

### Firebase Functions Integration
- Reuse existing emulator detection via `shouldUseEmulatorForService('functions')`
- Keep the same error handling and logging patterns
- Reference `packages/state/src/stores/firebase-auth.store.ts` for Firebase integration patterns

### Emulator Support
- Store must automatically detect emulator mode and connect Functions to localhost:5001
- Test both cloud and emulator modes

## Related Documentation

- `guides/WC_SHARED_DEFAULTS.md` - Component development patterns (Lines 39-68, 201-229)
- `guides/STANDARDS_STYLES.md` - Signals architecture (Lines 80-100, 97)
- `packages/state/src/stores/npm-info.store.ts` - Example: Simple async state
- `packages/state/src/stores/practice-widget.store.ts` - Example: Complex state with auto-refresh
- `packages/state/src/stores/firebase-auth.store.ts` - Example: Firebase integration

## Blocked By / Blocks

**Dependent on:** Ticket 1117 (df-user-admin-app creation) ✅ Complete
**Blocks:** Ticket 1120 (Fix Multiple Roles) - Can proceed in parallel but this refactor will make 1120 easier

## Notes

### Why Now?
This refactoring should happen before Ticket 1120 (many-to-many roles) because:
1. Adding multi-role support will require changing data structures
2. Having a dedicated store makes those changes localized
3. Ensures the app is on standard architecture before expanding features

### Future Improvements
After this ticket:
- Consider adding pagination to user list (`nextPageToken` already in Cloud Function)
- Add filtering/search via `searchQuery` parameter in `loadUsers()`
- Consider auto-refresh capability (like `practice-widget.store.ts` pattern)
- Add role-based filtering (show only admin users, etc.)

---

**Ticket Created:** 2025-11-19
**Estimated Effort:** 2-4 hours (1-2 days for full implementation + testing)
