## Plan: Generic Whitelist Access Control via Firestore & Env Sync

Store app-specific whitelists as zero-cost documents in a secure Firestore collection. Enhance `df-auth-wrapper` to optionally enforce these whitelists on the frontend (preventing component render). Extend `firestore.rules` to enforce the exact same whitelist on the backend, preventing data access even if the UI wrapper is bypassed via DevTools.

**Steps**
1. **Single Source of Truth (Secret):** Define the whitelist in a single secret file (like `.env` or a gitignored `whitelists.yaml`), mapping app IDs to arrays of allowed emails.
2. **Self-Deploying Sync Script:** Create a Node.js utility in `tools/sync-whitelists` that runs during deployment (or startup) using the Firebase Admin SDK. It reads the secret file and synchronizes the lists to a generic Firestore collection: `whitelists/{appId}/emails/{email}`. It adds new emails and deletes removed ones, ensuring Firestore exactly matches the secret file.
3. **Backend Security (Firestore Rules):** Update `firestore.rules` to add a generic helper function `isWhitelisted(appId)` that checks `exists(/databases/$(database)/documents/whitelists/$(appId)/emails/$(request.auth.token.email))`. Any collection rule for any app can now simply call `isWhitelisted('some-app-id')`.
4. **State Management:** Add a generic whitelist lookup to `@df/state` (e.g., `packages/state/src/stores/whitelist.ts`). Use the `AsyncComputed` pattern to check if the current authenticated user's email document exists for a given `appId`.
5. **UI Integration (`df-auth-wrapper`):** Add an optional `whitelist-id` (string) property to `df-auth-wrapper`. If provided, the wrapper pauses rendering the `<slot>` until the `AsyncComputed` whitelist check completes. If denied, it suppresses the wrapped component (rendering empty or an "Access Denied" message).
6. **Automated Testing:** Draft security rule tests (`pnpm test:rules`) to explicitly verify that logged-in but non-whitelisted users are denied read/write access to a mock collection protected by `isWhitelisted()`.

**Important Clarifications based on Feedback:**
- **Fully Generic:** This capability is designed to be used by **any** app in `apps/*` strictly by adding `whitelist-id="some-id"` to its `df-auth-wrapper` and protecting its Firestore collections with `isWhitelisted('some-id')`.
- **OpenClaw Chat is Unaffected:** This feature does **not** replace or alter the existing `SUPERUSER_EMAIL` logic in `df-openclaw-chat`. It adds a generic whitelist layer that functions entirely independently.
- **No Hard-coded Rules:** `firestore.rules` will not contain any actual emails. It only contains the generic logic to check the `whitelists/` collection, maintaining the single source of truth in the secret `.env`/config file.