/**
 * Callable Function: setUserRoles
 *
 * Sets a user's roles array and recomputes permissions as the union of all role permissions.
 * Security: Caller must have 'user:changeRole' permission.
 * Additional: Prevents self-modification (user cannot change their own role).
 *
 * RUNTIME: Firebase Cloud Functions v2 (2nd Generation)
 *
 * Deployed to Cloud Run with explicit region and CORS configuration
 * to ensure IAM permissions can be configured via Google Cloud Console.
 *
 * See: guides/FUNCTIONS_PLACEMENT.md for architecture
 * See: guides/ROLE_BASED_ACCESS_CONTROL_GUIDE.md for permission patterns
 */

import * as functions from 'firebase-functions/v2';
import {getFirestore, Timestamp} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import type {Role, UserProfileDocument} from '../types';

interface SetUserRolesRequest {
  targetUserId: string;
  roles: Role[];
}

interface SetUserRolesResponse {
  success: boolean;
  userId: string;
  roles: Role[];
  permissions: string[];
  updatedAt: string;
}

/**
 * Compute permissions as union of all role permissions.
 */
function getPermissionsForRoles(roles: Role[]): string[] {
  const rolePermissions: {[K in Role]: string[]} = {
    admin: ['user-admin-app:view', 'user:list', 'user:changeRole'],
    player: [],
    coderFomo: [],
    viewer: [],
  };

  const permissionSet = new Set<string>();
  roles.forEach((role) => {
    rolePermissions[role].forEach((permission) => permissionSet.add(permission));
  });
  return Array.from(permissionSet).sort();
}

export const setUserRoles = functions.https.onCall<
  SetUserRolesRequest,
  Promise<SetUserRolesResponse>
>(
  {
    region: 'us-central1',
    cors: true, // Allow all origins - Cloud Run will handle CORS
  },
  async (request) => {
    // 1. Verify authentication
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    // 2. Verify caller has 'user:changeRole' permission
    const claims = request.auth.token;
    if (!claims.permissions?.includes('user:changeRole')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Insufficient permissions to change user roles'
      );
    }

    const {targetUserId, roles: rolesInput} = request.data;
    const callerId = request.auth.uid;

    // 3. Validate roles array is not empty
    if (!Array.isArray(rolesInput) || rolesInput.length === 0) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Roles must be a non-empty array'
      );
    }

    // 4. Validate all roles are valid
    const validRoles: Role[] = ['admin', 'player', 'coderFomo', 'viewer'];
    const roles = rolesInput as Role[];
    for (const role of roles) {
      if (!validRoles.includes(role)) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          `Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`
        );
      }
    }

    // 5. Prevent self-modification
    if (targetUserId === callerId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Cannot modify your own roles'
      );
    }

    try {
      const firestore = getFirestore();
      const auth = getAuth();

      // 6. Verify target user exists
      try {
        await auth.getUser(targetUserId);
      } catch {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      // 7. Update Firestore userProfiles document
      const userProfileRef = firestore.collection('userProfiles').doc(targetUserId);
      const updatedAt = new Date().toISOString();

      // Compute union of permissions from all roles
      const permissions = getPermissionsForRoles(roles);

      await userProfileRef.update({
        roles,
        permissions,
        updatedAt,
      });

      // 8. Update Firebase Auth custom claims
      await auth.setCustomUserClaims(targetUserId, {
        roles,
        permissions,
      });

      // 9. Log the change for audit
      functions.logger.info('User roles updated', {
        targetUserId,
        roles,
        caller: callerId,
        timestamp: updatedAt,
      });

      return {
        success: true,
        userId: targetUserId,
        roles,
        permissions,
        updatedAt,
      };
    } catch (error) {
      // Re-throw HttpsError as-is
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      functions.logger.error('Failed to update user roles', {
        targetUserId,
        roles: rolesInput,
        caller: callerId,
        error: errorMessage,
      });

      throw new functions.https.HttpsError('internal', 'Failed to update user roles');
    }
  }
);

// Legacy function for backward compatibility - kept for now
export const updateUserRole = functions.https.onCall<
  {targetUserId: string; newRole: Role},
  Promise<{success: boolean; userId: string; roles: Role[]; updatedAt: string}>
>(
  {
    region: 'us-central1',
    cors: true,
  },
  async (request) => {
    // 1. Verify authentication
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    // 2. Verify caller has 'user:changeRole' permission
    const claims = request.auth.token;
    if (!claims.permissions?.includes('user:changeRole')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Insufficient permissions to change user roles'
      );
    }

    const {targetUserId, newRole: newRoleInput} = request.data;
    const callerId = request.auth.uid;

    // 3. Validate newRole is valid
    const validRoles: Role[] = ['admin', 'player', 'coderFomo', 'viewer'];
    if (!validRoles.includes(newRoleInput as Role)) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Invalid role. Must be one of: ${validRoles.join(', ')}`
      );
    }

    const newRole: Role = newRoleInput as Role;

    // 4. Prevent self-modification
    if (targetUserId === callerId) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Cannot modify your own roles'
      );
    }

    try {
      const firestore = getFirestore();
      const auth = getAuth();

      // 5. Verify target user exists
      try {
        await auth.getUser(targetUserId);
      } catch {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      // 6. Update Firestore and Auth with single role wrapped in array
      const userProfileRef = firestore.collection('userProfiles').doc(targetUserId);
      const updatedAt = new Date().toISOString();
      const roles = [newRole];
      const permissions = getPermissionsForRoles(roles);

      await userProfileRef.update({
        roles,
        permissions,
        updatedAt,
      });

      await auth.setCustomUserClaims(targetUserId, {
        roles,
        permissions,
      });

      functions.logger.info('User role updated (legacy)', {
        targetUserId,
        newRole,
        caller: callerId,
        timestamp: updatedAt,
      });

      return {
        success: true,
        userId: targetUserId,
        roles,
        updatedAt,
      };
    } catch (error) {
      // Re-throw HttpsError as-is
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      functions.logger.error('Failed to update user role', {
        targetUserId,
        newRole,
        caller: callerId,
        error: errorMessage,
      });

      throw new functions.https.HttpsError('internal', 'Failed to update user role');
    }
  }
);
