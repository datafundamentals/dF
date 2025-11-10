# AUTH_TRIGGERED_FUNCTION_EMULATE_TOOL

## Purpose

This tool provides a minimal Firebase emulator environment specifically for developing and testing Cloud Functions triggered by Firebase Authentication events (`onCreate`, `onDelete`). It strips away all non-essential functionality to create a focused development harness for auth-triggered functions.

## Overview

The tool is created by cloning `apps/df-firebase-teaching-app2` and removing everything except:
- Firebase emulator configuration (auth, functions, hosting)
- `df-auth-wrapper` component with email/password authentication
- Minimal UI shell for triggering auth events
- Functions directory for hosting auth-triggered Cloud Functions

This tool has **no other purpose** beyond testing auth-triggered functions in the emulator environment.

---

## Implementation Steps

### Step 1: Clone Source App

Clone `apps/df-firebase-teaching-app2` into `apps/auth-triggered-function-tool`.

**Commands:**
```bash
cd apps
cp -r df-firebase-teaching-app2 auth-triggered-function-tool
```

**Post-Clone Updates:**

1. Update `apps/auth-triggered-function-tool/package.json`:
   - Change `"name"` to `"@df/auth-triggered-function-tool"`
   - Update functions predeploy script to reference `@df/auth-triggered-function-tool-functions`

2. Update `apps/auth-triggered-function-tool/functions/package.json`:
   - Change `"name"` to `"@df/auth-triggered-function-tool-functions"`

3. Update `apps/auth-triggered-function-tool/.firebaserc`:
   - Change project ID to `"demo-auth-function-tool"`

4. Update `apps/auth-triggered-function-tool/firebase.json` emulator ports to avoid conflicts:
   ```json
   "emulators": {
     "auth": {"host": "127.0.0.1", "port": 9156},
     "functions": {"host": "127.0.0.1", "port": 5502},
     "hosting": {"host": "127.0.0.1", "port": 5510},
     "ui": {"host": "127.0.0.1", "port": 5410}
   }
   ```

5. Update `apps/auth-triggered-function-tool/src/config/firebase.config.ts`:
   - Update emulator ports to match `firebase.json`
   - Change project ID to `"demo-auth-function-tool"`

6. Update `apps/auth-triggered-function-tool/README.md`:
   - Replace content with tool-specific documentation
   - Document purpose as auth-triggered function development harness
   - List available emulator ports

7. Update root `playwright.config.ts`:
   - Add new project entry for `auth-triggered-function-tool` with port 4184

8. Add test script to `apps/auth-triggered-function-tool/package.json`:
   ```json
   "start:test": "pnpm build && vite dev --host 127.0.0.1 --port 4184 --strictPort --mode test --logLevel error"
   ```

**Validation Checkpoint:**

Return to user with summary:
- Confirm app cloned successfully
- List all updated configuration files
- Verify unique ports assigned
- Request validation before proceeding to Step 2

**Checkpoint Commit Message:**
```
feat: clone df-firebase-teaching-app2 for auth function tool

- Created apps/auth-triggered-function-tool from df-firebase-teaching-app2
- Updated package names and project ID
- Assigned unique emulator ports (9156, 5502, 5510, 5410)
- Added Playwright test configuration on port 4184
```

---

### Step 2: Strip to Minimal Functionality

Replace `apps/auth-triggered-function-tool/index.html` body with minimal auth interface:

```html
<body>
    <df-auth-wrapper emailPw>
    </df-auth-wrapper>
    <script type="module" src="/src/main.ts"></script>
</body>
```

**Files/Code to Remove:**

#### HTML/CSS Cleanup
- Remove all custom styles from `<style>` block in `index.html` except minimal body reset
- Remove layout styles for demo components (df-firestore-demo, df-storage-demo, etc.)

#### Component Imports (src/main.ts)
Remove dynamic imports for unused demos:
- `./df-firebase-teaching-app.js`
- `./df-auth-demo.js`
- `./df-firestore-demo.js`
- `./df-storage-demo.js`
- `./df-functions-demo.js`

Keep only:
```typescript
import {initializeFirebaseForApp} from '@df/state';
import {EMULATOR_CONFIG} from './config/firebase.config.js';
import '@df/ui-lit/df-auth-wrapper';

// Initialize Firebase with emulator configuration
initializeFirebaseForApp(EMULATOR_CONFIG);
```

#### Source Files to Delete
Remove entire component files (since they're no longer imported):
- `src/df-firebase-teaching-app.ts`
- `src/df-auth-demo.ts`
- `src/df-firestore-demo.ts`
- `src/df-storage-demo.ts`
- `src/df-functions-demo.ts`
- `src/firebase-emulator-guard.ts` (if not used by df-auth-wrapper)

#### Firebase Configuration Cleanup

**firebase.json:**
- Remove `firestore` section (rules, indexes)
- Remove `storage` section (rules)
- Keep `functions`, `hosting`, and `emulators` sections

**Root Directory Files to Delete:**
- `firestore.rules`
- `firestore.indexes.json`
- `storage.rules`
- `emulator-data/` directory (will regenerate as needed)

#### Package.json Script Cleanup

Remove scripts related to unused Firebase services:
- `test:rules` (Firestore rules testing)
- `test:seed-data`
- `seed`, `seed:reset`
- `deploy:rules` (Firestore/Storage rules)
- `deploy:prod` variants mentioning rules/storage
- `emulators:export`, `emulators:import` (unless needed for auth data)

Keep essential scripts:
- `dev`, `build`, `build:prod`
- `emulators:start`, `emulators:clear`
- `test`, `test:integration`, `start:test`
- `deploy:functions`, `deploy:hosting`

#### Test Directory Cleanup

Remove test files for unused services:
- `tests/security-rules/` (Firestore rules tests)
- Integration tests that exercise Firestore/Storage/non-auth demos

Keep:
- Integration tests that verify auth functionality
- Any tests that validate functions triggered by auth events

#### Documentation Cleanup

Remove or archive app2-specific docs:
- `FIRESTORE_PATTERNS.md`
- `MANUAL_TESTING_KNOWN_ISSUES.md` (unless auth-relevant)
- `PRODUCTION_READINESS.md` (tool is emulator-only)

Keep:
- `GOOGLE_SIGNIN_SETUP.md` (may be relevant for auth testing)
- `README.md` (update with tool-specific content)

#### Dependencies Review (Optional Optimization)

Review `package.json` dependencies - consider removing if no longer needed:
- Packages only used by deleted demo components
- Check if `@df/state` is fully required or if only auth stores are needed

**DO NOT REMOVE** core dependencies:
- `@df/firebase` (auth utilities)
- `@df/ui-lit` (df-auth-wrapper)
- `firebase` (SDK)
- `lit`, `@material/web` (component dependencies)

**Validation Checkpoint:**

Return to user with summary:
- List all deleted files
- Show simplified `index.html` and `main.ts`
- Confirm app still runs with `pnpm dev`
- Verify emulators start successfully
- Request validation before proceeding to Step 3

**Checkpoint Commit Message:**
```
refactor: strip auth function tool to minimal functionality

- Replaced index.html body with df-auth-wrapper only
- Removed all demo components (firestore, storage, functions, auth-demo)
- Deleted unused Firebase services (Firestore rules, Storage rules)
- Cleaned up package.json scripts for auth+functions only
- Removed unused test files and documentation
```

---

### Step 3: Iteration and Refinement

Work iteratively with user to address unexpected issues discovered during testing.

**Expected Discovery Areas:**

1. **Emulator Configuration Issues**
   - Port conflicts with other apps
   - Auth emulator data persistence needs
   - Functions emulator triggering auth events correctly

2. **Dependency Issues**
   - Missing dependencies after cleanup
   - Unused dependencies still present
   - Version conflicts in functions package

3. **Build/Dev Workflow Issues**
   - Vite configuration needing adjustment
   - TypeScript errors from deleted files
   - Import path issues after file removal

4. **Testing Issues**
   - Integration tests needing updates
   - Playwright configuration adjustments
   - Test data seeding for auth scenarios

5. **Functions Development Workflow**
   - Example auth-triggered function template needed
   - Function deployment script refinement
   - Logging/debugging patterns for function triggers

**Iteration Process:**

For each discovered issue:
1. Document the problem clearly
2. Propose solution with rationale
3. Implement fix with targeted changes
4. Validate fix works in isolation
5. Create checkpoint commit
6. Return to user for validation

**Example Function Template (to add if requested):**

Create `functions/src/index.ts` with example:
```typescript
import * as functions from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  functions.logger.info('User created:', user.uid);
  // Add custom logic here
});

export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  functions.logger.info('User deleted:', user.uid);
  // Add cleanup logic here
});
```

**Final Validation Criteria:**

- [ ] App runs cleanly with `pnpm dev`
- [ ] Emulators start without errors
- [ ] User can sign up/sign in via df-auth-wrapper
- [ ] Functions emulator detects auth onCreate/onDelete events
- [ ] Functions can be deployed to emulator and tested
- [ ] No unused code or dependencies remain
- [ ] All tests pass
- [ ] Documentation accurately reflects tool purpose and usage

**Final Commit Message:**
```
feat: complete auth-triggered function emulation tool

- Resolved [list key issues from iteration]
- Added example auth-triggered function template
- Updated documentation for tool usage
- Validated full auth+functions workflow in emulator
```

---

## Usage Instructions (for README)

**Starting the Tool:**
```bash
cd apps/auth-triggered-function-tool
pnpm emulators:start
```

**In separate terminal:**
```bash
pnpm dev
```

**Developing Auth-Triggered Functions:**
1. Edit functions in `functions/src/index.ts`
2. Functions auto-rebuild on save (if watch mode enabled)
3. Trigger auth events via UI (sign up/delete account)
4. View function logs in emulator UI or terminal

**Emulator Access:**
- **App UI:** http://127.0.0.1:5510
- **Emulator UI:** http://127.0.0.1:5410
- **Functions:** http://127.0.0.1:5502

---

## Success Criteria

This tool is complete when:
1. It provides the **minimal viable environment** for auth function development
2. All non-auth-function code has been removed
3. Documentation clearly states single-purpose scope
4. Emulator workflow is smooth and reliable
5. User can rapidly iterate on auth-triggered functions

## Related Documentation

- **Firebase Auth Triggers:** https://firebase.google.com/docs/functions/auth-events
- **Emulator Suite:** https://firebase.google.com/docs/emulator-suite
- **Project Guides:** 
  - `/guides/firebase-emulator-workflow.md`
  - `/apps/df-firebase-teaching-app2/guides/AUTHENTICATION_PATTERNS.md`
