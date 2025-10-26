# Cloud Functions Placement in Monorepo

> **Tier:** 2 (Load by Task)
>
> **For Agents:** Load this guide when adding or modifying Cloud Functions.
>
> **For Humans:** Load this guide when planning function architecture.

**Status:** ✅ Adopted
**Last Updated:** 2025-10-13
**Applies To:** All Firebase Cloud Functions in this monorepo

---

## Overview

This document establishes architectural patterns for organizing Cloud Functions in a pnpm monorepo with multiple Firebase-dependent applications. It addresses the critical question: **"Where do functions belong when they might be app-specific OR shared across multiple apps?"**

### The Challenge

Cloud Functions occupy an ambiguous space in monorepo architecture:
- They're **backend services** (not frontend code)
- They might be **app-specific** (single consumer)
- They might be **shared** (multiple consumers)
- They're **deployment-coupled** to Firebase projects
- They need **shared utilities** but can't be npm packages themselves

Traditional monorepo patterns (apps/packages/services) don't clearly address this.

---

## Core Principles

### 1. Deployment Boundaries Match Consumption Boundaries

**If one app consumes it** → Deploy with that app (`apps/*/functions/`)
**If multiple apps consume it** → Deploy as shared service (`services/firebase-functions-shared/`)

### 2. Functions Are Not NPM Packages

Unlike shared UI components or utilities, Cloud Functions:
- Run in Google Cloud infrastructure (not bundled with apps)
- Are consumed via **network calls** (HTTP/callable)
- Cannot be imported via `import` statements
- Have separate deployment lifecycles

Therefore: **Functions belong in `apps/` or `services/`, never in `packages/`**

### 3. Shared Utilities Go in Packages

While functions themselves aren't packages, their **shared utilities** are:
- Validation logic → `packages/firebase-admin-shared/validation/`
- Middleware → `packages/firebase-admin-shared/middleware/`
- Types → `packages/types/`
- Helper functions → `packages/firebase-admin-shared/utils/`

---

## Architecture Patterns

### Pattern 1: App-Specific Functions

**Use when:** Function serves **one app only**

**Structure:**
```
apps/df-firebase-teaching-app0/
├── src/                        # Frontend code
│   └── ui/
│       └── todo-list.ts        # Calls functions
├── functions/                  # ✅ Functions live here
│   ├── package.json            # Separate workspace
│   ├── firebase.json           # Firebase config
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Export all functions
│       ├── callable/
│       │   └── createTodoAdvanced.ts
│       ├── triggers/
│       │   └── onTodoCreated.ts
│       └── scheduled/
│           └── cleanupExpiredTodos.ts
└── firebase.json               # Points to ./functions
```

**Deployment:**
```bash
cd apps/df-firebase-teaching-app0
firebase deploy --only functions --project df-teaching-app
```

**When to use:**
- Todo notifications (only teaching app needs them)
- App-specific data processing
- Single-app workflows
- Business logic unique to one app

**Example:**
```typescript
// apps/df-firebase-teaching-app0/functions/src/callable/createTodoAdvanced.ts
import * as functions from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import type { Todo } from '@df/types';

export const createTodoAdvanced = functions.https.onCall<Partial<Todo>>({
  region: 'us-central1',
}, async (request) => {
  const data = request.data;

  // App-specific business logic
  const enrichedTodo = {
    ...data,
    createdAt: new Date(),
    createdBy: request.auth?.uid,
    tags: data.tags || [],
    estimatedMinutes: estimateEffort(data.title), // App-specific
  };

  const docRef = await getFirestore().collection('todos').add(enrichedTodo);
  return { id: docRef.id };
});
```

---

### Pattern 2: Shared Functions (Multi-App)

**Use when:** Function serves **multiple apps**

**Structure:**
```
services/
└── firebase-functions-shared/      # ✅ Shared functions service
    ├── package.json                # Independent workspace
    ├── firebase.json               # Firebase config
    ├── .firebaserc                 # Firebase project config
    ├── tsconfig.json
    └── src/
        ├── index.ts                # Export all shared functions
        ├── auth/
        │   ├── setCustomClaims.ts          # Role management
        │   ├── onUserCreated.ts            # User initialization
        │   └── syncRolesToFirestore.ts     # Role sync
        ├── roles/
        │   ├── assignRole.ts               # Callable
        │   ├── removeRole.ts               # Callable
        │   └── listUserRoles.ts            # Query function
        └── shared/
            ├── middleware.ts               # Auth middleware
            └── validators.ts               # Common validators
```

**Deployment (Once):**
```bash
cd services/firebase-functions-shared
firebase use shared-auth-project
firebase deploy --only functions
```

**Consumption (All Apps):**
```typescript
// apps/df-admin-app/src/stores/role-management.store.ts
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const assignRole = httpsCallable(functions, 'assignRole');

// Calls the shared function deployed in services/
await assignRole({ userId: 'abc123', role: 'admin' });
```

**When to use:**
- Authentication/authorization (shared across all apps)
- User role management (custom claims)
- Cross-app data synchronization
- Centralized business rules
- Shared API integrations (Stripe, SendGrid, etc.)

**Primary Use Case (This Monorepo):**
- **Shared auth component** used by 6+ apps
- Unified roles/permissions system
- Single source of truth for custom claims
- Centralized Firestore role storage

**Example:**
```typescript
// services/firebase-functions-shared/src/auth/setCustomClaims.ts
import * as functions from 'firebase-functions/v2';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import type { UserRole, CustomClaims } from '@df/types';
import { validateRole, canAssignRole } from '@df/firebase-admin-shared/validation';

export const setCustomClaims = functions.https.onCall<{
  userId: string;
  role: UserRole;
}>({
  region: 'us-central1',
  cors: true, // Allow all app domains
}, async (request) => {
  if (!request.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
  }

  const callerRole = request.auth.token.role as UserRole;
  const targetRole = validateRole(request.data.role);

  if (!canAssignRole(callerRole, targetRole)) {
    throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
  }

  // Set custom claims (affects ALL apps)
  const claims: CustomClaims = {
    role: targetRole,
    permissions: getPermissionsForRole(targetRole),
  };

  await getAuth().setCustomClaims(request.data.userId, claims);

  // Sync to Firestore for querying
  await getFirestore().collection('userRoles').doc(request.data.userId).set({
    role: targetRole,
    permissions: claims.permissions,
    assignedBy: request.auth.uid,
    assignedAt: new Date(),
  });

  return { success: true };
});
```

---

### Pattern 3: Shared Utilities (Not Functions)

**Use when:** Logic is **shared but not a deployable function**

**Structure:**
```
packages/
├── firebase-admin-shared/          # ✅ Shared backend utilities
│   ├── package.json
│   └── src/
│       ├── validation/
│       │   ├── role-validator.ts       # Role validation logic
│       │   └── user-validator.ts       # User validation logic
│       ├── middleware/
│       │   ├── auth-middleware.ts      # Express middleware
│       │   └── error-handler.ts        # Error handling
│       └── utils/
│           ├── permissions.ts          # Permission calculations
│           └── firebase-helpers.ts     # Firebase Admin helpers
│
└── types/                          # ✅ Shared types (client + functions)
    └── src/
        ├── user.types.ts
        ├── role.types.ts
        └── firebase.types.ts
```

**Usage:**
```typescript
// services/firebase-functions-shared/src/auth/setCustomClaims.ts
import { validateRole, canAssignRole } from '@df/firebase-admin-shared/validation';
import type { UserRole } from '@df/types';

// Use shared validation logic
const targetRole = validateRole(request.data.role);
if (!canAssignRole(callerRole, targetRole)) {
  throw new Error('Cannot assign role');
}
```

**When to use:**
- Validation logic used by multiple functions
- Middleware used across function types
- Helper utilities (not full functions)
- Type definitions shared between client and functions

**Examples of shared utilities:**
```typescript
// packages/firebase-admin-shared/src/validation/role-validator.ts
import type { UserRole } from '@df/types';

export function validateRole(role: unknown): UserRole {
  const validRoles: UserRole[] = ['admin', 'editor', 'viewer', 'guest'];
  if (typeof role === 'string' && validRoles.includes(role as UserRole)) {
    return role as UserRole;
  }
  throw new Error(`Invalid role: ${role}`);
}

export function canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
  const hierarchy = { admin: 3, editor: 2, viewer: 1, guest: 0 };
  return hierarchy[assignerRole] > hierarchy[targetRole];
}
```

---

## Complete Monorepo Structure

```
df-monorepo/
├── apps/
│   ├── df-firebase-teaching-app/       # Teaching app
│   │   ├── src/                        # Frontend
│   │   └── functions/                  # ✅ App-specific functions
│   │       ├── package.json
│   │       └── src/
│   │           ├── callable/
│   │           ├── triggers/
│   │           └── scheduled/
│   │
│   ├── df-admin-app/                   # Admin dashboard
│   │   └── src/                        # Calls shared auth functions
│   │
│   ├── df-user-portal/                 # User app
│   │   └── src/                        # Calls shared auth functions
│   │
│   └── df-teacher-app/                 # Teacher app
│       └── src/                        # Calls shared auth functions
│
├── packages/
│   ├── firebase/                       # ✅ Client-side SDK wrappers
│   │   └── src/
│   │       ├── auth/                   # Client auth utilities
│   │       ├── firestore/              # Client Firestore utilities
│   │       ├── functions/              # Client callable wrapper
│   │       └── storage/                # Client storage utilities
│   │
│   ├── firebase-admin-shared/          # ✅ Backend shared utilities
│   │   └── src/
│   │       ├── validation/
│   │       ├── middleware/
│   │       └── utils/
│   │
│   ├── types/                          # ✅ Shared types (client + backend)
│   │   └── src/
│   │       ├── user.types.ts
│   │       ├── role.types.ts
│   │       └── firebase.types.ts
│   │
│   ├── state/                          # Client state management
│   │   └── src/stores/
│   │
│   └── ui-lit/                         # Shared UI components
│       └── src/
│
└── services/
    └── firebase-functions-shared/      # ✅ Shared functions (multi-app)
        ├── package.json
        ├── firebase.json
        ├── .firebaserc
        └── src/
            ├── auth/                   # Auth functions
            ├── roles/                  # Role management
            └── shared/                 # Shared function utilities
```

---

## Decision Criteria

### Should this be a shared function (`services/`) or app-specific (`apps/*/functions/`)?

**Use `services/firebase-functions-shared/` if:**
- ✅ 2+ apps need this functionality
- ✅ Logic must be centralized (single source of truth)
- ✅ Authentication/authorization
- ✅ Cross-app data synchronization
- ✅ Shared API integrations (Stripe, SendGrid)
- ✅ Centralized business rules

**Use `apps/*/functions/` if:**
- ✅ Only one app needs this functionality
- ✅ Business logic is app-specific
- ✅ Tightly coupled to app features
- ✅ Independent deployment lifecycle

**Use `packages/*` if:**
- ✅ Not a deployable function (just utilities/types)
- ✅ Imported via `import` statements
- ✅ No network calls required
- ✅ Pure functions/helpers

### When in doubt:

**Start app-specific** (`apps/*/functions/`) → **Refactor to shared** (`services/`) when second app needs it.

Premature abstraction is worse than duplication. Wait for real multi-app need before creating shared functions.

---

## Package Configuration

### App-Specific Functions

`apps/df-firebase-teaching-app0/functions/package.json`:
```json
{
  "name": "@df/df-firebase-teaching-app0-functions",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "lib/index.js",
  "engines": {
    "node": "20"
  },
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0",
    "@df/types": "workspace:*",
    "@df/firebase-admin-shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  }
}
```

### Shared Functions Service

`services/firebase-functions-shared/package.json`:
```json
{
  "name": "@df/firebase-functions-shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "lib/index.js",
  "engines": {
    "node": "20"
  },
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions"
  },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0",
    "@df/types": "workspace:*",
    "@df/firebase-admin-shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  }
}
```

### Shared Backend Utilities

`packages/firebase-admin-shared/package.json`:
```json
{
  "name": "@df/firebase-admin-shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./validation": "./src/validation/index.ts",
    "./middleware": "./src/middleware/index.ts",
    "./utils": "./src/utils/index.ts"
  },
  "dependencies": {
    "@df/types": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.9.2"
  }
}
```

---

## TypeScript Configuration

### Functions tsconfig.json

**Both app-specific and shared functions use this pattern:**

`apps/*/functions/tsconfig.json` or `services/firebase-functions-shared/tsconfig.json`:
```json
{
  "extends": "../../../packages/config/tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",      // Firebase requirement
    "outDir": "lib",            // Firebase expects lib/
    "target": "ES2020",         // Node 20 runtime
    "lib": ["ES2020"],
    "types": ["node"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "lib"]
}
```

**Key differences from frontend:**
- `module: "commonjs"` (not ES modules)
- `target: ES2020` (not ES2022)
- Output to `lib/` (not `dist/`)
- No DOM types

---

## Dependency Rules

### ❌ Never Import

**In function code (`apps/*/functions/` or `services/firebase-functions-shared/`):**
- ❌ Never import `firebase` (client SDK) → Use `firebase-admin`
- ❌ Never import `@df/ui-lit` (UI components)
- ❌ Never import `@lit-labs/signals` (frontend state)
- ❌ Never import `@df/state` (frontend stores)
- ❌ Never import browser-only packages

**In client code (`apps/*/src/`):**
- ❌ Never import `firebase-admin` (backend SDK) → Use `firebase`
- ❌ Never import function internals

### ✅ Always Safe to Import

**Everywhere (client + functions):**
- ✅ `@df/types` - Shared interfaces
- ✅ `@df/firebase-admin-shared/validation` - Validation logic (if pure functions)

**In functions only:**
- ✅ `firebase-admin`
- ✅ `firebase-functions`
- ✅ `@df/firebase-admin-shared`

**In client only:**
- ✅ `firebase` (client SDK)
- ✅ `@df/firebase` (client wrappers)
- ✅ `@df/state`
- ✅ `@df/ui-lit`

---

## Deployment Strategies

### App-Specific Functions Deployment

**Deploy with app:**
```bash
cd apps/df-firebase-teaching-app0
firebase use df-teaching-app
firebase deploy --only functions
```

**Or deploy everything:**
```bash
firebase deploy  # Deploys functions + hosting + rules
```

### Shared Functions Deployment

**Deploy once, all apps consume:**
```bash
cd services/firebase-functions-shared
firebase use shared-services-project
firebase deploy --only functions
```

**Configure apps to call shared project:**
```typescript
// apps/df-admin-app/src/config/firebase.config.ts
export const SHARED_FUNCTIONS_PROJECT = 'shared-services-project';
export const SHARED_FUNCTIONS_REGION = 'us-central1';

// In app initialization
const sharedFunctions = getFunctions(getApp(), SHARED_FUNCTIONS_REGION);
```

### CI/CD Patterns

**GitHub Actions example:**
```yaml
# .github/workflows/deploy-shared-functions.yml
name: Deploy Shared Functions
on:
  push:
    branches: [main]
    paths:
      - 'services/firebase-functions-shared/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm --filter @df/firebase-functions-shared build
      - run: cd services/firebase-functions-shared && firebase deploy --only functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## Testing Patterns

### Unit Tests (Shared Utilities)

```typescript
// packages/firebase-admin-shared/src/validation/__tests__/role-validator.test.ts
import { validateRole, canAssignRole } from '../role-validator';

describe('validateRole', () => {
  it('accepts valid roles', () => {
    expect(validateRole('admin')).toBe('admin');
    expect(validateRole('editor')).toBe('editor');
  });

  it('rejects invalid roles', () => {
    expect(() => validateRole('superuser')).toThrow('Invalid role');
  });
});

describe('canAssignRole', () => {
  it('admin can assign any role', () => {
    expect(canAssignRole('admin', 'editor')).toBe(true);
    expect(canAssignRole('admin', 'viewer')).toBe(true);
  });

  it('editor cannot assign admin', () => {
    expect(canAssignRole('editor', 'admin')).toBe(false);
  });
});
```

### Integration Tests (Functions)

```typescript
// services/firebase-functions-shared/src/auth/__tests__/setCustomClaims.test.ts
import { setCustomClaims } from '../setCustomClaims';
import * as testUtils from 'firebase-functions-test';

const test = testUtils();

describe('setCustomClaims', () => {
  it('sets custom claims for valid request', async () => {
    const wrapped = test.wrap(setCustomClaims);
    const result = await wrapped({
      userId: 'user123',
      role: 'editor',
    }, {
      auth: { uid: 'admin123', token: { role: 'admin' } },
    });

    expect(result.success).toBe(true);
  });

  it('rejects unauthenticated requests', async () => {
    const wrapped = test.wrap(setCustomClaims);
    await expect(wrapped({ userId: 'user123', role: 'editor' }))
      .rejects.toThrow('unauthenticated');
  });
});
```

---

## Migration Path

### From Legacy Single-Repo Setup

**Before (traditional setup):**
```
my-app/
├── functions/          # All functions in one place
│   └── index.js
└── src/                # Frontend
```

**After (monorepo):**

**If one app:**
```
df-monorepo/
└── apps/
    └── my-app/
        ├── functions/      # Same functions, now a workspace
        └── src/
```

**If multiple apps need the functions:**
```
df-monorepo/
├── apps/
│   ├── app1/src/
│   └── app2/src/
└── services/
    └── firebase-functions-shared/  # Shared functions moved here
```

### Refactoring Checklist

**When moving functions to `services/`:**
- [ ] Create `services/firebase-functions-shared/` workspace
- [ ] Copy function source to `services/firebase-functions-shared/src/`
- [ ] Update imports to use workspace packages (`@df/types`, etc.)
- [ ] Extract shared logic to `packages/firebase-admin-shared/`
- [ ] Update apps to call new function URLs
- [ ] Deploy to shared Firebase project
- [ ] Update CI/CD pipelines
- [ ] Remove old function code from apps

---

## Common Pitfalls

### ❌ Putting Functions in `packages/`

**Wrong:**
```
packages/
└── my-functions/   # ❌ Functions are not packages!
    └── src/
        └── index.ts
```

**Why wrong:** Functions are deployment artifacts, not importable packages.

**Right:**
```
services/
└── firebase-functions-shared/  # ✅ Service that gets deployed
    └── src/
        └── index.ts
```

### ❌ Duplicating Functions Across Apps

**Wrong:**
```
apps/app1/functions/src/auth/setCustomClaims.ts  # ❌ Duplicated
apps/app2/functions/src/auth/setCustomClaims.ts  # ❌ Same logic
apps/app3/functions/src/auth/setCustomClaims.ts  # ❌ Maintenance nightmare
```

**Right:**
```
services/firebase-functions-shared/src/auth/setCustomClaims.ts  # ✅ Single source
# All apps call this deployed function
```

### ❌ Mixing Client and Server SDKs

**Wrong:**
```typescript
// In function code
import { getAuth } from 'firebase/auth';  // ❌ Client SDK!
```

**Right:**
```typescript
// In function code
import { getAuth } from 'firebase-admin/auth';  // ✅ Admin SDK
```

### ❌ Importing Functions Directly

**Wrong:**
```typescript
// In app code
import { setCustomClaims } from '@df/firebase-functions-shared';  // ❌ Can't import!
```

**Right:**
```typescript
// In app code
import { httpsCallable } from 'firebase/functions';
const setCustomClaims = httpsCallable(functions, 'setCustomClaims');  // ✅ Call via SDK
```

---

## Real-World Example: Shared Auth System

This monorepo's primary use case: **Shared authentication system across 6+ apps**

### Architecture

**Shared Functions Service:**
```
services/firebase-functions-shared/
└── src/
    ├── index.ts
    └── auth/
        ├── setCustomClaims.ts      # Set user roles
        ├── onUserCreated.ts        # Initialize new users
        ├── syncRolesToFirestore.ts # Keep Firestore in sync
        └── revokeAccess.ts         # Emergency access revocation
```

**Shared Validation Package:**
```
packages/firebase-admin-shared/
└── src/
    └── validation/
        ├── role-validator.ts       # Role validation logic
        └── permission-validator.ts # Permission checks
```

**Shared Types:**
```typescript
// packages/types/src/role.types.ts
export type UserRole = 'admin' | 'editor' | 'viewer' | 'guest';

export interface CustomClaims {
  role: UserRole;
  permissions: string[];
}

export interface UserRoleData {
  userId: string;
  role: UserRole;
  assignedBy: string;
  assignedAt: Date;
}
```

### Consumption Across Apps

**Admin App:**
```typescript
// apps/df-admin-app/src/stores/user-management.store.ts
import { httpsCallable } from 'firebase/functions';

const setRole = httpsCallable(functions, 'setCustomClaims');

export async function promoteToAdmin(userId: string) {
  await setRole({ userId, role: 'admin' });
}
```

**Teacher App:**
```typescript
// apps/df-teacher-app/src/guards/teacher-guard.ts
import { getAuth } from 'firebase/auth';

export function isTeacher(): boolean {
  const user = getAuth().currentUser;
  const claims = user?.getIdTokenResult().claims;
  return claims?.role === 'editor' || claims?.role === 'admin';
}
```

**Student App:**
```typescript
// apps/df-student-app/src/stores/auth.store.ts
import { getAuth } from 'firebase/auth';

export async function checkAccess() {
  const user = getAuth().currentUser;
  const token = await user?.getIdTokenResult(true); // Force refresh
  return token?.claims?.permissions || [];
}
```

---

## Summary

### Key Decisions

1. **App-specific functions** → `apps/*/functions/`
2. **Shared functions** → `services/firebase-functions-shared/`
3. **Shared utilities** → `packages/firebase-admin-shared/`
4. **Shared types** → `packages/types/`

### Decision Tree

```
Is this a Cloud Function?
├─ Yes
│  └─ Is it used by multiple apps?
│     ├─ Yes → services/firebase-functions-shared/
│     └─ No → apps/[app-name]/functions/
└─ No (utility/helper)
   └─ Is it used by functions?
      ├─ Yes → packages/firebase-admin-shared/
      └─ No → packages/[appropriate-package]/
```

### When to Refactor

**Move from app-specific to shared when:**
- ✅ Second app needs the same functionality
- ✅ Business logic must be centralized
- ✅ Authentication/authorization requirements emerge
- ✅ Duplication exceeds 50 lines of code

**Keep app-specific when:**
- ✅ Only one consumer
- ✅ Tightly coupled to app UI
- ✅ Independent lifecycle preferred
- ✅ Uncertainty about reuse

---

## References

- **Ticket 9**: `.z_/WIP/FIREBASE_TEACHING_APP_ROADMAP.md#ticket-9-cloud-functions-integration`
- **Monorepo Context**: `.claude/CLAUDE.md`
- **Firebase Functions Docs**: https://firebase.google.com/docs/functions
- **Monorepo Best Practices**: https://monorepo.tools/

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-10-13 | Initial document creation | Claude/Pete |

