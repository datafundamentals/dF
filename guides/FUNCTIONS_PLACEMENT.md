# Cloud Functions Placement in Monorepo

> **Tier:** 2 (Load by Task)
>
> **For Agents:** Load this guide when adding or modifying Cloud Functions.
>
> **For Humans:** Load this guide when planning function architecture.

**Status:** ✅ Adopted
**Last Updated:** 2025-11-18
**Applies To:** All Firebase Cloud Functions in this monorepo

---

## Core Principle

**Functions are servers. Server code goes in `services/`. Period.**

There is no ambiguity about placement:
- ❌ **NEVER** put functions in `apps/` (apps are browser/presentation code only)
- ✅ **ALL functions** go in `services/functions/` by default
- ✅ **Auth-triggered functions only** go in `services/auth-functions/` (special case)

---

## Architecture Overview

```
services/
├── functions/                    # ✅ Regular Cloud Functions (HTTP, callable, triggers, scheduled)
│   ├── src/
│   │   ├── callable/            # Callable functions (client-initiated)
│   │   ├── triggers/            # Firestore/Realtime triggers
│   │   ├── scheduled/           # Scheduled functions (Cloud Tasks)
│   │   ├── http/                # HTTP functions (webhooks, API endpoints)
│   │   └── shared/              # Shared utilities (auth middleware, validators)
│   ├── package.json
│   ├── tsconfig.json
│   └── firebase.json
│
└── auth-functions/              # ⚠️ SPECIAL: Auth-triggered functions ONLY
    ├── src/
    │   ├── onCreate.ts          # User creation trigger
    │   ├── onDelete.ts          # User deletion trigger
    │   └── shared/              # Shared utilities
    ├── package.json
    ├── tsconfig.json
    └── firebase.json
```

---

## Placement Decision Tree

```
Is this a Cloud Function?
│
├─ Yes
│  │
│  └─ Is it triggered by Firebase Authentication (user.onCreate, user.onDelete)?
│     │
│     ├─ Yes → services/auth-functions/
│     │
│     └─ No → services/functions/
│
└─ No (utility/helper/validation logic)
   │
   └─ Is it used by multiple services/apps?
      │
      ├─ Yes → packages/[appropriate-package]/
      └─ No → Keep in the function that uses it locally
```

---

## Pattern 1: Regular Cloud Functions (services/functions/)

**Use for:** HTTP callables, Firestore triggers, scheduled functions, webhooks - anything that's NOT auth-triggered.

### Structure

```
services/functions/
├── package.json                 # "type": "module", Node 20+
├── tsconfig.json               # "module": "NodeNext" (ESM only!)
├── firebase.json               # Firebase config
├── .firebaserc                 # Firebase project config
└── src/
    ├── index.ts                # Export all functions
    ├── callable/
    │   ├── getUserList.ts
    │   └── updateUserRole.ts
    ├── triggers/
    │   ├── onTodoCreated.ts
    │   └── onUserUpdated.ts
    ├── scheduled/
    │   └── cleanupExpiredTodos.ts
    ├── http/
    │   └── webhookReceiver.ts
    └── shared/
        ├── auth-middleware.ts
        └── validators.ts
```

### Example: Callable Function

```typescript
// services/functions/src/callable/getUserList.ts
import * as functions from 'firebase-functions/v2';
import { getFirestore } from 'firebase-admin/firestore';
import type { Role } from '@df/types';

export const getUserList = functions.https.onCall<GetUserListRequest, GetUserListResponse>(
  { region: 'us-central1', cors: true },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    // Check permissions (from custom claims)
    const claims = request.auth.token;
    if (!claims.permissions?.includes('user:list')) {
      throw new functions.https.HttpsError('permission-denied', 'Insufficient permissions');
    }

    // Business logic here
    const firestore = getFirestore();
    const users = await firestore.collection('users').limit(50).get();

    return { users: users.docs.map(doc => doc.data()) };
  }
);
```

### Deployment

```bash
cd services/functions
firebase deploy --only functions --project [project-id]
```

---

## Pattern 2: Auth-Triggered Functions (services/auth-functions/)

**Use ONLY for:** User creation and deletion triggers from Firebase Authentication.

⚠️ **This folder is special and off-limits.** Only authentication lifecycle functions belong here.

### Structure

```
services/auth-functions/
├── package.json
├── tsconfig.json
├── firebase.json
└── src/
    ├── index.ts                # Export all functions
    ├── onCreate.ts             # User creation trigger
    ├── onDelete.ts             # User deletion trigger
    └── shared/
        └── utils.ts
```

### Example: Auth onCreate

```typescript
// services/auth-functions/src/onCreate.ts
import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { UserProfileDocument, Role } from '@df/types';

initializeApp();

export const authUserCreated = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const timestamp = new Date().toISOString();

  const profileDoc: UserProfileDocument = {
    userId: uid,
    role: 'viewer' as Role,
    permissions: [],
    createdAt: timestamp,
  };

  try {
    await getFirestore().collection('userProfiles').doc(uid).set(profileDoc);
    functions.logger.info('User profile initialized', { uid });
  } catch (error) {
    functions.logger.error('Failed to initialize profile', { uid, error });
    throw error;
  }
});
```

### Deployment

```bash
cd services/auth-functions
firebase deploy --only functions --project [project-id]
```

---

## Shared Utilities (packages/, NOT services/)

Code that's reusable across multiple functions should NOT stay in services/. Move it to packages/.

### Examples of Shared Utilities

**Should be in `packages/firebase-admin-shared/`:**
```typescript
// packages/firebase-admin-shared/src/validation/role-validator.ts
export function validateRole(role: unknown): Role {
  const validRoles: Role[] = ['admin', 'player', 'coderFomo', 'viewer'];
  if (typeof role === 'string' && validRoles.includes(role as Role)) {
    return role as Role;
  }
  throw new Error(`Invalid role: ${role}`);
}

// packages/firebase-admin-shared/src/utils/permissions.ts
export function getPermissionsForRole(role: Role): Permission[] {
  const rolePermissions: Record<Role, Permission[]> = {
    admin: ['user:list', 'user:changeRole', 'user-admin-app:view'],
    player: [],
    coderFomo: [],
    viewer: [],
  };
  return rolePermissions[role];
}
```

**Import in functions:**
```typescript
// services/functions/src/callable/getUserList.ts
import { validateRole } from '@df/firebase-admin-shared/validation';
import { getPermissionsForRole } from '@df/firebase-admin-shared/utils';
```

---

## Complete Monorepo Structure

```
df-monorepo/
├── apps/
│   ├── df-user-admin-app/
│   │   ├── src/                # ✅ Browser/presentation code ONLY
│   │   │   ├── components/
│   │   │   └── stores/
│   │   └── functions/          # ❌ NEVER - functions go in services/
│   │
│   └── [other-apps]/
│       ├── src/                # ✅ Browser code
│       └── functions/          # ❌ NEVER
│
├── packages/
│   ├── firebase-admin-shared/  # ✅ Shared backend utilities
│   │   ├── validation/
│   │   ├── middleware/
│   │   └── utils/
│   │
│   ├── types/                  # ✅ Shared types (client + server)
│   │
│   ├── state/                  # ✅ Client-side state (Lit signals)
│   │
│   └── ui-lit/                 # ✅ Client-side components
│
└── services/
    ├── functions/              # ✅ ALL regular Cloud Functions
    │   └── src/
    │       ├── callable/
    │       ├── triggers/
    │       ├── scheduled/
    │       └── shared/
    │
    └── auth-functions/         # ✅ Auth-triggered functions ONLY
        └── src/
            ├── onCreate.ts
            └── onDelete.ts
```

---

## ESM Configuration (Required)

All functions **MUST** use ESM (ES Modules). Never use CommonJS.

### functions/package.json

```json
{
  "name": "@df/functions",
  "type": "module",
  "engines": { "node": "22" },
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.1.1"
  }
}
```

### functions/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "lib",
    "strict": true,
    "esModuleInterop": true,
    "sourceMap": true
  }
}
```

---

## Permission Checking in Functions

Per `guides/ROLE_BASED_ACCESS_CONTROL_GUIDE.md`:

**✅ CORRECT:** Check permissions (from custom claims)
```typescript
const claims = request.auth.token;
if (!claims.permissions?.includes('user:list')) {
  throw new HttpsError('permission-denied', 'Insufficient permissions');
}
```

**❌ WRONG:** Check role directly
```typescript
if (request.auth.token.role !== 'admin') {
  throw new HttpsError('permission-denied', '...');
}
```

---

## Deployment Checklist

- [ ] Function placed in correct location (`services/functions/` or `services/auth-functions/`)
- [ ] ESM configuration (`"type": "module"` and `"module": "NodeNext"`)
- [ ] All security checks use **permissions**, not roles
- [ ] Function is exported from `services/[functions|auth-functions]/src/index.ts`
- [ ] Build succeeds: `pnpm --filter @df/functions build`
- [ ] Tests pass: `pnpm --filter @df/functions test`
- [ ] Deployment succeeds: `firebase deploy --only functions`

---

## Key Principles Summary

1. **Functions are servers** → All function code goes in `services/`
2. **apps/ = browser code only** → Never put server code in apps/
3. **Reusable logic = packages/** → Shared utilities go in packages/
4. **ESM only** → No CommonJS anywhere in functions
5. **Auth functions = special** → Only auth triggers go in services/auth-functions/
6. **Regular functions = services/functions/** → Everything else here

---

## References

- `guides/ROLE_BASED_ACCESS_CONTROL_GUIDE.md` - Permission checking patterns
- `services/auth-functions/` - Canonical example of auth-triggered functions
- `services/functions/` - Canonical example of regular functions
- `packages/firebase-admin-shared/` - Shared utilities location
- `packages/types/` - Shared type definitions
