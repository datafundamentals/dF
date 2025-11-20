/**
 * Callable Function: getUserList
 *
 * Returns a paginated, searchable list of users with their roles.
 * Security: Caller must have 'user:list' permission in custom claims.
 *
 * RUNTIME: Firebase Cloud Functions v2 (2nd Generation)
 *
 * Deployed to Cloud Run with explicit region and CORS configuration
 * to ensure IAM permissions can be configured via Google Cloud Console.
 *
 * See: guides/FUNCTIONS_PLACEMENT.md for architecture
 * See: guides/ROLE_BASED_ACCESS_CONTROL_GUIDE.md for permission checking
 */

import * as functions from 'firebase-functions/v2';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import type {Role, UserProfileDocument} from '../types';

interface GetUserListRequest {
  searchQuery?: string;
  limit?: number;
  pageToken?: string;
}

interface UserListItem {
  uid: string;
  email: string;
  displayName?: string;
  roles: Role[];
  createdAt: string;
}

interface GetUserListResponse {
  users: UserListItem[];
  nextPageToken?: string;
}

export const getUserList = functions.https.onCall<
  GetUserListRequest,
  Promise<GetUserListResponse>
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

    // 2. Verify caller has 'user:list' permission
    const claims = request.auth.token;
    if (!claims.permissions?.includes('user:list')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Insufficient permissions to list users'
      );
    }

    const {searchQuery = '', limit = 50, pageToken} = request.data;

    try {
      const auth = getAuth();
      const firestore = getFirestore();

      // Get paginated list from Firebase Auth (max 1000 per page)
      const userRecords = await auth.listUsers(Math.min(limit, 1000), pageToken);

      // Fetch corresponding profiles and enrich with role/createdAt
      const profileDocs = await Promise.all(
        userRecords.users.map((user) =>
          firestore.collection('userProfiles').doc(user.uid).get()
        )
      );

      // Map to response, filtering by search query if provided
      const users: UserListItem[] = userRecords.users
        .map((user, index) => {
          const profile = profileDocs[index].data() as UserProfileDocument | undefined;
          return {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName,
            roles: profile?.roles || ['viewer'],
            createdAt: profile?.createdAt || new Date(user.metadata.creationTime).toISOString(),
          };
        })
        .filter((user) => {
          if (!searchQuery) return true;
          const query = searchQuery.toLowerCase();
          return (
            user.email.toLowerCase().includes(query) ||
            (user.displayName?.toLowerCase().includes(query) ?? false)
          );
        })
        // Sort by createdAt descending (most recent first)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      functions.logger.info('User list retrieved', {
        count: users.length,
        hasNextPage: !!userRecords.pageToken,
        caller: request.auth.uid,
      });

      return {
        users,
        nextPageToken: userRecords.pageToken,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      functions.logger.error('Failed to list users', {error: errorMessage, caller: request.auth.uid});
      throw new functions.https.HttpsError('internal', 'Failed to retrieve user list');
    }
  }
);
