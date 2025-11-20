# RBAC (Role-Based Access Control) Setup Guide

**Document Updated:** 2025-11-19
**Status:** Active (foundational documentation)
**Audience:** Developers, DevOps, System Administrators

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Role Definitions](#role-definitions)
4. [Permission Model](#permission-model)
5. [Deployment Setup](#deployment-setup)
6. [First Admin Initialization](#first-admin-initialization)
7. [Testing the RBAC System](#testing-the-rbac-system)
8. [Troubleshooting](#troubleshooting)

## Overview

The DF system uses a **role-based access control (RBAC)** model where:

- **Users** are assigned to roles (admin, player, coderFomo, viewer)
- **Roles** are mapped to specific permissions
- **Permissions** control what operations users can perform
- **Custom claims** in Firebase Auth ID tokens carry the role and permissions

### Key Components

| Component | Location | Purpose |
| --- | --- | --- |
| Auth Triggers | `services/auth-functions/src/index.ts` | Auto-provision user profiles when users sign up |
| Role Definitions | `services/auth-functions/src/index.ts:23-29` | Define which permissions each role has |
| Cloud Functions | `services/functions/src/callable/*` | Enforce permissions, implement business logic |
| User Profiles | Firestore `userProfiles` collection | Store user role and permissions persistently |
| Custom Claims | Firebase Auth | Carry role/permissions in ID token for client-side checks |

## Architecture

### User Signup Flow

```
User signs up in Firebase Auth
        ↓
authUserCreated trigger fires
        ↓
Assigns DEFAULT_ROLE ('viewer')
        ↓
Creates userProfiles document in Firestore
        ↓
Sets custom claims in Firebase Auth
        ↓
Client calls getIdTokenResult() to get claims
        ↓
Client can check permissions locally OR
Cloud Functions check permissions server-side
```

### Role Change Flow

```
Admin calls updateUserRole Cloud Function
        ↓
Function checks caller's 'user:changeRole' permission
        ↓
Function updates Firestore userProfiles document
        ↓
Function calls auth.setCustomUserClaims()
        ↓
User's next ID token will have new role/permissions
        ↓
(Client must refresh token to see new permissions)
```

## Role Definitions

### Current Roles

```typescript
type Role = 'admin' | 'player' | 'coderFomo' | 'viewer';
```

### Role-to-Permission Mapping

| Role | Permissions | Use Case |
| --- | --- | --- |
| `admin` | `user-admin-app:view`, `user:list`, `user:changeRole` | System administrator - can manage users |
| `player` | *(empty)* | Game player - reserved for future use |
| `coderFomo` | *(empty)* | Coding challenge participant - reserved for future use |
| `viewer` | *(empty)* | Read-only observer - default for new signups |

**Source:** `/services/auth-functions/src/index.ts:23-29`

```typescript
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['user-admin-app:view', 'user:list', 'user:changeRole'],
  player: [],
  coderFomo: [],
  viewer: [],
};
```

## Permission Model

### Permission String Format

Permissions are represented as strings in the format:
- `app:feature` - e.g., `user-admin-app:view`
- `resource:action` - e.g., `user:list`, `user:changeRole`

### Defining New Permissions

1. Add the permission string to the appropriate role's array in `services/auth-functions/src/index.ts`
2. Update the type definitions in `packages/types/src/firebase-rbac.types.ts`
3. Use the permission string in your Cloud Functions to gate operations:

```typescript
// Check permission in Cloud Function
const claims = request.auth.token;
if (!claims.permissions?.includes('myfeature:create')) {
  throw new functions.https.HttpsError(
    'permission-denied',
    'Insufficient permissions to create items'
  );
}
```

### Client-Side Permission Checking

Get the user's custom claims in the client:

```typescript
const idTokenResult = await user.getIdTokenResult();
const role = idTokenResult.claims.role;
const permissions = idTokenResult.claims.permissions;

// Check a specific permission
if (permissions?.includes('user:changeRole')) {
  // Show role management UI
}
```

## Deployment Setup

### 1. Deploy Auth Triggers

The auth-functions must be deployed to your Firebase project:

```bash
# From the project root
cd services/auth-functions
npm run build
npm run deploy
```

Or as part of your CI/CD pipeline:

```bash
firebase deploy --only functions --project your-project-id
```

**Verify Deployment:**

After deployment, new users created should automatically get:
- A document in Firestore `userProfiles` collection
- Custom claims with their role and permissions in their ID token

Test by:
1. Create a new user in Firebase Console
2. Check Firestore: `userProfiles/{uid}` should exist with DEFAULT_ROLE
3. Use Firebase Admin SDK to check: `admin.auth().getUser(uid)` should show customClaims

### 2. Verify Role-to-Permission Mapping

Ensure the `ROLE_PERMISSIONS` mapping in your auth-functions matches your needs:

```bash
# Check what's currently deployed
firebase functions:log --only authUserCreated --project your-project-id
```

Look for log entries like:
```
RBAC profile initialized {uid: "xyz...", role: "viewer", permissions: []}
```

### 3. Deploy Cloud Functions That Use Permissions

Any functions that call `.includes()` on permissions must be deployed:

```bash
# From the project root
cd services/functions
npm run build
npm run deploy
```

Check that functions like `updateUserRole` are deployed:
```bash
firebase functions:list --project your-project-id | grep updateUserRole
```

## First Admin Initialization

### ⚠️ The Bootstrap Problem

When initializing a new DF deployment, the very first user needs to be an admin to set up other users. Since new users default to 'viewer' role, this creates a chicken-and-egg problem.

### Recommended Solution: Offline Admin Tool

The monorepo includes a utility script for setting custom claims: `services/auth-functions/set-custom-claims.js`

This is an **offline tool** that directly updates Firebase Auth custom claims (does NOT deploy or affect auth-functions).

**Usage:**
```bash
cd services/auth-functions
node set-custom-claims.js <email> <role> [permissions...]

# Example: Promote first user to admin
node set-custom-claims.js pete.carapetyan@gmail.com admin user-admin-app:view user:list user:changeRole
```

**When to use this tool:**
- ✅ Bootstrap: Promote first user to admin before auth-functions are deployed
- ✅ Recovery: Fix user claims if auth trigger fails or gets rolled back
- ✅ Development: Manually set test user roles during local testing
- ❌ Regular operations: Use the `df-user-admin-app` Cloud Functions instead
- ❌ Automation: Use Firebase Admin SDK in service code instead

**Prerequisites:**
- `service-account-key.json` in `services/auth-functions/` directory
  - Get from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- Node.js installed locally

**What it does:**
1. Looks up the user by email in Firebase Auth
2. Sets their custom claims with the specified role and permissions
3. These claims appear in their next ID token

**Important:** This is a local utility, not part of the deployed auth-functions. It's only for manual operations and recovery scenarios. Regular user role management should use the `df-user-admin-app` UI or `updateUserRole` Cloud Function.

### Alternative: Create First User via Admin SDK

Create the first user as admin directly:

```typescript
// scripts/create-first-admin.ts
const user = await auth.createUser({
  email: 'admin@example.com',
  password: 'initial-password-change-immediately',
});

const adminClaims = {
  role: 'admin',
  permissions: ['user-admin-app:view', 'user:list', 'user:changeRole'],
};

// Set Firestore document
await db.collection('userProfiles').doc(user.uid).set({
  userId: user.uid,
  role: 'admin',
  permissions: adminClaims.permissions,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Set custom claims
await auth.setCustomUserClaims(user.uid, adminClaims);

console.log(`Created first admin: ${user.email}`);
```

## Testing the RBAC System

### 1. Emulator Testing

Use `apps/df-auth-trigd-func-tool` to test auth triggers with the Firebase emulator:

```bash
# Terminal 1: Start emulators
pnpm --filter @df/df-auth-trigd-func-tool emulators:start

# Terminal 2: Run UI
pnpm --filter @df/df-auth-trigd-func-tool dev
```

Then in the UI:
1. Create a new user with email/password
2. Check browser developer tools for custom claims in ID token
3. Verify Firestore document was created in `userProfiles`
4. Change the user's role and verify custom claims update

### 2. Permission Checking Test

Test that Cloud Functions enforce permissions:

```bash
# Create a non-admin user in emulator
# Try to call updateUserRole without 'user:changeRole' permission
# Should return: permission-denied error

# Create an admin user
# Call updateUserRole
# Should succeed
```

### 3. Production Integration Test

After deploying to production:

1. **Create a test user:**
   - Sign up in the app
   - Verify custom claims are set (check ID token)
   - Verify Firestore document exists

2. **Test permission enforcement:**
   - Try to access admin features as viewer
   - Should get permission-denied error
   - Promote user to admin
   - Retry operation
   - Should succeed (after token refresh)

3. **Test token refresh behavior:**
   - Change a user's role
   - Check their ID token
   - Should still show old role (cached token)
   - Force token refresh: `await user.getIdTokenResult(true)`
   - Check token again
   - Should show new role

### 4. Test Firestore Rules

If you have Firestore security rules protecting `userProfiles`:

```typescript
// Test read permission
match /userProfiles/{userId} {
  allow read: if request.auth.token.role == 'admin'
              || request.auth.uid == userId;
  allow write: if request.auth.token.role == 'admin';
}
```

## Troubleshooting

### Users Created But Can't Access Admin Features

**Symptoms:** User gets "Insufficient permissions" error immediately after signup

**Diagnosis:**
1. Check if auth-functions are deployed: `firebase functions:list --project your-project-id`
2. Check Firestore `userProfiles` collection - is the document there?
3. Check user's custom claims: `firebase auth:export <file> --project your-project-id` and inspect

**Solution:**
- If auth-functions not deployed: Run `firebase deploy --only functions --project your-project-id`
- If Firestore document missing: Triggers may be failing. Check logs: `firebase functions:log --project your-project-id`
- If custom claims missing: Force token refresh on client: `await user.getIdTokenResult(true)`

### Token Shows Old Permissions After Role Change

**Symptoms:** Changed a user's role, but they still see old permissions

**Diagnosis:**
This is expected behavior - Firebase Auth tokens are cached on the client until they expire or are manually refreshed

**Solution:**
```typescript
// Force token refresh on the client
await firebase.auth().currentUser?.getIdTokenResult(true);
// UI will automatically update as claims change
```

### Auth Trigger Not Firing

**Symptoms:** New user created, but no Firestore document appears

**Diagnosis:**
1. Auth triggers may not be deployed
2. Project might not be connected to auth trigger functions
3. Firestore rules might be blocking writes

**Solution:**
1. Verify deployment: `firebase functions:list --project your-project-id`
2. Check logs: `firebase functions:log --only authUserCreated --project your-project-id`
3. Check Firestore rules don't block the trigger's writes
4. Redeploy: `firebase deploy --only functions --project your-project-id`

### Custom Claims Missing from ID Token

**Symptoms:** Claims are set in Firebase Console, but `getIdTokenResult()` returns empty claims

**Diagnosis:**
- Claim changes require a new token generation
- Client is using a cached token from before claims were set

**Solution:**
```typescript
// Force fresh token from server
const freshToken = await user.getIdTokenResult(true);
console.log(freshToken.claims);
```

## Related Documentation

- `guides/firebase-emulator-workflow.md` - Running the emulator suite
- `packages/types/src/firebase-rbac.types.ts` - TypeScript type definitions
- `.z_/future/1118_BOOTSTRAP_PROBLEM_SOLUTION.md` - Detailed bootstrap problem analysis
- `services/auth-functions/README.md` - Auth function implementation details

## Next Steps

After RBAC is working:

1. **Define permissions for other roles** - Currently only admin has permissions
2. **Implement automatic token refresh** - When roles change, clients don't see updates until logout/login
3. **Add role-based UI elements** - Hide/show features based on user's permissions
4. **Implement Firestore security rules** - Protect sensitive data based on user roles

---

**Questions?** See the bootstrap problem ticket (1118) or check the implementation in `/services/auth-functions/src/index.ts`
