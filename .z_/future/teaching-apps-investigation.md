# Teaching Apps Investigation

> **Status**: In Progress  
> **Created**: 2025-11-08  
> **Purpose**: Document differences between teaching apps before consolidation

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

## Step 2: Map Authentication Configurations

**Status:** Not started - paused for tonight

**Next session tasks:**
- [ ] Check each teaching app's auth configuration
- [ ] Document email/password + emulator setup
- [ ] Document Google auth without emulator setup
- [ ] Document production setup
- [ ] Identify what breaks during migration between modes

