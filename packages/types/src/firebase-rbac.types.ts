export type Permission = string;

export type Role = 'admin' | 'player' | 'coderFomo' | 'viewer';

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
