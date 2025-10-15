# TypeScript Strictness Improvements

**Created:** October 15, 2025  
**Source:** Ticket 12 Standards Compliance Audit  
**Priority:** Low (Technical Debt)  
**Effort:** Medium (2-3 days)

---

## Overview

This ticket documents TypeScript strictness improvements that require **code refactoring** to implement. Per Ticket 12 acceptance criteria, these improvements were identified during the standards compliance audit but are **deferred to future work** to avoid scope creep.

The monorepo's base TypeScript configuration (`ts.config.base.json`) already has strong strictness settings enabled:
- ✅ `strict: true`
- ✅ `noImplicitAny: true`
- ✅ `noImplicitThis: true`
- ✅ `strictNullChecks: true`
- ✅ `strictFunctionTypes: true`
- ✅ `strictBindCallApply: true`
- ✅ `strictPropertyInitialization: true`

However, some workspace configs override these settings or have additional gaps that require code fixes to address.

---

## Issue 1: Property Declaration Pattern Violations

### Problem

**6 properties in Firebase components** violate the `declare` keyword pattern established in `guides/WC_SHARED_DEFAULTS.md`. This creates property shadowing risks where the decorator creates a property, and the assignment creates another.

### Files Affected

1. **`packages/ui-lit/src/firebase/df-firestore-delete.ts`** (2 violations)
   ```typescript
   // ❌ CURRENT (wrong)
   @property({type: String}) todoId = '';
   @property({type: String}) todoTitle = '';
   ```

2. **`packages/ui-lit/src/firebase/df-firestore-form.ts`** (2 violations)
   ```typescript
   // ❌ CURRENT (wrong)
   @property({type: String}) mode: FirestoreFormMode = 'create';
   @property({attribute: false}) todo: TodoDocument | null = null;
   ```

3. **`packages/ui-lit/src/firebase/df-firestore-item.ts`** (2 violations)
   ```typescript
   // ❌ CURRENT (wrong)
   @property({attribute: false}) todo: TodoDocument | null = null;
   @property({type: Boolean}) actions = true;
   ```

### Required Fixes

**Pattern to Apply:**
```typescript
// ✅ CORRECT
@property({type: String}) declare todoId: string;

constructor() {
  super();
  this.todoId = '';
}
```

**Steps:**
1. Add `declare` keyword to all 6 properties
2. Move default value initialization to `constructor()`
3. Ensure type annotations are explicit
4. Verify no property shadowing occurs
5. Test all affected components in Storybook

**Acceptance Criteria:**
- [ ] All 6 properties use `declare` keyword
- [ ] Default values initialized in constructor
- [ ] No TypeScript errors
- [ ] Storybook stories still work
- [ ] Integration tests pass

**Effort:** 1-2 hours

---

## Issue 2: ES2021 → ES2022 Target Upgrades

### Problem

**3 apps use ES2021 target** instead of ES2022 (monorepo base standard). Per user clarification: "Upgrade to ES2022 unless it breaks the build."

### Files Affected

1. **`apps/df-lit-starter/tsconfig.json`**
   ```json
   // ❌ CURRENT
   {
     "extends": "../../ts.config.base.json",
     "compilerOptions": {
       "target": "ES2021"  // Should be ES2022
     }
   }
   ```

2. **`apps/df-npm-info-app/tsconfig.json`**
   ```json
   // ❌ CURRENT
   {
     "extends": "../../ts.config.base.json",
     "compilerOptions": {
       "target": "ES2021"  // Should be ES2022
     }
   }
   ```

3. **`apps/df-teaching-app/tsconfig.json`**
   ```json
   // ❌ CURRENT
   {
     "extends": "../../ts.config.base.json",
     "compilerOptions": {
       "target": "es2021"  // Should be ES2022 (note: lowercase)
     }
   }
   ```

### Required Fixes

**Change All 3 to:**
```json
{
  "extends": "../../ts.config.base.json",
  "compilerOptions": {
    "target": "ES2022"  // ← Upgrade from ES2021
  }
}
```

**Steps:**
1. Update `target` to `ES2022` in all 3 files
2. Run `pnpm build` to verify no breaking changes
3. If build fails, investigate root cause (unlikely with ES2022)
4. Run tests to ensure runtime behavior unchanged
5. Commit changes

**Acceptance Criteria:**
- [ ] All 3 configs use `target: "ES2022"`
- [ ] `pnpm build` succeeds
- [ ] All tests pass
- [ ] No runtime errors in dev/production

**Effort:** 30 minutes (likely no code changes needed)

**ES2022 Features Enabled:**
- Class fields (public and private)
- Top-level `await`
- Ergonomic brand checks (`#field in obj`)
- `.at()` method for arrays/strings
- `Object.hasOwn()`
- Error cause (`new Error('msg', {cause})`)

---

## Issue 3: `skipLibCheck` Overrides

### Problem

Several workspace configs override `skipLibCheck: true` to avoid type-checking node_modules. While this is **acceptable for performance**, it means type errors in dependencies may be silently ignored.

### Files Using `skipLibCheck: true`

1. `apps/df-npm-info-app/tsconfig.json`
2. `apps/df-teaching-app/tsconfig.json`
3. (Possibly others - audit needed)

### Analysis

**Trade-offs:**
- ✅ **Pro:** Faster builds (skips checking hundreds of `.d.ts` files in node_modules)
- ❌ **Con:** May miss type errors in dependencies (rare but possible)
- ✅ **Pro:** Standard practice in many projects (Vite, Next.js, etc.)
- ❌ **Con:** Deviates from base config philosophy (check everything)

**Recommendation:** **KEEP** `skipLibCheck: true` where already used. This is a pragmatic performance optimization and is industry-standard practice.

**No Action Required:** Document the rationale in this ticket for future reference.

---

## Issue 4: Test Coverage Impact on Strictness

### Problem

Low test coverage (22.52% overall in `packages/state`) means **strictness improvements may introduce bugs** that aren't caught by tests.

### Strictness Flags That Require High Coverage

1. **`noImplicitReturns`** - Currently `false` in base config
   - If enabled, requires explicit return statements in all code paths
   - Without tests, hard to verify all paths covered

2. **`noUnusedLocals`** - Currently not set (defaults to `false`)
   - Flags unused variables
   - Safe to enable but requires code cleanup

3. **`noUnusedParameters`** - Currently not set (defaults to `false`)
   - Flags unused function parameters
   - Safe to enable but may require `_` prefix for intentionally unused params

### Required Fixes

**Option A: Raise Test Coverage First (Recommended)**
1. Add tests for `todos.store.ts` (Firestore CRUD)
2. Add tests for `firestore-base.store.ts` (base store pattern)
3. Add tests for other untested stores
4. **Then** enable additional strictness flags

**Option B: Enable Flags Incrementally**
1. Enable `noUnusedLocals` (safest)
2. Fix all violations
3. Enable `noUnusedParameters`
4. Fix all violations
5. Consider `noImplicitReturns` (requires most work)

**Acceptance Criteria (Option A):**
- [ ] Test coverage > 60% in `packages/state`
- [ ] Enable `noUnusedLocals: true` in base config
- [ ] Enable `noUnusedParameters: true` in base config
- [ ] Consider `noImplicitReturns: true` (optional)
- [ ] All workspaces build successfully
- [ ] All tests pass

**Effort:** 2-3 days (mostly writing tests)

---

## Issue 5: Functions Config Variance (Documented, No Fix Needed)

### Analysis

**File:** `apps/df-firebase-teaching-app/functions/tsconfig.json`

**Current Config:**
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["es2020"],
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  }
}
```

**Why It Doesn't Extend Base:**
- Firebase Cloud Functions require **CommonJS** module system
- Base config uses `"moduleResolution": "bundler"` (Vite-optimized)
- Functions use `"moduleResolution": "node"` (Node.js runtime)
- Target is ES2020 (Cloud Functions Node.js 18 runtime)

**Verdict:** ✅ **JUSTIFIED VARIANCE** - No action required

**Documentation:** This variance is acceptable and documented in the compliance audit. Cloud Functions have different runtime requirements than frontend apps.

---

## Issue 6: Circular Reference Risk in CSS Variables

### Problem

While auditing `guides/STANDARDS_STYLES.md`, a CSS anti-pattern was documented:

```css
/* ❌ WRONG: Circular reference risk */
:host { --my-color: var(--my-color, #blue); }

/* ✅ CORRECT: Fallbacks in usage, not definition */
.button { background: var(--my-color, #blue); }
```

### Audit Results

✅ **No violations found** in current codebase. All MD3 design token usage follows the correct pattern:

```css
/* ✅ Verified in df-segmented-button, df-upload-link, df-markdown-codemirror */
background-color: var(--md-sys-color-primary, #6200ea);
color: var(--md-sys-color-on-primary, #ffffff);
```

**No Action Required:** Pattern is already correct.

---

## Implementation Strategy

### Phase 1: Low-Hanging Fruit (1-2 hours)

1. **Fix Property Declaration Violations**
   - Add `declare` keyword to 6 properties
   - Move initialization to constructors
   - Test in Storybook

2. **Upgrade ES2021 → ES2022**
   - Change `target` in 3 tsconfig.json files
   - Verify build passes
   - Run tests

### Phase 2: Test Coverage Expansion (2-3 days)

1. **Add Store Tests**
   - `todos.store.ts` - Firestore CRUD operations
   - `firestore-base.store.ts` - Base store pattern
   - `functions-demo.store.ts` - Cloud Functions calls

2. **Verify Coverage Thresholds**
   - Stores > 60%
   - Components > 50%
   - Functions > 70%

### Phase 3: Additional Strictness Flags (1 day)

1. **Enable in Base Config**
   - `noUnusedLocals: true`
   - `noUnusedParameters: true`
   - (Optional) `noImplicitReturns: true`

2. **Fix All Violations**
   - Remove unused variables
   - Prefix unused params with `_`
   - Add explicit returns

3. **Verify Builds**
   - `pnpm build` succeeds
   - All tests pass
   - No new TypeScript errors

---

## Priority Justification

**Why Low Priority:**
- Current strictness settings are already strong (`strict: true`)
- No critical bugs identified from current gaps
- Teaching app focus is on patterns, not production hardening
- Test coverage expansion provides more value than strictness flags

**Why Worth Doing:**
- Demonstrates best practices for future apps
- Prevents property shadowing bugs
- Aligns all configs to ES2022 standard
- Improves code quality and maintainability

**When to Schedule:**
- After critical teaching app tickets complete (Tickets 13+)
- During a "quality week" or refactoring sprint
- When adding new features that benefit from stricter checks

---

## References

- **Source Audit:** `.z_/WIP/COMPLIANCE_CHECKLIST.md`
- **Standards Docs:** `guides/WC_SHARED_DEFAULTS.md`, `guides/STANDARDS_STYLES.md`
- **Base Config:** `ts.config.base.json`
- **Ticket 12:** Standards Compliance Audit

---

## Acceptance Criteria (Full Ticket)

- [ ] All 6 property declaration violations fixed (add `declare`)
- [ ] All 3 apps upgraded to ES2022 target
- [ ] Test coverage > 60% in `packages/state`
- [ ] `noUnusedLocals: true` enabled in base config
- [ ] `noUnusedParameters: true` enabled in base config
- [ ] All workspaces build successfully
- [ ] All tests pass
- [ ] No new TypeScript errors introduced
- [ ] Storybook stories still work
- [ ] Documentation updated (if patterns change)

**Total Effort:** 2-3 days (mostly test writing)

---

**End of Technical Debt Ticket**
