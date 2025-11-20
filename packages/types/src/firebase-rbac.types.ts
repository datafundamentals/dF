export type Permission = string;

export type Role = 'admin' | 'player' | 'coderFomo' | 'viewer';

/**
 * User Admin App Permissions
 * These permissions control access to user management functionality
 */
export const USER_ADMIN_PERMISSIONS = {
  /** Access to the user admin app UI */
  VIEW_APP: 'user-admin-app:view',
  /** View list of all users with their roles */
  LIST_USERS: 'user:list',
  /** Modify another user's role */
  CHANGE_ROLE: 'user:changeRole',
} as const;

/**
 * Role-to-Permissions Mapping
 * Defines which permissions each role has
 *
 * NOTE: This should be moved to @df/firebase-admin-shared/validation
 * once that package is created (see guides/FUNCTIONS_PLACEMENT.md)
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    USER_ADMIN_PERMISSIONS.VIEW_APP,
    USER_ADMIN_PERMISSIONS.LIST_USERS,
    USER_ADMIN_PERMISSIONS.CHANGE_ROLE,
  ],
  player: [],
  coderFomo: [],
  viewer: [],
};

export interface UserProfileDocument {
  userId: string;
  role: Role;
  permissions: Permission[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserRoleClaims {
  role: Role;
  permissions?: Permission[];
}

/**
 * User record exposed to administrative UIs.
 * Represents a flattened snapshot of Firebase Auth info plus metadata.
 */
export interface UserAdminListItem {
  uid: string;
  email: string;
  displayName?: string;
  role: Role;
  createdAt: string;
}
