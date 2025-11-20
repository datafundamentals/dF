# Ticket 1118: Bootstrap Problem - First Admin Initialization

**Status:** Planning Phase
**Related Ticket:** 1117 (df-user-admin-app implementation)
**Priority:** High
**Scope:** Authentication & Authorization infrastructure

## Problem Statement

When a new Firebase project or application deployment is initialized, there's a circular dependency problem:

1. The RBAC system requires users to have a specific role (admin, player, etc.) in order to perform certain operations
2. The first user created in the system needs to be promoted to admin to initialize the system
3. There's no mechanism to automatically bootstrap the first user as admin, and no UI to allow a viewer-role user to change their own role

**The core question:** How does the very first admin get created so they can then manage other users?

## Root Cause Analysis (from Ticket 1117)

During Ticket 1117, we discovered critical infrastructure gaps:

### 1. Auth Triggers Were Never Deployed
- **Finding:** The `services/auth-functions` package contains `authUserCreated` and `authUserDeleted` triggers that automatically provision RBAC profiles when users are created
- **Problem:** These functions had never been deployed to the Firebase project
- **Impact:** New users were being created without any roles or custom claims set, blocking all RBAC operations
- **Evidence:** User created an account, tried to access admin functions, got "Insufficient permissions" errors even though no permissions were configured yet

### 2. Custom Claims Lifecycle Is Asynchronous
- **Finding:** When auth triggers fire and call `auth.setCustomUserClaims()`, the custom claims don't appear in the client's ID token until the token is refreshed
- **Problem:** User signed up, trigger fired and set custom claims correctly, but the browser still had the old token cached
- **Reproduction:** User needed to clear browser site data (`Application > Storage > Clear site data`) to force a token refresh and pick up the new claims
- **Learning:** This creates a subtle UX issue - users won't see new permissions immediately after role changes

### 3. DEFAULT_ROLE Setting Is Critical
- **Finding:** The auth trigger uses a hardcoded `DEFAULT_ROLE` constant to assign roles to newly created users
- **Problem:** This was set to `'admin'` temporarily during development, but needs to be `'viewer'` for production security
- **Decision:** The temporary admin bypass only works if it automatically sets sufficient permissions (which it does via the trigger), without requiring manual Firebase Console configuration
- **Implementation:** `/services/auth-functions/src/index.ts:36` - currently set to `'viewer'`

### 4. Firestore Profile Document Is Required
- **Finding:** Each user must have a corresponding document in the `userProfiles` Firestore collection
- **What it stores:**
  - `userId` (string): Firebase Auth UID
  - `role` (Role): One of 'admin', 'player', 'coderFomo', 'viewer'
  - `permissions` (Permission[]): Array of permission strings based on role
  - `createdAt` (string): ISO timestamp
  - `updatedAt` (string): ISO timestamp (optional)
- **The trigger handles this:** `authUserCreated` automatically creates this document

### 5. Role-to-Permissions Mapping Is Centralized
- **Finding:** All role definitions and their corresponding permissions are in `/services/auth-functions/src/index.ts:23-29`
- **Structure:**
  ```typescript
  const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    admin: ['user-admin-app:view', 'user:list', 'user:changeRole'],
    player: [],
    coderFomo: [],
    viewer: [],
  };
  ```
- **Impact:** Each role currently has zero permissions except admin, which is why non-admin users are completely blocked

## Solutions Under Consideration

### Option A: First-User Admin Promotion
- Automatically promote the very first user created in a project to admin role
- Requires: Tracking whether any users exist yet in Firestore
- Pros: Requires no manual intervention
- Cons: Only works on first deploy, needs special handling

### Option B: Deployment Manual Step
- Deploy with a special initialization script or Firebase Function that:
  - Takes a specific email address as input
  - Creates or promotes that user to admin
  - Must be run after first deploy but before users start signing up
- Pros: Explicit and controlled
- Cons: Adds a deployment step, easy to forget

### Option C: Admin Initialization UI
- Create a "first admin setup" page that appears when:
  - The application has zero users OR
  - The user is creating an account and this is the first account
- Allows the first user to set themselves as admin with a special setup token
- Pros: User-friendly, self-service
- Cons: More complex UI, needs security considerations (preventing abuse)

### Option D: Firebase CLI + Custom Claims
- Use Firebase Admin SDK directly to:
  - Create the first user
  - Set custom claims directly without going through the UI
  - Could be a `pnpm` script run as part of deployment
- Pros: Simple, secure, automation-friendly
- Cons: Requires dev/ops setup, not user-friendly for first deployment

## Infrastructure Validation (from Ticket 1117)

### What Works ✅
1. **Auth Triggers:** Firebase does fire `authUserCreated` when users are created (both production and emulator)
2. **Custom Claims:** Firebase Auth can store and retrieve custom claims on users
3. **Permission Checking:** Cloud Functions can inspect custom claims and enforce permission gates
4. **Role Change Flow:** Callable functions can update user roles and set new custom claims
5. **Firestore Sync:** Auth triggers can write to Firestore in parallel with Auth custom claims

### What Needs Work ❌
1. **Token Refresh UX:** No automatic way to refresh client tokens when server-side claims change
2. **Bootstrap Scenario:** No way for a viewer user to become an admin without external help
3. **Permission Hierarchy:** Currently only 'admin' role has any permissions; other roles are empty

## Recommended Path Forward

1. **Phase 1 (Required for MVP):**
   - Keep auth triggers deployed and updated
   - Document the bootstrap problem and current workaround
   - Implement Option B (deployment script) as the initial solution
   - Write CLI helper: `pnpm --filter @df/df-user-admin-app promote-first-admin <email>`

2. **Phase 2 (UX Improvement):**
   - Implement automatic token refresh when role changes occur
   - Add `user:editProfile` permission to appropriate roles
   - Document permission hierarchy clearly

3. **Phase 3 (Self-Service):**
   - Implement Option C (Admin Initialization UI) for fresh deployments
   - Requires careful security review to prevent abuse

## Testing Recommendations

1. **Emulator Testing:**
   - Use `apps/df-auth-trigd-func-tool` to verify auth triggers work
   - Test the full user creation → trigger fire → custom claims set flow
   - Verify Firestore document is created correctly

2. **Production Testing:**
   - Deploy auth-functions to staging
   - Create a test user and verify custom claims are set
   - Verify getUserList and updateUserRole work with custom claims
   - Test role change and verify token refresh is needed (current limitation)

3. **Bootstrap Testing:**
   - Clear all users from production database
   - Sign up as a new user
   - Verify you're auto-assigned to selected role
   - Test permission enforcement

## Related Code Sections

### Auth Triggers Implementation
- Location: `/services/auth-functions/src/index.ts`
- Lines 42-44: `getPermissionsForRole()` function
- Lines 46-71: `authUserCreated` trigger
- Lines 73-83: `authUserDeleted` trigger

### Role Definitions
- Location: `/services/auth-functions/src/index.ts:23-29`
- Used by triggers to assign permissions on user creation

### Permission Checking in Cloud Functions
- Location: `/services/functions/src/callable/updateUserRole.ts:50-53`
- Pattern: `claims.permissions?.includes('user:changeRole')`

### User Profile Document
- Collection: `userProfiles`
- Document ID: Firebase Auth UID
- Schema: See section 4 above

### RBAC Type Definitions
- Location: `/packages/types/src/firebase-rbac.types.ts`
- Should document all roles and permissions

## Implementation Checklist

When implementing the solution:
- [ ] Verify auth-functions are deployed to production
- [ ] Document default role assignment behavior
- [ ] Implement bootstrap method (recommend Option B first)
- [ ] Update firebase-emulator-workflow guide with auth trigger testing
- [ ] Add permission definitions for non-admin roles
- [ ] Test complete user creation → admin change → other user management flow
- [ ] Document token refresh limitation
- [ ] Create runbook for fresh deployments

## Questions for Stakeholder

1. What should non-admin roles (player, coderFomo, viewer) be able to do? Currently they have zero permissions.
2. Should token refresh be automatic, or is the current "logout/login" requirement acceptable?
3. Is Option B (deployment script) acceptable, or should we go straight to Option C (UI)?
4. Should there be a default role other than 'viewer' for new signups?
