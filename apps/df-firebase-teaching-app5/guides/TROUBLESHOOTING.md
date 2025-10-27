# Troubleshooting Guide: Firebase Teaching App

**Last Updated:** 2025-10-14
**Target Audience:** Developers encountering errors with Firebase or the teaching app
**Difficulty:** All levels

## Overview

This guide covers common errors, their root causes, and solutions when working with the Firebase Teaching App. Solutions are organized by Firebase service for easy navigation.

---

## Table of Contents

1. [General Setup Issues](#general-setup-issues)
2. [Firebase Emulator Issues](#firebase-emulator-issues)
3. [Authentication Errors](#authentication-errors)
4. [Firestore Errors](#firestore-errors)
5. [Storage Errors](#storage-errors)
6. [Cloud Functions Errors](#cloud-functions-errors)
7. [Signals & Reactivity Issues](#signals--reactivity-issues)
8. [Build & TypeScript Errors](#build--typescript-errors)
9. [Testing Issues](#testing-issues)

---

## General Setup Issues

### Error: `Cannot find module '@df/state'` or similar workspace package

**Symptoms:**
```
Error: Cannot find module '@df/state'
  or
TS2307: Cannot find module '@df/state' or its corresponding type declarations.
```

**Root Cause:** Workspace dependencies not installed or linked properly.

**Solution:**
```bash
# From monorepo root
pnpm install

# If that doesn't work, clean and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install

# Build all packages
pnpm build
```

**Why this works:** pnpm workspaces require a fresh install to properly link local packages.

---

### Error: `VITE_FIREBASE_PROJECT_ID is not defined`

**Symptoms:**
```
Uncaught ReferenceError: process is not defined
  or
Error: Firebase project ID is undefined
```

**Root Cause:** Environment variables not loaded.

**Solution:**

1. Create `.env.local` file in your app directory:
```bash
# apps/df-firebase-teaching-app5/.env.local
VITE_USE_EMULATOR=true
VITE_FIREBASE_API_KEY=demo-api-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-project
VITE_FIREBASE_STORAGE_BUCKET=demo-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

2. Ensure you're accessing variables with `import.meta.env`:
```typescript
// ✅ Correct (Vite)
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// ❌ Wrong (Node.js style)
const apiKey = process.env.VITE_FIREBASE_API_KEY;
```

3. Restart dev server after changing `.env.local`

**Why this works:** Vite requires `VITE_` prefix and `import.meta.env` syntax.

---

## Firebase Emulator Issues

### Error: `ECONNREFUSED 127.0.0.1:9155` (or 8080, 9199, 5001)

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:9155
  or
FirebaseError: auth/emulator-config-failed
```

**Root Cause:** Firebase emulators not running.

**Solution:**
```bash
# Start emulators from the app directory
cd apps/df-firebase-teaching-app5
pnpm emulators:start

# Or use the monorepo command
pnpm --filter @df/df-firebase-teaching-app5 emulators:start
```

**Verify emulators are running:**
- Open http://127.0.0.1:5400 (Emulator UI)
- Should see Auth, Firestore, Storage, Functions tabs

**Why this works:** The app connects to emulator ports; they must be running first.

---

### Error: `Address already in use :::8080`

**Symptoms:**
```
Error: Port 8080 is not open on localhost (8080), could not start Firestore Emulator.
```

**Root Cause:** Emulator port already in use (another emulator instance or different process).

**Solution:**

**Option 1: Kill the process using the port**
```bash
# Find process ID
lsof -ti:8080

# Kill it
kill -9 $(lsof -ti:8080)

# Restart emulators
pnpm emulators:start
```

**Option 2: Change emulator ports in `firebase.json`**
```json
{
  "emulators": {
    "firestore": {"port": 8081},  // Changed from 8080
    "auth": {"port": 9155},
    "storage": {"port": 9199}
  }
}
```

**Then update your connection code:**
```typescript
connectFirestoreEmulator(db, '127.0.0.1', 8081); // New port
```

**Why this works:** Frees up the port or uses an available alternative.

---

### Error: Emulator data persists between runs (stale test data)

**Symptoms:**
- Old test users still exist after restarting emulators
- Firestore documents from previous session remain

**Root Cause:** Emulator export/import enabled, or using `--import`/`--export` flags.

**Solution:**

**Clear emulator data:**
```bash
# Remove exported data directory
rm -rf .firebase-emulator-data

# Or start with explicit --import flag pointing to fresh seed data
firebase emulators:start --import=./scripts/seed-data/emulator-export --export-on-exit
```

**For clean slate on every run:**
```bash
# Don't use --export-on-exit
firebase emulators:start --import=./scripts/seed-data/emulator-export
```

**Why this works:** Emulators can persist data between runs; removing it starts fresh.

---

## Authentication Errors

### Error: `auth/invalid-email` or `auth/invalid-credential`

**Symptoms:**
```
FirebaseError: Firebase: Error (auth/invalid-email).
  or
FirebaseError: Firebase: Error (auth/invalid-credential).
```

**Root Cause:** Email format invalid, or email/password combination doesn't exist.

**Solution:**

**For emulator testing, use seeded users:**
```typescript
// These users exist in emulator after running seed script
const testUsers = [
  {email: 'alice.anderson@example.com', password: 'password123'},
  {email: 'bob.builder@example.com', password: 'password123'},
  {email: 'charlie.chen@example.com', password: 'password123'},
];
```

**Create seed users:**
```bash
cd apps/df-firebase-teaching-app5
pnpm seed:all
```

**Check emulator has users:**
- Open http://127.0.0.1:5400
- Click "Authentication" tab
- Should see test users listed

**Why this works:** Emulator doesn't persist users unless seeded or created during session.

---

### Error: `auth/operation-not-allowed`

**Symptoms:**
```
FirebaseError: Firebase: Error (auth/operation-not-allowed).
```

**Root Cause:** Email/password auth not enabled in Firebase project or emulator.

**Solution:**

**For emulator (Teaching App):**
This should already be configured. If not, check `firebase.json`:
```json
{
  "emulators": {
    "auth": {
      "port": 9155
    }
  }
}
```

**For production Firebase project:**
1. Go to Firebase Console
2. Navigate to Authentication > Sign-in method
3. Enable "Email/Password" provider
4. Save changes

**Why this works:** Firebase requires explicit enabling of auth providers.

---

### Error: `auth/weak-password`

**Symptoms:**
```
FirebaseError: Firebase: Password should be at least 6 characters (auth/weak-password).
```

**Root Cause:** Firebase enforces minimum 6-character password.

**Solution:**
```typescript
// ❌ Will fail
await signUp('user@example.com', '12345');

// ✅ Works
await signUp('user@example.com', '123456');
```

**Why this works:** Firebase security requirement cannot be disabled.

---

### Error: Component doesn't update when user signs in

**Symptoms:**
- User signs in successfully (no error)
- Component still shows "unauthenticated" state
- Manually refreshing page fixes it

**Root Cause:** Component not watching signals or auth not initialized.

**Solution:**

**1. Ensure component extends `SignalWatcher`:**
```typescript
// ❌ Won't react to signal changes
export class MyComponent extends LitElement {

// ✅ Reacts to signal changes
export class MyComponent extends SignalWatcher(LitElement) {
```

**2. Ensure auth is initialized before rendering:**
```typescript
// In app entry point (e.g., index.ts or main.ts)
import {initializeAuth} from '@df/state';
import {getFirebaseApp} from '@df/firebase/app';

const app = getFirebaseApp(config);
initializeAuth(app); // Initialize BEFORE rendering components

render(html`<my-app></my-app>`, document.body);
```

**3. Access signal state correctly:**
```typescript
render() {
  // ✅ Call .get() to access current value
  const {authUser} = firebaseAuthState.get();

  // ❌ Don't access signal directly
  const authUser = firebaseAuthState.authUser; // undefined!
}
```

**Why this works:** SignalWatcher subscribes to signal changes and triggers re-renders.

---

## Firestore Errors

### Error: `firestore/permission-denied`

**Symptoms:**
```
FirebaseError: Missing or insufficient permissions. (firestore/permission-denied)
```

**Root Cause:** Firestore security rules deny the operation, or user not authenticated.

**Solution:**

**Check if user is authenticated:**
```typescript
import {isAuthenticated} from '@df/state';

if (!isAuthenticated()) {
  console.log('User must be signed in');
  // Redirect to sign-in page
}
```

**For emulator, check security rules** (`firestore.rules`):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Example: todos collection requires authentication
    match /todos/{todoId} {
      allow read, write: if request.auth != null;
    }

    // Example: user-owned data
    match /users/{userId}/documents/{docId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Test rules in Emulator UI:**
1. Open http://127.0.0.1:5400
2. Go to Firestore tab
3. Click "Rules" to see active rules
4. Use "Evaluate Rules" to test specific requests

**Why this works:** Firestore rules enforce access control even in emulator.

---

### Error: `firestore/unavailable` or connection timeout

**Symptoms:**
```
FirebaseError: The operation could not be completed. (firestore/unavailable)
```

**Root Cause:** Can't connect to Firestore (emulator not running or network issue).

**Solution:**

**1. Verify emulator is running:**
```bash
pnpm emulators:start
```

**2. Check emulator connection in code:**
```typescript
import {getFirestore, connectFirestoreEmulator} from 'firebase/firestore';

const db = getFirestore(app);

if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  } catch (error) {
    // Emulator might already be connected (ignore error)
  }
}
```

**3. Ensure `VITE_USE_EMULATOR=true` in `.env.local`**

**Why this works:** Connects to local emulator instead of production Firestore.

---

### Error: Query returns empty array when documents exist

**Symptoms:**
- Documents visible in Emulator UI
- Query returns `[]` in code
- No errors thrown

**Root Cause:** Query filters don't match, or listener not set up correctly.

**Solution:**

**1. Verify query logic:**
```typescript
// Check in Emulator UI: do documents match your query?
// Example: querying for completed todos
const q = query(
  collection(db, 'todos'),
  where('completed', '==', true)  // Double-check field name and value
);
```

**2. Use snapshot listener (not `getDocs`):**
```typescript
// ❌ One-time fetch (won't update)
const snapshot = await getDocs(q);

// ✅ Real-time listener (updates automatically)
const unsubscribe = onSnapshot(q, (snapshot) => {
  const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
  todosSignal.set(data);
});
```

**3. Check indexes (for complex queries):**
```
Error: The query requires an index.
```
Click the link in error message, or create index manually in `firestore.indexes.json`.

**Why this works:** Real-time listeners are the recommended pattern for reactive UIs.

---

### Error: Firestore writes succeed but don't trigger listener

**Symptoms:**
- `addDoc()` or `updateDoc()` succeeds (no error)
- Document appears in Emulator UI
- `onSnapshot()` listener doesn't fire with new data

**Root Cause:** Listener query doesn't match written document.

**Solution:**

**Verify listener query matches written data:**
```typescript
// Listener
const q = query(collection(db, 'todos'), where('userId', '==', currentUserId));
const unsubscribe = onSnapshot(q, handleSnapshot);

// Write operation - MUST match query
await addDoc(collection(db, 'todos'), {
  text: 'Buy milk',
  userId: currentUserId,  // ✅ Matches query filter
  completed: false,
});

// ❌ This won't trigger listener (different userId)
await addDoc(collection(db, 'todos'), {
  text: 'Buy milk',
  userId: 'different-user',  // Won't match query
});
```

**Why this works:** Listener only fires for documents matching its query.

---

## Storage Errors

### Error: `storage/unauthorized` or `storage/unauthenticated`

**Symptoms:**
```
FirebaseError: User does not have permission to access 'uploads/file.jpg'. (storage/unauthorized)
```

**Root Cause:** Storage security rules deny access, or user not authenticated.

**Solution:**

**Check authentication:**
```typescript
import {isAuthenticated} from '@df/state';

if (!isAuthenticated()) {
  console.error('User must sign in before uploading');
}
```

**Check storage rules** (`storage.rules`):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Public read, authenticated write
    match /uploads/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // User-owned files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Test in emulator:**
1. Open http://127.0.0.1:5400
2. Go to Storage tab
3. Check "Rules" to see active rules

**Why this works:** Storage rules control file access just like Firestore rules.

---

### Error: Upload fails silently (no progress, no error)

**Symptoms:**
- File selected
- Upload doesn't start
- No error message shown

**Root Cause:** Missing event handlers on upload task, or file validation failing silently.

**Solution:**

**Use proper upload task pattern:**
```typescript
import {uploadBytesResumable} from 'firebase/storage';

const uploadTask = uploadBytesResumable(storageRef, file);

uploadTask.on(
  'state_changed',
  (snapshot) => {
    // Progress
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
  },
  (error) => {
    // Error handler - DON'T SKIP THIS
    console.error('Upload error:', error);
    errorSignal.set(error.message);
  },
  async () => {
    // Success handler
    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
    console.log('File available at', downloadURL);
  }
);
```

**Add file validation:**
```typescript
function validateFile(file: File): {valid: boolean; error?: string} {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  if (file.size > maxSize) {
    return {valid: false, error: 'File exceeds 10MB limit'};
  }

  if (!allowedTypes.includes(file.type)) {
    return {valid: false, error: `File type ${file.type} not allowed`};
  }

  return {valid: true};
}

// Before upload
const validation = validateFile(file);
if (!validation.valid) {
  console.error(validation.error);
  return;
}
```

**Why this works:** Proper error handling reveals silent failures.

---

### Error: `storage/object-not-found`

**Symptoms:**
```
FirebaseError: Object 'uploads/file.jpg' does not exist. (storage/object-not-found)
```

**Root Cause:** File doesn't exist at specified path, or path is incorrect.

**Solution:**

**1. Verify file was uploaded:**
- Open http://127.0.0.1:5400
- Go to Storage tab
- Browse to see actual file paths

**2. Check path matches exactly:**
```typescript
// Upload
const uploadPath = `uploads/${file.name}`;
await uploadFile(uploadPath, file);

// Download - MUST match upload path exactly
const downloadURL = await getFileDownloadURL(`uploads/${file.name}`);
//                                            ^^^^^^^^^^^^^^^^^^^
// Case-sensitive, no leading/trailing slashes
```

**3. Don't include leading slash:**
```typescript
// ❌ Wrong
const path = '/uploads/file.jpg';

// ✅ Correct
const path = 'uploads/file.jpg';
```

**Why this works:** Storage paths are case-sensitive and slash-sensitive.

---

## Cloud Functions Errors

### Error: `functions/internal` or `functions/unavailable`

**Symptoms:**
```
FirebaseError: INTERNAL (functions/internal)
```

**Root Cause:** Function crashed, or emulator not running.

**Solution:**

**1. Check emulator logs:**
```bash
# Emulator output shows function errors
pnpm emulators:start

# Look for stack traces in output
```

**2. Check function exists:**
```bash
# In functions directory
cd apps/df-firebase-teaching-app5/functions
ls -la src/

# Ensure function is exported in index.ts
cat src/index.ts
```

**3. Rebuild functions:**
```bash
cd apps/df-firebase-teaching-app5/functions
pnpm build

# Restart emulators
pnpm --filter @df/df-firebase-teaching-app5 emulators:start
```

**Why this works:** Functions must be built before emulator can run them.

---

### Error: Function triggers don't fire

**Symptoms:**
- Document written to Firestore
- Corresponding Firestore trigger function doesn't execute
- No errors shown

**Root Cause:** Trigger path doesn't match document path, or function not deployed to emulator.

**Solution:**

**1. Verify trigger path matches document path:**
```typescript
// Function definition
export const onTodoCreated = onDocumentCreated('todos/{todoId}', async (event) => {
  // ...
});

// Document write - MUST write to 'todos' collection
await addDoc(collection(db, 'todos'), {text: 'Test'});
//                         ^^^^^
// Must match function path
```

**2. Check emulator output for function registration:**
```
✔  functions: onCreate(todos/{todoId})
   http://127.0.0.1:5001/...
```

**3. Check function is exported:**
```typescript
// functions/src/index.ts
export {onTodoCreated} from './todos';  // ✅ Must be exported
```

**Why this works:** Functions must be exported and paths must match exactly.

---

## Signals & Reactivity Issues

### Error: Component doesn't re-render when signal changes

**Symptoms:**
- Signal value updates (verified with `console.log`)
- Component UI doesn't update
- Manual page refresh shows new data

**Root Cause:** Component not extending `SignalWatcher`.

**Solution:**
```typescript
import {SignalWatcher} from '@lit-labs/signals';

// ❌ Won't react to signals
export class MyComponent extends LitElement {

// ✅ Reacts to signal changes
export class MyComponent extends SignalWatcher(LitElement) {
  render() {
    const {data} = mySignalState.get();  // Auto-subscribes
    return html`<p>${data}</p>`;
  }
}
```

**Why this works:** `SignalWatcher` mixin subscribes component to signal changes.

---

### Error: `signal.get() is not a function`

**Symptoms:**
```
TypeError: signal.get is not a function
```

**Root Cause:** Trying to access signal value without calling `.get()`.

**Solution:**
```typescript
import {signal, computed} from '@lit-labs/signals';

const countSignal = signal(0);

// ❌ Wrong
const value = countSignal.value;     // undefined
const value = countSignal;            // Returns signal object

// ✅ Correct
const value = countSignal.get();      // 0

// For computed signals
const doubleCount = computed(() => countSignal.get() * 2);
const value = doubleCount.get();      // Returns computed value
```

**Why this works:** Signals use `.get()` method to access current value.

---

## Build & TypeScript Errors

### Error: `Cannot find name 'signal'` or `'computed'`

**Symptoms:**
```
TS2304: Cannot find name 'signal'.
```

**Root Cause:** Missing import from `@lit-labs/signals`.

**Solution:**
```typescript
// ✅ Add this import
import {signal, computed} from '@lit-labs/signals';

const mySignal = signal(initialValue);
const myComputed = computed(() => mySignal.get() * 2);
```

**Why this works:** TypeScript needs explicit imports for signals.

---

### Error: Lit decorators not working (`@customElement`, `@property`, etc.)

**Symptoms:**
```
Component not registered
  or
Decorators are not valid here
```

**Root Cause:** TypeScript `experimentalDecorators` not enabled.

**Solution:**

Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false  // Important for Lit!
  }
}
```

**Why this works:** Lit uses TypeScript decorators for reactivity.

---

## Testing Issues

### Error: Tests fail with `Auth not initialized`

**Symptoms:**
```
Error: Auth not initialized
  at signIn (firebase-auth.store.ts:45)
```

**Root Cause:** Store tests call functions without initializing auth first.

**Solution:**
```typescript
import {describe, it, beforeEach, vi} from 'vitest';
import {initializeAuth, signIn} from '../firebase-auth.store';

// Mock Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({} as any)),
  onAuthStateChanged: vi.fn((auth, cb) => {
    cb(null);
    return vi.fn();
  }),
  signInWithEmailAndPassword: vi.fn(),
}));

describe('Auth Store', () => {
  beforeEach(() => {
    const mockApp = {name: '[DEFAULT]'} as any;
    initializeAuth(mockApp);  // ✅ Initialize before each test
  });

  it('should sign in', async () => {
    await signIn('test@example.com', 'password123');
  });
});
```

**Why this works:** Stores need initialization even in tests.

---

### Error: `TypeError: vi.mock is not a function`

**Symptoms:**
```
TypeError: vi.mock is not a function
```

**Root Cause:** Vitest not configured, or using wrong test runner.

**Solution:**

**1. Install Vitest:**
```bash
pnpm add -D vitest @vitest/ui @vitest/coverage-v8 happy-dom
```

**2. Create `vitest.config.ts`:**
```typescript
import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
  },
});
```

**3. Update package.json scripts:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**Why this works:** Vitest provides `vi` mock utilities.

---

## Getting More Help

If your issue isn't covered here:

1. **Check Emulator UI Logs:**
   - http://127.0.0.1:5400
   - Check Logs tab for detailed error messages

2. **Check Browser Console:**
   - Press F12 → Console tab
   - Look for Firebase SDK error messages

3. **Check Emulator Terminal Output:**
   - Firebase functions errors appear here
   - Security rules evaluation logs

4. **Enable Firebase Debug Logging:**
```typescript
import {setLogLevel} from 'firebase/app';
setLogLevel('debug');
```

5. **Review Documentation:**
   - [Migration Guide](./MIGRATION_GUIDE.md) - For pattern questions
   - [Authentication Patterns](../AUTHENTICATION_PATTERNS.md) - Auth-specific help
   - [Firestore Patterns](../FIRESTORE_PATTERNS.md) - Query help
   - [Firebase Cookbook](./FIREBASE_COOKBOOK.md) - Code examples

6. **Ask for Help:**
   - Open an issue in the teaching app repo
   - Include: error message, code snippet, what you've tried
   - Mention which emulator service (Auth/Firestore/Storage/Functions)

---

## Quick Reference: Common Commands

```bash
# Start emulators
pnpm --filter @df/df-firebase-teaching-app5 emulators:start

# Seed emulator data
pnpm --filter @df/firebase-emulator seed:all

# Run tests
pnpm --filter @df/state test

# Build packages
pnpm build

# Clean install
rm -rf node_modules pnpm-lock.yaml && pnpm install

# Kill process on port
kill -9 $(lsof -ti:8080)
```

---

**Last Updated:** 2025-10-14
**Maintained by:** Firebase Teaching App Contributors
