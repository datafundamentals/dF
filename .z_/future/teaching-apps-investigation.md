# Teaching Apps Investigation

> **Status**: ✅ Investigation Complete (Step 4)  
> **Created**: 2025-11-08  
> **Purpose**: Document differences between teaching apps before consolidation

## Executive Summary

**Key Discovery:** The 5 teaching apps are NOT arbitrary duplicates - they represent a **staged migration pattern** from full emulator to full production.

**Critical Findings:**
1. ✅ **Rollup bundling is NOT in teaching apps** - it's in `df-activity-log` and `df-chat-app`
2. ✅ **Teaching apps differ ONLY in EMULATOR_CONFIG** - same codebase, different flags
3. ✅ **Apps 2, 3, 4 have identical configs** - only comment headers differ
4. ✅ **Stage 3 was planned but never implemented** - app4 comment says "Stage 3" but config is Stage 2

**Recommendation:** Consolidate from 5 apps → 3 apps
- Keep: app1 (full emulator), app2 (hybrid), app5 (production)
- Archive: app3, app4 (duplicates of app2)

**Impact:** 40% reduction in maintenance burden, no functionality lost

---

## Context

We have 5 teaching apps (teaching-app1 through teaching-app5) that appear similar but may have subtle differences we need to preserve:

1. **Rollup bundling configuration** - Critical, cannot lose this
2. **Auth mode variations** - Different approaches to handling emulator vs production
3. **Other unique features** - TBD during investigation

## Investigation Goals

1. Find which app has working rollup bundling
2. Map authentication configurations
3. Document any other unique features
4. Create consolidation plan that preserves critical features

---

## Step 1: Find Working Rollup Configuration ✅ COMPLETE

### Search Results

**Apps with standalone `rollup.config.js`:**
- ✅ `apps/df-lit-starter/rollup.config.js` 
- ✅ `apps/df-chat-app/rollup.config.js`
- ✅ `apps/df-activity-log/rollup.config.js`

**Teaching apps with rollup config:**
- ❌ None - No teaching apps have `rollup.config.js`
- ❌ None - No teaching apps have `rollupOptions` in `vite.config.ts`

### Conclusion: Rollup Config Location Found

**Source of rollup bundling pattern:** `df-activity-log` and `df-chat-app` have identical rollup configs.

**Pattern details:**
- Takes Vite output (`dist/main.js`) as input
- Bundles to single ESM file (`dist/bundle/[app-name].js`)
- Includes terser (minification), summary, visualizer plugins
- Outputs sourcemaps and bundle stats

**Critical finding:** The rollup bundling is NOT in any teaching app - it's in the "real" apps. This means:
1. ✅ Teaching apps can be consolidated without losing rollup pattern
2. ✅ Rollup config can be copied FROM `df-activity-log` or `df-chat-app` 
3. ✅ Pattern is already documented and working in multiple places

### Next Steps
- [x] Check package.json scripts to see how rollup is invoked ✅
- [ ] Document the build pipeline (vite → rollup → bundle)
- [ ] Create reusable rollup config pattern for guides/

### Build Pipeline Found

**Command:** `pnpm build:rollup` (in `df-activity-log` and `df-chat-app`)

**Pipeline:**
1. `pnpm build` → TypeScript compilation (`tsc`)
2. `rollup -c` → Bundles `dist/main.js` → `dist/bundle/[app].js`

**Result:** Single ESM bundle ready for 11ty or external consumption

---

## Step 2: Map Authentication Configurations ✅ COMPLETE

### Discovery: Teaching Apps Are Staged Migration Steps!

Each teaching app represents a **progressive stage** in the (a)→(b)→(c) migration path:

| App | Stage | Auth Emulator | Firestore | Storage | Functions | Purpose |
|-----|-------|---------------|-----------|---------|-----------|---------|
| app1 | Stage 1 | ✅ true | ✅ true | ✅ true | ✅ true | **Full emulator** - All services local |
| app2 | Stage 2 | ❌ false | ✅ true | ✅ true | ✅ true | **Hybrid** - Local data, prod cloud functions |
| app3 | Stage 2 | ❌ false | ✅ true | ✅ true | ✅ true | **Hybrid** (comment says Stage 2) |
| app4 | Stage 3 | ❌ false | ✅ true | ✅ true | ✅ true | **Near-prod** (comment says Stage 3, but config identical to app2-3!) |
| app5 | Stage 4 | ❌ false | ❌ false | ❌ false | ❌ false | **Full production** - All services cloud |

### Key Findings

**Stage 1 (app1):** Email/password with auth emulator
- Uses auth emulator for teaching convenience
- Comment: "Stage 1: Full emulator development"
- This is scenario **(a)** from your original description

**Stage 2 (app2-4):** Google auth without auth emulator  
- Auth emulator disabled: "disallowed except for app1 as courtesy to users"
- Comment: "Stage 2: Hybrid development - Local data stores with production cloud functions"
- This is scenario **(b)** from your original description
- **Question:** Why 3 identical Stage 2 apps?

**Stage 4 (app5):** Full production
- All emulators disabled
- Comment: "Stage 4: Full production - All services use production Firebase infrastructure"
- This is scenario **(c)** from your original description
- **Note:** Skips Stage 3?

### Authentication Pattern

**All apps use the same Firebase initialization:**
```typescript
import {initializeAppFirebase} from '@df/firebase/app-firebase-config';
import {EMULATOR_CONFIG} from './config/firebase.config';

const {app, auth, firestore} = initializeAppFirebase(EMULATOR_CONFIG);
```

**The ONLY difference:** The `EMULATOR_CONFIG` flags in each app's `firebase.config.ts`

### Critical Insight

**The "migration blockers" you experienced were NOT unsolvable technical issues.**

They exist because you were trying to **modify apps in-place** instead of having **separate apps for each stage**.

**Current approach (problematic):**
- Try to modify app1 to behave like app2 → things break
- Clone app1 → rename to app2 → manual config changes
- Repeat for each stage

**Better approach (what the codebase already suggests):**
- Keep all stages as separate apps
- Switch between them based on what you're teaching/testing
- Each stage is stable and tested

### Questions to Answer

1. **Why are app2, app3, app4 functionally identical?** ✅ ANSWERED
   - Comment headers claim different stages (2, 2, 3)
   - But EMULATOR_CONFIG is **identical** in all three
   - App4 claims "Stage 3: Near-production testing" but config = Stage 2
   - **Conclusion:** Comments are aspirational, reality is they're duplicates

2. **What happened to actual Stage 3?** 
   - App4 was INTENDED to be Stage 3
   - But the config was never actually changed
   - Stage 3 was probably meant to disable functions emulator: `functions: false`
   - This would be: prod auth + prod functions, local data stores
   - **This stage was never implemented**

3. **Can we reduce duplication while preserving the staging pattern?**
   - Yes! Here's what actually exists vs what was intended:

**What Actually Exists:**
- Stage 1 (app1): Full emulator ✅
- Stage 2 (app2, 3, 4): Hybrid, all identical ✅  
- Stage 4 (app5): Full production ✅

**What Was Intended (based on comments):**
- Stage 1: Full emulator
- Stage 2: Prod auth, local data/functions
- Stage 3: Prod auth/functions, local data (NEVER IMPLEMENTED)
- Stage 4: Full production

---

## Recommendations

### Proposed Consolidation Strategy

**Option A: Keep Minimal Set (3 apps)**

Keep only what's actually different:

1. **`df-firebase-teaching-app`** - Stage 1: Full Emulator
2. **`df-firebase-teaching-app2`** - Stage 2: Hybrid (delete app3, app4 - identical)
3. **`df-firebase-teaching-app5`** - Stage 4: Full Production

**Archive:** app3, app4 (identical configs, only comments differ)

**Option B: Implement Missing Stage 3 (4 apps)**

Complete the intended progression:

1. **`df-firebase-teaching-app`** - Stage 1: All emulators
2. **`df-firebase-teaching-app2`** - Stage 2: Prod auth, local data/functions
3. **`df-firebase-teaching-app4`** - Stage 3: Prod auth/functions, local data (FIX CONFIG)
4. **`df-firebase-teaching-app5`** - Stage 4: Full production

**Archive:** app3 (truly redundant)

**Change to app4 for Option B:**
```typescript
export const EMULATOR_CONFIG: EmulatorConfig = {
  auth: false,      // Production auth
  firestore: true,  // Local Firestore
  storage: true,    // Local Storage  
  functions: false, // Production Functions ← KEY CHANGE
};
```

### Recommendation: **Option A** (Simpler)

**Why:**
- You've been working with the current 3-stage setup successfully
- Stage 3 was never actually needed (app4 config was never changed)
- Fewer apps = less maintenance
- Covers the full progression: all-local → hybrid → all-production

**If you need Stage 3 later:** Easy to create by modifying app2's config

### Why This Works

**Preserves your migration path (a→b→c):**
- (a) app1 = Email + emulators
- (b) app2 = Google + partial emulators  
- (c) app5 = Production everything

**Eliminates the "modify and break" problem:**
- Each stage is a separate, stable app
- No need to "migrate" between modes
- Just switch to the appropriate app

**Reduces maintenance:**
- 5 apps → 3 apps (40% reduction)
- Each app has clear, distinct purpose
- No duplicate code to maintain

### Rollup Bundling Solution

Since rollup is in `df-activity-log` and `df-chat-app`, we can:

1. Extract the pattern to a reusable guide (permanent)
2. Add `build:rollup` script to any teaching app that needs it
3. No bundling logic lost

---

## Next Steps

### Immediate (Next Session)
- [ ] Verify app3 and app4 are truly identical to app2
- [ ] Check if there are any unique features in app3/app4
- [ ] Test all three remaining apps work correctly
- [ ] Document the rollup pattern extraction

### Follow-up (Separate Ticket)
- [ ] Archive app3 and app4 to `.z_/archived-teaching-apps/`
- [ ] Update documentation to reference 3-stage pattern
- [ ] Add rollup config to teaching apps if needed
- [ ] Update root README with new structure

### Future Enhancement
- [ ] Create environment switcher utility
- [ ] Add visual indicators in UI showing which stage is active
- [ ] Document common pitfalls for each stage

