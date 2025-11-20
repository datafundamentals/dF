# Ticket 1120: Fix Multiple Roles (Many-to-Many RBAC)

**Status:** Planning
**Related Tickets:** 1117 (df-user-admin-app), 1118 (Bootstrap), 1119 (Starter fixes)
**Priority:** High
**Scope:** RBAC Architecture Refactoring

## Problem Statement

The current RBAC implementation treats each user as having a **single role**. However, the NIST Core RBAC standard (and production best practice) requires **Many-to-Many** relationships between users and roles:

- One user can have **multiple roles** (e.g., "admin" AND "moderator")
- One role can be assigned to **multiple users**

### Current State (Incorrect)
```typescript
// User has a single role
interface UserProfile {
  userId: string;
  role: 'admin' | 'player' | 'coderFomo' | 'viewer';  // ❌ Only one!
  permissions: string[];
  createdAt: string;
}
```

### Required State (Correct)
```typescript
// User has multiple roles
interface UserProfile {
  userId: string;
  roles: Role[];  // ✅ Array of roles
  permissions: string[];  // ✅ Union of all permissions from all roles
  createdAt: string;
}

interface Role {
  id: string;
  name: 'admin' | 'player' | 'coderFomo' | 'viewer';
  permissions: string[];
}
```

## Why This Matters

### Real-World Example
User "Alice" is both:
- An **admin** (can manage users)
- A **moderator** (can moderate content)

With single-role design:
- ❌ Promote Alice to moderator → she loses admin privileges
- ❌ Can't represent "Alice is both admin AND moderator"

With many-to-many design:
- ✅ Alice has both roles simultaneously
- ✅ Permissions are the union of all her roles
- ✅ Flexible role combinations

### Components Affected
Looking at the storybook examples:
1. **`df-role-picker` component** - Currently allows selecting ONE role
   - Must change to multi-select or checkboxes for multiple roles
   - Must update to display all assigned roles

2. **`user-admin-list` component** - Currently displays ONE role per user
   - Must change to display all assigned roles
   - Must show role "tags" or "badges" for each user

3. **Cloud Functions** - Currently set single role
   - `updateUserRole()` must support adding/removing roles
   - Must recalculate permissions union from all roles

4. **Firestore Schema** - Currently stores single role
   - `userProfiles` document structure must change
   - Or create separate `user_roles` collection (better for scalability)

## Implementation Approach

### Option A: Embed Roles Array in User Profile (Simpler)
```firestore
// userProfiles/{uid}
{
  userId: "uid123",
  roles: ["admin", "moderator"],
  permissions: ["user:list", "user:changeRole", "content:moderate"],
  createdAt: "2025-11-19T...",
  updatedAt: "2025-11-19T..."
}
```

**Pros:** Simple, single document read
**Cons:** Harder to query "all users with admin role"

### Option B: Separate Join Collection (Scalable)
```firestore
// userProfiles/{uid}
{
  userId: "uid123",
  permissions: ["user:list", "user:changeRole", "content:moderate"],
  createdAt: "2025-11-19T...",
  updatedAt: "2025-11-19T..."
}

// userRoles/{uid}_{roleId}
{
  userId: "uid123",
  roleId: "admin",
  assignedAt: "2025-11-19T..."
}
```

**Pros:** Clean separation, easy to query by role
**Cons:** Two document reads per user

**Recommendation:** Start with **Option A** for simplicity. Can refactor to Option B later if needed.

## Affected Components & Functions

### Firestore Schema Changes

**Auth Functions** (`services/auth-functions/src/index.ts`)
- `authUserCreated`: Initialize user with `roles: ['viewer']` instead of `role: 'viewer'`
- `authUserDeleted`: No changes needed

**Cloud Functions** (`services/functions/src/callable/`)
- `updateUserRole`: Change to `addUserRole` and `removeUserRole` (or `setUserRoles` with array)
- `getUserList`: No changes, permissions already recalculated
- Permission checking: Unchanged (already reads from permissions array)

### UI Components

**`role-picker` component** (`packages/ui-lit/src/role-picker.ts`)
- Change from radio buttons (single select) to checkboxes (multi-select)
- Display: Show all assigned roles
- Interaction: Add/remove roles individually
- Update event: Change from `{newRole: 'admin'}` to `{rolesAdded: ['admin'], rolesRemoved: []}`

**`user-admin-list` component** (`packages/ui-lit/src/user-admin-list.ts`)
- Display all roles for each user (not just one)
- Show roles as badges/tags
- On "Change Role" click: Show picker with current roles pre-selected

**`user-admin-app-shell` component** (`apps/df-user-admin-app/src/user-admin-app-shell.ts`)
- Update `UserItem` interface: `role: Role` → `roles: Role[]`
- Update role display logic
- Update role change handler

### Type Changes

**`packages/types/src/firebase-rbac.types.ts`**
```typescript
// Before
interface UserProfileDocument {
  userId: string;
  role: Role;  // ❌
  permissions: Permission[];
  createdAt: string;
  updatedAt?: string;
}

// After
interface UserProfileDocument {
  userId: string;
  roles: Role[];  // ✅
  permissions: Permission[];
  createdAt: string;
  updatedAt?: string;
}
```

## Migration Strategy

### Phase 1: Backend Changes (No UI Changes Yet)
1. Update auth-functions to initialize users with `roles: ['viewer']`
2. Update Cloud Function to handle `setUserRoles(targetUserId, rolesArray)`
3. Keep old `updateUserRole` for backward compatibility
4. Update permission calculation to compute union of all role permissions

### Phase 2: Frontend Migration
1. Update role-picker to multi-select
2. Update user-admin-list to display all roles
3. Update shell component
4. Test with multiple roles

### Phase 3: Cleanup
1. Remove old `updateUserRole` function
2. Remove old `role` field from Firestore documents (optional - can keep for backward compat)

## Testing Requirements

### Unit Tests (defer to later ticket)
- Adding a role to a user updates permissions
- Removing a role from a user updates permissions
- Union of permissions from multiple roles is correct
- User with no roles has no permissions

### Integration Tests
- User can have multiple roles assigned
- Role picker shows/updates all roles
- Permission checking uses union of all role permissions
- Token contains all permissions from all roles

### Manual Testing
- Create a user with admin role
- Add moderator role to same user
- Verify both roles appear in UI
- Verify permissions are union of both roles
- Change/remove a role
- Verify permissions update correctly

## Success Criteria

- [ ] Type definitions support multiple roles per user
- [ ] Auth-functions initialize users with role array
- [ ] Cloud Function can add/remove individual roles
- [ ] Permission calculation is union of all role permissions
- [ ] Role picker allows multi-select
- [ ] User list displays all roles per user
- [ ] Integration tests pass (deferred)
- [ ] Manual testing verifies multiple roles work end-to-end

## Rollout Plan

1. **Backward Compatibility**: Keep single-role documents working during migration
2. **Gradual Rollout**: New users get `roles: []` array format; existing users can be migrated
3. **Feature Flag**: Could gate multi-role editing UI until confident (optional)

## Notes

### NIST Compliance
This ticket implements **NIST Core RBAC**, which is the industry standard for role-based access control. Many-to-many user-role relationships are not just best practice—they're foundational to the standard.

### Sessions (Out of Scope)
NIST Core RBAC includes an advanced concept called "Sessions" where a user can activate a subset of their roles during a login. However, this is rarely implemented in web applications. We'll stick with the simpler approach: **All roles active simultaneously**. The union of permissions from all roles is automatically applied.

---

**Related Documentation:**
- `guides/RBAC_SETUP.md` - Will need update to reflect many-to-many
- `1119_FIX_STARTER_TEMPLATE.md` - Starter should document multi-role pattern
- `1118_BOOTSTRAP_PROBLEM_SOLUTION.md` - Bootstrap script should handle role arrays

**Next Steps After This Ticket:**
- Define permissions for player/coderFomo roles (currently empty)
- Implement role-based UI visibility (show features based on permissions)
- Add automatic token refresh when roles change (UX improvement)
