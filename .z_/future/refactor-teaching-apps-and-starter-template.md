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

## Implementation Plan

### Phase 0: Example Apps Audit (Do First)
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

### Phase 1: Build Infrastructure

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
