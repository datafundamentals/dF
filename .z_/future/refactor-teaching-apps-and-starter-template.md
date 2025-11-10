# Refactor Teaching Apps & Create Starter Template

> **Status**: Design Phase  
> **Created**: 2025-11-09  
> **Branch**: `1108teachingAppRefactoring`  
> **Related**: `.z_/future/teaching-apps-investigation.md`

## Problem Statement

We have **4 competing workflows** that currently conflict:

1. **Production Workflow**: Need bare-bones starter app → hybrid emulator dev → production deployment
2. **Emulator Mode Switching**: Need reliable toggle between full → hybrid → production (and back)
3. **Functions Anti-Pattern**: Teaching apps have `app/functions/` directories (wrong pattern - functions should be shared)
4. **Dual-Bundler Requirement**: Every production app needs Vite (dev) + Rollup (11ty deployment)

**Current State Issues:**
- ❌ No starter template for cloning
- ❌ Mode switching requires cloning entire apps (brittle, agent failures)
- ❌ Teaching apps demonstrate anti-pattern (app-specific functions)
- ❌ Teaching apps lack rollup bundling
- ❌ 5 teaching apps with duplicate configs (only comments differ)

## Investigation Findings

See `.z_/future/teaching-apps-investigation.md` for partial analysis, some analysis came after that doc was created, and some remains ongoing.

**Key Discoveries:**
1. ✅ Rollup bundling is in `df-activity-log` and `df-chat-app` (not teaching apps - safe)
2. ✅ Teaching apps differ ONLY in `EMULATOR_CONFIG` flags
3. ✅ Apps 2, 3, 4 have identical configs (only comment headers differ)
4. ✅ Teaching apps represent staged migration pattern (full → hybrid → production)

## Approved Solution Design

### Core Insight
**If mode switching is bulletproof, we need only ONE teaching app** that demonstrates mode switching itself.

### Key Decisions

#### 1. Service Naming
- ✅ `services/fb-functions/` (shorter, better for IDE)
- ❌ NOT `services/firebase-functions-shared/` (too verbose)

#### 2. Teaching Apps Consolidation
- ✅ **ONE teaching app** with interactive mode switching tutorial
- ❌ NOT 5 separate apps representing different stages
- **Reasoning**: Bulletproof mode switching makes multiple apps redundant

#### 3. Material Design 3 Compliance Note
**Important Clarification**: "No native HTML form elements" is a **guideline, not absolute rule**.

MD3 is a **design specification** with **partial implementation** via `@material/web` widgets.

**Compliance means:**
- ✅ Use `@material/web` components when available
- ✅ Implement MD3 spec yourself when widgets missing (e.g., `df-segmented-button.ts`)
- ✅ Follow MD3 design patterns and visual language
- ❌ Don't use native elements when MD3 equivalent exists

**Audit criteria should be:**
- "Does it follow MD3 design patterns?" (not "Does it use native elements?")
- Check implementation against MD3 spec, not just widget usage

## Pre-Work: Cleanup Checklist

Before starting implementation, ensure monorepo is in clean state:

### 1. Fix Broken Tests
- [ ] Run `pnpm test:integration` to identify failures
- [ ] Fix or skip broken tests with documentation
- [ ] Document skip reason in `.z_/future/test-failures.md` if needed

```bash
# If test must be skipped temporarily:
test.skip('test name', () => {
  // TODO: Re-enable after [specific blocker] is resolved
  // See: .z_/future/test-failures.md
});
```

### 2. Verify Build System
- [ ] All packages build successfully
- [ ] No TypeScript errors
- [ ] All apps start without errors

```bash
pnpm install
pnpm build

# Test one teaching app starts
pnpm --filter df-firebase-teaching-app1 dev
```

### 3. Clean Git State
- [ ] Commit any WIP changes
- [ ] Verify on feature branch
- [ ] Tag current state as rollback point

```bash
git status
git add -A
git commit -m "chore: checkpoint before teaching apps refactor"
git tag pre-refactor-checkpoint
```

### 4. Validate Investigation Findings
- [ ] Re-verify rollup locations unchanged
- [ ] Re-check EMULATOR_CONFIG in teaching apps
- [ ] Document any changes since investigation

```bash
# Re-verify rollup locations
find apps -name "rollup.config.js"

# Re-check EMULATOR_CONFIG
for app in apps/df-firebase-teaching-app*; do
  echo "=== $app ==="
  grep -A 10 "EMULATOR_CONFIG" $app/src/config/firebase.config.ts 2>/dev/null
done
```

---

## Implementation Plan (Discrete Steps)

### Step 0: Audit Existing Emulator Patterns
**Estimated time:** 30 minutes  
**Goal:** Ensure new mode switching complements existing patterns

**Critical Question:** Does our proposed `EmulatorMode` type conflict with existing `EmulatorConfig`?

**Tasks:**
- [ ] Document all current `EMULATOR_CONFIG` usage
- [ ] Check if any apps already use `VITE_EMULATOR_MODE`
- [ ] Verify type compatibility (see analysis below)
- [ ] Document any conflicts/overlaps

**Type Compatibility Analysis:**

**Existing pattern** (`packages/firebase/src/app-firebase-config.ts`):
```typescript
export interface EmulatorConfig {
  auth: boolean;
  firestore: boolean;
  storage: boolean;
  functions: boolean;
}

// Apps use like this:
const EMULATOR_CONFIG: EmulatorConfig = {
  auth: true,
  firestore: true,
  storage: true,
  functions: true,
};

export const {app, auth} = initializeAppFirebase(EMULATOR_CONFIG);
```

**Proposed pattern** (NEW: `packages/firebase/src/emulator-mode.ts`):
```typescript
export interface EmulatorModeConfig extends EmulatorConfig {
  label: string;        // NEW - for UI display
  description: string;  // NEW - for documentation
}

export type EmulatorMode = 'full' | 'hybrid' | 'production';

export const EMULATOR_MODES: Record<EmulatorMode, EmulatorModeConfig> = {
  full: { auth: true, firestore: true, storage: true, functions: true, ... },
  hybrid: { auth: false, firestore: true, storage: true, functions: true, ... },
  production: { auth: false, firestore: false, storage: false, functions: false, ... },
};

export function getCurrentModeConfig(): EmulatorModeConfig {
  const mode = import.meta.env.VITE_EMULATOR_MODE as EmulatorMode || 'hybrid';
  return EMULATOR_MODES[mode];
}
```

**Compatibility:** ✅ **FULLY COMPATIBLE**
- `EmulatorModeConfig` extends `EmulatorConfig` (structural superset)
- `initializeAppFirebase()` accepts both types (TypeScript structural typing)
- Existing apps continue to work without changes
- New apps can opt into environment-based switching
- No breaking changes

**Migration path:**
```typescript
// OLD (still works)
const config: EmulatorConfig = { auth: false, ... };

// NEW (preferred)
import {getCurrentModeConfig} from '@df/firebase/emulator-mode';
const config = getCurrentModeConfig();

// Both compatible with initializeAppFirebase(config)
```

**Deliverable:** `.z_/future/emulator-patterns-audit.md` with findings

**Exit criteria:**
- ✅ Compatibility verified (no conflicts), OR
- ⚠️ Conflicts documented with resolution plan

**Commit message:** `docs: audit existing emulator patterns for compatibility`

---

### Phase 0: Example Apps Audit (Parallel with Step 0)
**Goal**: Verify reference implementations don't teach anti-patterns

**Apps to audit:**
- `df-lit-starter` - Legacy 11ty reference (primarily used for basic folder structure - this is modified version of the Lit team's starter)
- `df-npm-info-app` - AsyncComputed author's reference implementation of the Signals and state store patterns, including AsyncComputed
- `df-teaching-app` - Host shell for auto-refresh (meta-app)

**Audit checklist:**
- [ ] Signals-first architecture (`@lit-labs/signals`)
- [ ] MD3 design compliance (not just widget usage)
- [ ] Proper property declarations (`@property() declare`)
- [ ] No side effects in components (fetch/mutations in stores)
- [ ] Package organization (types in `@df/types`, state in `@df/state`)

**Actions based on findings:**
- If passes → Mark as "✅ Reference Implementation"
- If minor issues → Create fix tickets
- If major issues → Add warning, mark as "Legacy Example" and not to use as a pattern.

---

### Step 1: Create Mode Switching Logic (Infrastructure)
**Estimated time:** 1 hour  
**Goal:** Single source of truth for emulator modes

**Files to create:**
```
packages/firebase/src/
└── emulator-mode.ts  ← NEW
```

**Implementation:**
```typescript
// packages/firebase/src/emulator-mode.ts
import type {EmulatorConfig} from './app-firebase-config';

export interface EmulatorModeConfig extends EmulatorConfig {
  label: string;
  description: string;
}

export type EmulatorMode = 'full' | 'hybrid' | 'production';

export const EMULATOR_MODES: Record<EmulatorMode, EmulatorModeConfig> = {
  full: {
    auth: true,
    firestore: true,
    storage: true,
    functions: true,
    label: 'Full Emulator',
    description: 'All services local - ideal for teaching/demos',
  },
  hybrid: {
    auth: false,
    firestore: true,
    storage: true,
    functions: true,
    label: 'Hybrid Development',
    description: 'Production auth, local data - default for development',
  },
  production: {
    auth: false,
    firestore: false,
    storage: false,
    functions: false,
    label: 'Production',
    description: 'All services in cloud - for final testing',
  },
};

export function getEmulatorMode(): EmulatorMode {
  const mode = import.meta.env.VITE_EMULATOR_MODE as EmulatorMode;
  if (!EMULATOR_MODES[mode]) {
    console.warn(`Invalid VITE_EMULATOR_MODE: ${mode}, defaulting to hybrid`);
    return 'hybrid';
  }
  return mode;
}

export function getCurrentModeConfig(): EmulatorModeConfig {
  return EMULATOR_MODES[getEmulatorMode()];
}
```

**Test:**
```typescript
import {getEmulatorMode, getCurrentModeConfig} from '@df/firebase/emulator-mode';

console.log(getEmulatorMode()); // Should log: 'hybrid'
console.log(getCurrentModeConfig().label); // Should log: 'Hybrid Development'
```

**Exit criteria:**
- [ ] Package builds successfully
- [ ] Exports work correctly
- [ ] Default mode is 'hybrid'
- [ ] Invalid mode falls back to 'hybrid' with warning

**Deliverable:** `packages/firebase/src/emulator-mode.ts`

**Commit message:** `feat(firebase): add emulator mode switching logic`

---

### Step 2: Create Visual Mode Indicator (UI Component)
**Estimated time:** 1 hour  
**Goal:** Visual feedback for current mode

**Files to create:**
```
packages/ui-lit/src/
└── df-emulator-mode-banner.ts  ← NEW
```

**Implementation features:**
- Color-coded backgrounds (green/yellow/red)
- Shows mode label and description
- Responsive layout
- Uses MD3 design tokens

**Test:**
```typescript
// In Storybook or test app
import '@df/ui-lit/df-emulator-mode-banner';

// Should render with yellow background (hybrid mode default)
html`<df-emulator-mode-banner></df-emulator-mode-banner>`;
```

**Visual indicators:**
- 🟢 Green - Full emulator (safe, local)
- 🟡 Yellow - Hybrid (recommended, mostly local)
- 🔴 Red - Production (caution, cloud costs)

**Exit criteria:**
- [ ] Component renders in all three modes
- [ ] Colors change based on mode
- [ ] Label and description display correctly
- [ ] Responsive on mobile/desktop

**Deliverable:** `packages/ui-lit/src/df-emulator-mode-banner.ts`

**Commit message:** `feat(ui-lit): add emulator mode banner component`

---

### Step 3: Update One Teaching App (Proof of Concept)
**Estimated time:** 1-2 hours  
**Goal:** Prove mode switching works in real app

**App to update:** `df-firebase-teaching-app1` (keep others as control)

**Changes:**
1. Update firebase.config.ts to use `getCurrentModeConfig()`
2. Add `.env.example` with `VITE_EMULATOR_MODE=hybrid`
3. Add mode banner to main component
4. Update README with mode switching instructions

**Test procedure:**
```bash
# Test full mode
echo "VITE_EMULATOR_MODE=full" > apps/df-firebase-teaching-app1/.env.local
pnpm --filter df-firebase-teaching-app1 dev
# Verify: green banner, all emulators

# Test hybrid mode
echo "VITE_EMULATOR_MODE=hybrid" > apps/df-firebase-teaching-app1/.env.local
pnpm --filter df-firebase-teaching-app1 dev
# Verify: yellow banner, no auth emulator

# Test production mode
echo "VITE_EMULATOR_MODE=production" > apps/df-firebase-teaching-app1/.env.local
pnpm --filter df-firebase-teaching-app1 dev
# Verify: red banner, no emulators
```

**Exit criteria:**
- [ ] App starts successfully in all three modes
- [ ] Visual indicators work correctly
- [ ] Can switch modes without errors
- [ ] Auth behavior changes as expected (email/password vs Google)
- [ ] No emulator connection errors in console
- [ ] Mode switching is bidirectional (can go back)

**Deliverable:** Updated `df-firebase-teaching-app1` with mode switching

**Commit message:** `feat(teaching-app1): add mode switching capability`

---

### Step 4: Create Shared Functions Service (Infrastructure)
**Estimated time:** 2 hours  
**Goal:** Establish correct functions pattern

**Files to create:**
```
services/fb-functions/
├── src/
│   ├── index.ts
│   ├── auth/
│   ├── roles/
│   └── types/  ← Auto-copied
├── scripts/
│   └── copy-types.mjs  ← Auto-sync from packages/types
├── firebase.json
├── .firebaserc
└── package.json
```

**Type copying script:**
```javascript
// scripts/copy-types.mjs
import fs from 'fs/promises';
import path from 'path';

const SOURCE = '../../../packages/types/src';
const DEST = './src/types';

async function copyTypes() {
  await fs.mkdir(DEST, { recursive: true });
  
  const files = [
    'firebase-todos.types.ts',
    'user.types.ts',
    'role.types.ts',
  ];
  
  for (const file of files) {
    const source = path.join(SOURCE, file);
    const dest = path.join(DEST, file);
    await fs.copyFile(source, dest);
    console.log(`✅ Copied ${file}`);
  }
}

copyTypes().catch(console.error);
```

**Package.json scripts:**
```json
{
  "scripts": {
    "prebuild": "node scripts/copy-types.mjs",
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions"
  }
}
```

**Test:**
```bash
cd services/fb-functions
pnpm install
pnpm build  # Should auto-copy types, then compile
firebase emulators:start --only functions
```

**Exit criteria:**
- [ ] Types auto-copy before build
- [ ] Functions compile successfully
- [ ] Emulator starts without errors
- [ ] Can call test function from client

**Deliverable:** `services/fb-functions/` directory

**Commit message:** `feat(services): create shared fb-functions service`

---

### Step 5: Create Starter Template (Core Deliverable)
**Estimated time:** 2-3 hours  
**Goal:** Cloneable template with all patterns

**Files to create:**
```
apps/df-starter-template/
├── src/
│   ├── main.ts
│   ├── config/
│   │   └── firebase.config.ts  ← Uses getCurrentModeConfig()
│   └── components/  ← Empty placeholder
├── public/
│   └── index.html
├── vite.config.ts
├── rollup.config.js  ← Copy from df-activity-log
├── package.json
├── .env.example
├── .gitignore
└── README.md  ← Comprehensive cloning instructions
```

**Key file: firebase.config.ts**
```typescript
import {initializeAppFirebase} from '@df/firebase/app-firebase-config';
import {getCurrentModeConfig} from '@df/firebase/emulator-mode';

const config = getCurrentModeConfig();
export const {app, auth, firestore, storage, functions} = 
  initializeAppFirebase(config);

// Log mode on startup
console.log(`🔧 Firebase Mode: ${config.label} - ${config.description}`);
```

**Key file: rollup.config.js** (copy from df-activity-log, update output)
```javascript
import terser from '@rollup/plugin-terser';
import summary from 'rollup-plugin-summary';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';

export default {
  input: 'dist/main.js',
  output: {
    file: 'dist/bundle/starter-template.js',  // ← MUST UPDATE when cloning
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    terser({
      ecma: 2021,
      module: true,
      warnings: true,
    }),
    summary({
      showBrotliSize: true,
      showGzippedSize: true,
    }),
  ],
};
```

**Validation checklist:**
- [ ] All three modes work
- [ ] Vite build succeeds
- [ ] Rollup build succeeds
- [ ] Bundle emitted to dist/bundle/
- [ ] Can be cloned following own README
- [ ] Validation script passes (see below)

**Test cloning process:**
```bash
# Follow own README to clone
cp -r apps/df-starter-template apps/df-test-clone
cd apps/df-test-clone
# Update package.json name
# Update rollup output filename
pnpm install
pnpm dev
pnpm validate:clone apps/df-test-clone  # Run validation script
```

**Exit criteria:**
- [ ] Template works in all modes
- [ ] Cloning process succeeds
- [ ] Validation script passes
- [ ] No TypeScript errors
- [ ] README instructions are accurate

**Deliverable:** Complete `apps/df-starter-template/`

**Commit message:** `feat(apps): create df-starter-template`

---

### Step 6: Create Template Validation Script
**Estimated time:** 1 hour  
**Goal:** Catch forgotten manual edits after cloning

**Files to create:**
```
scripts/
└── validate-template-clone.mjs  ← NEW
```

**Script checks:**
1. ✅ package.json name updated
2. ✅ rollup.config.js output filename updated
3. ✅ firebase.config.ts cleaned of TEMPLATE markers
4. ✅ README.md updated with app name
5. ✅ .env.example exists
6. ✅ .env.local NOT committed
7. ✅ vite.config.ts fileName matches app name
8. ✅ pnpm-workspace.yaml includes app

**Implementation:** See full script in appendix below

**Usage:**
```bash
# After cloning and making manual edits
pnpm validate:clone apps/df-my-new-app
```

**Add to root package.json:**
```json
{
  "scripts": {
    "validate:clone": "node scripts/validate-template-clone.mjs"
  }
}
```

**Add to template README.md:**
```markdown
## After Cloning Checklist

1. Update `package.json` name
2. Update `rollup.config.js` output filename
3. Remove any TEMPLATE markers from code
4. Update README.md with your app name
5. Run validation:
   ```bash
   pnpm validate:clone apps/[your-app-name]
   ```
```

**Exit criteria:**
- [ ] Script detects all 8 common mistakes
- [ ] Colorized output (errors/warnings/success)
- [ ] Exit codes work correctly
- [ ] Documented in template README

**Deliverable:** `scripts/validate-template-clone.mjs`

**Commit message:** `feat(scripts): add template cloning validation`

---

### Step 7: Add Rollup to Teaching App (Feature Parity)
**Estimated time:** 30 minutes  
**Goal:** Teaching app matches production pattern

**Changes to df-firebase-teaching-app1:**
1. Copy rollup.config.js from df-activity-log
2. Update output filename
3. Add `build:rollup` script to package.json
4. Test bundle generation
5. Document in README

**Test:**
```bash
pnpm --filter df-firebase-teaching-app1 build:rollup
ls apps/df-firebase-teaching-app1/dist/bundle/  # Should see bundle
```

**Exit criteria:**
- [ ] Rollup build succeeds
- [ ] Bundle emitted correctly
- [ ] README documents rollup usage
- [ ] No breaking changes to existing build

**Deliverable:** Updated teaching-app1 with rollup bundling

**Commit message:** `feat(teaching-app1): add rollup bundling`

---

### Step 8: Add Mode Switching Tutorial (Teaching Content)
**Estimated time:** 2 hours  
**Goal:** Interactive component teaching mode switching

**Files to create:**
```
apps/df-firebase-teaching-app1/src/demos/
└── 04-mode-switching-demo.ts  ← NEW
```

**Component features:**
- Current mode display with icon
- Mode comparison table
- Step-by-step switching instructions
- Use case guide for each mode
- Common mistakes section
- Best practices

**Test:**
- Navigate to demo in browser
- Verify all content renders
- Follow instructions to switch modes
- Verify tutorial accuracy

**Exit criteria:**
- [ ] Component renders correctly
- [ ] All instructions are accurate
- [ ] Examples work as described
- [ ] Integrated into main app navigation

**Deliverable:** Interactive mode switching tutorial

**Commit message:** `feat(teaching-app1): add interactive mode switching tutorial`

---

### Step 9: Consolidate Teaching Apps (Major Change)
**Estimated time:** 1 hour  
**Goal:** ONE teaching app with all features

**Actions:**
1. Rename `df-firebase-teaching-app1` → `df-firebase-teaching-app` (singular)
2. Move `teaching-app2-5` to `.z_/archived-teaching-apps/`
3. Update all documentation references
4. Update workspace configuration
5. Update import paths if needed

**Commands:**
```bash
# Rename main teaching app
mv apps/df-firebase-teaching-app1 apps/df-firebase-teaching-app

# Archive others
mkdir -p .z_/archived-teaching-apps
mv apps/df-firebase-teaching-app{2,3,4,5} .z_/archived-teaching-apps/

# Update package.json name
# Update all imports/references
```

**Test:**
```bash
# Verify renamed app works
pnpm --filter df-firebase-teaching-app dev

# Verify archived apps not in workspace
pnpm --filter df-firebase-teaching-app2 dev  # Should fail/not found
```

**Exit criteria:**
- [ ] Single teaching app works in all modes
- [ ] Old apps archived and documented
- [ ] All references updated
- [ ] No broken imports

**Deliverable:** Single `df-firebase-teaching-app`

**Commit message:** `refactor: consolidate teaching apps into single app`

---

### Step 10: Playwright Tests (Validation)
**Estimated time:** 2 hours  
**Goal:** Automated mode switching validation

**Files to create:**
```
tests/integration/
├── emulator-mode-switching.spec.ts  ← NEW
└── starter-template-validation.spec.ts  ← NEW
```

**Test coverage:**
1. Mode switching in all directions
2. Visual indicators correct in each mode
3. Firebase connections based on mode
4. Template cloning process
5. Functions import from shared service

**Example test:**
```typescript
// tests/integration/emulator-mode-switching.spec.ts
import {test, expect} from '@playwright/test';

test.describe('Emulator Mode Switching', () => {
  test('full mode uses all emulators', async ({page}) => {
    await page.goto('http://localhost:5173');
    
    // Check banner color
    const banner = page.locator('df-emulator-mode-banner');
    await expect(banner).toHaveClass(/full/);
    
    // Verify console logs for emulator connections
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    await page.waitForTimeout(1000);
    expect(logs.some(log => log.includes('Auth emulator'))).toBeTruthy();
  });
  
  test('can switch between modes', async ({page}) => {
    // Test: full → hybrid → production → hybrid → full
    // Verify no errors, visual indicators change
  });
});
```

**Exit criteria:**
- [ ] All tests pass
- [ ] Coverage for all modes
- [ ] Bidirectional switching tested
- [ ] CI/CD ready

**Deliverable:** Comprehensive test suite

**Commit message:** `test: add emulator mode switching validation`

---

### Step 11: Documentation Updates (Completion)
**Estimated time:** 2 hours  
**Goal:** Complete reference documentation

**Guides to create/update:**

**NEW guides:**
- `guides/ROLLUP_BUNDLING_PATTERN.md` - Extract from df-activity-log
- `guides/EMULATOR_MODE_SWITCHING.md` - How to switch modes
- `guides/CLONING_STARTER_TEMPLATE.md` - Step-by-step cloning

**UPDATE guides:**
- `guides/FUNCTIONS_PLACEMENT.md` - Update to reference `fb-functions`
- `.github/copilot-instructions.md` - Update with mode switching pattern
- Root `README.md` - Add cloning workflow section

**Validation:**
- [ ] All links work
- [ ] Commands tested and accurate
- [ ] Examples work as described
- [ ] Cross-references correct
- [ ] No broken internal links

**Exit criteria:**
- [ ] All guides created/updated
- [ ] Documentation tested
- [ ] No TODO markers left
- [ ] Reviewed for accuracy

**Deliverable:** Complete documentation set

**Commit message:** `docs: complete refactoring documentation`

---

## Step Dependencies & Parallelization

```
Step 0 (audit) → Must complete first
  ↓
Step 1 (mode logic) ─────┐
  ↓                       │
Step 2 (banner) ─────┐   │
  ↓                   ↓   ↓
Step 3 (POC app) ────┴───┴─→ Step 4 (fb-functions) [can parallel]
  ↓                              ↓
Step 5 (template) ←──────────────┘
  ↓
Step 6 (validation script)
  ↓
Step 7 (rollup) ──┐
  ↓               │
Step 8 (tutorial) ┘
  ↓
Step 9 (consolidate)
  ↓
Step 10 (tests)
  ↓
Step 11 (docs)
```

**Parallel work opportunities:**
- Steps 1-2 and Step 4 can be worked simultaneously (different packages)
- Steps 7 and 8 can be worked simultaneously (independent features)

**Critical path:**
0 → 1 → 2 → 3 → 5 → 6 → 9 → 10 → 11

**Total estimated time:** 15-20 hours spread across multiple sessions

---

## Emulator Pattern Compatibility Analysis

### Current Pattern (packages/firebase/src/app-firebase-config.ts)
```typescript
export interface EmulatorConfig {
  auth: boolean;
  firestore: boolean;
  storage: boolean;
  functions: boolean;
}
```

### New Pattern (packages/firebase/src/emulator-mode.ts)
```typescript
export interface EmulatorModeConfig extends EmulatorConfig {
  label: string;
  description: string;
}

export type EmulatorMode = 'full' | 'hybrid' | 'production';
```

### Compatibility Guarantee

**✅ FULLY BACKWARDS COMPATIBLE**

**Why:**
1. **Structural supertype** - `EmulatorModeConfig extends EmulatorConfig`
   - Any code expecting `EmulatorConfig` can accept `EmulatorModeConfig`
   - TypeScript structural typing allows this naturally

2. **No breaking changes to existing code**
   - `initializeAppFirebase()` still accepts `EmulatorConfig`
   - Existing apps can continue using manual config objects
   - New apps can use `getCurrentModeConfig()` which returns compatible type

3. **Gradual adoption path**
   - Add new exports alongside existing code
   - No changes to `app-firebase-config.ts` required
   - Apps opt-in to mode switching when ready

### Migration Patterns

**Pattern 1: Existing manual config (keep working)**
```typescript
// This continues to work exactly as before
const EMULATOR_CONFIG: EmulatorConfig = {
  auth: false,
  firestore: true,
  storage: true,
  functions: true,
};

export const {app, auth, firestore} = initializeAppFirebase(EMULATOR_CONFIG);
```

**Pattern 2: New mode switching (opt-in)**
```typescript
// New apps can use mode switching
import {getCurrentModeConfig} from '@df/firebase/emulator-mode';

export const {app, auth, firestore} = initializeAppFirebase(getCurrentModeConfig());
```

**Pattern 3: Hybrid approach (gradual migration)**
```typescript
// Use mode if available, fallback to manual config
import {getCurrentModeConfig, getEmulatorMode} from '@df/firebase/emulator-mode';

let config: EmulatorConfig;
try {
  config = getCurrentModeConfig();
} catch {
  // Fallback for environments without VITE_EMULATOR_MODE
  config = {auth: false, firestore: true, storage: true, functions: true};
}

export const {app, auth, firestore} = initializeAppFirebase(config);
```

### Verification Tests

**Test 1: Type compatibility**
```typescript
// Should compile without errors
const modeConfig: EmulatorModeConfig = getCurrentModeConfig();
const baseConfig: EmulatorConfig = modeConfig; // ✅ Valid
initializeAppFirebase(modeConfig); // ✅ Valid
```

**Test 2: Runtime compatibility**
```typescript
// Both patterns should work at runtime
const app1 = initializeAppFirebase({auth: false, firestore: true, storage: true, functions: true});
const app2 = initializeAppFirebase(getCurrentModeConfig());
// Both initialize successfully
```

**Test 3: Gradual migration**
```typescript
// Can mix patterns in same codebase
// app1 uses manual config
// app2 uses mode switching
// No conflicts, no errors
```

### Implementation Safety

1. **New files, zero edits to existing files**
   - Create `emulator-mode.ts` (new)
   - Create `df-emulator-mode-banner.ts` (new)
   - No changes to `app-firebase-config.ts` (existing)

2. **Export additions only**
   - Add to `packages/firebase/src/index.ts`: `export * from './emulator-mode'`
   - No removals, no renames

3. **Optional adoption**
   - Existing apps: No changes required
   - New apps: Can opt-in to mode switching
   - Teaching app: Demonstrates the pattern

---

## Template Validation Script

### Purpose
Catch common mistakes after cloning `df-starter-template`:
- Forgotten package.json name update
- Forgotten rollup.config.js output filename update
- TEMPLATE markers left in code
- Missing environment files
- Incorrect workspace configuration

### Implementation

**File:** `scripts/validate-template-clone.mjs`

```javascript
#!/usr/bin/env node
/**
 * Validates that a cloned template has all manual edits completed correctly.
 * 
 * Usage: node scripts/validate-template-clone.mjs apps/my-new-app
 * 
 * Exit codes:
 *   0 - All checks passed
 *   1 - Validation errors found
 *   2 - Script error (path not found, etc.)
 */

import fs from 'fs/promises';
import path from 'path';

const CHECKS = {
  ERRORS: [],
  WARNINGS: [],
  SUCCESS: [],
};

async function validateClone(appPath) {
  console.log(`\n🔍 Validating cloned template: ${appPath}\n`);

  try {
    await fs.access(appPath);
  } catch {
    console.error(`❌ Path not found: ${appPath}`);
    process.exit(2);
  }

  const appName = path.basename(appPath);

  // Check 1: package.json name updated
  try {
    const pkgPath = path.join(appPath, 'package.json');
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8'));
    
    if (pkg.name === 'df-starter-template') {
      CHECKS.ERRORS.push('❌ package.json name still "df-starter-template"');
    } else if (pkg.name !== appName) {
      CHECKS.WARNINGS.push(`⚠️  package.json name "${pkg.name}" doesn't match folder "${appName}"`);
    } else {
      CHECKS.SUCCESS.push('✅ package.json name updated');
    }
  } catch (err) {
    CHECKS.ERRORS.push(`❌ Cannot read package.json: ${err.message}`);
  }

  // Check 2: rollup.config.js output filename updated
  try {
    const rollupPath = path.join(appPath, 'rollup.config.js');
    const rollup = await fs.readFile(rollupPath, 'utf8');
    
    if (rollup.includes('starter-template.js')) {
      CHECKS.ERRORS.push('❌ rollup.config.js still outputs "starter-template.js"');
    } else if (rollup.includes(`${appName}.js`)) {
      CHECKS.SUCCESS.push('✅ rollup.config.js output filename updated');
    } else {
      CHECKS.WARNINGS.push('⚠️  rollup.config.js output filename unclear');
    }
  } catch (err) {
    CHECKS.ERRORS.push(`❌ Cannot read rollup.config.js: ${err.message}`);
  }

  // Check 3: No TEMPLATE markers in code
  try {
    const srcPath = path.join(appPath, 'src');
    const files = await fs.readdir(srcPath, {recursive: true, withFileTypes: true});
    
    let foundMarkers = false;
    for (const file of files) {
      if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.js'))) {
        const content = await fs.readFile(path.join(file.path, file.name), 'utf8');
        if (content.includes('TEMPLATE') && content.includes('TODO')) {
          CHECKS.WARNINGS.push(`⚠️  Found TEMPLATE marker in ${file.name}`);
          foundMarkers = true;
        }
      }
    }
    
    if (!foundMarkers) {
      CHECKS.SUCCESS.push('✅ No TEMPLATE markers found');
    }
  } catch (err) {
    CHECKS.WARNINGS.push(`⚠️  Could not scan for TEMPLATE markers: ${err.message}`);
  }

  // Check 4: README.md updated
  try {
    const readmePath = path.join(appPath, 'README.md');
    const readme = await fs.readFile(readmePath, 'utf8');
    
    if (readme.includes('df-starter-template')) {
      CHECKS.WARNINGS.push('⚠️  README.md still mentions "df-starter-template"');
    } else {
      CHECKS.SUCCESS.push('✅ README.md updated');
    }
  } catch (err) {
    CHECKS.WARNINGS.push(`⚠️  Cannot read README.md: ${err.message}`);
  }

  // Check 5: .env.example exists
  try {
    await fs.access(path.join(appPath, '.env.example'));
    CHECKS.SUCCESS.push('✅ .env.example exists');
  } catch {
    CHECKS.ERRORS.push('❌ .env.example missing');
  }

  // Check 6: .env.local NOT committed
  try {
    await fs.access(path.join(appPath, '.env.local'));
    CHECKS.WARNINGS.push('⚠️  .env.local exists (should not be committed)');
  } catch {
    CHECKS.SUCCESS.push('✅ .env.local not present (correct)');
  }

  // Check 7: vite.config.ts fileName matches
  try {
    const vitePath = path.join(appPath, 'vite.config.ts');
    const vite = await fs.readFile(vitePath, 'utf8');
    
    const filenameMatch = vite.match(/fileName:\s*['"]([^'"]+)['"]/);
    if (filenameMatch && filenameMatch[1] === 'starter-template') {
      CHECKS.ERRORS.push('❌ vite.config.ts fileName still "starter-template"');
    } else if (filenameMatch && filenameMatch[1] === appName) {
      CHECKS.SUCCESS.push('✅ vite.config.ts fileName updated');
    } else {
      CHECKS.WARNINGS.push('⚠️  vite.config.ts fileName unclear');
    }
  } catch (err) {
    CHECKS.WARNINGS.push(`⚠️  Cannot check vite.config.ts: ${err.message}`);
  }

  // Check 8: Workspace configuration
  try {
    const workspacePath = path.resolve(appPath, '../../pnpm-workspace.yaml');
    const workspace = await fs.readFile(workspacePath, 'utf8');
    
    if (!workspace.includes('apps/*')) {
      CHECKS.ERRORS.push('❌ pnpm-workspace.yaml missing "apps/*" pattern');
    } else {
      CHECKS.SUCCESS.push('✅ Workspace configuration correct');
    }
  } catch (err) {
    CHECKS.WARNINGS.push(`⚠️  Cannot check workspace config: ${err.message}`);
  }

  // Print results
  console.log('\n📊 Validation Results:\n');
  
  if (CHECKS.SUCCESS.length > 0) {
    console.log('✅ PASSED:');
    CHECKS.SUCCESS.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }
  
  if (CHECKS.WARNINGS.length > 0) {
    console.log('⚠️  WARNINGS:');
    CHECKS.WARNINGS.forEach(msg => console.log(`   ${msg}`));
    console.log('');
  }
  
  if (CHECKS.ERRORS.length > 0) {
    console.log('❌ ERRORS:');
    CHECKS.ERRORS.forEach(msg => console.log(`   ${msg}`));
    console.log('');
    console.log('❌ Validation FAILED\n');
    process.exit(1);
  } else if (CHECKS.WARNINGS.length > 0) {
    console.log('⚠️  Validation passed with warnings\n');
    process.exit(0);
  } else {
    console.log('✅ All checks PASSED!\n');
    process.exit(0);
  }
}

// Main
const appPath = process.argv[2];
if (!appPath) {
  console.error('Usage: node scripts/validate-template-clone.mjs <app-path>');
  console.error('Example: node scripts/validate-template-clone.mjs apps/my-new-app');
  process.exit(2);
}

validateClone(appPath);
```

### Usage

**After cloning template:**
```bash
# Clone the template
cp -r apps/df-starter-template apps/df-my-new-app

# Make manual edits...
# (update package.json, rollup.config.js, etc.)

# Validate changes
pnpm validate:clone apps/df-my-new-app
```

**Expected output when correct:**
```
🔍 Validating cloned template: apps/df-my-new-app

📊 Validation Results:

✅ PASSED:
   ✅ package.json name updated
   ✅ rollup.config.js output filename updated
   ✅ No TEMPLATE markers found
   ✅ README.md updated
   ✅ .env.example exists
   ✅ .env.local not present (correct)
   ✅ vite.config.ts fileName updated
   ✅ Workspace configuration correct

✅ All checks PASSED!
```

**Expected output when errors found:**
```
🔍 Validating cloned template: apps/df-my-new-app

📊 Validation Results:

✅ PASSED:
   ✅ .env.example exists
   ✅ Workspace configuration correct

⚠️  WARNINGS:
   ⚠️  README.md still mentions "df-starter-template"

❌ ERRORS:
   ❌ package.json name still "df-starter-template"
   ❌ rollup.config.js still outputs "starter-template.js"

❌ Validation FAILED
```

### Integration

**Add to root package.json:**
```json
{
  "scripts": {
    "validate:clone": "node scripts/validate-template-clone.mjs"
  }
}
```

**Add to template README.md:**
````markdown
## Cloning This Template

### Quick Start
```bash
# 1. Copy template
cp -r apps/df-starter-template apps/my-new-app

# 2. Update package.json name
# 3. Update rollup.config.js output filename
# 4. Update vite.config.ts fileName
# 5. Remove TEMPLATE markers from code
# 6. Update this README

# 6. Validate changes
pnpm validate:clone apps/my-new-app
```

### Validation Checklist
Run `pnpm validate:clone apps/[your-app]` to verify:
- [ ] package.json name updated
- [ ] rollup.config.js output updated
- [ ] vite.config.ts fileName updated
- [ ] TEMPLATE markers removed
- [ ] README updated
- [ ] .env.example exists
- [ ] .env.local not committed
- [ ] Workspace configuration correct
````

---

## MD3 Compliance Clarification

### Current Understanding Issue

The rule "STRICTLY REQUIRED: All interactive UI elements MUST use `@material/web` components" has caused confusion. This needs clarification.

### Correct Understanding

**MD3 is a DESIGN SPECIFICATION, not just a widget library.**

#### Two Levels of Compliance:

**Level 1: Use MD3 Web Components When Available (Easy)**
```typescript
// ✅ CORRECT - Use existing MD3 widgets
import '@material/web/button/filled-button.js';
html`<md-filled-button>Submit</md-filled-button>`;

// ❌ WRONG - Don't use native HTML when MD3 exists
html`<button>Submit</button>`;
```

**Level 2: Implement MD3 Design Patterns When Widget Missing (Advanced)**
```typescript
// ✅ CORRECT - Custom component following MD3 spec
// Example: df-segmented-button.ts implements MD3 segmented button design
// because @material/web doesn't provide this component yet
import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('df-segmented-button')
export class DfSegmentedButton extends LitElement {
  static styles = css`
    /* MD3 design tokens and patterns */
    :host {
      --md-sys-color-surface: var(--md-sys-color-surface-variant);
      border-radius: var(--md-sys-shape-corner-full);
      /* ... follow MD3 segmented button spec */
    }
  `;
  // Implementation follows MD3 specification
}
```

### Updated Rule

**OLD (oversimplified):**
> All interactive UI elements MUST use `@material/web` components

**NEW (accurate):**
> All interactive UI elements MUST follow Material Design 3 specifications:
> 1. Use `@material/web` components when available
> 2. Implement custom components following MD3 design patterns when no widget exists
> 3. Never use unstyled native HTML form elements

### Examples in Codebase

**Using existing MD3 widgets:**
- Buttons → `<md-filled-button>`, `<md-text-button>`
- Text fields → `<md-filled-text-field>`
- Checkboxes → `<md-checkbox>`
- Lists → `<md-list>`, `<md-list-item>`

**Custom MD3 implementations:**
- `df-segmented-button.ts` - Implements MD3 segmented button spec
- `df-emulator-mode-banner.ts` - Uses MD3 design tokens (colors, typography, spacing)
- Future components following MD3 patterns

### Verification Checklist

When creating new UI components:
- [ ] Check if `@material/web` provides this component → Use it
- [ ] If not provided → Design using MD3 specification
- [ ] Use MD3 design tokens (colors, typography, spacing, elevation)
- [ ] Follow MD3 interaction patterns (states, animations)
- [ ] Never use raw `<button>`, `<input>`, `<select>`, etc. without MD3 styling

### Resources

- **MD3 Design Guidelines:** https://m3.material.io/
- **Web Components:** https://github.com/material-components/material-web
- **Design Tokens:** Use CSS custom properties with `--md-sys-` prefix
- **Reference Implementation:** `packages/ui-lit/src/df-segmented-button.ts`

---

## Phase 1: Build Infrastructure

#### 1.1 Create Shared Functions Service
```
services/
└── fb-functions/              ← NEW
    ├── src/
    │   ├── auth/             ← Authentication functions
    │   ├── roles/            ← Role management
    │   ├── index.ts          ← Export all
    │   └── types/            ← Bundled types (auto-copied)
    ├── scripts/
    │   └── copy-types.mjs    ← Auto-sync from packages/types
    ├── firebase.json
    ├── .firebaserc
    └── package.json
```

**Build pipeline:**
```json
{
  "scripts": {
    "prebuild": "node scripts/copy-types.mjs",
    "build": "tsc"
  }
}
```

#### 1.2 Create Mode Switching Logic
```
packages/firebase/src/
├── emulator-mode.ts          ← NEW: Mode definitions and getCurrentMode()
└── app-firebase-config.ts    ← UPDATE: Use emulator-mode.ts
```

**Mode definitions:**
```typescript
export type EmulatorMode = 'full' | 'hybrid' | 'production';

export const EMULATOR_MODES: Record<EmulatorMode, EmulatorModeConfig> = {
  full: {
    auth: true,
    firestore: true,
    storage: true,
    functions: true,
    label: 'Full Emulator',
    description: 'All services local - ideal for teaching/demos',
  },
  hybrid: {
    auth: false,
    firestore: true,
    storage: true,
    functions: true,
    label: 'Hybrid Development',
    description: 'Production auth, local data - default for development',
  },
  production: {
    auth: false,
    firestore: false,
    storage: false,
    functions: false,
    label: 'Production',
    description: 'All services in cloud - for final testing',
  },
};
```

#### 1.3 Create Visual Mode Indicator
```
packages/ui-lit/src/
└── df-emulator-mode-banner.ts  ← NEW: Shows current mode with color coding
```

**Visual indicators:**
- 🟢 Green - Full emulator (safe, local)
- 🟡 Yellow - Hybrid (recommended, mostly local)
- 🔴 Red - Production (caution, cloud costs)

### Phase 2: Build Starter Template

#### 2.1 Create Directory Structure
```
apps/df-starter-template/
├── src/
│   ├── main.ts                    # Minimal entry point
│   ├── config/
│   │   └── firebase.config.ts     # Mode-switchable config
│   └── components/                # Empty, ready for components
├── public/
│   └── index.html                 # Basic shell
├── vite.config.ts                 # Dev server + build
├── rollup.config.js               # 11ty bundle generation
├── package.json
│   ├── "build": "tsc && vite build"
│   ├── "build:rollup": "pnpm build && rollup -c"
│   ├── "dev": "vite"
│   └── "start:test": "vite preview"
├── .env.example                   # Documents VITE_EMULATOR_MODE
└── README.md                      # Cloning instructions
```

#### 2.2 Key Features

**Mode-switchable Firebase config:**
```typescript
import {initializeAppFirebase} from '@df/firebase/app-firebase-config';
import {getCurrentModeConfig} from '@df/firebase/emulator-mode';

const config = getCurrentModeConfig();
export const {app, auth, firestore, storage, functions} = 
  initializeAppFirebase(config);

console.log(`🔧 Firebase Mode: ${config.label} - ${config.description}`);
```

**Rollup config (copied from df-activity-log):**
```javascript
import terser from '@rollup/plugin-terser';
import summary from 'rollup-plugin-summary';

export default {
  input: 'dist/main.js',
  output: {
    file: 'dist/bundle/starter-template.js',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [terser(), summary()],
};
```

**Cloning workflow:**
```bash
# 1. Copy directory
cp -r apps/df-starter-template apps/df-my-new-app

# 2. Update package.json name
# 3. Update rollup output filename
# 4. Add to workspace (if needed)
# 5. pnpm install
# 6. pnpm dev (defaults to hybrid mode)
```

### Phase 3: Consolidate Teaching Apps → ONE App

#### 3.1 Keep ONE Teaching App
- ✅ Keep: `df-firebase-teaching-app` (singular, no number)
- 🗑️ Archive: `df-firebase-teaching-app1` through `df-firebase-teaching-app5`

#### 3.2 Add Interactive Mode Switching Demo

**New demo component:**
```
apps/df-firebase-teaching-app/src/demos/
└── 04-mode-switching-demo.ts  ← NEW: Interactive tutorial
```

**Component features:**
- Shows current mode with explanation
- Displays mode comparison table
- Step-by-step switching instructions
- Lists use cases for each mode

#### 3.3 Remove Anti-Pattern (App Functions)

**REMOVE:**
```
apps/df-firebase-teaching-app/functions/  ❌ DELETE
```

**REPLACE WITH:**
```typescript
// Import from shared functions
import {httpsCallable} from 'firebase/functions';
import {functions} from './config/firebase.config';

const myFunction = httpsCallable(functions, 'mySharedFunction');
```

**Document in README:**
```markdown
## Functions Pattern

Firebase functions are **shared by default** in this monorepo.

✅ CORRECT: Import from `services/fb-functions/`
❌ WRONG: Create `app/functions/` directory

See `services/fb-functions/README.md` for adding new functions.
```

#### 3.4 Add Rollup Bundling

Add to teaching app:
```json
{
  "scripts": {
    "build:rollup": "pnpm build && rollup -c"
  }
}
```

Copy `rollup.config.js` from `df-activity-log`.

#### 3.5 Update README with Mode Switching Tutorial

Complete step-by-step guide:
1. Understanding the three modes
2. How to switch between modes
3. What changes in each mode
4. When to use which mode
5. Best practices
6. Common mistakes
7. Applying to your own apps

### Phase 4: Validation

#### 4.1 Playwright Tests for Mode Switching
```typescript
// tests/integration/emulator-mode-switching.spec.ts
test('full mode uses all emulators', async ({page}) => {
  // Start with VITE_EMULATOR_MODE=full
  // Verify all emulator connections
});

test('hybrid mode skips auth emulator', async ({page}) => {
  // Start with VITE_EMULATOR_MODE=hybrid
  // Verify auth is production, others are emulated
});

test('production mode uses no emulators', async ({page}) => {
  // Start with VITE_EMULATOR_MODE=production
  // Verify no emulator connections
});
```

#### 4.2 Bidirectional Switching Test
```bash
# Verify can switch in any direction without breaking
full → hybrid → production → hybrid → full
```

### Phase 5: Documentation Updates

#### 5.1 New Guides (Permanent)
- `guides/ROLLUP_BUNDLING_PATTERN.md` - Extract from df-activity-log
- `guides/EMULATOR_MODE_SWITCHING.md` - How to switch modes
- `guides/CLONING_STARTER_TEMPLATE.md` - Step-by-step cloning

#### 5.2 Update Existing Guides
- `guides/FUNCTIONS_PLACEMENT.md` - Update to reference `fb-functions`
- `.github/copilot-instructions.md` - Update with mode switching pattern

#### 5.3 Update Root README
- Document cloning workflow
- Link to starter template
- Explain mode switching

## Success Criteria

### Functional Requirements
- [ ] Starter template can be cloned in < 5 minutes
- [ ] Mode switching works reliably in all directions
- [ ] All apps use shared functions (no app-specific functions directories)
- [ ] All production apps have both Vite and Rollup bundlers
- [ ] Mode switching tested with Playwright

### Documentation Requirements
- [ ] Starter template has clear cloning instructions
- [ ] Teaching app has interactive mode switching tutorial
- [ ] All guides updated
- [ ] Example apps audit complete

### Quality Requirements
- [ ] No anti-patterns taught in any example/teaching app
- [ ] MD3 compliance (design patterns, not just widget usage)
- [ ] Signals-first architecture in all new code
- [ ] No console.log statements (except mode indicators)

## Migration Path

### For Existing Apps
Apps that need to adopt mode switching:

1. **Update firebase config:**
   ```typescript
   import {getCurrentModeConfig} from '@df/firebase/emulator-mode';
   const config = getCurrentModeConfig();
   ```

2. **Add .env.example:**
   ```bash
   VITE_EMULATOR_MODE=hybrid
   ```

3. **Add mode banner:**
   ```typescript
   import '@df/ui-lit/df-emulator-mode-banner';
   ```

4. **Test in all three modes**

### For New Apps
1. Clone `df-starter-template`
2. Rename appropriately
3. Start building features
4. Mode switching comes for free

## Rollback Plan

If things go wrong:
1. Investigation findings preserved in `.z_/future/teaching-apps-investigation.md`
2. Original 5 teaching apps preserved in git history
3. Can revert branch: `git checkout main`
4. This document preserved for future attempts

## Open Questions

- [ ] Run example apps audit before or after building starter template?
- [ ] Keep any of the 5 teaching apps temporarily during transition?
- [ ] Any other workflows not considered?

## Next Actions

1. **Get stakeholder approval** on this plan
2. **Run example apps audit** (Phase 0)
3. **Fix any issues** in reference implementations
4. **Build infrastructure** (Phase 1)
5. **Build starter template** (Phase 2)
6. **Test mode switching** thoroughly
7. **Consolidate teaching apps** (Phase 3)
8. **Update documentation** (Phase 5)

## Related Documents

- `.z_/future/teaching-apps-investigation.md` - Investigation findings
- `guides/FUNCTIONS_PLACEMENT.md` - Functions architecture (already correct)
- `guides/WC_SHARED_DEFAULTS.md` - Signals architecture
- `guides/STANDARDS_STYLES.md` - Coding standards

---

**Last Updated**: 2025-11-09  
**Status**: Ready for stakeholder approval
