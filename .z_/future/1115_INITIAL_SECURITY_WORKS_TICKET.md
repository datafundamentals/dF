# Ticket: Implement Foundational RBAC Infrastructure

Coding agent is asked to return to user as frequently as is reasonable, in order to give the user opportunities to check progress against goals. This is especially important in the `4.  **Validation:**` step as noted below, but may be important in other places, as well.

## 1. Goal

Establish the core, backend infrastructure for Role-Based Access Control (RBAC) as defined in the authoritative guide, [`guides/ROLE_BASED_ACCESS_CONTROL_GUIDE.md`](guides/ROLE_BASED_ACCESS_CONTROL_GUIDE.md).

This ticket focuses exclusively on creating the underlying data models and auth-triggered functions necessary to assign a default role to new users and clean up when users are deleted.

## 2. Scope

### In Scope
-   Define `Role` and `Permission` types in `@df/types`.
-   Create a `userProfiles` collection in Firestore to store user role information.
-   Update the `authUserCreated` function in [`services/auth-functions/src/index.ts`](services/auth-functions/src/index.ts) to:
    -   Create a corresponding document in the `userProfiles` collection for the new user.
    -   Assign a default role (e.g., 'viewer') to the new user.
    -   Set the user's role as a custom claim on their Firebase Auth token.
-   Update the `authUserDeleted` function in [`services/auth-functions/src/index.ts`](services/auth-functions/src/index.ts) to delete the user's corresponding document from the `userProfiles` collection.
-   Update Firestore security rules to protect the new `userProfiles` collection, allowing only the system (via functions) to write to it.
-   Validate the implementation using the [`df-auth-trigd-func-tool`](apps/df-auth-trigd-func-tool/README.md) application to create and delete users and verify the functions execute correctly in the emulator.

### Out of Scope
-   Creating any UI for administering or viewing roles.
-   Creating functions to change or assign roles after user creation.
-   Implementing any logic within applications that consumes or depends on these roles.
-   Defining a full hierarchy of roles beyond a single default.

## 3. Implementation Plan

1.  **Define Types:**
    -   In `packages/types/src/`, create a new file for RBAC types (e.g., `firebase-rbac.types.ts`).
    -   Define `Permission` (e.g., `type Permission = string;`) and `Role` (e.g., `type Role = 'admin' | 'editor' | 'viewer';`).
    -   Define an interface for the `userProfile` document.
    -   Export these new types from `packages/types/src/index.ts`.

2.  **Update Auth-Triggered Functions:**
    -   Modify `services/auth-functions/src/index.ts`.
    -   In `authUserCreated`:
        -   Import the Firebase Admin SDK for Firestore.
        -   On user creation, write a new document to a `userProfiles` collection using the user's UID as the document ID.
        -   Set a default `role` field in the document.
        -   Use the Admin Auth SDK to call `setCustomClaims` on the new user, setting the `role`.
    -   In `authUserDeleted`:
        -   Delete the corresponding document from the `userProfiles` collection.

3.  **Update Security Rules:**
    -   In a relevant `firestore.rules` file (e.g., for [`df-firebase-teaching-app`](apps/df-firebase-teaching-app/README.md)), add a new match block for `userProfiles/{userId}`.
    -   The rules should prevent any client-side reads or writes, ensuring roles can only be managed by backend functions.

4.  **Validation:**
    -   Use the `df-auth-trigd-func-tool` workspace.
    -   Run `pnpm --filter @df/df-auth-trigd-func-tool emulators:start`.
    -   Run `pnpm --filter @df/df-auth-trigd-func-tool dev`.
    -   Use the UI to create a new user.
    -   Verify in the emulator logs that `authUserCreated` ran successfully.
    -   Check the Emulator UI to confirm a `userProfile` document was created in Firestore and that the user has a custom claim for their role in the Auth emulator.
    -   Delete the user and verify `authUserDeleted` runs and cleans up the Firestore document.

## 4. References
-   **Authoritative Guide:** [`guides/ROLE_BASED_ACCESS_CONTROL_GUIDE.md`](guides/ROLE_BASED_ACCESS_CONTROL_GUIDE.md)
-   **Functions Placement:** [`guides/FUNCTIONS_PLACEMENT.md`](guides/FUNCTIONS_PLACEMENT.md)
-   **Testing Harness:** [`apps/auth-trigd-func-tool/README.md`](apps/df-auth-trigd-func-tool/README.md)
-   **Target Functions:** [`services/auth-functions/src/index.ts`](services/auth-functions/src/index.ts)