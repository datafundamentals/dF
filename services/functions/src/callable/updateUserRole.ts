/**
 * Callable Function: updateUserRole
 *
 * Updates a user's role and recomputes permissions.
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

interface UpdateUserRoleRequest {
  targetUserId: string;
  newRole: Role;
}

interface UpdateUserRoleResponse {
  success: boolean;
  userId: string;
  newRole: Role;
  updatedAt: string;
}

export const updateUserRole = functions.https.onCall<
  UpdateUserRoleRequest,
  Promise<UpdateUserRoleResponse>
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
        'Cannot modify your own role'
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

      // 6. Update Firestore userProfiles document
      const userProfileRef = firestore.collection('userProfiles').doc(targetUserId);
      const updatedAt = new Date().toISOString();

      // Get the permissions for the new role
      const rolePermissions: {[K in Role]: string[]} = {
        admin: ['user-admin-app:view', 'user:list', 'user:changeRole'],
        player: [],
        coderFomo: [],
        viewer: [],
      };

      const newPermissions = rolePermissions[newRole];

      await userProfileRef.update({
        role: newRole,
        permissions: newPermissions,
        updatedAt,
      });

      // 7. Update Firebase Auth custom claims
      await auth.setCustomUserClaims(targetUserId, {
        role: newRole,
        permissions: newPermissions,
      });

      // 8. Log the change for audit
      functions.logger.info('User role updated', {
        targetUserId,
        newRole,
        caller: callerId,
        timestamp: updatedAt,
      });

      return {
        success: true,
        userId: targetUserId,
        newRole,
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
