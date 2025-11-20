# User Admin App - Allow Admin Users to Manage Roles

## Overview
Create a new app `apps/df-user-admin-app` that allows users with the `admin` role to manage other users' roles. This app will be the **first clone** of `apps/df-app-starter-template`, so careful documentation of the cloning process is critical for improving the starter template.

## Critical Meta-Task: Document Starter Template Issues
**BEFORE starting implementation**, create `.z_/future/1117_FIRST_FIXES_TO_APP_STARTER.md` and maintain a running log throughout development under the section `## Observations by first usage 1117`.

Document:
- Any difficulties or friction during cloning process
- Missing configurations or unclear patterns
- Opportunities for automation (e.g., naming patterns that would enable scripting)
- Suggestions for what could be pre-configured in the starter
- Any manual steps that could be eliminated

Example observation: "If the starter used pattern `apps/df-[feature]-app` consistently, we could automate import path updates during cloning."

## Reference Files (MANDATORY READING)
- `guides/FUNCTIONS_PLACEMENT.md` - **CRITICAL**: Where backend functions belong (app-specific vs shared)
- `guides/ROLE_BASED_ACCESS_CONTROL_GUIDE.md` - RBAC implementation patterns
- `guides/WC_SHARED_DEFAULTS.md` - Component architecture patterns
- `guides/FIREBASE_PATTERNS.md` - Firebase state management
- `.z_/historical/1115_INITIAL_SECURITY_WORKS_TICKET.md` - Recently merged RBAC work

## Permissions & Roles

### New Permissions to Define
Add to `packages/types/src/firebase-rbac.types.ts`:

```typescript
// User admin app permissions
'user-admin-app:view'    // Access to the user admin app UI
'user:list'              // View list of all users
'user:changeRole'        // Modify another user's role
```

### Role Assignment
Update role definitions to include:
- `admin` role gets all three permissions above
- Existing roles (`player`, `coderFomo`, `viewer`) remain unchanged

### Seed Data - PRODUCTION ONLY
**CRITICAL CONSTRAINT**: Per `guides/STANDARDS_STYLES.md` line 130, Authentication Emulator is **forbidden** in this monorepo (except for limited use in `df-firebase-teaching-app`). This means:

- ❌ **NO emulator seed data** - Cannot create test users in local development
- ✅ **Production Firebase only** - First admin user must be created manually in production Firebase Console
- ⚠️ **Testing limitations** - UI testing requiring multiple user accounts will be manual/production-based
- 📝 **Rationale**: "Authentication with email/password is burdensome for users"

**Initial Setup (Manual in Firebase Console)**:
1. Create first admin user via Firebase Console Authentication
2. Manually set role to `admin` in Firestore `userProfiles` collection
3. Trigger custom claims update (either via function or manual deployment)
4. This first admin can then use the app to create additional users' roles

**Implication for Testing**: See Testing Requirements section for adjusted approach.

## Backend Functions Placement Decision

**All Cloud Functions go in `services/functions/`**

**Justification**: Functions are servers. Per `guides/FUNCTIONS_PLACEMENT.md`, ALL server code goes in `services/`. Never in `apps/`. The user-admin-app (browser code) will call these functions via the Cloud Functions API.

**Reference**: See `guides/FUNCTIONS_PLACEMENT.md` - Pattern 1 (Regular Cloud Functions)

---

## Backend Services

**Location Pattern**: Per `guides/FUNCTIONS_PLACEMENT.md` Pattern 1 (Regular Cloud Functions):
- Place in: `services/functions/src/callable/`
- These are Cloud Functions that the user-admin-app (browser code) calls via the API
- Deploy with: `cd services/functions && firebase deploy --only functions`
- Use **ESM only**: `"type": "module"` in package.json, `"module": "NodeNext"` in tsconfig.json

**Permission Checking**: Per `guides/ROLE_BASED_ACCESS_CONTROL_GUIDE.md`:
- ✅ Always check for PERMISSION from custom claims, never check for ROLE
- Verify caller has the required permission in `request.auth.token.permissions`
- Permissions are set during auth user creation (in services/auth-functions/)

### Function: `getUserList`

**Purpose**: Return paginated, searchable list of users

**Security**: 
- Verify caller has `user:list` permission
- Use Firebase Admin SDK for user enumeration

**Inputs**:
```typescript
{
  searchQuery?: string;  // Filter by email or display name
  limit?: number;        // Default 50
  pageToken?: string;    // For pagination
}
```

**Outputs**:
```typescript
{
  users: Array<{
    uid: string;
    email: string;
    displayName?: string;
    role: Role;
    createdAt: string;
  }>;
  nextPageToken?: string;
}
```

**Sorting**: Always return most recent users first (by `createdAt` desc)

### Function: `updateUserRole`

**Purpose**: Update a user's role and recompute permissions

**Security**: 
- Verify caller has `user:changeRole` permission
- Prevent self-role-modification (admins can't demote themselves)
- Log all role changes for audit

**Inputs**:
```typescript
{
  targetUserId: string;
  newRole: Role;
}
```

**Implementation**:
1. Validate caller permissions
2. Validate `targetUserId` exists
3. Prevent self-modification
4. Update Firestore `userProfiles/{targetUserId}` document
5. Update Firebase Auth custom claims
6. Return updated user profile

## Frontend Implementation

### App Creation
1. Clone `apps/df-app-starter-template` to `apps/df-user-admin-app`
2. Update `package.json` name to `@df/df-user-admin-app`
3. Update all import paths from starter references
4. Configure unique Playwright test port (consult `playwright.config.ts` for next available)

### App Security
Protect app access in router/entry point:
- Check for `user-admin-app:view` permission before rendering
- Show friendly "Access Denied" message if user lacks permission
- Redirect to login if not authenticated

### UI Components

#### User List Table
**Location**: Create in `packages/ui-lit/src/` (consult `WC_SHARED_DEFAULTS.md`)

**Storybook**: Make sure the new component also shows up in storybook

**Component**: `<df-user-admin-list>`

**Features**:
- Display users in table with columns: Email, Display Name, Current Role, Created Date
- Search box at top (Material Design `<md-outlined-text-field>`)
- Real-time filtering as user types
- "Load More" button if pagination needed
- Empty state when no users match search

**State Management** (per `WC_SHARED_DEFAULTS.md`):
- State in `packages/state/src/stores/user-admin.store.ts`
- Component is presentation-only, consumes signals
- Use `AsyncComputed` for user list fetching

#### Role Picker
**Location**: Create in `packages/ui-lit/src/` or inline in app (consult `WC_NEW_V_EXISTING.md`)

**Component**: `<df-role-picker>`

**Implementation**:
- Use Material Web checkboxes: https://github.com/material-components/material-web/blob/main/docs/components/checkbox.md
- Show checkboxes for `player` and `coderFomo` roles only (admin cannot assign `admin` or `viewer` via this UI)
- Display current role(s) as checked
- Emit `df-role-picker-change` event with new role selection
- Disable during API call (show loading state)

**Usage**:
```typescript
html`
  <df-role-picker
    .userId=${user.uid}
    .currentRole=${user.role}
    @df-role-picker-change=${this._handleRoleChange}
  ></df-role-picker>
`
```

### Main App Shell
**File**: `apps/df-user-admin-app/src/components/app-shell.ts`

**Layout**:
```
┌─────────────────────────────────┐
│ Header: "User Administration"   │
├─────────────────────────────────┤
│ Search: [_______________] 🔍    │
├─────────────────────────────────┤
│ User List Table                 │
│ ┌──────┬────────┬──────┬──────┐│
│ │Email │ Name   │ Role │ Edit ││
│ ├──────┼────────┼──────┼──────┤│
│ │...   │...     │[✓]   │      ││
│ └──────┴────────┴──────┴──────┘│
├─────────────────────────────────┤
│ [Load More Users]               │
└─────────────────────────────────┘
```

**Interactions**:
1. User types in search → debounced filter (300ms)
2. User clicks role checkbox → confirmation dialog
3. After confirmation → call `updateUserRole` function
4. Show success/error toast (use Material snackbar)
5. Refresh user list to show updated role

## Testing Requirements

**CRITICAL TESTING CONSTRAINT**: Due to the Authentication Emulator restriction (`guides/STANDARDS_STYLES.md` line 130), this app has **severely limited automated testing capabilities**. Most testing will be manual in production.

### Integration Tests (Limited Scope)
**File**: `tests/integration/df-user-admin-app.spec.ts`

**What CAN Be Tested (without auth)**:
1. **App loads** - Verify page renders without errors
2. **Auth gate shows** - Verify "Access Denied" or login prompt appears when not authenticated
3. **Component rendering** - Verify UI structure exists in DOM (search box, table container, etc.)

**What CANNOT Be Tested (requires real Firebase Auth)**:
- ❌ Multi-user role scenarios (admin vs non-admin access)
- ❌ User list loading with real data
- ❌ Role update workflows
- ❌ Search functionality with real users
- ❌ Permission boundary verification
- ❌ Audit trail validation

**Playwright Test Strategy**:
- Focus on smoke tests that verify app builds and loads
- Mock Firebase calls at network level if possible for UI flow testing
- Document what's untested due to auth constraints

### Manual Testing Checklist (Production Environment)
**⚠️ ALL functional testing must be done in production Firebase**

**Initial Deployment**:
- [ ] Manually create first admin user in Firebase Console
- [ ] Manually set `userProfiles` document with `admin` role
- [ ] Verify admin can access app

**Core Functionality**:
- [ ] User list displays correctly (newest first)
- [ ] Search works with partial email matches
- [ ] Search works with display name matches
- [ ] Pagination triggers correctly (if >50 users exist)
- [ ] Empty state shows when no matches

**Role Management**:
- [ ] Admin can assign `player` role to a user
- [ ] Admin can assign `coderFomo` role to a user
- [ ] Admin can switch user between `player` ↔ `coderFomo`
- [ ] Role picker shows current role as checked
- [ ] Confirmation dialog appears before role change
- [ ] Success toast shows after successful update
- [ ] Error toast shows if update fails
- [ ] Admin **cannot** change their own role (self-modification blocked)
- [ ] Role change persists after page refresh

**Access Control**:
- [ ] Non-admin user sees "Access Denied" message
- [ ] Viewer role cannot access app
- [ ] Player role cannot access app
- [ ] Only admin role can access app

**Edge Cases**:
- [ ] Network failure shows helpful error
- [ ] Invalid user ID handled gracefully
- [ ] Concurrent role updates don't corrupt data
- [ ] Audit logs capture all role changes with timestamps

### Testing Documentation
**Acceptance Criteria**: Given the narrow usage (1-2 people first year), the testing strategy is:
1. ✅ Build and deploy successfully
2. ✅ Basic Playwright smoke tests pass (app loads, no crashes)
3. ✅ Manual testing checklist completed in production
4. ✅ Critical path documented (admin creates roles successfully)
5. ⚠️ Accept risk: Limited pre-production validation due to auth constraints

## Success Criteria
- [ ] App cloned from starter template
- [ ] All friction points documented in `1117_FIRST_FIXES_TO_APP_STARTER.md`
- [ ] New permissions defined and seeded
- [ ] Backend functions secure and functional
- [ ] UI follows Material Design 3 strictly
- [ ] Search and pagination work correctly
- [ ] Role updates persist correctly
- [ ] Integration tests pass
- [ ] All debug logs removed
- [ ] Documentation updated

## Notes

### Development Constraints
- **Auth Emulator Forbidden**: Per `guides/STANDARDS_STYLES.md`, no local auth testing possible
- **Production-First Testing**: All user authentication scenarios must be tested in production Firebase
- **Narrow Usage**: App will serve 1-2 admin users in first year, acceptable risk for limited testing
- **Manual Setup Required**: First admin must be bootstrapped manually via Firebase Console

### Starter Template Learning
- This is the **first production use** of `df-app-starter-template` - prioritize learning over speed
- If the starter template is missing critical pieces, document them thoroughly
- The goal is to make future app clones smoother and potentially scriptable
- Consult guides liberally - they are authoritative specifications

### Risk Acceptance
Given the authentication emulator constraint, this app accepts:
- ✅ Limited automated testing (smoke tests only)
- ✅ Manual production testing for all user flows
- ✅ Higher risk of production bugs in edge cases
- ✅ Trade-off justified by narrow usage and low user impact
