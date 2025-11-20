# Firebase Patterns in the Monorepo

## Overview

This guide defines where Firebase-related code belongs in the monorepo and provides clear decision trees to prevent duplication between shared packages and app-specific code.

**Key Principle:** Apps consume from packages. Packages provide reusable utilities, types, and components.

## Package Organization

### Shared Packages (Reusable Across All Firebase Apps)

#### `packages/types/src/firebase.types.ts` ✅ EXISTS

**What's already defined:**
- `FirebaseConfig` - Firebase project configuration interface
- `EmulatorConfig` - Comprehensive emulator connection settings
- `EmulatorHostConfig` - Individual emulator service configuration
- `FirebaseUser` - Type alias for Firebase Auth user

**When to add here:**
- Any new Firebase-related TypeScript interfaces
- Type definitions that multiple apps will use
- Enums for Firebase-specific constants

**Example usage in apps:**
```typescript
import type { FirebaseConfig, EmulatorConfig, FirebaseUser } from '@df/types/firebase.types';
```

#### `packages/firebase/` ⏳ TO BE CREATED (Ticket 3)

**What will live here:**
- Firebase app initialization utilities
- Emulator detection and connection helpers
- Common Firebase operations (error handling, retry logic)
- Shared Firebase SDK wrappers

**When to add here:**
- Utility functions used by multiple Firebase apps
- Firebase initialization logic
- Emulator setup helpers
- Common Firebase patterns (pagination, batching, etc.)

#### `packages/state/src/stores/` ✅ EXISTS

**Firebase-related stores:**
- Auth state management (`firebase-auth.store.ts`)
- User profile state
- Firebase connection state
- Any state derived from Firebase services

**When to add here:**
- Signal-based state tied to Firebase services
- Reactive state that multiple apps need
- Computed values based on Firebase data

**Example pattern:**
```typescript
// packages/state/src/stores/firebase-auth.store.ts
import { signal, computed } from '@lit-labs/signals';
import type { FirebaseUser } from '@df/types/firebase.types';

export const firebaseUser = signal<FirebaseUser | null>(null);
export const isAuthenticated = computed(() => firebaseUser.value !== null);
```

#### `packages/ui-lit/` ✅ EXISTS

**Firebase-related UI components:**
- Reusable auth components (sign-in forms, user profiles)
- Firebase-connected widgets (if reusable)
- Material Design 3 Firebase UI patterns

**When to add here:**
- UI components used by multiple Firebase apps
- Presentation-only components that read Firebase state signals
- Reusable Firebase interaction patterns

### App-Specific Code

#### What Belongs in `apps/df-firebase-teaching-app/`

**Environment Configuration (App-Specific):**
- `.env.example` - Template for all required variables
- `.env.emulator` - Emulator-specific configuration
- `.env.local` - Local developer overrides (gitignored)

**Config Readers (App-Specific, but imports shared types):**
```typescript
// ✅ CORRECT - apps/df-firebase-teaching-app/src/config/firebase.config.ts
import type { FirebaseConfig, EmulatorConfig } from '@df/types/firebase.types';

export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  // ... reads from environment
};
```

**Teaching-Specific Code:**
- `emulator-data/` - Seed data for this teaching app
- `src/components/` - Demo components specific to teaching examples
- Teaching-specific documentation in app README

## Decision Tree

```
Need to add Firebase code?
│
├─ Is it a TYPE or INTERFACE definition?
│  └─ YES → Add to packages/types/src/firebase.types.ts
│           Import in apps: import type { ... } from '@df/types/firebase.types'
│
├─ Is it a UTILITY FUNCTION? (initialization, helpers, wrappers)
│  └─ YES → Add to packages/firebase/
│           Will other Firebase apps use it? Always YES for utilities.
│           Import in apps: import { ... } from '@df/firebase'
│
├─ Is it STATE MANAGEMENT? (signals, stores, computed values)
│  └─ YES → Add to packages/state/src/stores/
│           Will state be shared across apps or components? Usually YES.
│           Import in apps: import { ... } from '@df/state'
│
├─ Is it a UI COMPONENT?
│  ├─ Will multiple apps reuse it?
│  │  └─ YES → Add to packages/ui-lit/
│  │           Import: import '@df/ui-lit/component-name'
│  └─ Is it teaching/demo-specific only?
│     └─ YES → Add to apps/df-firebase-teaching-app/src/components/
│
├─ Is it ENVIRONMENT CONFIGURATION?
│  └─ YES → App-specific files (.env.example, .env.emulator)
│           Config reader imports types from packages/types
│
└─ Is it SEED DATA or TEACHING EXAMPLES?
   └─ YES → packages/firebase-emulator/emulator-data/
            or apps/df-firebase-teaching-app/scripts/
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Duplicating Type Definitions

**WRONG:**
```typescript
// apps/df-firebase-teaching-app/src/config/firebase.config.ts
export interface FirebaseConfig {  // ❌ Already exists in packages/types
  apiKey: string;
  authDomain: string;
  projectId: string;
  // ...
}
```

**CORRECT:**
```typescript
// apps/df-firebase-teaching-app/src/config/firebase.config.ts
import type { FirebaseConfig } from '@df/types/firebase.types';  // ✅

export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ...
};
```

### ❌ Mistake 2: App-Specific Firebase Initialization

**WRONG:**
```typescript
// apps/df-firebase-teaching-app/src/utils/firebase-init.ts
import { initializeApp } from 'firebase/app';

export function initializeFirebase() {  // ❌ Should be in packages/firebase
  return initializeApp(config);
}
```

**CORRECT:**
```typescript
// packages/firebase/src/firebase-app.ts
import { initializeApp } from 'firebase/app';
import type { FirebaseConfig } from '@df/types/firebase.types';

export function initializeFirebase(config: FirebaseConfig) {  // ✅
  return initializeApp(config);
}

// apps/df-firebase-teaching-app/src/main.ts
import { initializeFirebase } from '@df/firebase';  // ✅ Import from package
import { firebaseConfig } from './config/firebase.config.js';

initializeFirebase(firebaseConfig);
```

### ❌ Mistake 3: Hardcoding Emulator Configuration

**WRONG:**
```typescript
// apps/df-firebase-teaching-app/src/config/firebase.config.ts
export const emulatorConfig = {  // ❌ Hardcoded, not typed
  auth: { host: '127.0.0.1', port: 9155 },
  firestore: { host: 'localhost', port: 8080 },
  // ...
};
```

**CORRECT:**
```typescript
// apps/df-firebase-teaching-app/src/config/firebase.config.ts
import type { EmulatorConfig } from '@df/types/firebase.types';  // ✅

export const emulatorConfig: EmulatorConfig = {  // ✅ Typed
  enabled: import.meta.env.VITE_USE_EMULATOR === 'true',
  auth: { host: '127.0.0.1', port: 9155 },
  firestore: { host: 'localhost', port: 8080 },
  storage: { host: 'localhost', port: 9199 },
  functions: { host: 'localhost', port: 5001, region: 'us-central1' },
};
```

### ❌ Mistake 4: Mixing Presentation and Side Effects

**WRONG:**
```typescript
// packages/ui-lit/src/firebase-data-widget.ts
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export class FirebaseDataWidget extends LitElement {
  async connectedCallback() {
    super.connectedCallback();
    const db = getFirestore();  // ❌ Component doing data fetching
    const snapshot = await getDocs(collection(db, 'items'));
    // ...
  }
}
```

**CORRECT:**
```typescript
// packages/state/src/stores/firebase-data.store.ts
import { signal } from '@lit-labs/signals';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

export const items = signal([]);

export async function loadItems() {  // ✅ Store handles side effects
  const db = getFirestore();
  const snapshot = await getDocs(collection(db, 'items'));
  items.value = snapshot.docs.map(doc => doc.data());
}

// packages/ui-lit/src/firebase-data-widget.ts
import { SignalWatcher } from '@lit-labs/signals';
import { items, loadItems } from '@df/state/stores/firebase-data.store';

export class FirebaseDataWidget extends SignalWatcher(LitElement) {
  connectedCallback() {
    super.connectedCallback();
    loadItems();  // ✅ Component triggers, store executes
  }

  render() {
    return html`${items.value.map(item => html`<div>${item.name}</div>`)}`;  // ✅ Presentation only
  }
}
```

## Checklist Before Writing Firebase Code

Before implementing any Firebase feature:

- [ ] **Check `packages/types/src/firebase.types.ts`** - Does the type already exist?
- [ ] **Check `packages/firebase/`** - Does the utility already exist? (Will exist after Ticket 3)
- [ ] **Check `packages/state/src/stores/`** - Does the state pattern already exist?
- [ ] **Review this guide's decision tree** - Where should my code live?
- [ ] **Ask: "Will other Firebase apps need this?"** 
  - YES → Put in `packages/`
  - NO → Put in app-specific code
- [ ] **Follow signals-first architecture** - Side effects in stores, not components

## Migration from Legacy Code

When migrating Firebase code from `.z_/WIP/approach/`:

1. **Extract types first** → Add to `packages/types/src/firebase.types.ts`
2. **Extract utilities** → Add to `packages/firebase/`
3. **Extract state patterns** → Add to `packages/state/src/stores/`
4. **Rebuild UI with signals** → Presentation-only components in `packages/ui-lit/`
5. **Wire it up in teaching app** → Demo the patterns in `apps/df-firebase-teaching-app/`

## Testing Firebase Code

**Shared Package Tests:**
- `packages/firebase/` - Unit tests for utilities
- `packages/state/src/stores/` - Tests for state management logic
- `packages/ui-lit/` - Component tests with mocked Firebase state

**App Integration Tests:**
- `apps/df-firebase-teaching-app/tests/integration/` - End-to-end flows with emulators
- Test against emulator data, not production

## Related Documentation

- [Shared Web Component Defaults](/guides/SHARED_WEB_COMPONENT_DEFAULTS.md)
- [Firebase Teaching App Roadmap](/.z_/WIP/FIREBASE_TEACHING_APP_ROADMAP.md)
- [Testing Architecture Patterns](/guides/TESTING_ARCHITECTURE_PATTERNS.md)
- [Monorepo Shared Resources](/guides/shared-resources.md)

## Questions?

If you're unsure where Firebase code belongs:

1. **Read this guide's decision tree** (above)
2. **Look at existing Firebase packages** for similar patterns
3. **Check the Firebase Teaching App** (`apps/df-firebase-teaching-app/`) for examples
4. **When in doubt:** Put it in `packages/` if it could ever be reused
