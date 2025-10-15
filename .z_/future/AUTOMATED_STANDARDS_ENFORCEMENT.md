# Automated Standards Enforcement System

**Created:** October 15, 2025  
**Source:** Ticket 12 Standards Compliance Audit + Roadmap Ticket 14 Proposal  
**Priority:** Medium  
**Effort:** 3-5 days  
**Category:** Quality Assurance / DevOps / Long-Term Infrastructure

---

## Overview

This ticket implements automated enforcement mechanisms to prevent standards violations from being merged into the codebase. It addresses the root cause identified during Ticket 12 audit: **standards violations occur because enforcement is manual, not automated**.

The Firebase teaching app currently has minor violations (property declarations) that passed code review because:
1. No linter catches these patterns
2. No pre-commit hooks block violations
3. No CI/CD checks prevent merging non-compliant code
4. Agents/developers rely on memory instead of automated validation

This ticket creates **machine-verified quality gates** to make standards violations impossible to merge.

---

## Problem Statement (from Ticket 14 Proposal in Roadmap)

**Root Cause:** During Ticket 6 implementation, Firebase UI components were built with native HTML elements instead of Material Design 3 web components, violating `STANDARDS_STYLES.md`. This wasn't a one-time mistake—it revealed systemic weaknesses:

1. **Documentation Fatigue:** Standards live in prose that agents read once then forget
2. **No Enforcement Mechanism:** Standards are aspirational - no automated validation
3. **Example-Driven Development Trap:** Agents learn from existing code patterns more than docs
4. **Conversation Context Collapse:** Standards compliance falls out of active memory during debugging
5. **No Review Gates:** Agents/developers can merge non-compliant code without blockers

**Impact:**
- ⚠️ 6 property declaration violations found in Ticket 12 audit (fixed manually)
- ⚠️ Risk of future violations in new components
- ⚠️ Teaching app patterns multiply across monorepo (violations scale)
- ⚠️ Manual code review unreliable for catching these issues

---

## Objectives

1. **Automate MD3 compliance checking** (no native HTML elements in components)
2. **Automate property declaration pattern enforcement** (require `declare` keyword)
3. **Create pre-commit hooks** to catch violations before they're committed
4. **Create CI/CD checks** to block merging non-compliant PRs
5. **Provide clear error messages** with links to compliant examples
6. **Make standards violations machine-detectable** (not memory-dependent)

---

## Scope

### Tier 1: Automated Enforcement (Highest Impact)

**Custom ESLint Rules**
- [ ] Rule: `enforce-md3-components` - Detect native HTML form elements in Lit templates
- [ ] Rule: `enforce-property-declare` - Require `declare` keyword with `@property` decorator
- [ ] Rule: `no-console-log` - Allow only `console.error` (block `console.log`, `console.debug`, `console.warn`)
- [ ] Rule: `require-event-naming` - Enforce `df-[component]-[action]` event naming pattern

**Pre-Commit Hooks (Husky)**
- [ ] Run ESLint on staged files only (fast)
- [ ] Block commit if linting fails
- [ ] Provide helpful error messages
- [ ] Allow `--no-verify` bypass (logged for monitoring)

**GitHub Actions CI Checks**
- [ ] Lint all files on PR
- [ ] Run TypeScript build
- [ ] Run all tests
- [ ] Check test coverage thresholds
- [ ] Block merge if any check fails
- [ ] Post detailed failure reports as PR comments

**Compliance Verification Scripts**
- [ ] `scripts/check-md3-compliance.sh` - Scan for native HTML violations
- [ ] `scripts/check-property-declare.sh` - Scan for missing `declare` keywords
- [ ] `scripts/check-forbidden-patterns.sh` - Scan for `console.log`, `@ts-ignore`, etc.

### Tier 2: Agent Instruction Architecture (Medium Impact)

**Mandatory Ticket Completion Checklist**
- [ ] Create `guides/TICKET_COMPLETION_CHECKLIST.md`
- [ ] Two-phase prompting pattern (creation → compliance review)
- [ ] Explicit compliance verification steps
- [ ] Links to automated tools

### Out of Scope (Deferred)

- Visual regression testing (screenshots)
- Runtime performance monitoring
- Accessibility automated testing (separate ticket)
- Code complexity metrics (cyclomatic complexity, etc.)

---

## Acceptance Criteria

### A. Custom ESLint Rule: `enforce-md3-components`

**File:** `packages/config/eslint-rules/enforce-md3.js`

**Violations to Detect:**
```typescript
// ❌ VIOLATION: Native HTML form elements
html`<button>Click me</button>`
html`<input type="text">`
html`<select><option>...</option></select>`
html`<textarea></textarea>`

// ✅ COMPLIANT: Material Design 3 components
html`<md-filled-button>Click me</md-filled-button>`
html`<md-outlined-text-field></md-outlined-text-field>`
html`<md-filled-select></md-filled-select>`
```

**Error Message:**
```
error  Native HTML element '<button>' detected in Lit template
  Replace with Material Design 3 component:
  - <button> → <md-filled-button> or <md-outlined-button> or <md-text-button>
  - <input> → <md-outlined-text-field> or <md-filled-text-field>
  - <select> → <md-filled-select> or <md-outlined-select>
  - <textarea> → <md-filled-text-field type="textarea">
  
  See: guides/STANDARDS_STYLES.md § Material Design 3 Components
  Example: packages/ui-lit/src/firebase/df-sign-in.ts
```

**Exemptions:**
- Non-UI files (tests, config, scripts)
- Semantic HTML (`<div>`, `<span>`, `<section>`, `<header>`, etc.)
- Explicit opt-out: `// eslint-disable-next-line enforce-md3 -- [justification required]`

**Acceptance:**
- [ ] Rule detects all 4 native form elements (`<button>`, `<input>`, `<select>`, `<textarea>`)
- [ ] Rule ignores semantic HTML
- [ ] Error message clear and actionable
- [ ] Rule integrates with existing ESLint config
- [ ] `pnpm lint` fails on violations
- [ ] Exemption pattern works with justification comment

---

### B. Custom ESLint Rule: `enforce-property-declare`

**File:** `packages/config/eslint-rules/enforce-property-declare.js`

**Violations to Detect:**
```typescript
// ❌ VIOLATION: Missing `declare` keyword
@property({type: String}) todoId = '';
@property({type: Boolean}) completed: boolean = false;

// ✅ COMPLIANT: Uses `declare` keyword
@property({type: String}) declare todoId: string;
@property({type: Boolean}) declare completed: boolean;

constructor() {
  super();
  this.todoId = '';
  this.completed = false;
}
```

**Error Message:**
```
error  Property 'todoId' decorated with @property must use 'declare' keyword
  
  Pattern: @property({...}) declare propertyName: Type;
  
  Why: Prevents property shadowing (decorator creates property, assignment creates another).
  
  Fix:
    @property({type: String}) declare todoId: string;
    
    constructor() {
      super();
      this.todoId = '';
    }
  
  See: guides/WC_SHARED_DEFAULTS.md § Property Declaration Pattern
  Example: packages/ui-lit/src/df-upload-link.ts
```

**Acceptance:**
- [ ] Rule detects `@property` without `declare`
- [ ] Rule allows `@state` without `declare` (different pattern)
- [ ] Error message provides fix example
- [ ] Rule integrates with existing ESLint config
- [ ] `pnpm lint` fails on violations

---

### C. Pre-Commit Hook (Husky)

**File:** `.husky/pre-commit`

**Checks Performed:**
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# 1. Lint staged files only (fast)
echo "  Linting staged files..."
npx lint-staged

# 2. TypeScript compilation (quick check)
echo "  Checking TypeScript..."
pnpm tsc --noEmit

# 3. Run compliance scripts
echo "  Checking MD3 compliance..."
./scripts/check-md3-compliance.sh

echo "  Checking property declarations..."
./scripts/check-property-declare.sh

echo "  Checking forbidden patterns..."
./scripts/check-forbidden-patterns.sh

echo "✅ Pre-commit checks passed!"
```

**Staged Files Only (Performance):**
```json
// .lintstagedrc.json
{
  "*.ts": ["eslint --fix", "prettier --write"],
  "*.md": ["prettier --write"]
}
```

**Acceptance:**
- [ ] Hook runs before every commit
- [ ] Only lints staged files (fast)
- [ ] Provides clear error messages
- [ ] Can be bypassed with `--no-verify` (logged)
- [ ] Does NOT block emergency fixes
- [ ] Total runtime < 10 seconds for typical commits

---

### D. GitHub Actions CI Check

**File:** `.github/workflows/standards-compliance.yml`

```yaml
name: Standards Compliance

on:
  pull_request:
  push:
    branches: [main, dev]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run ESLint
        run: pnpm lint
      
      - name: Check MD3 Compliance
        run: ./scripts/check-md3-compliance.sh
      
      - name: Check Property Declarations
        run: ./scripts/check-property-declare.sh
      
      - name: Check Forbidden Patterns
        run: ./scripts/check-forbidden-patterns.sh
  
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build all packages
        run: pnpm build
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run tests
        run: pnpm test
      
      - name: Check coverage thresholds
        run: pnpm test:coverage --reporter=json-summary
      
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            // Post detailed results as PR comment
```

**Acceptance:**
- [ ] Workflow triggers on PR and push to main/dev
- [ ] All checks run in parallel (fast)
- [ ] PR cannot be merged if checks fail
- [ ] Detailed failure reports posted as PR comments
- [ ] Status badge shows compliance status

---

### E. Compliance Verification Scripts

**File:** `scripts/check-md3-compliance.sh`

```bash
#!/bin/bash
set -e

echo "🔍 Checking Material Design 3 compliance..."

# Scan all UI component files for native HTML violations
VIOLATIONS=$(grep -rn --include="*.ts" \
  -E 'html`[^`]*<(button|input|select|textarea)[>\s]' \
  packages/ui-lit/src apps/*/src || true)

if [ -n "$VIOLATIONS" ]; then
  echo "❌ MD3 COMPLIANCE VIOLATIONS FOUND:"
  echo "$VIOLATIONS"
  echo ""
  echo "Native HTML form elements must use Material Design 3 components."
  echo "See: guides/STANDARDS_STYLES.md § Material Design 3 Components"
  exit 1
fi

echo "✅ MD3 compliance verified - no native HTML violations"
```

**File:** `scripts/check-property-declare.sh`

```bash
#!/bin/bash
set -e

echo "🔍 Checking property declaration pattern..."

# Scan for @property without declare keyword
VIOLATIONS=$(grep -rn --include="*.ts" \
  -P '@property\([^)]*\)\s+(?!declare)[a-zA-Z]' \
  packages/ui-lit/src apps/*/src || true)

if [ -n "$VIOLATIONS" ]; then
  echo "❌ PROPERTY DECLARATION VIOLATIONS FOUND:"
  echo "$VIOLATIONS"
  echo ""
  echo "Properties decorated with @property must use 'declare' keyword."
  echo "See: guides/WC_SHARED_DEFAULTS.md § Property Declaration Pattern"
  exit 1
fi

echo "✅ Property declarations verified - all use 'declare' keyword"
```

**File:** `scripts/check-forbidden-patterns.sh`

```bash
#!/bin/bash
set -e

echo "🔍 Checking for forbidden patterns..."

# Check for console.log (allow console.error only)
LOGS=$(grep -rn --include="*.ts" \
  -E 'console\.(log|debug|warn)' \
  packages/*/src apps/*/src || true)

if [ -n "$LOGS" ]; then
  echo "⚠️  CONSOLE LOGS FOUND (should use console.error only):"
  echo "$LOGS"
  # Warning only, don't fail build
fi

# Check for @ts-ignore without justification
IGNORES=$(grep -rn --include="*.ts" \
  '@ts-ignore' \
  packages/*/src apps/*/src | grep -v '// @ts-ignore --' || true)

if [ -n "$IGNORES" ]; then
  echo "❌ @ts-ignore WITHOUT JUSTIFICATION:"
  echo "$IGNORES"
  echo ""
  echo "Use: // @ts-ignore -- [justification required]"
  exit 1
fi

echo "✅ No forbidden patterns found"
```

**Acceptance:**
- [ ] Scripts exit with code 1 on violations (fail CI)
- [ ] Scripts provide clear, actionable error messages
- [ ] Scripts are fast (< 5 seconds each)
- [ ] Scripts work on macOS and Linux

---

### F. Ticket Completion Checklist (Agent Workflow)

**File:** `guides/TICKET_COMPLETION_CHECKLIST.md`

```markdown
# Ticket Completion Checklist

Use this checklist **before marking any ticket complete**. This two-phase approach separates creation from compliance review.

## Phase 1: Implementation

- [ ] Core functionality implemented
- [ ] Manual testing completed
- [ ] Documentation updated

## Phase 2: Standards Compliance Review

Run automated checks:

```bash
# Lint all code
pnpm lint

# Build all packages
pnpm build

# Run all tests
pnpm test

# Check MD3 compliance
./scripts/check-md3-compliance.sh

# Check property declarations
./scripts/check-property-declare.sh

# Check forbidden patterns
./scripts/check-forbidden-patterns.sh
```

Manual verification:

- [ ] All components use Material Design 3 (no native `<button>`, `<input>`, `<select>`, `<textarea>`)
- [ ] All `@property` decorators use `declare` keyword
- [ ] No `console.log` (use `console.error` only)
- [ ] SignalWatcher used for signal-consuming components
- [ ] Event names follow `df-[component]-[action]` pattern
- [ ] TypeScript compiles with no errors
- [ ] All tests pass
- [ ] Storybook builds successfully

Cross-references:

- [ ] Check against `guides/WC_SHARED_DEFAULTS.md`
- [ ] Check against `guides/STANDARDS_STYLES.md`
- [ ] Check against `.github/copilot-instructions.md`

## Phase 3: Commit

```bash
# Stage changes
git add .

# Pre-commit hooks will run automatically
# Fix any violations before proceeding

# Commit with descriptive message
git commit -m "feat: [description]"
```

If pre-commit checks fail:
1. Read error messages carefully
2. Fix violations
3. Re-run checks
4. Commit again

## Emergency Bypass

**Only use in true emergencies:**
```bash
git commit --no-verify -m "emergency: [justification]"
```

This bypasses pre-commit hooks but CI checks will still run.
```

**Acceptance:**
- [ ] Checklist covers all automated and manual checks
- [ ] Clear instructions for running each check
- [ ] Emergency bypass documented (with warning)
- [ ] Referenced in `.github/copilot-instructions.md`

---

## Implementation Strategy

### Phase 1: ESLint Rules (1-2 days)

1. **Create Custom Rules Package**
   - `packages/config/eslint-rules/` directory
   - `enforce-md3.js` rule
   - `enforce-property-declare.js` rule
   - Test files for each rule

2. **Integrate with ESLint Config**
   - Update `eslint.config.js` to load custom rules
   - Configure rule severity (error vs warning)
   - Test on existing codebase

3. **Document Rules**
   - Add rule documentation to `packages/config/README.md`
   - Link to guides with pattern explanations

### Phase 2: Pre-Commit Hooks (0.5-1 day)

1. **Install Husky**
   ```bash
   pnpm add -D -w husky lint-staged
   pnpm husky install
   ```

2. **Create Pre-Commit Hook**
   - `.husky/pre-commit` script
   - `.lintstagedrc.json` config
   - Test on sample commits

3. **Create Compliance Scripts**
   - `scripts/check-md3-compliance.sh`
   - `scripts/check-property-declare.sh`
   - `scripts/check-forbidden-patterns.sh`
   - Make scripts executable (`chmod +x`)

### Phase 3: GitHub Actions (1 day)

1. **Create Workflow File**
   - `.github/workflows/standards-compliance.yml`
   - Lint job, build job, test job
   - PR comment integration

2. **Test Workflow**
   - Create test PR with intentional violations
   - Verify workflow blocks merge
   - Verify error messages are clear

3. **Add Status Badge**
   - Add to README
   - Link to workflow runs

### Phase 4: Documentation & Training (0.5-1 day)

1. **Create Ticket Completion Checklist**
   - `guides/TICKET_COMPLETION_CHECKLIST.md`
   - Two-phase workflow documentation

2. **Update Copilot Instructions**
   - Reference mandatory checklist
   - Link to automated tools

3. **Create Migration Guide**
   - "How to fix existing violations"
   - "How to add new custom rules"

---

## Success Criteria

- [ ] Custom ESLint rules detect MD3 and property declaration violations
- [ ] Pre-commit hooks block commits with violations
- [ ] GitHub Actions workflow blocks PRs with violations
- [ ] Compliance scripts provide clear error messages
- [ ] Ticket completion checklist created
- [ ] All existing code passes new checks (after Ticket 12 fixes applied)
- [ ] Documentation updated
- [ ] Team trained on new workflow

**Validation:**
1. Create test commit with violations → pre-commit hook blocks ✅
2. Create test PR with violations → CI blocks merge ✅
3. Existing codebase passes all checks ✅

---

## Expected Impact

**Before (Current State):**
- ⚠️ Standards violations possible (6 found in Ticket 12)
- ⚠️ Manual code review unreliable
- ⚠️ Agents forget standards during implementation
- ⚠️ No automated prevention mechanism

**After (With Enforcement System):**
- ✅ Standards violations blocked at commit time
- ✅ Standards violations blocked at PR merge time
- ✅ Clear error messages guide fixes
- ✅ Agents can't forget standards (machine-enforced)
- ✅ Teaching app maintains quality as it evolves

**Teaching Value:**
- ✅ Demonstrates automated quality gates
- ✅ Shows how to create custom ESLint rules
- ✅ Provides reusable enforcement patterns
- ✅ Scales to production apps

---

## Priority Justification

**Medium Priority** because:
- ✅ Prevents future standards violations (high value)
- ⚠️ Requires 3-5 days effort (significant investment)
- ✅ Benefits all future development (long-term payoff)
- ⚠️ Current violations already fixed manually (Ticket 12)
- ✅ Teaching app quality maintained over time

**Schedule After:**
- Ticket 12 immediate fixes ✅ (property declarations, ES2022)
- Firestore store tests (validate enforcement doesn't break tests)

**Before:**
- Large new feature development
- Onboarding new developers
- Public release of teaching app

---

## Effort Estimate

**Total: 3-5 days**
- Phase 1 (ESLint rules): 1-2 days
- Phase 2 (pre-commit hooks): 0.5-1 day
- Phase 3 (GitHub Actions): 1 day
- Phase 4 (documentation): 0.5-1 day
- Buffer for debugging/testing: 1 day

**Parallelization:** Phases 1-2 can be done in parallel by different developers

---

## References

- **Source Audit:** `.z_/WIP/COMPLIANCE_CHECKLIST.md` (identified property declaration violations)
- **Roadmap Ticket 14:** Standards Enforcement System proposal
- **Ticket 12:** Standards Compliance Audit (manual validation)
- **Ticket 11:** Testing & Documentation Finalization
- **Guides:** `WC_SHARED_DEFAULTS.md`, `STANDARDS_STYLES.md`
- **ESLint Custom Rules:** [ESLint Plugin Tutorial](https://eslint.org/docs/latest/developer-guide/working-with-plugins)
- **Husky Docs:** [Husky Git Hooks](https://typicode.github.io/husky/)
- **GitHub Actions:** [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**End of Technical Debt Ticket**
