# Copilot Instructions for DF Monorepo

> **CRITICAL:** All files under `guides/` directories (root and workspace-specific) are **authoritative reference documentation**. You are **required** to consult relevant guides before starting any ticket and ensure all work complies with their directives. See [Reference Files](#reference-files---mandatory-reading) section below.

## Architecture Overview

This is a **pnpm + Turbo monorepo** with a **signals-first, presentation-only component architecture**. Apps consume shared packages (`@df/types`, `@df/state`, `@df/ui-lit`, `@df/firebase`) and deploy as **multi-page applications (MPA)** via 11ty static site generator.

### Workspace Structure
- `apps/*` – Runnable frontends and teaching harnesses (Vite dev servers)
- `packages/*` – Shared libraries (types, state, UI components, Firebase utilities)
- `services/*` – Backend projects and API facades
- Build dependency order: `types → state/firebase → ui-lit → apps`

## Critical Development Patterns

### Signals-First State Management

**ALL reactive state uses signals from `@lit-labs/signals`**. Components are presentation-only and consume state via signals.

```typescript
// ✅ CORRECT: State in packages/state/src/stores/
import {signal, computed} from '@lit-labs/signals';

const topicSignal = signal<string>('default');
export const featureState = computed(() => ({topic: topicSignal.get()}));
export function setTopic(value: string) { topicSignal.set(value); }

// ✅ CORRECT: Component consumes signals (packages/ui-lit/src/)
import {SignalWatcher} from '@lit-labs/signals';
import {featureState} from '@df/state';

@customElement('my-component')
export class MyComponent extends SignalWatcher(LitElement) {
  render() {
    return html`<div>${featureState.value.topic}</div>`;
  }
}

// ❌ WRONG: Never put state or side effects in components
async connectedCallback() {
  const data = await fetch('/api'); // ❌ No fetching in components!
}
```

**Reference implementations:** `apps/df-npm-info-app`, `packages/ui-lit/src/df-npm-info-widget.ts`

### Property Declaration Pattern

**Always use `declare` with `@property` decorators** to avoid property shadowing:

```typescript
// ✅ CORRECT
@property({type: String}) declare variant: 'compact' | 'full';
constructor() {
  super();
  this.variant = 'full';
}

// ❌ WRONG - causes property shadowing
@property({type: String}) variant: 'compact' | 'full' = 'full';
```

### Material Design 3 Enforcement

**STRICTLY REQUIRED:** All interactive UI elements MUST use `@material/web` components.

```typescript
// ✅ CORRECT
import '@material/web/button/filled-button.js';
html`<md-filled-button>Submit</md-filled-button>`;

// ❌ FORBIDDEN
html`<button>Submit</button>`; // Never use native HTML form elements
```

### Event Naming Convention

```typescript
// Pattern: df-[component-name]-[action-type]
this.dispatchEvent(new CustomEvent('df-upload-link-change', {
  detail: {url: this.linkUrl},
  bubbles: true,
  composed: true,
}));
```

## Package Organization & Imports

### Where Code Belongs

- **Types/Interfaces** → `packages/types/src/` → Import via `@df/types`
- **Signals & Stores** → `packages/state/src/stores/` → Import via `@df/state`
- **Reusable UI Components** → `packages/ui-lit/src/` → Import via `@df/ui-lit/[component-name]`
- **Firebase Utilities** → `packages/firebase/src/` → Import via `@df/firebase`
- **App-Specific Code** → `apps/[app-name]/src/`

**Decision tree:** If multiple apps will use it → put in `packages/`. If teaching/demo-specific → put in `apps/`.

### Export Checklist for New Components

1. Add type to `packages/types/src/index.ts`
2. Add store/state to `packages/state/src/index.ts`
3. Add component to `packages/ui-lit/src/index.ts`
4. Add export mapping to `packages/ui-lit/package.json` exports field
5. Rebuild packages in order: `pnpm --filter @df/types run build && pnpm --filter @df/state run build && pnpm --filter @df/ui-lit run build`

## Essential Commands

```bash
# Initial setup
pnpm install

# Development (all apps in parallel)
pnpm dev

# Scope to single workspace
pnpm --filter <workspace-name> dev
pnpm --filter @df/df-npm-info-app dev

# Build (respects Turbo dependency graph)
pnpm build

# Rebuild specific packages in order
pnpm --filter @df/types run build
pnpm --filter @df/state run build
pnpm --filter @df/ui-lit run build

# Watch mode for component development
pnpm --filter @df/ui-lit run build --watch

# Testing
pnpm test                          # All workspaces (via Turbo)
pnpm test:integration             # Playwright only
pnpm --filter <workspace> test    # Specific workspace

# Storybook
pnpm --filter @df/df-storybook run dev
```

## Testing Architecture

- **Playwright** for integration tests (`tests/integration/*.spec.ts`)
- **Web Test Runner** only in `df-lit-starter` (legacy component tests)
- Each app has `build`, `start:test` (Vite preview server), and `test` scripts
- Playwright config in root registers each app with unique port (4173-4176)
- Run `pnpm exec playwright install --with-deps` once per machine

### Test Script Pattern for New Apps

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "start:test": "pnpm build && vite preview --port 4177 --strictPort --host 127.0.0.1",
    "test": "playwright test --config ../../playwright.config.ts --project=my-app"
  }
}
```

Then add project entry to `playwright.config.ts`.

## Firebase Patterns

- **Config types** → `packages/types/src/firebase.types.ts`
- **Shared utilities** → `packages/firebase/src/` (app init, emulator wiring)
- **State/stores** → `packages/state/src/stores/` (auth state, Firestore collections)
- **UI components** → `packages/ui-lit/src/firebase/` (reusable Firebase widgets)
- **App config** → `apps/[app]/src/config/firebase.config.ts` (reads env vars)

### AsyncComputed Pattern

```typescript
// In store (packages/state/src/stores/)
import {AsyncComputed} from 'signal-utils/async-computed';
export function createDataLoader() {
  return new AsyncComputed(async () => {
    const response = await fetch('/api/data');
    return response.json();
  });
}

// In component
const loader = createDataLoader();
await loader.complete;
const data = loader.value; // ✅ CORRECT

// ❌ WRONG
const data = await loader.value; // Returns undefined!
```

### Emulator Wiring

- Use emulators for **Firestore, Storage, Functions** (configured in `firebase.json`)
- **Avoid Auth emulator** (known issues in this environment)
- Auto-detect with `location.hostname === 'localhost'` or `import.meta.env.DEV`

## Code Quality Standards

### Mandatory Cleanup

- **Remove all debug logs** (`console.log`, `console.debug`, `console.warn`) before task completion
- **Keep `console.error`** for production error tracking
- **No commented-out code** except briefly during active development

### CSS Architecture

```css
/* ✅ CORRECT: Fallbacks in usage, not definition */
.button { background: var(--my-color, #blue); }

/* ❌ WRONG: Circular reference risk */
:host { --my-color: var(--my-color, #blue); }
```

### Component Size Limits

- Keep components under **200 lines**
- If approaching **300 lines**, split responsibilities
- Extract reusable logic to stores or utilities

## Deployment Model

- **Vite** for local dev servers and Playwright integration
- **Rollup** bundles emitted to `dist/` for 11ty consumption
- **11ty** hosts production apps (external sites consume bundles)
- **MPA pattern**: Each feature = separate HTML page, natural browser navigation
- Exception: `df-lit-starter` preserves upstream 11ty demo for teaching

## Documentation Requirements

- **Update docs immediately** after creating/changing scripts
- Verify commands in `package.json` before documenting
- Update workspace README + root `guides/TESTING_INTEGRATION.md`
- Reference key files in PR descriptions

## Common Pitfalls

1. **Property shadowing** – Always use `declare` with `@property`
2. **Side effects in components** – Fetch/mutations belong in stores
3. **Duplicate types** – Import from `@df/types`, never redefine
4. **Missing package exports** – Update `package.json` exports field
5. **Wrong build order** – Rebuild dependencies: types → state → ui-lit
6. **Native form elements** – Use Material Web Components exclusively
7. **AsyncComputed misuse** – `await loader.complete` then access `.value`

## Reference Files - MANDATORY READING

**All files under `guides/` directories are authoritative specifications.** You MUST consult relevant guides before starting any ticket and ensure all work complies with their directives.

### Root-Level Guides (`/guides/`)
- **`WC_SHARED_DEFAULTS.md`** – Signals architecture, component patterns (READ FIRST for any component work)
- **`STANDARDS_STYLES.md`** – Coding standards, TypeScript patterns, Material Design 3 enforcement
- **`TESTING_INTEGRATION.md`** – Playwright setup, test script patterns, port assignments
- **`TESTING_ARCHITECTURE_PATTERNS.md`** – Testing strategy, WTR vs Playwright decisions
- **`TICKET_SESSION_CHECKLIST.md`** – Pre/post-work verification steps
- **`AUDIT_STANDARDIZATION_PLAYBOOK.md`** – Alignment checks for existing code
- **`FUNCTIONS_PLACEMENT.md`** – Where to place utility functions and shared logic
- **`WC_NEW_V_EXISTING.md`** – When to create new components vs modify existing
- **`GLOSSARY.md`** – Terminology and concept definitions

### Firebase Guides (`/apps/df-firebase-teaching-app0/guides/`)
- **`FIREBASE_PATTERNS.md`** – Package organization, decision trees, common mistakes
- **`AUTHENTICATION_PATTERNS.md`** – Auth state, SignalWatcher usage, boundary enforcement
- **`FIREBASE_COOKBOOK.md`** – Practical recipes for common Firebase operations
- **`COMPOSITE_PATTERNS.md`** – Complex Firebase integration patterns
- **`PERFORMANCE_PATTERNS.md`** – Optimization strategies for Firebase operations
- **`TROUBLESHOOTING.md`** – Debugging Firebase issues
- **`MIGRATION_GUIDE.md`** – Moving legacy Firebase code to current patterns

### Package-Specific Guides
- **`packages/firebase/guides/README.md`** – Firebase package utilities and exports
- **`services/guides/README.md`** – Backend service patterns

### Code Examples (Living Specifications)
- **`packages/ui-lit/src/df-npm-info-widget.ts`** – AsyncComputed, SignalWatcher, property patterns
- **`packages/ui-lit/src/df-practice-widget.ts`** – Computed signals, event dispatching
- **`apps/df-npm-info-app/`** – Complete signals-first app architecture
- **`apps/df-teaching-app/`** – Host shell orchestration, auto-refresh patterns

### Workflow Before Starting Any Ticket
1. **Read `guides/TICKET_SESSION_CHECKLIST.md`** for pre-work steps
2. **Identify relevant guides** based on ticket scope (component/Firebase/testing/etc.)
3. **Study reference implementations** matching your task
4. **Follow patterns exactly** – deviations require explicit documentation
5. **Verify compliance** using audit playbook before completing work
