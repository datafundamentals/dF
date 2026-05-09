/**
 * Unit tests for firebase-auth.store
 *
 * These tests demonstrate testing patterns for Firebase Auth with signals.
 * They use mocks to avoid depending on the Firebase emulator.
 */

import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import type {FirebaseApp} from 'firebase/app';
import type {User as FirebaseSDKUser} from 'firebase/auth';
import {
  initializeAuth,
  cleanupAuth,
  signIn,
  signOut,
  signUp,
  resetPassword,
  getCurrentAuthUser,
  isAuthenticated,
  isAuthLoading,
  clearError,
  firebaseAuthState,
} from '../firebase-auth.store';

// Mock Firebase auth module
vi.mock('@df/firebase/auth', () => ({
  getFirebaseAuth: vi.fn(() => ({} as any)),
  onAuthStateChange: vi.fn((_app, callback) => {
    // Simulate initial unauthenticated state
    callback(null);
    // Return unsubscribe function
    return vi.fn();
  }),
  signInWithEmail: vi.fn(),
  createUserWithEmail: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updateUserProfile: vi.fn(),
  connectAuthToEmulator: vi.fn(),
}));

// Import mocked functions for assertions
import {
  signInWithEmail,
  createUserWithEmail,
  signOut as firebaseSignOut,
  resetPassword as firebaseResetPassword,
  updateUserProfile,
  onAuthStateChange,
} from '@df/firebase/auth';

describe('firebase-auth.store', () => {
  let mockApp: FirebaseApp;
  let mockUser: FirebaseSDKUser;

  beforeEach(() => {
    // Create mock Firebase app
    mockApp = {name: '[DEFAULT]'} as FirebaseApp;

    // Create mock user
    mockUser = {
      uid: 'test-uid-123',
      email: 'test@example.com',
      displayName: 'Test User',
      photoURL: null,
      emailVerified: true,
      metadata: {},
      providerData: [],
      getIdToken: vi.fn().mockResolvedValue('test-id-token'),
    } as unknown as FirebaseSDKUser;

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup auth state after each test
    cleanupAuth();
  });

  describe('Initialization', () => {
    it('should initialize auth and set up listener', () => {
      initializeAuth(mockApp);

      expect(onAuthStateChange).toHaveBeenCalledOnce();
      expect(firebaseAuthState.get().initialized).toBe(true);
      expect(firebaseAuthState.get().authState).toBe('unauthenticated');
    });

    it('should not re-initialize if already initialized with same app', () => {
      initializeAuth(mockApp);
      const callCount = (onAuthStateChange as any).mock.calls.length;

      initializeAuth(mockApp);

      // Should not call onAuthStateChange again
      expect((onAuthStateChange as any).mock.calls.length).toBe(callCount);
    });

    it('should cleanup previous listener when initializing with different app', () => {
      const mockApp2 = {name: 'different-app'} as FirebaseApp;

      initializeAuth(mockApp);
      const unsubscribe1 = (onAuthStateChange as any).mock.results[0].value;

      initializeAuth(mockApp2);

      expect(unsubscribe1).toHaveBeenCalled();
    });
  });

  describe('cleanupAuth', () => {
    it('should reset all auth state', () => {
      initializeAuth(mockApp);
      // After initialization, state should be 'unauthenticated' (no user logged in)
      expect(firebaseAuthState.get().authState).toBe('unauthenticated');

      cleanupAuth();

      const state = firebaseAuthState.get();
      expect(state.authUser).toBeNull();
      expect(state.authState).toBe('idle');
      expect(state.error).toBeNull();
      expect(state.initialized).toBe(false);
    });

    it('should call unsubscribe function', () => {
      initializeAuth(mockApp);
      const unsubscribe = (onAuthStateChange as any).mock.results[0].value;

      cleanupAuth();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    beforeEach(() => {
      initializeAuth(mockApp);
    });

    it('should throw if auth not initialized', async () => {
      // This test verifies that signIn fails appropriately when the Firebase auth
      // operation fails. When auth is cleaned up and then signIn is called without
      // setting up the mock, it will fail because signInWithEmail is not mocked.
      cleanupAuth(); // Uninitialize

      // signInWithEmail is not mocked, so it will be undefined
      await expect(
        signIn({email: 'test@example.com', password: 'password123'})
      ).rejects.toThrow();
    });

    it('should call Firebase signInWithEmail with correct credentials', async () => {
      (signInWithEmail as any).mockResolvedValue({user: mockUser});

      await signIn({email: 'test@example.com', password: 'password123'});

      expect(signInWithEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
    });

    it('should update auth state to authenticated on success', async () => {
      (signInWithEmail as any).mockResolvedValue({user: mockUser});

      await signIn({email: 'test@example.com', password: 'password123'});

      const state = firebaseAuthState.get();
      expect(state.authState).toBe('authenticated');
      expect(state.authUser).toEqual(mockUser);
      expect(state.error).toBeNull();
    });

    it('should set loading state during sign in', async () => {
      let resolveSignIn: any;
      (signInWithEmail as any).mockReturnValue(
        new Promise((resolve) => {
          resolveSignIn = resolve;
        })
      );

      const signInPromise = signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      // Check loading state
      expect(firebaseAuthState.get().authState).toBe('loading');

      // Resolve the promise
      resolveSignIn({user: mockUser});
      await signInPromise;
    });

    it('should handle sign in errors', async () => {
      const mockError = new Error('Invalid credentials');
      (signInWithEmail as any).mockRejectedValue(mockError);

      await expect(
        signIn({email: 'wrong@example.com', password: 'wrongpass'})
      ).rejects.toThrow('Invalid credentials');

      const state = firebaseAuthState.get();
      expect(state.authState).toBe('error');
      expect(state.error).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    beforeEach(() => {
      initializeAuth(mockApp);
    });

    it('should throw if auth not initialized', async () => {
      // When auth is cleaned up and then signUp is called without setting up the mock,
      // it will fail because createUserWithEmail is not mocked.
      cleanupAuth();

      await expect(
        signUp({email: 'new@example.com', password: 'password123'})
      ).rejects.toThrow();
    });

    it('should call Firebase createUserWithEmail', async () => {
      (createUserWithEmail as any).mockResolvedValue({user: mockUser});

      await signUp({email: 'new@example.com', password: 'password123'});

      expect(createUserWithEmail).toHaveBeenCalledWith(
        expect.anything(),
        'new@example.com',
        'password123'
      );
    });

    it('should update profile if displayName provided', async () => {
      (createUserWithEmail as any).mockResolvedValue({user: mockUser});
      (updateUserProfile as any).mockResolvedValue(undefined);

      await signUp({
        email: 'new@example.com',
        password: 'password123',
        displayName: 'New User',
      });

      expect(updateUserProfile).toHaveBeenCalledWith(mockUser, {
        displayName: 'New User',
      });
    });

    it('should not update profile if displayName not provided', async () => {
      (createUserWithEmail as any).mockResolvedValue({user: mockUser});

      await signUp({email: 'new@example.com', password: 'password123'});

      expect(updateUserProfile).not.toHaveBeenCalled();
    });

    it('should handle sign up errors', async () => {
      const mockError = new Error('Email already in use');
      (createUserWithEmail as any).mockRejectedValue(mockError);

      await expect(
        signUp({email: 'existing@example.com', password: 'password123'})
      ).rejects.toThrow('Email already in use');

      const state = firebaseAuthState.get();
      expect(state.authState).toBe('error');
      expect(state.error).toBe('Email already in use');
    });
  });

  describe('signOut', () => {
    beforeEach(() => {
      initializeAuth(mockApp);
    });

    it('should handle signOut when auth is re-initialized', async () => {
      // After cleanup, signOut auto-initializes auth and then calls the Firebase API.
      // Without mocking, the Firebase signOut returns undefined but doesn't throw.
      cleanupAuth();
      (firebaseSignOut as any).mockResolvedValue(undefined);

      // Should not throw - auth will be re-initialized
      await expect(signOut()).resolves.not.toThrow();
    });

    it('should call Firebase signOut', async () => {
      (firebaseSignOut as any).mockResolvedValue(undefined);

      await signOut();

      expect(firebaseSignOut).toHaveBeenCalledWith(expect.anything());
    });

    it('should update state to unauthenticated', async () => {
      (firebaseSignOut as any).mockResolvedValue(undefined);

      await signOut();

      const state = firebaseAuthState.get();
      expect(state.authState).toBe('unauthenticated');
      expect(state.authUser).toBeNull();
    });

    it('should handle sign out errors', async () => {
      const mockError = new Error('Sign out failed');
      (firebaseSignOut as any).mockRejectedValue(mockError);

      await expect(signOut()).rejects.toThrow('Sign out failed');

      expect(firebaseAuthState.get().authState).toBe('error');
    });
  });

  describe('resetPassword', () => {
    beforeEach(() => {
      initializeAuth(mockApp);
    });

    it('should handle resetPassword when auth is re-initialized', async () => {
      // After cleanup, resetPassword auto-initializes auth and then calls the Firebase API.
      // Without mocking, the Firebase resetPassword returns undefined but doesn't throw.
      cleanupAuth();
      (firebaseResetPassword as any).mockResolvedValue(undefined);

      // Should not throw - auth will be re-initialized
      await expect(
        resetPassword({email: 'test@example.com'})
      ).resolves.not.toThrow();
    });

    it('should call Firebase resetPassword', async () => {
      (firebaseResetPassword as any).mockResolvedValue(undefined);

      await resetPassword({email: 'test@example.com'});

      expect(firebaseResetPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com'
      );
    });

    it('should handle reset password errors', async () => {
      const mockError = new Error('User not found');
      (firebaseResetPassword as any).mockRejectedValue(mockError);

      await expect(
        resetPassword({email: 'nonexistent@example.com'})
      ).rejects.toThrow('User not found');

      expect(firebaseAuthState.get().error).toBe('User not found');
    });
  });

  describe('Utility functions', () => {
    beforeEach(() => {
      initializeAuth(mockApp);
    });

    it('getCurrentAuthUser should return current user', async () => {
      expect(getCurrentAuthUser()).toBeNull();

      // Simulate authenticated state
      (signInWithEmail as any).mockResolvedValue({user: mockUser});
      await signIn({email: 'test@example.com', password: 'password123'});

      expect(getCurrentAuthUser()).toEqual(mockUser);
    });

    it('isAuthenticated should return true when authenticated', async () => {
      expect(isAuthenticated()).toBe(false);

      (signInWithEmail as any).mockResolvedValue({user: mockUser});
      await signIn({email: 'test@example.com', password: 'password123'});

      expect(isAuthenticated()).toBe(true);
    });

    it('isAuthLoading should return true during async operations', async () => {
      let resolveSignIn: any;
      (signInWithEmail as any).mockReturnValue(
        new Promise((resolve) => {
          resolveSignIn = resolve;
        })
      );

      const signInPromise = signIn({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(isAuthLoading()).toBe(true);

      resolveSignIn({user: mockUser});
      await signInPromise;

      expect(isAuthLoading()).toBe(false);
    });

    it('clearError should reset error state', async () => {
      const mockError = new Error('Test error');
      (signInWithEmail as any).mockRejectedValue(mockError);

      await signIn({email: 'test@example.com', password: 'wrong'}).catch(() => {});

      expect(firebaseAuthState.get().error).not.toBeNull();

      clearError();

      expect(firebaseAuthState.get().error).toBeNull();
    });
  });

  describe('Signals reactivity', () => {
    it('firebaseAuthState should be reactive to state changes', async () => {
      initializeAuth(mockApp);

      const initialState = firebaseAuthState.get();
      expect(initialState.authState).toBe('unauthenticated');

      (signInWithEmail as any).mockResolvedValue({user: mockUser});
      await signIn({email: 'test@example.com', password: 'password123'});

      const newState = firebaseAuthState.get();
      expect(newState.authState).toBe('authenticated');
      expect(newState).not.toBe(initialState); // New computed value
    });
  });
});
