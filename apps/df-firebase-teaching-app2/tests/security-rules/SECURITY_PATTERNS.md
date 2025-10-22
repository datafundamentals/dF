# Security Patterns & Best Practices

This guide documents proven security patterns, common pitfalls, and best practices for Firebase Firestore and Storage security rules based on the teaching app implementation.

## Table of Contents

1. [Firestore Security Patterns](#firestore-security-patterns)
2. [Storage Security Patterns](#storage-security-patterns)
3. [Common Anti-Patterns](#common-anti-patterns)
4. [Best Practices](#best-practices)
5. [Testing Patterns](#testing-patterns)

---

## Firestore Security Patterns

### Pattern 1: Authentication-First Design

**Principle:** Every rule should start by checking authentication before evaluating any other logic.

**Good Example:**
```javascript
match /todos/{todoId} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() && isValidTodo();
}

function isAuthenticated() {
  return request.auth != null;
}
```

**Why it works:**
- Prevents unauthenticated access immediately
- Reduces unnecessary rule evaluation
- Clear security boundary

**Anti-pattern:**
```javascript
// BAD - Allows unauthenticated reads!
match /todos/{todoId} {
  allow read: if true;
  allow write: if request.auth != null && isValidTodo();
}
```

---

### Pattern 2: Helper Functions for Reusability

**Principle:** Extract common checks into reusable functions.

**Good Example:**
```javascript
function isAuthenticated() {
  return request.auth != null;
}

function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}

function hasRequiredFields(fields) {
  return request.resource.data.keys().hasAll(fields);
}
```

**Benefits:**
- DRY (Don't Repeat Yourself)
- Easier to maintain and update
- Self-documenting code
- Consistent behavior across rules

**Usage:**
```javascript
match /todos/{todoId} {
  allow create: if isAuthenticated() && hasRequiredFields(['title', 'description']);
  allow update: if isAuthenticated() && hasRequiredFields(['title', 'description']);
}
```

---

### Pattern 3: Comprehensive Field Validation

**Principle:** Validate every field in your documents - type, presence, constraints.

**Good Example:**
```javascript
function isValidTodo() {
  let required = ['title', 'description', 'completed', 'priority', 'tags'];
  let allowed = ['title', 'description', 'completed', 'priority', 'tags', 'createdAt'];
  
  return hasRequiredFields(required)
      && hasOnlyAllowedFields(allowed)
      && request.resource.data.title is string
      && request.resource.data.title.size() > 0
      && request.resource.data.title.size() <= 200
      && request.resource.data.priority in ['low', 'medium', 'high']
      && request.resource.data.tags is list
      && request.resource.data.tags.size() <= 10;
}
```

**What this validates:**
- ✅ Required fields present
- ✅ No unexpected fields
- ✅ Correct field types
- ✅ String length constraints
- ✅ Enum values
- ✅ Array size limits

**Why comprehensive:**
- Prevents malformed data
- Protects against injection attacks
- Enforces business rules
- Makes debugging easier

---

### Pattern 4: Computed Fields Validation

**Principle:** Validate computed fields match their source data.

**Good Example:**
```javascript
function isValidTodo() {
  return request.resource.data.title is string
      && request.resource.data.titleLower is string
      && request.resource.data.titleLower == request.resource.data.title.lower();
}
```

**Why it matters:**
- Prevents data inconsistency
- Ensures reliable queries (e.g., case-insensitive search)
- Catches client-side bugs

**Common use cases:**
- Case-normalized strings for search
- Full names from first + last name
- Calculated totals from item lists

---

### Pattern 5: Read-Only Reference Data

**Principle:** Separate reference data (controlled by admins) from user data.

**Good Example:**
```javascript
// Reference data collections
match /flowers/{flowerId} {
  allow read: if isAuthenticated();
  allow write: if isAdmin();
}

function isAdmin() {
  return isAuthenticated() && request.auth.token.admin == true;
}
```

**Benefits:**
- Prevents user tampering with shared data
- Clear data ownership model
- Supports multi-tenant scenarios

**Alternative approaches:**
- Admin SDK writes (bypasses rules entirely)
- Cloud Functions with admin privileges
- Custom claims for admin users

---

### Pattern 6: Extensible Ownership Rules

**Principle:** Design rules to support future owner-based permissions.

**Good Example:**
```javascript
match /todos/{todoId} {
  // Current: Any authenticated user can read
  // Future: Filter to owner with security rules
  allow read: if isAuthenticated();
  
  // Current: Any authenticated user can write
  // Future: Add ownership check when userId field added
  allow write: if isAuthenticated() && isValidTodo();
  // Future version:
  // allow write: if isAuthenticated() && isValidTodo() && isOwner(request.resource.data.userId);
}
```

**Why design for future:**
- Minimizes breaking changes
- Documents evolution path
- Keeps tests forward-compatible

---

## Storage Security Patterns

### Pattern 1: Path-Based Organization

**Principle:** Organize files by purpose and access pattern.

**Good Example:**
```javascript
// Public read, authenticated write
match /images/{imageId} {
  allow read: if true;
  allow write: if isAuthenticated() && isImageFile();
}

// Authenticated read/write
match /documents/{docId} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() && isDocumentFile();
}

// Owner-only write, public read
match /avatars/{userId} {
  allow read: if true;
  allow write: if isOwner(userId) && isImageFile();
}
```

**Path conventions:**
- `/images` - Public content (thumbnails, product photos)
- `/documents` - Private content (invoices, reports)
- `/avatars` - User-owned content (profile pictures)
- `/uploads` - Temporary staging area

---

### Pattern 2: Content Type Validation

**Principle:** Restrict file uploads by MIME type.

**Good Example:**
```javascript
function isImageFile() {
  return request.resource.contentType.matches('image/.*');
}

function isDocumentFile() {
  return request.resource.contentType.matches('application/pdf')
      || request.resource.contentType.matches('application/msword')
      || request.resource.contentType.matches('application/vnd.openxmlformats-officedocument.*')
      || request.resource.contentType.matches('text/plain');
}

match /images/{imageId} {
  allow write: if isAuthenticated() && isImageFile();
}
```

**Why validate content type:**
- Prevents executable uploads (.exe, .sh)
- Protects against XSS via SVG
- Enforces business requirements
- Improves user experience (early validation)

**Common patterns:**
- `image/*` - All image types
- `image/(jpeg|png|gif|webp)` - Specific image types
- `application/pdf` - PDF documents only
- `video/*` - All video types

---

### Pattern 3: Size Limit Enforcement

**Principle:** Set appropriate size limits for each file type and path.

**Good Example:**
```javascript
function isWithinSizeLimit(maxSizeBytes) {
  return request.resource.size <= maxSizeBytes;
}

match /avatars/{userId} {
  allow write: if isOwner(userId)
                && isImageFile()
                && isWithinSizeLimit(2 * 1024 * 1024); // 2MB
}

match /documents/{docId} {
  allow write: if isAuthenticated()
                && isDocumentFile()
                && isWithinSizeLimit(10 * 1024 * 1024); // 10MB
}
```

**Recommended limits:**
- Avatars: 2MB
- Images: 5MB
- Documents: 10MB
- Videos: 100MB (or use signed URLs)

**Why limit size:**
- Prevents storage abuse
- Reduces costs
- Improves upload experience
- Protects against DoS attacks

---

### Pattern 4: Owner-Based Permissions

**Principle:** Use path variables to enforce ownership.

**Good Example:**
```javascript
match /avatars/{userId} {
  allow read: if true;  // Public read
  allow write: if isAuthenticated()
                && request.auth.uid == userId  // Must match path
                && isImageFile()
                && isWithinSizeLimit(2 * 1024 * 1024);
}
```

**Key insight:** The path variable `{userId}` becomes available in the rule, allowing you to check if `request.auth.uid` matches the requested path.

**Usage pattern:**
```
avatars/user123 ← Only user with UID 'user123' can write
avatars/user456 ← Only user with UID 'user456' can write
```

**Benefits:**
- Self-documenting paths
- Simple ownership model
- No database queries needed

---

### Pattern 5: Default Deny

**Principle:** Explicitly deny all undefined paths.

**Good Example:**
```javascript
// At the end of your rules
match /{document=**} {
  allow read, write: if false;
}
```

**Why explicit deny:**
- Security by default
- Forces intentional rules
- Catches typos/mistakes
- Clear security posture

**Note:** In Storage rules, more specific matchers take precedence over wildcards, so place this at the end.

---

## Common Anti-Patterns

### Anti-Pattern 1: Wide-Open Development Rules

**Problem:**
```javascript
// NEVER DO THIS - Even in development!
match /{document=**} {
  allow read, write: if true;
}
```

**Why it's dangerous:**
- Easy to forget to change
- Can be accidentally deployed
- Teaches bad habits
- Makes testing meaningless

**Better approach:**
```javascript
// Development rules should still require auth
match /{document=**} {
  allow read, write: if isAuthenticated();
}
```

---

### Anti-Pattern 2: Client-Side Validation Only

**Problem:** Relying on client-side checks without server-side rules.

```javascript
// Client does validation
if (todo.title.length > 200) {
  throw new Error('Title too long');
}

// But rules don't enforce it!
match /todos/{todoId} {
  allow write: if isAuthenticated();  // Missing validation!
}
```

**Why it fails:**
- Malicious clients bypass validation
- API calls skip client code
- Admin SDK bypasses client
- Different clients may have bugs

**Fix:** Always validate on server (rules) AND client (UX).

---

### Anti-Pattern 3: Over-Permissive Reads

**Problem:**
```javascript
// BAD - Anyone can read all user data!
match /users/{userId} {
  allow read: if true;
  allow write: if isOwner(userId);
}
```

**Why it's bad:**
- Privacy violation
- Data leakage risk
- Compliance issues (GDPR, etc.)

**Fix:** Require authentication or ownership for sensitive data.
```javascript
match /users/{userId} {
  allow read: if isAuthenticated() && (isPublicProfile(userId) || isOwner(userId));
  allow write: if isOwner(userId);
}
```

---

### Anti-Pattern 4: Missing Size Limits

**Problem:**
```javascript
// BAD - No size limit!
match /uploads/{file} {
  allow write: if isAuthenticated();
}
```

**Risks:**
- Storage cost explosion
- DoS attacks
- Poor user experience

**Fix:**
```javascript
match /uploads/{file} {
  allow write: if isAuthenticated()
                && isWithinSizeLimit(10 * 1024 * 1024);
}
```

---

### Anti-Pattern 5: Greedy Wildcard Matchers

**Problem:**
```javascript
// BAD - {path=**} matches everything, even more specific paths!
match /uploads/{path=**} {
  allow write: if isAuthenticated();
}

// This never gets evaluated!
match /uploads/images/{imageId} {
  allow write: if isAuthenticated() && isImageFile();
}
```

**Why it fails:**
- Greedy wildcards match first
- More specific rules ignored
- Hard to debug

**Fix:** Use single-level wildcards or place specific rules first.
```javascript
// Specific rules first
match /uploads/images/{imageId} {
  allow write: if isAuthenticated() && isImageFile();
}

// Generic rule last
match /uploads/{fileId} {
  allow write: if isAuthenticated();
}
```

---

## Best Practices

### 1. Test Early, Test Often

- Write tests BEFORE deploying rules
- Use `@firebase/rules-unit-testing` for fast feedback
- Test both positive and negative cases
- Cover edge cases (empty strings, null values, etc.)

### 2. Document Your Rules

```javascript
/**
 * Todos Collection Rules
 * 
 * Authentication: Required for all operations
 * Ownership: Currently shared, ready for userId field
 * Validation: Full field validation with constraints
 * 
 * Fields:
 * - title (string, 1-200 chars, required)
 * - titleLower (string, computed from title, required)
 * - description (string, 0-2000 chars, required)
 * - completed (boolean, required)
 * - priority ('low'|'medium'|'high', required)
 * - tags (array, 0-10 items, required)
 * - createdAt (timestamp|null)
 * - updatedAt (timestamp|null)
 * - dueDate (timestamp|null)
 */
match /todos/{todoId} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() && isValidTodo();
}
```

### 3. Version Your Rules

Track rule changes with comments:
```javascript
rules_version = '2';

/**
 * Version History:
 * v1.0 (2025-01-15): Initial rules with auth checks
 * v1.1 (2025-01-20): Added field validation
 * v1.2 (2025-01-25): Added admin support for reference collections
 */
```

### 4. Use TypeScript Types as Guide

Match your Firestore types to rules:
```typescript
// types/todo.ts
export interface TodoDocument {
  title: string;           // 1-200 chars
  titleLower: string;      // computed
  description: string;      // 0-2000 chars
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];          // max 10
  createdAt: Date | null;
  updatedAt: Date | null;
  dueDate: Date | null;
}
```

Then validate in rules:
```javascript
function isValidTodo() {
  return request.resource.data.title is string
      && request.resource.data.title.size() >= 1
      && request.resource.data.title.size() <= 200
      // ... match all fields from type
}
```

### 5. Progressive Security Enhancement

Start simple, add complexity as needed:

**Phase 1 - MVP:**
```javascript
match /todos/{todoId} {
  allow read, write: if isAuthenticated();
}
```

**Phase 2 - Field Validation:**
```javascript
match /todos/{todoId} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() && isValidTodo();
}
```

**Phase 3 - Ownership:**
```javascript
match /todos/{todoId} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated()
                && isValidTodo()
                && isOwner(request.resource.data.userId);
}
```

### 6. Monitor Rule Performance

Use Firebase Console to monitor rule evaluation:
- Rules evaluation count
- Denied requests (may indicate attacks)
- Slow rules (complex validation)

Optimize expensive rules:
```javascript
// Expensive - multiple database reads
function canEditProject(projectId) {
  return isProjectMember(projectId) && hasEditPermission(projectId);
}

// Optimized - check auth first, then read database
function canEditProject(projectId) {
  return isAuthenticated()
      && isProjectMember(projectId)
      && hasEditPermission(projectId);
}
```

---

## Testing Patterns

### Pattern 1: Test Isolation

Each test should be independent:
```typescript
afterEach(async () => {
  await testEnv.clearFirestore();  // Clean state
});
```

### Pattern 2: Positive and Negative Tests

Always test both success and failure:
```typescript
test('authenticated users can create valid todos', async () => {
  const db = getAuthenticatedFirestore('user1');
  const todoRef = doc(db, 'todos', 'test-1');
  await assertSucceeds(setDoc(todoRef, createValidTodo()));
});

test('authenticated users cannot create invalid todos', async () => {
  const db = getAuthenticatedFirestore('user1');
  const todoRef = doc(db, 'todos', 'test-1');
  await assertFails(setDoc(todoRef, createInvalidTodo()));
});
```

### Pattern 3: Helper Functions for Test Data

Create reusable test data generators:
```typescript
function createValidTodo(overrides = {}) {
  return {
    title: 'Test Todo',
    titleLower: 'test todo',
    description: 'Test description',
    completed: false,
    priority: 'medium',
    tags: ['test'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    dueDate: null,
    ...overrides,
  };
}

// Usage
await setDoc(todoRef, createValidTodo({ priority: 'high' }));
```

### Pattern 4: Test Organization

Organize tests by feature and security aspect:
```
tests/security-rules/
  ├── firestore.rules.test.ts
  │   ├── Todos Collection - Authentication
  │   ├── Todos Collection - Field Validation
  │   ├── Todos Collection - CRUD Operations
  │   ├── Reference Collections - Read-Only
  │   └── Default Deny
  ├── storage.rules.test.ts
  │   ├── Images Path - Authentication
  │   ├── Documents Path - Validation
  │   ├── Avatars Path - Ownership
  │   └── Default Deny
  └── run-all-tests.ts
```

### Pattern 5: Descriptive Test Names

Use clear, actionable test names:
```typescript
// Good
test('unauthenticated users cannot read todos', ...)
test('authenticated users can create valid todos', ...)
test('cannot create todo with title exceeding 200 chars', ...)

// Bad
test('test1', ...)
test('read test', ...)
test('validation', ...)
```

---

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules Guide](https://firebase.google.com/docs/storage/security)
- [Security Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests)
- Teaching app rules: `firestore.rules`, `storage.rules`
- Teaching app tests: `tests/security-rules/`
