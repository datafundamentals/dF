# Add Tests for Firestore Stores

**Created:** October 15, 2025  
**Source:** Ticket 12 Standards Compliance Audit - Short-Term Recommendations  
**Priority:** Medium  
**Effort:** 1-2 days  
**Category:** Testing / Teaching Value

---

## Overview

This ticket addresses the test coverage gap for Firestore-related stores in `packages/state`. While critical Firebase stores (auth: 100%, storage: 95.2%) have excellent coverage, the Firestore stores lack tests, bringing overall coverage to 22.52%.

Per Ticket 11's teaching app philosophy, this ticket focuses on **demonstrating testing patterns** rather than achieving exhaustive coverage. The goal is to show developers how to test Firestore CRUD operations, real-time listeners, and base store patterns.

---

## Problem Statement

**Current Test Coverage (`packages/state`):**
```
Overall:      22.52% (below 60% threshold)

Tested Stores (100% and 95.2%):
  ✅ firebase-auth.store.ts:   100% coverage (87.8% branch)
  ✅ storage.store.ts:          95.2% coverage (80% branch)

Untested Stores (0% coverage):
  ❌ firestore-base.store.ts:    0% - Generic base store for Firestore collections
  ❌ todos.store.ts:              0% - Firestore CRUD with real-time listeners
  ❌ functions-demo.store.ts:     0% - Cloud Functions calls
  ❌ npm-info.store.ts:           0% - Non-Firebase store
  ❌ practice-widget.store.ts:    0% - Non-Firebase store
  ❌ segmented-button.store.ts:   0% - Non-Firebase store
  ❌ upload-link.store.ts:        0% - Non-Firebase store
```

**Impact:**
- Missing Firestore testing examples for teaching purposes
- No validation of CRUD operation correctness
- Real-time listener patterns not demonstrated
- Base store pattern not tested (affects reusability)

---

## Objectives

1. **Demonstrate Firestore testing patterns** using Firebase emulators and `@firebase/rules-unit-testing`
2. **Raise coverage to 60%+ in stores** (Ticket 11 target: 60-75% for stores)
3. **Provide copy-paste examples** for future Firestore store tests
4. **Validate critical paths** (create, read, update, delete, real-time updates)

---

## Scope

### In Scope (Priority 1 - Firestore Stores)

**1. `firestore-base.store.ts` Tests**
- Generic base store pattern validation
- Load/create/update/delete operations
- Pagination cursor management
- Real-time listener setup/teardown
- Error handling patterns
- State transitions (idle → loading → ready → error)

**2. `todos.store.ts` Tests**
- All CRUD operations (create, read, update, delete todos)
- Real-time listener updates
- Query filtering (priority, tags, completion status)
- Compound queries (priority + tags + completion)
- Pagination with filters
- User-specific data access (auth.uid filtering)
- Edge cases (empty collections, missing fields, invalid data)

### Out of Scope (Deferred)

- `functions-demo.store.ts` - Covered by Cloud Functions testing (separate ticket)
- `npm-info.store.ts`, `practice-widget.store.ts`, `segmented-button.store.ts`, `upload-link.store.ts` - Non-Firebase stores (low priority for teaching app)

---

## Acceptance Criteria

### Tests for `firestore-base.store.ts`

**File:** `packages/state/src/stores/__tests__/firestore-base.store.test.ts`

- [ ] **Setup/Teardown**
  - [ ] Initialize Firebase emulators before tests
  - [ ] Clear Firestore data between tests
  - [ ] Properly disconnect emulators after tests

- [ ] **Load Operations**
  - [ ] Load empty collection (returns empty array)
  - [ ] Load collection with documents (returns all docs)
  - [ ] Load with query constraints (where, orderBy, limit)
  - [ ] Load with pagination (first page, next page, previous page)
  - [ ] Real-time listener updates when data changes

- [ ] **Create Operations**
  - [ ] Create document with valid data
  - [ ] Create document with auto-generated ID
  - [ ] Create fails with invalid data (validation)
  - [ ] State updates correctly (idle → loading → ready)

- [ ] **Update Operations**
  - [ ] Update existing document
  - [ ] Update non-existent document (error)
  - [ ] Partial updates preserve other fields
  - [ ] State updates correctly

- [ ] **Delete Operations**
  - [ ] Delete existing document
  - [ ] Delete non-existent document (no error)
  - [ ] State updates correctly

- [ ] **Error Handling**
  - [ ] Network errors handled gracefully
  - [ ] Permission denied errors caught
  - [ ] Invalid queries handled
  - [ ] State transitions to error state

- [ ] **State Management**
  - [ ] Verify signal updates trigger reactivity
  - [ ] State transitions follow correct sequence
  - [ ] Loading flags set correctly

**Target Coverage:** 70-80% (base store pattern is complex)

---

### Tests for `todos.store.ts`

**File:** `packages/state/src/stores/__tests__/todos.store.test.ts`

- [ ] **Initialization**
  - [ ] Store initializes with empty state
  - [ ] Auth user context required for queries
  - [ ] Error if auth not initialized

- [ ] **CRUD Operations**
  - [ ] Create todo with all fields
  - [ ] Create todo with minimal fields (title only)
  - [ ] Read todos for authenticated user
  - [ ] Update todo (title, description, priority, tags, dueDate, completed)
  - [ ] Delete todo by ID
  - [ ] Verify todos are user-scoped (auth.uid filter)

- [ ] **Real-Time Listener**
  - [ ] Listener updates on external create
  - [ ] Listener updates on external update
  - [ ] Listener updates on external delete
  - [ ] Listener detaches on cleanup

- [ ] **Query Filtering**
  - [ ] Filter by completion status (completed: true/false)
  - [ ] Filter by priority (low, medium, high)
  - [ ] Filter by tags (contains specific tag)
  - [ ] Compound filter (priority + completed)
  - [ ] Query returns empty array if no matches

- [ ] **Pagination**
  - [ ] Load first page (pageSize: 10)
  - [ ] Load next page
  - [ ] Load previous page
  - [ ] hasNextPage flag correct
  - [ ] hasPreviousPage flag correct

- [ ] **Edge Cases**
  - [ ] Empty collection (no todos)
  - [ ] Todo with missing optional fields
  - [ ] Invalid priority value (validation)
  - [ ] Invalid date format (validation)
  - [ ] Concurrent updates (last write wins)

**Target Coverage:** 70-80% (comprehensive CRUD + real-time patterns)

---

## Testing Tools & Setup

### Required Dependencies

Already installed (from Ticket 8):
- ✅ `@firebase/rules-unit-testing` - Firebase emulator testing
- ✅ `vitest` - Test runner with coverage
- ✅ Firestore emulator configured in `firebase.json`

**No new dependencies needed.**

### Test Environment Setup

**Pattern to use (from `firebase-auth.store.test.ts`):**
```typescript
import {describe, it, expect, beforeAll, afterAll, beforeEach} from 'vitest';
import {initializeTestEnvironment, RulesTestEnvironment} from '@firebase/rules-unit-testing';
import {doc, setDoc, getDoc} from 'firebase/firestore';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'demo-firestore-base-test',
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: `/* Firestore security rules */`,
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

it('should create a document', async () => {
  const firestore = testEnv.unauthenticatedContext().firestore();
  // Test logic...
});
```

---

## Implementation Strategy

### Phase 1: `firestore-base.store.ts` Tests (4-6 hours)

1. **Setup Test File**
   - Create `__tests__/firestore-base.store.test.ts`
   - Initialize emulator environment
   - Create test collection reference

2. **Write Core Tests**
   - Load operations (empty, with data, with queries)
   - Create operations (valid, invalid, state transitions)
   - Update operations (partial, full, non-existent)
   - Delete operations (existing, non-existent)

3. **Real-Time Listener Tests**
   - Setup listener, verify updates, teardown
   - Multiple updates in sequence
   - Listener cleanup on unmount

4. **Pagination Tests**
   - First page, next page, previous page
   - Page boundary conditions
   - Combined with filters

5. **Error Handling Tests**
   - Permission denied
   - Invalid queries
   - Network errors (simulate)

### Phase 2: `todos.store.ts` Tests (4-6 hours)

1. **Setup Test File**
   - Create `__tests__/todos.store.test.ts`
   - Initialize emulator with auth context
   - Seed test user

2. **CRUD Tests**
   - Create todos (all field variations)
   - Read todos (user-scoped)
   - Update todos (all field types)
   - Delete todos

3. **Query/Filter Tests**
   - Completion filter
   - Priority filter
   - Tag filter
   - Compound filters

4. **Real-Time Tests**
   - External creates trigger updates
   - External updates trigger re-render
   - External deletes remove from list

5. **Edge Case Tests**
   - Empty states
   - Missing fields
   - Invalid data
   - Concurrent updates

### Phase 3: Documentation & Examples (2 hours)

1. **Update README**
   - Add "Testing Firestore Stores" section
   - Link to test files as examples
   - Document emulator setup for tests

2. **Create Testing Guide**
   - `apps/df-firebase-teaching-app0/guides/FIRESTORE_TESTING.md`
   - Copy-paste examples for common scenarios
   - Troubleshooting emulator issues

3. **Update Coverage Report**
   - Run `pnpm test --coverage` in `packages/state`
   - Verify 60%+ overall coverage achieved
   - Document remaining gaps (non-Firebase stores)

---

## Success Criteria

- [ ] `firestore-base.store.test.ts` created with 70-80% coverage of base store
- [ ] `todos.store.test.ts` created with 70-80% coverage of todos store
- [ ] Overall `packages/state` coverage > 60% (up from 22.52%)
- [ ] All tests pass (`pnpm test` in packages/state)
- [ ] Tests run in Firestore emulator (no real Firebase project needed)
- [ ] README updated with testing documentation
- [ ] FIRESTORE_TESTING.md guide created with examples
- [ ] No regressions (existing auth/storage tests still pass)

---

## Expected Impact

**Before:**
```
Overall Coverage: 22.52%
  - firebase-auth.store.ts: 100%
  - storage.store.ts: 95.2%
  - firestore-base.store.ts: 0%
  - todos.store.ts: 0%
```

**After:**
```
Overall Coverage: 65-70% (target met ✅)
  - firebase-auth.store.ts: 100%
  - storage.store.ts: 95.2%
  - firestore-base.store.ts: 70-80%
  - todos.store.ts: 70-80%
```

**Teaching Value:**
- ✅ Demonstrates Firestore emulator testing patterns
- ✅ Shows how to test CRUD operations
- ✅ Examples of real-time listener testing
- ✅ Pagination testing patterns
- ✅ Query/filter testing strategies
- ✅ Copy-paste examples for future stores

---

## Priority Justification

**Medium Priority** because:
- ✅ Critical Firebase patterns (auth, storage) already tested
- ✅ Teaching value high (demonstrates Firestore testing)
- ⚠️ Coverage below threshold but acceptable per Ticket 11 scope
- ⚠️ No production users relying on this code
- ✅ Validates Firestore CRUD correctness (important for teaching)

**Schedule After:**
- Ticket 12 immediate fixes (property declarations, ES2022 upgrades) ✅
- Ticket 13 production deployment patterns (optional)

**Before:**
- Major new feature development
- Complex Firestore query additions
- Production app deployment

---

## Effort Estimate

**Total: 1-2 days**
- Phase 1 (firestore-base.store.ts tests): 4-6 hours
- Phase 2 (todos.store.ts tests): 4-6 hours
- Phase 3 (documentation): 2 hours
- Buffer for debugging emulator issues: 2 hours

**Parallelization:** Tests can be written incrementally (one describe block at a time)

---

## References

- **Source Audit:** `.z_/WIP/COMPLIANCE_CHECKLIST.md` (Section E: Test Coverage Validation)
- **Existing Test Examples:** `packages/state/src/stores/__tests__/firebase-auth.store.test.ts`, `storage.store.test.ts`
- **Ticket 11:** Testing finalization with revised coverage targets (60-75% stores)
- **Firebase Docs:** [Firestore Security Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests)
- **Vitest Docs:** [Coverage Configuration](https://vitest.dev/guide/coverage.html)

---

**End of Technical Debt Ticket**
