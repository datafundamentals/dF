import * as functions from 'firebase-functions';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';

// Type definitions inlined to avoid workspace dependency in Cloud Functions
type Permission = string;
type Role = 'admin' | 'player' | 'coderFomo' | 'viewer';

interface UserProfileDocument {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  createdAt: string;
  updatedAt?: string;
}

interface UserRoleClaims {
  roles: Role[];
  permissions?: Permission[];
}

// Role-to-Permissions Mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['user-admin-app:view', 'user:list', 'user:changeRole'],
  player: [],
  coderFomo: [],
  viewer: [],
};

initializeApp();

const firestore = getFirestore();
const auth = getAuth();
const USER_PROFILE_COLLECTION = 'userProfiles';
const DEFAULT_ROLE: Role = 'viewer';

/**
 * Compute permissions as union of all role permissions.
 * This ensures consistent permission mapping across the app.
 */
function getPermissionsForRoles(roles: Role[]): string[] {
  const permissionSet = new Set<string>();
  roles.forEach((role) => {
    ROLE_PERMISSIONS[role].forEach((permission) => permissionSet.add(permission));
  });
  return Array.from(permissionSet).sort();
}

export const authUserCreated = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const timestamp = new Date().toISOString();
  const roles = [DEFAULT_ROLE];
  const permissions = getPermissionsForRoles(roles);
  const profileDoc: UserProfileDocument = {
    userId: uid,
    roles,
    permissions,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  try {
    await firestore.collection(USER_PROFILE_COLLECTION).doc(uid).set(profileDoc);
    const claims: UserRoleClaims = {
      roles,
      permissions,
    };
    await auth.setCustomUserClaims(uid, claims);
    functions.logger.info('RBAC profile initialized', {uid, roles, permissions});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    functions.logger.error('Failed to initialize RBAC profile', {uid, error: errorMessage});
    throw error;
  }
});

export const authUserDeleted = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  try {
    await firestore.collection(USER_PROFILE_COLLECTION).doc(uid).delete();
    functions.logger.info('RBAC profile deleted', {uid});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    functions.logger.error('Failed to delete RBAC profile', {uid, error: errorMessage});
    throw error;
  }
});
