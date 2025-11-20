import {describe, it, expect, beforeEach, vi} from 'vitest';
import type {UserAdminListItem} from '@df/types';

const mockCallableHandlers: Record<string, ReturnType<typeof vi.fn>> = {};

vi.mock('../firebase-init.js', () => ({
  getInitializedFirebaseApp: vi.fn(() => ({name: 'test-app'})),
  shouldUseEmulatorForService: vi.fn(() => false),
}));

vi.mock('@df/firebase/functions', () => ({
  getFirebaseFunctions: vi.fn(() => ({})),
  connectFunctionsToEmulator: vi.fn(),
  callable: vi.fn((_functions, name: string) => {
    const handler = mockCallableHandlers[name];
    if (!handler) {
      throw new Error(`No mock handler registered for ${name}`);
    }
    return handler;
  }),
  DEFAULT_FUNCTIONS_REGION: 'us-central1',
}));

import {
  userAdminState,
  loadUsers,
  updateUserRole,
  clearUserAdminError,
  __resetUserAdminStore,
} from '../user-admin.store';

function setCallableHandler<TArgs extends object = object, TResult = unknown>(
  name: string,
  impl: (args: TArgs) => Promise<TResult>
) {
  mockCallableHandlers[name] = vi.fn(impl);
  return mockCallableHandlers[name];
}

function resetCallableHandlers(): void {
  for (const key of Object.keys(mockCallableHandlers)) {
    delete mockCallableHandlers[key];
  }
}

describe('user-admin.store', () => {
  beforeEach(() => {
    __resetUserAdminStore();
    resetCallableHandlers();
    vi.clearAllMocks();
  });

  it('loads users from Cloud Functions', async () => {
    const users: UserAdminListItem[] = [
      {
        uid: 'user-1',
        email: 'user1@example.com',
        roles: ['admin'],
        createdAt: '2024-01-01T00:00:00.000Z',
        displayName: 'User One',
      },
    ];

    setCallableHandler<{searchQuery?: string}, {data: {users: UserAdminListItem[]}}>(
      'getUserList',
      async () => ({data: {users}})
    );

    await loadUsers();

    const state = userAdminState.get();
    expect(state.users).toEqual(users);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('');
  });

  it('stores an error when loadUsers fails', async () => {
    const error = new Error('load failure');

    setCallableHandler('getUserList', async () => {
      throw error;
    });

    await expect(loadUsers()).rejects.toThrow('load failure');

    const state = userAdminState.get();
    expect(state.error).toBe('load failure');
    expect(state.loading).toBe(false);
  });

  it('updates a user role and refreshes the list', async () => {
    const updatedUsers: UserAdminListItem[] = [
      {
        uid: 'user-2',
        email: 'user2@example.com',
        roles: ['player'],
        createdAt: '2024-02-01T00:00:00.000Z',
      },
    ];

    const updateHandler = setCallableHandler<{targetUserId: string; newRole: string}, {data: {success: boolean}}>(
      'updateUserRole',
      async (payload) => {
        expect(payload).toEqual({targetUserId: 'user-2', newRole: 'player'});
        return {data: {success: true}};
      }
    );

    const loadHandler = setCallableHandler<{searchQuery?: string}, {data: {users: UserAdminListItem[]}}>(
      'getUserList',
      async () => ({data: {users: updatedUsers}})
    );

    await updateUserRole('user-2', 'player');

    expect(updateHandler).toHaveBeenCalledTimes(1);
    expect(loadHandler).toHaveBeenCalledTimes(1);
    expect(userAdminState.get().users).toEqual(updatedUsers);
  });

  it('clears error messages with clearError()', async () => {
    setCallableHandler('getUserList', async () => {
      throw new Error('temporary failure');
    });

    await expect(loadUsers()).rejects.toThrow();
    expect(userAdminState.get().error).toBe('temporary failure');

    clearUserAdminError();
    expect(userAdminState.get().error).toBe('');
  });
});
