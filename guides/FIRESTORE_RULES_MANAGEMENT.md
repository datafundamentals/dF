# Firestore Security Rules Management in the Monorepo

> **Tier:** 2 (Load when working with Firebase/Firestore)
>
> **For Agents & Humans:** Essential guide for managing Firestore security rules across the monorepo.

## Overview

This monorepo uses a **single consolidated Firestore security rules file** shared across all Firebase apps. This architecture prevents deployment conflicts and ensures all apps have consistent security coverage.

## Architecture

### Single Source of Truth

**Location:** `packages/firebase/firestore.rules`

This file contains ALL Firestore security rules for ALL collections used by ANY app in the monorepo.

### Why Consolidated Rules?

Firebase projects have **ONE set of security rules** that applies to ALL apps in the project. When you deploy from any app, you deploy rules for the ENTIRE project.

**The Problem We Solved:**
- Before: Each app had its own `firestore.rules` file
- Issue: Deploying App A would overwrite rules needed by App B
- Result: Broken security, missing collection rules, confusion

**The Solution:**
- Single `packages/firebase/firestore.rules` contains all rules
- All app `firebase.json` files reference this shared file
- Any deployment updates the complete, correct ruleset

## File Organization

```
/Users/petecarapetyan/work/primary/dF/
├── firestore.rules          ← SINGLE SOURCE OF TRUTH (monorepo root)
├── firebase.json            ← Root-level config for deploying rules
└── .firebaserc              ← Firebase project configuration

apps/df-firebase-teaching-app/
├── firebase.json            ← App-specific config (functions, storage, etc.)
└── firestore.indexes.json   ← App-specific indexes

apps/df-chat-app/
├── firebase.json            ← App-specific config
└── firestore.indexes.json

apps/df-activity-log/
├── firebase.json            ← App-specific config
└── firestore.indexes.json

[...all other Firebase apps follow same pattern...]
```

## How It Works

### Root-Level Configuration

The monorepo root has a minimal `firebase.json` for deploying shared rules:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

### Deployment

**Deploy rules from the monorepo root:**
```bash
# From /Users/petecarapetyan/work/primary/dF/
firebase deploy --only firestore:rules
```

This deploys the COMPLETE ruleset from `firestore.rules` to the shared Firebase project.

**Important:** Due to Firebase CLI security restrictions, you MUST deploy rules from the monorepo root. Deploying from app directories will not work because Firebase CLI prevents using `../` paths to reference files outside the project directory.

### Adding New Collections

When you add a new collection to ANY app:

1. **Add rules to `firestore.rules` at monorepo root**
   ```
   // Add your collection rules with a comment indicating which app uses it
   // =============================================================================
   // YOUR COLLECTION NAME (app-name)
   // =============================================================================

   match /yourCollection/{docId} {
     allow read: if isAuthenticated();
     // ... your rules
   }
   ```

2. **Document the collection** in the header comment with the app name

3. **Deploy from any app** - the new rules will be included

4. **DO NOT** create app-level `firestore.rules` files

## Rules File Structure

The consolidated rules file follows this organization:

```
packages/firebase/firestore.rules
├── Header documentation (purpose, architecture notes)
├── Helper functions (reusable across collections)
├── Collection-specific rules (grouped by app/feature)
│   ├── // TODOS COLLECTION (df-firebase-teaching-app, df-user-admin-app)
│   ├── // USER PROFILES COLLECTION (df-firebase-teaching-app, df-user-admin-app)
│   ├── // REFERENCE DATA COLLECTIONS (df-firebase-teaching-app)
│   ├── // CHAT MESSAGES COLLECTION (df-chat-app)
│   └── // ACTIVITY LOG COLLECTION (df-activity-log)
└── Default deny-all rule (security best practice)
```

## Collections Currently Covered

| Collection | Apps Using It | Purpose |
|------------|---------------|---------|
| `todos` | df-firebase-teaching-app, df-user-admin-app | Task management demo |
| `userProfiles` | df-firebase-teaching-app, df-user-admin-app | User profile data (auth trigger managed) |
| `flowers`, `continents`, `chemicalElements`, `musicalInstruments` | df-firebase-teaching-app | Read-only reference data |
| `chatMessage` | df-chat-app | Chat messages |
| `activity/{userId}/pushups` | df-activity-log | User activity tracking |

## Common Operations

### Adding a New App

1. Create app directory structure
2. Create app-specific `firebase.json` with functions, storage, etc. (NOT firestore rules)
3. Add any new collection rules to the root-level `firestore.rules`
4. Deploy rules from monorepo root: `cd /path/to/dF && firebase deploy --only firestore:rules`

### Modifying Existing Rules

1. Edit `firestore.rules` at monorepo root
2. Test locally with emulators
3. Deploy from monorepo root: `cd /path/to/dF && firebase deploy --only firestore:rules`

### Testing Rules

From `apps/df-firebase-teaching-app`:
```bash
pnpm test:rules
```

This runs the security rules test suite against the consolidated rules file.

## Migration Notes

**Completed:** All app-level `firestore.rules` files have been removed and consolidated.

**Before (WRONG):**
```
apps/df-chat-app/firestore.rules           ❌ Removed
apps/df-activity-log/firestore.rules       ❌ Removed
apps/df-firebase-teaching-app/firestore.rules  ❌ Removed
[...etc...]
```

**After (CORRECT):**
```
packages/firebase/firestore.rules          ✅ SINGLE SOURCE OF TRUTH
```

All `firebase.json` files updated to reference the shared rules file.

## Why This Matches Monorepo Patterns

This approach follows the same pattern already established in the monorepo:

| Resource | Pattern | Location |
|----------|---------|----------|
| **Functions** | Shared, referenced by apps | `services/functions/` |
| **Types** | Shared package | `packages/types/` |
| **State** | Shared package | `packages/state/` |
| **UI Components** | Shared package | `packages/ui-lit/` |
| **Firestore Rules** | Shared, referenced by apps | `packages/firebase/firestore.rules` ✅ |
| **Emulator Config** | Shared, referenced by apps | `packages/firebase/firebase.json` |

## Troubleshooting

### "Rules deployment failed: File not found"

**Cause:** The `firebase.json` path is incorrect.

**Fix:** Ensure the path is relative from the app directory:
```json
"rules": "../../packages/firebase/firestore.rules"
```

### "Collection XYZ permission denied"

**Cause:** Rules for that collection may not exist in the consolidated file.

**Fix:**
1. Open `packages/firebase/firestore.rules`
2. Add rules for the collection
3. Deploy: `firebase deploy --only firestore:rules`

### "I deployed App A and App B stopped working"

**Cause:** This should NOT happen anymore with consolidated rules.

**If it does happen:**
1. Check that `packages/firebase/firestore.rules` has rules for App B's collections
2. Verify App B's `firebase.json` points to the shared rules file
3. Redeploy to restore full ruleset

## Best Practices

✅ **DO:**
- Add all new collection rules to `packages/firebase/firestore.rules`
- Comment which app(s) use each collection
- Test with emulators before deploying
- Deploy rules separately: `firebase deploy --only firestore:rules`
- Keep the default deny-all rule at the end

❌ **DON'T:**
- Create app-level `firestore.rules` files
- Deploy rules from multiple files
- Mix collection rules for the same app across different sections
- Remove the default deny-all rule

## Firebase Documentation References

For more information on Firestore security rules:

- [Manage and deploy Firebase Security Rules](https://firebase.google.com/docs/rules/manage-deploy)
- [Structuring Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Get started with Cloud Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

## Related Guides

- `guides/firebase-teaching/FIREBASE_PATTERNS.md` - Overall Firebase architecture in the monorepo
- `guides/firebase-teaching/FIREBASE_COOKBOOK.md` - Common Firebase operations
- `packages/firebase/firestore.rules` - The actual consolidated rules file

---

**Summary:** One project = one ruleset = one file. All apps reference the shared `packages/firebase/firestore.rules` file. This prevents deployment conflicts and ensures comprehensive security coverage.
