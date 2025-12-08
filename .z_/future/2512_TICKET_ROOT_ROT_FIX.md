# Ticket: Root Directory Cleanup (Root Rot Fix)

**Status:** Draft / Ready for Execution  
**Objective:** Reduce file clutter at the root of the monorepo by moving non-essential files to appropriate subdirectories, improving DX and maintainability.

## Execution Protocol (Strict)

For **EACH** step below, the Agent must follow this exact sequence:

1.  **Readiness Check:** Ask "Are you ready to start Step X?" and wait for user confirmation.
2.  **Execute Migration:** Perform the file moves and code updates specified in the plan.
3.  **Automated Verification:** Run the specified verification commands to ensure the change didn't break the build/tools.
4.  **User Handover:** Return control to the user with a specific list of manual checks.
5.  **Commit Point:** The user will commit changes to git as "WIP: Step X complete" before proceeding.

---

## Step 1: Move Compliance Report (Low Risk)

**Goal:** Move the generated compliance report out of the root.

**Plan:**
1.  Create directory `reports/` at root.
2.  Move `COMPLIANCE_REPORT.md` to `reports/COMPLIANCE_REPORT.md`.
3.  Update `package.json` script `generate:compliance-report` to output to the new path.
    *   *Search:* `node tools/compliance/src/generate-compliance-report.mjs`
    *   *Update:* Ensure the script inside `tools/compliance/src/generate-compliance-report.mjs` (or the arguments passed to it) writes to the new location. *Note: This might require editing the `.mjs` file itself if the path is hardcoded.*

**Automated Verification:**
*   Run `npm run generate:compliance-report` (or equivalent pnpm command).
*   Check if `reports/COMPLIANCE_REPORT.md` exists and is non-empty.

**User Manual Checks:**
*   Verify the file `reports/COMPLIANCE_REPORT.md` opens correctly.
*   Verify no other scripts rely on the old path.

---

## Step 2: Move Firebase Rules (Low Risk)

**Goal:** Group Firebase configuration files.

**Plan:**
1.  Create directory `config/firebase/`.
2.  Move `firestore.rules` to `config/firebase/firestore.rules`.
3.  Move `storage.rules` to `config/firebase/storage.rules`.
4.  Update `firebase.json` to point to the new paths.
    *   *Change:* `"firestore": { "rules": "firestore.rules" }` -> `"firestore": { "rules": "config/firebase/firestore.rules" }`
    *   *Change:* `"storage": { "rules": "storage.rules" }` -> `"storage": { "rules": "config/firebase/storage.rules" }`

**Automated Verification:**
*   Run `cat firebase.json` to verify structure.
*   (Optional) Run `firebase emulators:start --only firestore` briefly to ensure it loads rules (if environment permits).

**User Manual Checks:**
*   Review `firebase.json` changes.
*   Confirm you can deploy rules (if applicable) or that emulators start without "rules file not found" errors.

---

## Step 3: Move TypeScript Base Config (Medium Risk - High Impact)

**Goal:** Centralize TypeScript configuration in the `packages/config` workspace.

**Plan:**
1.  Move `ts.config.base.json` to `packages/config/base.json`.
2.  **CRITICAL:** Update `packages/config/package.json` (if it exists) or ensure the file is accessible.
3.  **Global Find & Replace:** Update `extends` in **ALL** `tsconfig.json` files in the monorepo.
    *   *Find:* `"extends": "../../ts.config.base.json"` (or similar relative paths)
    *   *Replace:* `"extends": "../../packages/config/base.json"` (Adjusting `../` count based on file depth).
    *   *Note:* Some apps might be deeper (e.g., `apps/nested/app`), so relative paths must be calculated dynamically.

**Automated Verification:**
*   Run `pnpm build --filter @df/types` (or a simple package) to verify TypeScript can resolve the config.
*   Run `pnpm type-check` (if available) or `tsc --noEmit` on a sample app.

**User Manual Checks:**
*   Open a `.ts` file in VS Code and ensure there are no red squiggles (IntelliSense working).
*   Check `apps/df-npm-info-app/tsconfig.json` (and others) to verify the path looks correct.

---

## Step 4: Move Playwright Config (Medium Risk)

**Goal:** Move testing config to the tools directory.

**Plan:**
1.  Move `playwright.config.ts` to `tools/test-utils/playwright.config.ts`.
2.  Update `package.json` script `test:integration`.
    *   *Change:* `playwright test` -> `playwright test --config tools/test-utils/playwright.config.ts`
3.  Update VS Code settings (if `.vscode/settings.json` exists) to help the extension find the config.
    *   *Add/Update:* `"playwright.config.configPath": "tools/test-utils/playwright.config.ts"`

**Automated Verification:**
*   Run `pnpm test:integration --list` (lists tests without running them) to verify Playwright finds the config.

**User Manual Checks:**
*   Run one integration test locally.
*   Check if the Playwright VS Code extension still discovers tests.

---

## Step 5: Refactor ESLint Config (Advanced)

**Goal:** Keep root clean while satisfying ESLint's root discovery.

**Plan:**
1.  Move the *content* of `eslint.config.js` to `packages/config/eslint-root.js`.
2.  Overwrite `eslint.config.js` at root with a proxy export:
    ```javascript
    export { default } from './packages/config/eslint-root.js';
    ```
3.  Update import paths inside `packages/config/eslint-root.js` if it references other local files (adjust relative paths).

**Automated Verification:**
*   Run `pnpm lint` on the root or a specific package.

**User Manual Checks:**
*   Verify linting still works in VS Code (problems panel).

---

## Final Cleanup

1.  Delete any empty directories left behind.
2.  Verify `package.json` scripts are clean.
3.  Celebrate a cleaner root directory!