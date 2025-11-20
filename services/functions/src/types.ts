/**
 * Type definitions for Cloud Functions
 * Inlined to avoid workspace dependency issues in Firebase Cloud Build
 */

export type Permission = string;
export type Role = 'admin' | 'player' | 'coderFomo' | 'viewer';

export interface UserProfileDocument {
  userId: string;
  roles: Role[];
  permissions: Permission[];
  createdAt: string;
  updatedAt?: string;
}

export interface UserRoleClaims {
  roles: Role[];
  permissions?: Permission[];
}

// Role-to-Permissions Mapping
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['user-admin-app:view', 'user:list', 'user:changeRole'],
  player: [],
  coderFomo: [],
  viewer: [],
};
