/**
 * User Admin Store
 *
 * Centralizes user administration data fetching and mutations so Lit components
 * remain presentation-only. Follows the shared signals architecture pattern by
 * exposing a computed state object and explicit action functions.
 */

import {computed, signal} from '@lit-labs/signals';
import {
  callable,
  connectFunctionsToEmulator,
  getFirebaseFunctions,
  DEFAULT_FUNCTIONS_REGION,
  type Functions,
} from '@df/firebase/functions';
import {DF_EMULATOR_HOST, DF_EMULATOR_PORTS} from '@df/firebase/emulator-config';
import type {Role, UserAdminListItem} from '@df/types';

import {getInitializedFirebaseApp, shouldUseEmulatorForService} from './firebase-init.js';

interface GetUserListResponse {
  users: UserAdminListItem[];
  nextPageToken?: string;
}

interface UpdateUserRoleResponse {
  success: boolean;
}

interface UpdateUserRolePayload {
  targetUserId: string;
  newRole: Role;
}

/** Internal signal tracking the user list. */
const usersSignal = signal<UserAdminListItem[]>([]);
/** Internal signal tracking loading status for any user admin request. */
const loadingSignal = signal<boolean>(false);
/** Internal signal tracking the most recent error message. */
const errorSignal = signal<string>('');

export interface UserAdminState {
  users: UserAdminListItem[];
  loading: boolean;
  error: string;
}

/**
 * Computed state consumed by presentation components.
 * Returns a snapshot of the user list, loading, and error state.
 */
export const userAdminState = computed<UserAdminState>(() => ({
  users: usersSignal.get(),
  loading: loadingSignal.get(),
  error: errorSignal.get(),
}));

let functionsInstance: Functions | null = null;

function ensureFunctionsInstance(): Functions {
  if (functionsInstance) {
    return functionsInstance;
  }

  const app = getInitializedFirebaseApp();
  const functions = getFirebaseFunctions(app, DEFAULT_FUNCTIONS_REGION);

  if (shouldUseEmulatorForService('functions')) {
    connectFunctionsToEmulator(functions, {
      host: DF_EMULATOR_HOST,
      port: DF_EMULATOR_PORTS.functions,
    });
  }

  functionsInstance = functions;
  return functionsInstance;
}

/**
 * Loads users from the Cloud Function.
 * Optionally forwards a search query to the callable function.
 */
export async function loadUsers(searchQuery: string = ''): Promise<void> {
  loadingSignal.set(true);
  errorSignal.set('');

  try {
    const fn = callable<{searchQuery?: string}, GetUserListResponse>(
      ensureFunctionsInstance(),
      'getUserList'
    );
    const result = await fn({searchQuery});
    usersSignal.set(result.data.users);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load users';
    errorSignal.set(message);
    console.error('[user-admin.store] Failed to load users:', error);
    throw error;
  } finally {
    loadingSignal.set(false);
  }
}

/**
 * Updates a user's role via the Cloud Function and reloads the list on success.
 */
export async function updateUserRole(targetUserId: string, newRole: Role): Promise<void> {
  loadingSignal.set(true);
  errorSignal.set('');

  try {
    const fn = callable<UpdateUserRolePayload, UpdateUserRoleResponse>(
      ensureFunctionsInstance(),
      'updateUserRole'
    );
    await fn({targetUserId, newRole});
    await loadUsers();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user role';
    errorSignal.set(message);
    console.error('[user-admin.store] Failed to update user role:', error);
    throw error;
  } finally {
    loadingSignal.set(false);
  }
}

/**
 * Clears any stored error message so UIs can dismiss notifications.
 */
export function clearUserAdminError(): void {
  errorSignal.set('');
}

/**
 * Test-only reset helper to ensure clean state between specs.
 * Not exported publicly to app code.
 */
export function __resetUserAdminStore(): void {
  usersSignal.set([]);
  loadingSignal.set(false);
  errorSignal.set('');
  functionsInstance = null;
}
