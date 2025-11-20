# Improvements to App Starter Template (Based on First Real Usage)

also:
  - validate don't need firebaserc file see df-user-admin-app
  - if anything else fails unexpectedly see df-user-admin-app
  - keep a special eye out for future problems with emulators, an area not tested yet

## Purpose
This document captures observations from the first production clone of `apps/df-app-starter-template` during development of `apps/df-user-admin-app`. The goal is to identify gaps, friction points, and automation opportunities to improve the starter for future apps.

## Observations by first usage 1117

### Cloning Completed - Initial Observations

The following friction points were identified during the cloning of `df-app-starter-template` to create `df-user-admin-app`:

### Issue 1: Manual Playwright Configuration Registration

**Issue**: After cloning the app, `playwright.config.ts` in the repo root does not automatically know about the new project. A manual entry must be added to `PROJECT_WEB_SERVERS`.

**Current State**: Each app manually registers itself in the global `playwright.config.ts` with:
- Unique project name
- pnpm filter command
- Unique port number
- Timeout settings

**Proposed Fix**: Create a discovery mechanism that scans `apps/*/package.json` and auto-registers any app that has a `start:test` script, extracting the port from `vite.config.ts` or a new `.playwright.json` config file.

**Automation Potential**: High. Could be a script that generates the `PROJECT_WEB_SERVERS` mapping automatically by scanning app directories.

**Priority**: Medium

**Example**:
```javascript
// Current: Manual registration
'df-user-admin-app': {
  command: 'pnpm --filter @df/df-user-admin-app run start:test',
  url: 'http://127.0.0.1:4184',
  reuseExistingServer: true,
  timeout: 120_000,
}

// Proposed: Auto-discovery via app scanning
```

---

### Issue 2: Multiple Port Number Locations Require Manual Sync

**Issue**: The port number `4184` had to be updated in three separate places:
1. `apps/df-user-admin-app/vite.config.ts` (server + preview ports)
2. `apps/df-user-admin-app/package.json` (`start:test` script)
3. `playwright.config.ts` (PROJECT_WEB_SERVERS entry)

If any one is forgotten, tests fail silently with connection timeouts.

**Current State**: No single source of truth for app port configuration.

**Proposed Fix**: Store port in a single location (e.g., `vite.config.ts`) and have other files reference it via:
- NPM script variables during build time
- Package exports (e.g., `export const TEST_PORT = 4184` from `vite.config.ts`)
- Environment variable injection

**Automation Potential**: High. Could be a pre-commit hook that validates port consistency across the three locations.

**Priority**: High

**Example**:
```typescript
// vite.config.ts - single source
export const APP_PORT = 4184;
export const APP_NAME = 'df-user-admin-app';

// playwright.config.ts auto-generates from this
// package.json script references it via substitution
```

---

### Issue 3: "Rename Me" Pattern Not Obvious During Cloning

**Issue**: The starter has a component named `rename-me-app-container.ts` with multiple references scattered throughout:
- Component file name
- Class name (`RenameMeAppContainer`)
- Custom element name (`'rename-me-app-container'`)
- HTML tag usage in `index.html`
- Global type declaration in component
- Import in `src/main.ts`

It's not immediately clear that ALL of these must be updated consistently. Missing even one causes the app to fail to load.

**Current State**:
- File is named `rename-me-app-container.ts` (obvious it needs renaming)
- But references in `index.html`, `main.ts`, and component internals are not obviously marked as "needs update"

**Proposed Fix**:
1. Add a clear "RENAME ME" checklist comment at the top of `rename-me-app-container.ts`
2. Add JSDoc with example of all locations that need updating
3. Consider adding a setup script that prompts for app name and performs all renames atomically

**Automation Potential**: Very High. A `scripts/clone-app.sh` could:
```bash
# Usage: ./clone-app.sh df-app-starter-template df-user-admin-app
# Would perform all 7+ renames atomically
```

**Priority**: High

**Example Comment**:
```typescript
/**
 * ⚠️ RENAME THIS COMPONENT - Clone-time TODO
 *
 * When cloning this starter, rename ALL of the following:
 * 1. This file: rename-me-app-container.ts → [your-app-name]-shell.ts
 * 2. Class name: RenameMeAppContainer → YourAppNameShell
 * 3. Element tag: 'rename-me-app-container' → 'your-app-name-shell'
 * 4. In src/main.ts: import './rename-me-app-container.js' → '.../your-app-name-shell.js'
 * 5. In index.html: <rename-me-app-container> → <your-app-name-shell>
 * 6. In index.html CSS: rename-me-app-container { → your-app-name-shell {
 * 7. Rollup: dist/bundle/df-app-starter-template.js → .../df-your-app.js
 * 8. Vite plugin name: 'df-firebase-teaching-entry' → 'df-your-app-entry'
 * 9. Playwright: Register in playwright.config.ts PROJECT_WEB_SERVERS
 *
 * See .z_/CLONING_CHECKLIST.md for a complete guide.
 */
```

---

### Issue 4: No Monorepo Integration Points are Documented

**Issue**: When cloning, it's unclear which files are app-specific and which are shared monorepo configuration:
- Should I update the workspace Playwright config? ✅ Yes
- Should I update monorepo `pnpm-workspace.yaml`? ❓ No (automatic for apps/)
- Should I update any Turbo configuration? ❓ No (auto-discovered)
- Should I register the app somewhere in CI/CD? ❓ Depends on project

**Current State**: No documentation explaining the integration points or checklist.

**Proposed Fix**: Create `.z_/CLONING_CHECKLIST.md` with clear sections:
- "Automatic Integration Points" (what the monorepo discovers)
- "Manual Integration Points" (Playwright, CI/CD, etc.)
- "Verification Steps" (commands to validate successful clone)

**Automation Potential**: Medium. Could validate all integration points post-clone.

**Priority**: Medium

---

### Issue 5: Package.json Scripts Reference Old App Name

**Issue**: After cloning, several scripts still reference the original app name:
- `emulators:start` references `"demo-firebase-teaching-app"` (hardcoded project ID)
- `emulators:export/import` also hardcoded to teaching app
- No template variables or clear indication these need updating

**Current State**: These scripts run without error but operate on the wrong Firebase project/emulator data.

**Proposed Fix**: Create environment variables for app-specific settings:
```json
{
  "scripts": {
    "emulators:start": "firebase emulators:start --project $FIREBASE_PROJECT_ID"
  }
}
```

Or more realistically, add a `.env.local` that gets picked up automatically.

**Automation Potential**: Medium. Could be environment variable injection during cloning.

**Priority**: Low (these scripts are secondary for most apps)

---

### Issue 6: Emulator Configuration Missing Functions

**CRITICAL BUG**: The `emulators:start` script does not specify which emulators to start via the `--only` flag.

**Current State**:
```json
"emulators:start": "firebase emulators:start --project demo-firebase-teaching-app --import ... --export-on-exit ..."
```

This starts ALL available emulators (auth, firestore, storage, hosting, functions, etc.), but without the `--only` flag, it defaults to some subset that depends on `firebase.json` configuration. The actual emulators started were:
- ✅ Authentication (9155)
- ✅ Firestore (8280)
- ✅ Hosting (5500)
- ✅ Storage (9390)
- ❌ **Functions - MISSING** (critical for testing Cloud Functions)

**Impact**: Apps cannot test Cloud Functions locally without manually specifying emulators. Integration tests calling Cloud Functions will fail.

**Proposed Fix**: Explicitly specify all required emulators in the `--only` flag:
```json
"emulators:start": "firebase emulators:start --project demo-firebase-teaching-app --only auth,firestore,storage,functions,hosting --import ... --export-on-exit ..."
```

**Automation Potential**: Low. This is a one-time fix to the starter template's `package.json` that affects all cloned apps.

**Priority**: CRITICAL - Blocks proper local testing of Cloud Functions.

**Fixed in**:
- ✅ `apps/df-user-admin-app/package.json`
- ✅ `apps/df-app-starter-template/package.json`

---

### Issue 7: No Integration Test Port Configuration in package.json

**Issue**: The `preview` and `preview:prod` scripts still hardcode port 4183 (from starter):
```json
"preview": "vite preview --host 127.0.0.1 --port 4183",
```

These should also be updated to port 4184, but they're easy to forget since they're not used in normal development.

**Current State**: Port mismatch between dev/test and preview scripts.

**Proposed Fix**: Extract port to a single variable and reference it in all scripts, or inject it from `vite.config.ts`.

**Automation Potential**: High (same as Issue 2).

**Priority**: Low (preview scripts are rarely used)

---

### Issue 8: Auth Functions Deployment Not Documented

**CRITICAL BUG DISCOVERED**: When cloning the starter to create a new app that uses Firebase Auth triggers (like RBAC profile provisioning), the `services/auth-functions` package must be deployed to Firebase. However, there's no documentation or checklist indicating this is required.

**Current State**: The auth-functions exist in the monorepo but developers cloning a new app have no way to know:
1. That auth-functions exist at all
2. That they need to be deployed separately
3. What auth-functions provide to the cloned app
4. That user creation won't work without them deployed

**Impact**: Without auth-functions deployed:
- New users sign up but don't get RBAC profiles
- Custom claims aren't set on ID tokens
- Any permission-based logic fails with "Insufficient permissions"
- Apps appear broken but the root cause is invisible (infrastructure issue, not app code)

**Proposed Fix**: Add to starter template documentation:
1. Add `DEPLOYMENT_CHECKLIST.md` that lists:
   - Deploy auth-functions: `pnpm --filter @df/auth-functions run deploy`
   - Verify auth-functions are deployed: Check Firebase Console → Cloud Functions
   - Verify custom claims appear in new user ID tokens

2. Add verification script that checks:
   - Auth triggers are callable
   - Custom claims are being set
   - Firestore documents are being created

3. Document the auth trigger lifecycle in a new guide (recommend: `guides/AUTH_FUNCTION_SETUP.md`)

**Automation Potential**: High. Could create a validation script that tests auth trigger functionality after deployment.

**Priority**: CRITICAL - Blocks any app using RBAC or custom claims from working.

---

### Issue 9: RBAC Setup Not in Starter Knowledge

**Issue**: The starter template has no documentation or examples of:
- Role-based access control patterns
- Custom claims in ID tokens
- Permission checking in Cloud Functions
- Firestore profile collections for users
- Mapping roles to permissions

**Current State**: Apps cloned from starter and wanting to implement access control have to figure out RBAC architecture from scratch (or copy from another app).

**Proposed Fix**:
1. Add example RBAC implementation to starter (or reference guide)
2. Include `services/auth-functions` in the starter's awareness
3. Document the RBAC pattern: roles → permissions → custom claims → token → enforcement
4. Provide example Cloud Function with permission checking

**Automation Potential**: Low. This is documentation and pattern guidance.

**Priority**: High - The RBAC pattern is fundamental for production apps but completely undiscovered by starter users.

**Relevant Guides Created**: `guides/RBAC_SETUP.md` covers this comprehensively.

---

### Issue 10: Firebase Admin SDK Scripts for Bootstrap

**Issue**: When a new app is deployed and users sign up, the very first user needs special treatment. They often need to be promoted to admin so they can then manage other users. However, there's no tooling or documentation for this "bootstrap" scenario.

**Current State**: Developers must manually use Firebase Console to promote the first user, which is:
- Error-prone (manual Firebase Console navigation)
- Not documented in starter
- Not scriptable/repeatable

**Proposed Fix**:
1. Create a template script in starter: `scripts/promote-first-admin.ts`
2. Usage: `npx ts-node scripts/promote-first-admin.ts <user-email>`
3. Script should:
   - Update Firestore user profile
   - Set custom claims in Firebase Auth
   - Log completion with verification steps

4. Document the bootstrap problem in setup guide

**Automation Potential**: High. Script is reusable across all apps.

**Priority**: High - Blocks app deployment readiness.

**Relevant Ticket Created**: `.z_/future/1118_BOOTSTRAP_PROBLEM_SOLUTION.md` documents this issue in detail.

---

### Issue 11: Custom Claims Token Caching Behavior Not Documented

**Issue**: When an app uses custom claims in Firebase Auth (e.g., for RBAC), changes to those claims don't appear in the client's ID token until the token is refreshed. This causes confusing behavior:
1. Admin changes a user's role
2. User's token still shows old permissions
3. User sees permission denied even though role was changed
4. User must logout/login to see new role

**Current State**: No documentation of this behavior. Developers experience it as a bug when it's actually correct Firebase behavior.

**Proposed Fix**:
1. Document in `guides/RBAC_SETUP.md` (✅ Done)
2. Add to starter template setup guide
3. Consider implementing automatic token refresh when role changes
4. Note it in code comments where custom claims are used

**Automation Potential**: Medium. Could implement auto-refresh as a reusable pattern.

**Priority**: Medium - Affects UX but is technically correct behavior.

---

### Positive Observations

✅ **Excellent**: The starter template is well-structured. Cloning with `cp -r` worked perfectly - no hidden dependencies or broken imports in the base template.

✅ **Excellent**: TypeScript config inheritance via `extends` means cloned apps automatically get the right compiler settings.

✅ **Excellent**: The patterns in `src/main.ts` and `src/config/firebase.config.ts` are clear and require minimal customization.

✅ **Good**: Environment file structure (`.env`, `.env.development`, `.env.production`) is well-documented and works as-is post-clone.

✅ **Good**: Security rules and Firestore indexes can be reused or easily modified for new data models.

---

### Format
Use this structure for each observation:

```markdown
### [Category] - [Brief Description]

**Issue**: What was the problem or friction point?

**Current State**: How does the starter handle this now?

**Proposed Fix**: Specific change to make to the starter template

**Automation Potential**: Could this be scripted? How?

**Priority**: High / Medium / Low

**Example**: If applicable, show before/after or code example
```

## Implementation Plan
*After ticket 1117 completes, review observations and create follow-up tickets to update the starter template*

## Success Criteria
- [ ] Agent documented at least 5 observations during development
- [ ] Each observation includes proposed fix
- [ ] Observations prioritized by impact
- [ ] At least one automation opportunity identified
