# RBAC Workflow Test Checklist

**Test Date:** 2025-11-19
**Ticket:** 1117 - df-user-admin-app user administration
**Objective:** Verify the complete role-based access control system functions end-to-end

## Pre-Test Setup

- [ ] All auth-functions are deployed to production Firebase project
- [ ] All Cloud Functions (updateUserRole, getUserList) are deployed
- [ ] df-user-admin-app is running and connected to production Firebase
- [ ] Browser dev tools are available (for checking ID tokens)
- [ ] Firebase Console is accessible for user/Firestore inspection

## Test Scenario 1: Default Role Assignment

**Objective:** Verify new users are automatically assigned viewer role

### Steps:
1. [ ] Open df-user-admin-app in incognito window
2. [ ] Create a new user with email: `test.viewer@example.com` / password: `Test123!@#`
3. [ ] Sign in with this new user
4. [ ] Open browser DevTools → Application → Storage → IndexedDB → firebaseLocalStorageDb
5. [ ] Check the stored token and decode JWT to view claims

### Expected Results:
- [ ] User successfully creates account
- [ ] User is logged in
- [ ] Firestore document exists at `userProfiles/{uid}`
- [ ] Document contains:
  - `userId`: Matches Firebase Auth UID
  - `role`: "viewer"
  - `permissions`: [] (empty array)
  - `createdAt`: ISO timestamp
  - `updatedAt`: ISO timestamp
- [ ] ID token custom claims show:
  - `role`: "viewer"
  - `permissions`: []

### Failure Diagnosis:
- If Firestore document doesn't exist: Auth triggers may not be deployed
- If custom claims missing: Force refresh with `await user.getIdTokenResult(true)`
- If wrong role: Check DEFAULT_ROLE in auth-functions

---

## Test Scenario 2: Viewer Cannot Access Admin Features

**Objective:** Verify permission checking prevents non-admin users from using admin functions

### Steps:
1. [ ] Sign in as the viewer user from Scenario 1
2. [ ] Observe the df-user-admin-app UI
3. [ ] User list should not be visible
4. [ ] Try to manually call getUserList Cloud Function via console:
   ```typescript
   const functions = window.firebase.functions();
   const callable = httpsCallable(functions, 'getUserList');
   callable({}).then(result => console.log(result))
               .catch(err => console.log(err));
   ```

### Expected Results:
- [ ] User list section is hidden in UI (or shows permission error)
- [ ] Manual function call returns permission-denied error:
  ```
  HttpsError: code=permission-denied, message=Insufficient permissions
  ```
- [ ] Firestore logs show permission check failed

### Failure Diagnosis:
- If user list is visible: Permission checking may not be implemented
- If call succeeds when it shouldn't: Check permission logic in getUserList

---

## Test Scenario 3: Admin User Can Perform Admin Operations

**Objective:** Verify admin role has necessary permissions

### Steps:
1. [ ] Open Firebase Console → Authentication
2. [ ] Find the original admin user (created during ticket 1117)
3. [ ] Verify this user's Firestore document shows:
   - `role`: "admin"
   - `permissions`: includes 'user:list' and 'user:changeRole'
4. [ ] Sign in as the admin user in df-user-admin-app
5. [ ] Observe the UI

### Expected Results:
- [ ] User list is visible in the UI
- [ ] User list shows the viewer user from Scenario 1
- [ ] Can see "Change Role" button for other users
- [ ] getUserList function call succeeds
- [ ] User list displays correctly with emails and current roles

### Failure Diagnosis:
- If user list is hidden: Admin might not have proper claims
- If users don't display: Check getUserList implementation
- If permissions show empty: Check ROLE_PERMISSIONS mapping for admin

---

## Test Scenario 4: Role Change Flow (Admin → Viewer)

**Objective:** Verify admin can change another user's role

### Steps:
1. [ ] Sign in as admin user
2. [ ] Locate the viewer user (`test.viewer@example.com`) in the user list
3. [ ] Click "Change Role" button for this user
4. [ ] A dialog should appear (df-role-picker component)
5. [ ] Dialog shows current role: "viewer"
6. [ ] Select "Admin" from the role options
7. [ ] Click "Update Role" button
8. [ ] Observe response (should be success or error)

### Expected Results:
- [ ] Role picker dialog appears with role options
- [ ] "Update Role" button is enabled when a different role is selected
- [ ] After clicking update:
  - Dialog closes
  - Success message appears
  - User list refreshes
  - User's role now shows "admin"
- [ ] Check Firestore: `userProfiles/{viewer-uid}` document now shows:
  - `role`: "admin"
  - `permissions`: ['user-admin-app:view', 'user:list', 'user:changeRole']
  - `updatedAt`: Recent timestamp

### Failure Diagnosis:
- If dialog doesn't appear: Check df-role-picker component mounting
- If update fails: Check updateUserRole permission checking
- If Firestore not updated: Check auth trigger or function implementation
- If UI doesn't refresh: Check state management and reactivity

---

## Test Scenario 5: Token Refresh Requirement

**Objective:** Verify that role changes require token refresh to take effect

### Steps:
1. [ ] Keep the former viewer user signed in (from Scenario 3)
2. [ ] In a new tab, sign in as admin again
3. [ ] Change the role back to "viewer"
4. [ ] Switch back to the former viewer user's tab
5. [ ] DON'T refresh page
6. [ ] Try to call getUserList again:
   ```typescript
   const functions = window.firebase.functions();
   const callable = httpsCallable(functions, 'getUserList');
   callable({}).then(result => console.log(result))
               .catch(err => console.log(err));
   ```
7. [ ] Check current ID token:
   ```typescript
   const token = await firebase.auth().currentUser.getIdTokenResult(false);
   console.log(token.claims);
   ```
8. [ ] Force refresh:
   ```typescript
   const newToken = await firebase.auth().currentUser.getIdTokenResult(true);
   console.log(newToken.claims);
   ```
9. [ ] Try getUserList again

### Expected Results:
- [ ] First attempt (step 6) should succeed because cached token still has admin permissions
- [ ] ID token without force refresh (step 7) shows: `role: "admin"`, `permissions: [...]`
- [ ] After force refresh (step 8), token shows: `role: "viewer"`, `permissions: []`
- [ ] Second getUserList call (step 9) returns permission-denied error
- [ ] This demonstrates the token caching behavior

### Learning Outcome:
This test validates the important finding from Ticket 1117: **Firebase Auth tokens are cached and don't automatically update when custom claims change on the server.** Users must force a refresh to see new permissions.

---

## Test Scenario 6: Role Change Flow (Viewer → Admin)

**Objective:** Verify promoted user can now use admin functions after token refresh

### Steps:
1. [ ] User from Scenario 5 is still signed in as "viewer"
2. [ ] Force token refresh:
   ```typescript
   const newToken = await firebase.auth().currentUser.getIdTokenResult(true);
   ```
3. [ ] Now the local claims show: `role: "viewer"`, `permissions: []`
4. [ ] Try to call getUserList again:
   ```typescript
   const functions = window.firebase.functions();
   const callable = httpsCallable(functions, 'getUserList');
   callable({}).then(result => console.log(result))
               .catch(err => console.log(err));
   ```

### Expected Results:
- [ ] getUserList call returns permission-denied error
- [ ] User cannot access admin features
- [ ] This confirms permissions are properly enforced

---

## Test Scenario 7: Bidirectional Role Changes

**Objective:** Verify roles can be changed multiple times

### Steps:
1. [ ] Continue as admin user
2. [ ] Change a test user's role: viewer → admin
3. [ ] Change the same user's role: admin → player
4. [ ] Change the same user's role: player → viewer
5. [ ] Verify Firestore document updates each time:
   - [ ] `userProfiles/{uid}.role` changes
   - [ ] `userProfiles/{uid}.permissions` changes
   - [ ] `userProfiles/{uid}.updatedAt` updates to new timestamp

### Expected Results:
- [ ] All role changes succeed
- [ ] Each change reflects immediately in user list UI
- [ ] Firestore documents reflect all changes in order
- [ ] No errors in console

---

## Test Scenario 8: Permission Consistency

**Objective:** Verify role permissions match between Firestore and auth claims

### Steps:
1. [ ] Change a user to "admin" role
2. [ ] Check Firestore `userProfiles/{uid}.permissions`
3. [ ] Get the user's ID token:
   ```typescript
   // First, need to trick Firebase to refresh token
   // Can't do this as another admin, so instead:
   ```
4. [ ] Use Firebase Console → Authentication → View User
5. [ ] Check the user's custom claims

### Expected Results:
- [ ] Firestore `permissions` array matches token `claims.permissions`
- [ ] Both show: `['user-admin-app:view', 'user:list', 'user:changeRole']` for admin
- [ ] Both show: `[]` (empty) for other roles

### Failure Diagnosis:
- If they don't match: Check updateUserRole function - may not be setting both correctly

---

## Test Scenario 9: Deleted User Cleanup

**Objective:** Verify that deleting a user also deletes their Firestore profile

### Steps:
1. [ ] As admin in Firebase Console, delete a test user account
2. [ ] Check Firestore `userProfiles` collection
3. [ ] Search for the deleted user's UID

### Expected Results:
- [ ] Firestore document is automatically deleted
- [ ] This confirms the `authUserDeleted` trigger works
- [ ] No orphaned profiles in Firestore

### Failure Diagnosis:
- If profile still exists: authUserDeleted trigger may not be deployed

---

## Test Scenario 10: Permissions Not Defined for Non-Admin Roles

**Objective:** Verify current limitation that only admin role has permissions

### Steps:
1. [ ] Change a user to "player" role
2. [ ] Check Firestore `userProfiles/{uid}.permissions`

### Expected Results:
- [ ] Permissions array is empty: `[]`
- [ ] This is the current state (see guides/RBAC_SETUP.md)
- [ ] Document this as a known limitation to be addressed in future tickets

---

## Summary & Report

### Test Coverage
- [ ] Default role assignment
- [ ] Permission enforcement for non-admin users
- [ ] Admin user access to admin features
- [ ] Role change from non-admin to admin
- [ ] Role change from admin to non-admin
- [ ] Token refresh requirement
- [ ] Multiple role changes
- [ ] Permission consistency
- [ ] User deletion cleanup
- [ ] Non-admin role limitations

### Critical Issues Found
(If any test scenarios fail, list them here with severity)

| Scenario | Status | Severity | Details |
| --- | --- | --- | --- |
| | PASS/FAIL | Critical/High/Medium/Low | Description |

### Known Limitations (Not Issues)
- [ ] Token refresh required when changing roles (by design - see Ticket 1118)
- [ ] Non-admin roles have zero permissions (by design - future work)
- [ ] No "self-promote-to-admin" flow (by design - bootstrap problem is separate ticket)

### Recommendations for Next Iteration
1. Implement automatic token refresh when role changes
2. Define permissions for player and coderFomo roles
3. Implement bootstrap/first-admin initialization solution
4. Consider adding logs to Cloud Functions for better debugging

### Sign-Off
- [ ] All critical tests passed
- [ ] Documented known limitations
- [ ] Ready for production deployment

**Tester Name:** _________________
**Date:** _________________
**Notes:** _____________________________________________________________
