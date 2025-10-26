# Testing & Compliance Technical Debt

**Created:** October 16, 2025  
**Status:** Documented for future completion  
**Related Tickets:** Ticket 11 (Testing & Documentation), Ticket 12 (Standards Compliance Audit)

## Overview

This document tracks known gaps in the Firebase Teaching App identified during Ticket 13 (Production Deployment) implementation. While the app is functional and deployed to production, these gaps represent technical debt that should be addressed for a complete teaching app implementation.

---

## Summary of Gaps

| Category | Current State | Target State | Priority | Effort |
|----------|---------------|--------------|----------|--------|
| Unit Test Coverage | ~30-40% estimated | 60-75% stores, 50-65% components, 70-80% functions | HIGH | 3-4 days |
| Storybook Stories | 5 stories (partial) | 10+ stories (all components) | MEDIUM | 1-2 days |
| Standards Compliance Audit | Not performed | Ticket 12 checklist complete | MEDIUM | 1-2 days |
| Cloud Functions Tests | 0 tests | 70-80% coverage | HIGH | 1-2 days |

**Total Estimated Effort:** 6-10 days for complete remediation

---

## Gap 1: Unit Test Coverage Insufficient

### Current State
- **Found:** 4 test files total
  - 3 test files in `packages/state`
  - 1 test file in `packages/ui-lit`
  - 0 test files in `apps/df-firebase-teaching-app0/functions`
- **Estimated Coverage:** 30-40% (not measured)
- **What's Missing:**
  - Store tests for auth, Firestore, storage, functions stores
  - Component tests for Firebase UI components
  - Cloud Functions unit tests (callable, HTTP, triggers, scheduled)
  - Edge case testing
  - Error handling tests

### Target State (Ticket 11 Requirements)
- **Stores:** 60-75% coverage (critical paths: auth flows, CRUD, file operations)
- **Components:** 50-65% coverage (user-facing interactions, state rendering)
- **Functions:** 70-80% coverage (business logic, validation)
- **Test Framework:** Vitest or Web Test Runner configured
- **Coverage Reporting:** c8 or nyc with HTML reports

### Impact
- ⚠️ **Medium-High Risk:** Code deployed to production with insufficient automated test validation
- ❌ Cannot verify behavior changes don't break existing functionality
- ❌ Difficult to refactor with confidence
- ❌ New contributors lack test examples to follow

### Mitigation (Current)
- ✅ Security rules have 100% test coverage (64/64 tests passing)
- ✅ Manual testing performed during development
- ✅ Integration tests for basic app functionality
- ✅ Code follows established patterns from reference apps

### Remediation Plan

**Phase 1: Store Tests (2 days)**
- [ ] Create test suite for `firebase-auth.store.ts`
  - Sign-in, sign-up, sign-out flows
  - Auth state changes
  - Error handling (invalid credentials, network errors)
- [ ] Create test suite for `firestore-base.store.ts`
  - CRUD operations
  - Real-time listener updates
  - Pagination
  - Query/filter operations
- [ ] Create test suite for `storage.store.ts`
  - File upload with progress tracking
  - File download
  - File deletion
  - List files
  - Error handling (file too large, invalid type)
- [ ] Create test suite for `functions-demo.store.ts`
  - Callable function invocation
  - Loading state tracking
  - Error handling
  - Response processing

**Phase 2: Component Tests (1-2 days)**
- [ ] Test `df-auth-signin` component
  - Form validation
  - Submit behavior
  - Error display
  - Loading states
- [ ] Test `df-firestore-todos` component
  - Todo creation
  - Todo completion
  - Todo deletion
  - Real-time updates (with mocked store)
- [ ] Test `df-upload-link` component
  - File selection
  - Upload progress
  - Error states
  - Success states
- [ ] Test `df-file-list` component
  - File rendering
  - Delete button interaction
  - Preview functionality

**Phase 3: Functions Tests (1-2 days)**
- [ ] Test callable functions
  - `createTodoAdvanced` with valid/invalid input
  - Auth context validation
  - Response format
- [ ] Test HTTP functions
  - `todosExportAPI` endpoint
  - CORS headers
  - Request validation
  - CSV generation
- [ ] Test Firestore triggers
  - `onTodoCreated` trigger logic
  - Notification generation
- [ ] Test scheduled functions
  - `cleanupExpiredTodos` execution
  - Date filtering logic

**Phase 4: Coverage Reporting (0.5 days)**
- [ ] Configure coverage tool (c8 or nyc)
- [ ] Add coverage scripts to package.json
- [ ] Generate HTML coverage reports
- [ ] Document coverage thresholds
- [ ] Add coverage badge to README

**Tools & Setup:**
```bash
# Add testing dependencies
pnpm add -D vitest @vitest/ui c8 happy-dom @testing-library/dom

# Add coverage scripts to package.json
"test:unit": "vitest",
"test:coverage": "vitest run --coverage",
"test:ui": "vitest --ui"
```

---

## Gap 2: Storybook Stories Incomplete

### Current State
- **Found:** 5 Storybook stories
  - ✅ `df-auth-signin.stories.ts`
  - ✅ `df-firestore-todos.stories.ts`
  - ✅ `df-upload-link.stories.ts`
  - ✅ `df-file-list.stories.ts`
  - ✅ `df-file-delete.stories.ts`
- **Missing Stories:**
  - `df-firestore-form` (create/edit form)
  - `df-firestore-list` (collection display)
  - `df-firestore-item` (single document display)
  - `df-user-profile` (user info display)
  - `df-sign-up` (registration form)
  - `df-sign-out` (sign-out button)
  - `df-password-reset` (password reset form)
  - Any other Firebase components

### Target State (Ticket 11 Requirements)
- **All UI components have Storybook stories**
- Stories demonstrate:
  - Default state
  - Interactive controls (knobs for props)
  - All variants (compact, full, etc.)
  - Loading states
  - Error states
  - Edge cases
- Documentation tabs complete:
  - Component description
  - Props table
  - Events list
  - Accessibility notes

### Impact
- ⚠️ **Low-Medium Risk:** Components are functional, stories are documentation/visual regression testing
- ❌ Reduced visual regression testing capability
- ❌ Harder for developers to explore component variants
- ❌ Missing component documentation
- ❌ Cannot easily demo components in isolation

### Mitigation (Current)
- ✅ Components are functional and deployed
- ✅ Some key components have stories (auth, todos, upload)
- ✅ Components documented in README
- ✅ Manual testing validates component behavior

### Remediation Plan

**Phase 1: Create Missing Stories (1-2 days)**
- [ ] `df-firestore-form.stories.ts`
  - Create mode story
  - Edit mode story
  - Validation error stories
  - Loading state story
- [ ] `df-firestore-list.stories.ts`
  - Empty list story
  - Populated list story
  - Pagination story
  - Loading state story
- [ ] `df-firestore-item.stories.ts`
  - Default display story
  - Actions enabled story
  - Compact variant story
- [ ] Auth component stories:
  - `df-sign-up.stories.ts`
  - `df-sign-out.stories.ts`
  - `df-password-reset.stories.ts`
  - `df-user-profile.stories.ts`

**Phase 2: Enhance Existing Stories (0.5 days)**
- [ ] Add interactive controls (argTypes)
- [ ] Add documentation tabs
- [ ] Add accessibility notes
- [ ] Add usage examples

**Phase 3: Visual Regression Testing (Optional)**
- [ ] Set up Chromatic or Percy
- [ ] Configure screenshot testing
- [ ] Add to CI/CD pipeline

---

## Gap 3: Standards Compliance Audit Not Performed

### Current State
- **Ticket 12 Checklist:** Not executed
- **What's Unknown:**
  - TypeScript configuration compliance (11+ tsconfig files)
  - Material Design 3 compliance (no native HTML elements)
  - Signal/store pattern consistency
  - ESLint/Prettier compliance
  - Documentation completeness
  - Storybook integration status

### Target State (Ticket 12 Requirements)
- [ ] TypeScript configuration audit complete
  - All configs inherit from `ts.config.base.json` where appropriate
  - Strictness levels documented
  - Deviations justified (e.g., Functions CommonJS)
- [ ] Material Design 3 compliance verified
  - No native `<button>`, `<input>`, `<select>`, `<textarea>`
  - All use `@material/web` components
  - Version 2.4.0+ confirmed
- [ ] Signal/store patterns validated
  - Consistent with reference implementations
  - No side effects in components
  - Proper SignalWatcher usage
- [ ] Code quality checks pass
  - ESLint warnings: 0
  - TypeScript errors: 0
  - Prettier formatted
- [ ] Documentation complete
  - All public APIs documented
  - README accurate
  - Guides complete

### Impact
- ⚠️ **Medium Risk:** Unknown if code fully complies with monorepo standards
- ❌ Potential standards violations not caught
- ❌ May require refactoring if violations found
- ❌ Inconsistent patterns with other monorepo apps

### Mitigation (Current)
- ✅ Code follows patterns from reference apps (`df-npm-info-app`, `df-teaching-app`)
- ✅ No obvious violations during development
- ✅ TypeScript compiles successfully
- ✅ Components work correctly

### Remediation Plan

**Phase 1: Automated Checks (0.5 days)**
- [ ] Run ESLint across all workspaces
- [ ] Run Prettier check
- [ ] Run TypeScript build (`tsc --noEmit`)
- [ ] Scan for native HTML elements
- [ ] Check `@material/web` version

**Phase 2: Manual Audits (1 day)**
- [ ] TypeScript config audit
  - Review all 11+ tsconfig files
  - Document inheritance patterns
  - Identify strictness gaps
  - Create `.z_/future/TSCONFIG_TIGHTEN.md` for code changes
- [ ] Signal/store pattern review
  - Compare against reference implementations
  - Check for side effects in components
  - Verify SignalWatcher usage
- [ ] Documentation completeness check
  - All features documented
  - Commands verified
  - Guides complete

**Phase 3: Remediation (0.5 days)**
- [ ] Fix any violations found
- [ ] Document exemptions (if justified)
- [ ] Update README if needed
- [ ] Create follow-up tickets for major issues

---

## Gap 4: Cloud Functions Implementation Status Unclear

### Current State
- **Directory Structure:** ✅ Exists (`apps/df-firebase-teaching-app0/functions/`)
- **Workspace Configuration:** ✅ Separate package.json and tsconfig.json
- **Function Implementations:** ❓ Unknown (not verified)
  - Callable functions: Unknown
  - HTTP functions: Unknown
  - Firestore triggers: Unknown
  - Scheduled functions: Unknown
- **Tests:** ❌ 0 test files found

### Target State (Ticket 9 Requirements)
- [ ] Callable function: `createTodoAdvanced`
- [ ] HTTP function: `todosExportAPI`
- [ ] Firestore trigger: `onTodoCreated`
- [ ] Scheduled function: `cleanupExpiredTodos`
- [ ] All functions tested (unit + integration with emulators)
- [ ] Client integration complete (signals-based calling pattern)

### Impact
- ⚠️ **High Risk:** Cannot verify functions work correctly
- ❌ Production deployment may fail if functions not implemented
- ❌ No automated validation of function behavior
- ❌ Teaching patterns incomplete without function examples

### Mitigation (Current)
- ✅ Functions directory structure correct
- ✅ Workspace configuration proper
- ⚠️ Manual testing possible in emulator

### Remediation Plan

**Phase 1: Verify Implementations (0.5 days)**
- [ ] Check `functions/src/` for implemented functions
- [ ] List all exported functions in `functions/src/index.ts`
- [ ] Test each function manually in emulator
- [ ] Document what exists vs. what's missing

**Phase 2: Implement Missing Functions (1 day, if needed)**
- [ ] Implement callable function pattern
- [ ] Implement HTTP function pattern
- [ ] Implement Firestore trigger pattern
- [ ] Implement scheduled function pattern

**Phase 3: Add Function Tests (1-2 days)**
- [ ] Unit tests for function logic (firebase-functions-test)
- [ ] Integration tests calling emulated functions
- [ ] Mock external dependencies
- [ ] Error handling tests

---

## Prioritization Recommendations

### Critical Path (Must Do First)
1. **Verify Cloud Functions Status** (0.5 days)
   - High risk if not implemented
   - Required for production deployment to work fully
   - Blocks other testing work

2. **Add Cloud Functions Tests** (1-2 days)
   - Critical for production confidence
   - Prevents deployment of broken functions
   - Demonstrates testing patterns for teaching app

3. **Create Store Unit Tests** (2 days)
   - Core application logic must be tested
   - High value for teaching patterns
   - Reduces regression risk

### High Priority (Should Do Soon)
4. **Run Standards Compliance Audit** (1-2 days)
   - Identifies hidden issues
   - May require refactoring
   - Better to find now than later

5. **Add Component Unit Tests** (1-2 days)
   - Validates UI behavior
   - Prevents UI regressions
   - Completes testing coverage

### Medium Priority (Nice to Have)
6. **Complete Storybook Stories** (1-2 days)
   - Improves documentation
   - Enables visual regression testing
   - Lower priority than functional tests

7. **Configure Coverage Reporting** (0.5 days)
   - Visibility into test coverage
   - Metrics for improvement
   - Low effort, high value

---

## Acceptance Criteria for Remediation Complete

The technical debt is considered resolved when:

✅ **Unit test coverage meets revised Ticket 11 targets:**
- Stores: 60-75% coverage
- Components: 50-65% coverage  
- Functions: 70-80% coverage

✅ **Storybook stories complete:**
- All UI components have stories
- Interactive controls configured
- Documentation tabs complete

✅ **Standards compliance audit passed:**
- Ticket 12 checklist complete
- All automated checks pass
- Deviations documented and justified

✅ **Cloud Functions verified:**
- All 4 function patterns implemented
- Tests written and passing
- Client integration working

✅ **Documentation updated:**
- README reflects accurate test coverage
- Technical debt document archived
- Remediation work documented in changelog

---

## Tracking Progress

**Status:** 🟡 Documented (Not Started)

### Phase 1: Critical Path (Target: Week of Oct 21-25, 2025)
- [ ] Gap 4: Verify Cloud Functions status
- [ ] Gap 4: Add Cloud Functions tests
- [ ] Gap 1: Create store unit tests

### Phase 2: High Priority (Target: Week of Oct 28-Nov 1, 2025)
- [ ] Gap 3: Run standards compliance audit
- [ ] Gap 1: Add component unit tests

### Phase 3: Medium Priority (Target: Week of Nov 4-8, 2025)
- [ ] Gap 2: Complete Storybook stories
- [ ] Gap 1: Configure coverage reporting

### Final Review (Target: Week of Nov 11-15, 2025)
- [ ] Verify all acceptance criteria met
- [ ] Update documentation
- [ ] Archive this technical debt document
- [ ] Announce completion

---

## Related Documents

- **Ticket 11:** `.z_/WIP/FIREBASE_TEACHING_APP_ROADMAP.md` (lines 1050-1250)
- **Ticket 12:** `.z_/WIP/FIREBASE_TEACHING_APP_ROADMAP.md` (lines 1250-1400)
- **Ticket 13:** `.z_/WIP/FIREBASE_TEACHING_APP_ROADMAP.md` (lines 1400-1650)
- **Testing Guide:** `apps/df-firebase-teaching-app0/README.md` (Security Rules Testing section)
- **Guides Directory:** `apps/df-firebase-teaching-app0/guides/` (7 Firebase pattern guides)

---

## Notes

**Why Deploy with These Gaps?**

This is a **teaching app**, not a production app with millions of users. The decision to deploy despite gaps is justified by:

1. **Production deployment patterns are critical to document** - the teaching value is very high
2. **Core functionality is solid** - emulator setup works, security rules are 100% tested, UI components function correctly
3. **Gaps don't block deployment** - missing tests/stories don't prevent successful deployment to Firebase
4. **Honesty about state** - acknowledging gaps is pedagogically valuable, demonstrates realistic development constraints
5. **Provides clear path forward** - this document shows exactly what needs completion

This technical debt document IS the teaching pattern - showing how to identify, document, and plan remediation of gaps in a transparent, actionable way.

---

**Last Updated:** October 16, 2025  
**Owner:** Development Team  
**Reviewers:** TBD  
**Next Review:** After Cloud Functions verification (Gap 4, Phase 1)
