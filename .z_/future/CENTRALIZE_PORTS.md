# Ticket: Centralize Firebase Emulator Port Configuration (Single Source of Truth)

## Problem Statement

Firebase emulator ports are currently hardcoded in **multiple locations** across the codebase, violating DRY principles and causing maintenance issues. During recent refactoring, port mismatches between `apps/df-firebase-teaching-app/firebase.json` (intentionally non-default ports) and store initialization code caused connection failures.

**Current Duplication (Per App):**
1. `apps/df-firebase-teaching-app/firebase.json` - Emulator configuration
2. `apps/*/scripts/seed-data/seed.ts` - Seed script emulator connection
3. `packages/state/src/stores/firebase-auth.store.ts` - Auth emulator connection (hardcoded 9155)
4. `packages/state/src/stores/storage.store.ts` - Storage emulator connection (hardcoded 9390)
5. `packages/state/src/stores/functions-demo.store.ts` - Functions emulator connection (hardcoded 5501)
6. Documentation in `guides/BUNDLE_INTEGRATION.md` and other guides

**Known Port Scheme (Intentionally Non-Default):**
- Auth: **9155** (not Firebase default 9099)
- Firestore: **8280** (not default 8080)
- Storage: **9390** (not default 9199)
- Functions: **5501** (not default 5001)
- Hosting: **5500**
- Emulator UI: **5400** (not default 4000)

## Acceptance Criteria

### 1. Create Centralized Port Constants

Create `packages/types/src/firebase-ports.ts`:

```typescript
/**
 * Firebase Emulator Port Configuration
 * 
 * SINGLE SOURCE OF TRUTH for all emulator ports.
 * These ports are intentionally non-default to avoid conflicts
 * with other local development environments.
 */
export const FIREBASE_EMULATOR_PORTS = {
  auth: 9155,
  firestore: 8280,
  storage: 9390,
  functions: 5501,
  hosting: 5500,
  ui: 5400,
} as const;

export type EmulatorService = keyof typeof FIREBASE_EMULATOR_PORTS;
```

Export from `packages/types/src/index.ts`:
```typescript
export { FIREBASE_EMULATOR_PORTS, type EmulatorService } from './firebase-ports.js';
```

### 2. Update Store Initialization Code

Update all hardcoded ports in store files to import constants:

```typescript
// packages/state/src/stores/firebase-auth.store.ts
import { FIREBASE_EMULATOR_PORTS } from '@df/types';

function ensureAuthInitialized() {
  // ...
  if (shouldUseEmulatorForService('auth')) {
    connectAuthEmulator(
      auth,
      `http://127.0.0.1:${FIREBASE_EMULATOR_PORTS.auth}`,
      { disableWarnings: true }
    );
  }
}
```

Apply same pattern to:
- `packages/state/src/stores/storage.store.ts` (line 66)
- `packages/state/src/stores/functions-demo.store.ts` (line 39)

### 3. Update Seed Scripts

Each `apps/*/scripts/seed-data/seed.ts` currently has:

```typescript
const EMULATOR_CONFIG = {
  auth: {host: '127.0.0.1', port: 9155},
  firestore: {host: '127.0.0.1', port: 8280},
  storage: {host: '127.0.0.1', port: 9390},
};
```

Replace with:

```typescript
import { FIREBASE_EMULATOR_PORTS } from '@df/types';

const EMULATOR_CONFIG = {
  auth: {host: '127.0.0.1', port: FIREBASE_EMULATOR_PORTS.auth},
  firestore: {host: '127.0.0.1', port: FIREBASE_EMULATOR_PORTS.firestore},
  storage: {host: '127.0.0.1', port: FIREBASE_EMULATOR_PORTS.storage},
};
```

Update in all 5 teaching apps:
- `apps/df-firebase-teaching-app/scripts/seed-data/seed.ts`
- `apps/df-firebase-teaching-app2/scripts/seed-data/seed.ts`
- `apps/df-firebase-teaching-app3/scripts/seed-data/seed.ts`
- `apps/df-firebase-teaching-app4/scripts/seed-data/seed.ts`
- `apps/df-firebase-teaching-app5/scripts/seed-data/seed.ts`

### 4. Generate `firebase.json` from Constants (Optional Enhancement)

Consider creating a script to generate/validate `firebase.json` from constants:

```typescript
// scripts/generate-firebase-config.ts
import { FIREBASE_EMULATOR_PORTS } from '@df/types';

const config = {
  emulators: {
    auth: {
      host: '127.0.0.1',
      port: FIREBASE_EMULATOR_PORTS.auth,
    },
    firestore: {
      host: '127.0.0.1',
      port: FIREBASE_EMULATOR_PORTS.firestore,
    },
    // ... etc
  }
};

// Write to firebase.json or validate existing matches
```

**If generated:** Add `pnpm generate:firebase-config` script to `package.json`
**If validator:** Add `pnpm validate:firebase-config` to CI/pre-commit

### 5. Update Documentation

Update all port references in documentation:
- `guides/BUNDLE_INTEGRATION.md` - Replace hardcoded port list with import reference
- `apps/df-firebase-teaching-app/guides/*` - Reference `FIREBASE_EMULATOR_PORTS` constant
- README files mentioning emulator ports

Example documentation pattern:
```markdown
**Emulator Ports** (defined in `@df/types/firebase-ports.ts`):
- Import via `import { FIREBASE_EMULATOR_PORTS } from '@df/types'`
- Auth: Port 9155
- Firestore: Port 8280
- Storage: Port 9390
- Functions: Port 5501
```

### 6. Add Validation Test

Create test to ensure all ports match:

```typescript
// tests/integration/firebase-ports.spec.ts
import { test, expect } from '@playwright/test';
import { FIREBASE_EMULATOR_PORTS } from '@df/types';
import firebaseConfig from '../../apps/df-firebase-teaching-app/firebase.json';

test('firebase.json ports match FIREBASE_EMULATOR_PORTS constants', () => {
  expect(firebaseConfig.emulators.auth.port).toBe(FIREBASE_EMULATOR_PORTS.auth);
  expect(firebaseConfig.emulators.firestore.port).toBe(FIREBASE_EMULATOR_PORTS.firestore);
  expect(firebaseConfig.emulators.storage.port).toBe(FIREBASE_EMULATOR_PORTS.storage);
  // ... etc
});
```

## Implementation Steps

1. Create `packages/types/src/firebase-ports.ts` with constants
2. Export from `packages/types/src/index.ts`
3. Rebuild types package: `pnpm --filter @df/types run build`
4. Update 3 store files in `packages/state/src/stores`
5. Rebuild state package: `pnpm --filter @df/state run build`
6. Update 5 seed scripts in `apps/*/scripts/seed-data/seed.ts`
7. Update documentation references
8. Add validation test (optional but recommended)
9. Run full test suite to verify no regressions

## Verification Checklist

- [ ] `pnpm build` succeeds for all packages
- [ ] All 5 teaching app emulators start successfully
- [ ] Seed scripts connect to emulators on correct ports
- [ ] Auth/Storage/Functions stores connect without port errors
- [ ] Documentation reflects single source of truth pattern
- [ ] Validation test passes (if implemented)
- [ ] No hardcoded port numbers remain in code (except `firebase.json`)

## Benefits

✅ **Single source of truth** - Change port once, applies everywhere
✅ **Type safety** - TypeScript validates port references
✅ **Self-documenting** - Code imports make port scheme explicit
✅ **Prevents regression** - Can't accidentally revert to default ports
✅ **Easier onboarding** - New developers see centralized config
✅ **Future-proof** - Easy to add new emulator services

## Risks & Mitigations

**Risk:** Breaking change if external code relies on hardcoded ports
**Mitigation:** All Firebase code is in monorepo, no external consumers

**Risk:** `firebase.json` still requires manual sync
**Mitigation:** Option 4 (generate/validate script) eliminates this risk

**Risk:** Build order dependency (types must build before state)
**Mitigation:** Already enforced by Turbo dependency graph

## Follow-up Work

After this ticket, consider:
1. Extend pattern to other environment-specific configs (API URLs, feature flags)
2. Create shared `@df/config` package for all environment constants
3. Generate Firebase configs programmatically per app (for app-specific port ranges)

---

**Estimated Effort:** 2-3 hours (straightforward refactor, high confidence)
**Priority:** Medium (prevents future port mismatch bugs, improves maintainability)
**Blocked By:** None (current state is stable, this is improvement)
