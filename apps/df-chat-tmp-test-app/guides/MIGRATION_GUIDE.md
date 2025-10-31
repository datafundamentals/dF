# Migration Guide: Adopting Teaching App Patterns

**Last Updated:** 2025-10-14
**Target Audience:** Developers migrating existing Firebase apps to signals-first architecture
**Difficulty:** Intermediate

## Overview

This guide helps you migrate existing Firebase code to the patterns demonstrated in this teaching app. Whether you're upgrading from older Firebase SDKs, converting from other state management systems, or refactoring legacy code, this guide provides step-by-step migration paths.

## What's Different?

### Architecture Changes

| Aspect | Legacy Pattern | Teaching App Pattern |
|--------|----------------|---------------------|
| **State Management** | Props, context, Redux | Signals (`@lit-labs/signals`) |
| **Firebase SDK** | Compat API (v8 or earlier) | Modular API (v11+) |
| **Component Logic** | Business logic in components | Presentation-only components |
| **Data Flow** | Props drilling, callbacks | Signal subscriptions |
| **Testing** | Emulator-dependent | Unit tests with mocks + emulator tests |

### Key Benefits

✅ **12.5x faster rendering** (signals vs traditional re-rendering)
✅ **Simpler component code** (no state management boilerplate)
✅ **Better testability** (business logic isolated from UI)
✅ **Easier debugging** (centralized state in stores)
✅ **Type safety** (TypeScript throughout)

---

## Migration Path

### Phase 1: Set Up Infrastructure (1-2 hours)

#### 1.1 Install Dependencies

```bash
# Add signals support
pnpm add @lit-labs/signals

# Update to Firebase SDK v11
pnpm add firebase@^11.5.0

# Optional: Add teaching app packages if in monorepo
pnpm add @df/state @df/ui-lit @df/types
```

#### 1.2 Configure TypeScript

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

#### 1.3 Set Up Firebase Emulator (Recommended)

```bash
# Install Firebase tools
pnpm add -D firebase-tools

# Initialize emulators
firebase init emulators

# Select: Auth, Firestore, Storage, Functions
```

**Emulator configuration** (`firebase.json`):
```json
{
  "emulators": {
    "auth": {"port": 9155},
    "firestore": {"port": 8080},
    "storage": {"port": 9199},
    "functions": {"port": 5001},
    "ui": {"enabled": true, "port": 5400}
  }
}
```

---

### Phase 2: Migrate Firebase Initialization (1 hour)

#### Before: Legacy Initialization

```typescript
// ❌ Old way (Firebase v8 compat API)
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const config = { /* ... */ };
firebase.initializeApp(config);

const auth = firebase.auth();
const db = firebase.firestore();
```

#### After: Modular API + Emulator Support

```typescript
// ✅ New way (Firebase v11 modular API)
import {initializeApp} from 'firebase/app';
import {getAuth, connectAuthEmulator} from 'firebase/auth';
import {getFirestore, connectFirestoreEmulator} from 'firebase/firestore';
import {getStorage, connectStorageEmulator} from 'firebase/storage';

// Centralized config
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(config);

// Connect to emulators in development
const USE_EMULATOR = import.meta.env.VITE_USE_EMULATOR === 'true';

if (USE_EMULATOR) {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  connectAuthEmulator(auth, 'http://127.0.0.1:9155', {disableWarnings: true});
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

export {app};
```

**Environment variables** (`.env.local`):
```bash
VITE_USE_EMULATOR=true
VITE_FIREBASE_API_KEY=demo-key
VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=demo-project
# ... etc
```

---

### Phase 3: Migrate Authentication (2-3 hours)

#### 3.1 Create Auth Store

**File:** `src/stores/firebase-auth.store.ts`

```typescript
import {signal, computed} from '@lit-labs/signals';
import {getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, type User} from 'firebase/auth';
import {app} from '../firebase-config';

// Signals
const authUserSignal = signal<User | null>(null);
const authStateSignal = signal<'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'>('idle');
const errorSignal = signal<string | null>(null);
const initializedSignal = signal(false);

// Computed state
export const firebaseAuthState = computed(() => ({
  authUser: authUserSignal.get(),
  authState: authStateSignal.get(),
  error: errorSignal.get(),
  initialized: initializedSignal.get(),
}));

// Initialize auth listener
let auth: ReturnType<typeof getAuth> | null = null;
let unsubscribe: (() => void) | null = null;

export function initializeAuth() {
  if (unsubscribe) return; // Already initialized

  auth = getAuth(app);

  unsubscribe = onAuthStateChanged(auth, (user) => {
    authUserSignal.set(user);
    authStateSignal.set(user ? 'authenticated' : 'unauthenticated');
    initializedSignal.set(true);
  });
}

// Action functions
export async function signIn(email: string, password: string) {
  if (!auth) throw new Error('Auth not initialized');

  authStateSignal.set('loading');
  errorSignal.set(null);

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    authUserSignal.set(credential.user);
    authStateSignal.set('authenticated');
    return credential.user;
  } catch (error: any) {
    authStateSignal.set('error');
    errorSignal.set(error.message);
    throw error;
  }
}

export async function signUp(email: string, password: string) {
  if (!auth) throw new Error('Auth not initialized');

  authStateSignal.set('loading');
  errorSignal.set(null);

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    authUserSignal.set(credential.user);
    authStateSignal.set('authenticated');
    return credential.user;
  } catch (error: any) {
    authStateSignal.set('error');
    errorSignal.set(error.message);
    throw error;
  }
}

export async function signOut() {
  if (!auth) throw new Error('Auth not initialized');

  await firebaseSignOut(auth);
  authUserSignal.set(null);
  authStateSignal.set('unauthenticated');
}

// Convenience helpers
export const getCurrentAuthUser = () => authUserSignal.get();
export const isAuthenticated = () => authStateSignal.get() === 'authenticated';
export const isAuthLoading = () => authStateSignal.get() === 'loading';
```

#### 3.2 Migrate Component from Context/Props to Signals

**Before: Context-based Auth Component**

```typescript
// ❌ Old way: Props drilling, context, callbacks
import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';

@customElement('old-auth-component')
export class OldAuthComponent extends LitElement {
  @property({type: Object}) user: any = null;
  @property({type: Boolean}) loading = false;
  @property({type: String}) error = '';

  // Passed down as props
  @property({type: Function}) onSignIn?: (email: string, password: string) => void;

  private handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    this.onSignIn?.(email, password);
  }

  render() {
    if (this.loading) return html`<p>Loading...</p>`;
    if (this.user) return html`<p>Welcome, ${this.user.email}</p>`;

    return html`
      <form @submit=${this.handleSubmit}>
        <input name="email" type="email" required />
        <input name="password" type="password" required />
        <button type="submit">Sign In</button>
        ${this.error ? html`<p class="error">${this.error}</p>` : ''}
      </form>
    `;
  }
}
```

**After: Signals-based Auth Component**

```typescript
// ✅ New way: SignalWatcher, direct store access, no props
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState, signIn} from '../stores/firebase-auth.store';

@customElement('new-auth-component')
export class NewAuthComponent extends SignalWatcher(LitElement) {
  // No @property decorators needed!

  private async handleSubmit(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    try {
      await signIn(email, password);
      // Component automatically re-renders when signal updates
    } catch (error) {
      // Error already in store, component will show it
    }
  }

  render() {
    // Access state directly from signal
    const {authUser, authState, error} = firebaseAuthState.get();

    if (authState === 'loading') return html`<p>Loading...</p>`;
    if (authUser) return html`<p>Welcome, ${authUser.email}</p>`;

    return html`
      <form @submit=${this.handleSubmit}>
        <input name="email" type="email" required />
        <input name="password" type="password" required />
        <button type="submit">Sign In</button>
        ${error ? html`<p class="error">${error}</p>` : ''}
      </form>
    `;
  }
}
```

**Key Changes:**
- ✅ Extend `SignalWatcher(LitElement)` instead of `LitElement`
- ✅ No `@property` decorators needed
- ✅ No props passed from parent components
- ✅ Call `firebaseAuthState.get()` to access current state
- ✅ Component auto-re-renders when signals change

---

### Phase 4: Migrate Firestore Queries (2-3 hours)

#### 4.1 Before: Direct Firestore Access in Components

```typescript
// ❌ Old way: Firestore logic in component
import {collection, query, onSnapshot, addDoc} from 'firebase/firestore';

@customElement('todo-list')
export class TodoList extends LitElement {
  @state() private todos: any[] = [];
  @state() private loading = true;

  private unsubscribe?: () => void;

  connectedCallback() {
    super.connectedCallback();

    const db = getFirestore();
    const q = query(collection(db, 'todos'));

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      this.todos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      this.loading = false;
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
  }

  private async addTodo(text: string) {
    const db = getFirestore();
    await addDoc(collection(db, 'todos'), {text, completed: false});
  }

  render() {
    if (this.loading) return html`<p>Loading...</p>`;
    return html`
      <ul>
        ${this.todos.map(todo => html`<li>${todo.text}</li>`)}
      </ul>
    `;
  }
}
```

#### 4.2 After: Firestore Store with Signals

**File:** `src/stores/todos.store.ts`

```typescript
import {signal, computed} from '@lit-labs/signals';
import {getFirestore, collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc} from 'firebase/firestore';
import {app} from '../firebase-config';
import type {Todo} from '../types';

// Signals
const todosSignal = signal<Todo[]>([]);
const loadingSignal = signal(true);
const errorSignal = signal<string | null>(null);

// Computed state
export const todosState = computed(() => ({
  todos: todosSignal.get(),
  loading: loadingSignal.get(),
  error: errorSignal.get(),
}));

// Initialize listener
let unsubscribe: (() => void) | null = null;

export function initializeTodosListener() {
  if (unsubscribe) return; // Already listening

  const db = getFirestore(app);
  const q = query(collection(db, 'todos'));

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      todosSignal.set(
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Todo))
      );
      loadingSignal.set(false);
      errorSignal.set(null);
    },
    (error) => {
      errorSignal.set(error.message);
      loadingSignal.set(false);
    }
  );
}

export function cleanupTodosListener() {
  unsubscribe?.();
  unsubscribe = null;
  todosSignal.set([]);
  loadingSignal.set(true);
  errorSignal.set(null);
}

// Action functions
export async function addTodo(text: string) {
  const db = getFirestore(app);
  await addDoc(collection(db, 'todos'), {
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  });
}

export async function toggleTodo(id: string, completed: boolean) {
  const db = getFirestore(app);
  await updateDoc(doc(db, 'todos', id), {completed});
}

export async function deleteTodo(id: string) {
  const db = getFirestore(app);
  await deleteDoc(doc(db, 'todos', id));
}
```

**Component using the store:**

```typescript
// ✅ New way: Clean presentation component
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {todosState, initializeTodosListener, cleanupTodosListener, addTodo, toggleTodo, deleteTodo} from '../stores/todos.store';

@customElement('todo-list')
export class TodoList extends SignalWatcher(LitElement) {
  connectedCallback() {
    super.connectedCallback();
    initializeTodosListener();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    cleanupTodosListener();
  }

  private async handleAdd(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem('text') as HTMLInputElement;

    await addTodo(input.value);
    form.reset();
  }

  render() {
    const {todos, loading, error} = todosState.get();

    if (loading) return html`<p>Loading...</p>`;
    if (error) return html`<p class="error">${error}</p>`;

    return html`
      <form @submit=${this.handleAdd}>
        <input name="text" required />
        <button type="submit">Add</button>
      </form>

      <ul>
        ${todos.map(todo => html`
          <li>
            <input
              type="checkbox"
              .checked=${todo.completed}
              @change=${() => toggleTodo(todo.id, !todo.completed)}
            />
            <span>${todo.text}</span>
            <button @click=${() => deleteTodo(todo.id)}>Delete</button>
          </li>
        `)}
      </ul>
    `;
  }
}
```

**Benefits:**
- ✅ Component is 50% smaller
- ✅ Business logic testable without rendering components
- ✅ State shared across multiple components automatically
- ✅ Easier to add features (filters, sorting, etc.) in store

---

### Phase 5: Migrate Storage Operations (1-2 hours)

#### Before: Direct Storage Access

```typescript
// ❌ Old way
import {getStorage, ref, uploadBytes, getDownloadURL} from 'firebase/storage';

@customElement('file-upload')
export class FileUpload extends LitElement {
  @state() private uploading = false;
  @state() private progress = 0;
  @state() private downloadURL = '';

  private async handleUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading = true;

    const storage = getStorage();
    const storageRef = ref(storage, `uploads/${file.name}`);

    await uploadBytes(storageRef, file);
    this.downloadURL = await getDownloadURL(storageRef);

    this.uploading = false;
  }
}
```

#### After: Storage Store Pattern

**File:** `src/stores/storage.store.ts`

```typescript
import {signal, computed} from '@lit-labs/signals';
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from 'firebase/storage';
import {app} from '../firebase-config';

const uploadingSignal = signal(false);
const progressSignal = signal(0);
const errorSignal = signal<string | null>(null);
const downloadURLSignal = signal<string | null>(null);

export const storageUploadState = computed(() => ({
  uploading: uploadingSignal.get(),
  progress: progressSignal.get(),
  error: errorSignal.get(),
  downloadURL: downloadURLSignal.get(),
}));

export async function uploadFile(path: string, file: File): Promise<string> {
  uploadingSignal.set(true);
  progressSignal.set(0);
  errorSignal.set(null);

  const storage = getStorage(app);
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        progressSignal.set(progress);
      },
      (error) => {
        errorSignal.set(error.message);
        uploadingSignal.set(false);
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        downloadURLSignal.set(downloadURL);
        uploadingSignal.set(false);
        progressSignal.set(100);
        resolve(downloadURL);
      }
    );
  });
}

export function resetUploadState() {
  uploadingSignal.set(false);
  progressSignal.set(0);
  errorSignal.set(null);
  downloadURLSignal.set(null);
}
```

**Component:**

```typescript
// ✅ Clean component with store
import {SignalWatcher} from '@lit-labs/signals';
import {storageUploadState, uploadFile, resetUploadState} from '../stores/storage.store';

@customElement('file-upload')
export class FileUpload extends SignalWatcher(LitElement) {
  private async handleUpload(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    try {
      await uploadFile(`uploads/${file.name}`, file);
      // Success!
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  render() {
    const {uploading, progress, error, downloadURL} = storageUploadState.get();

    return html`
      <input type="file" @change=${this.handleUpload} ?disabled=${uploading} />

      ${uploading ? html`
        <progress value=${progress} max="100"></progress>
        <p>${Math.round(progress)}%</p>
      ` : ''}

      ${error ? html`<p class="error">${error}</p>` : ''}
      ${downloadURL ? html`<a href=${downloadURL}>Download</a>` : ''}
    `;
  }
}
```

---

## Testing Your Migrated Code

### Unit Tests with Mocks

**Before migration:** Tests required running Firebase emulator

**After migration:** Tests can mock Firebase SDK functions

```typescript
// Test example for auth store
import {describe, it, expect, beforeEach, vi} from 'vitest';
import {signIn, firebaseAuthState} from './firebase-auth.store';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({} as any)),
  signInWithEmailAndPassword: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null); // Start unauthenticated
    return vi.fn(); // Unsubscribe function
  }),
}));

import {signInWithEmailAndPassword} from 'firebase/auth';

describe('firebase-auth.store', () => {
  it('should sign in user', async () => {
    const mockUser = {uid: '123', email: 'test@example.com'};
    (signInWithEmailAndPassword as any).mockResolvedValue({user: mockUser});

    await signIn('test@example.com', 'password123');

    const state = firebaseAuthState.get();
    expect(state.authState).toBe('authenticated');
    expect(state.authUser).toEqual(mockUser);
  });
});
```

**Benefits:**
- ✅ Tests run in milliseconds (no emulator startup)
- ✅ More reliable (no network flakiness)
- ✅ Easier CI/CD integration

---

## Common Migration Challenges

### Challenge 1: "My component doesn't re-render when signal changes"

**Solution:** Ensure you're extending `SignalWatcher(LitElement)`:

```typescript
// ❌ Won't work
export class MyComponent extends LitElement {

// ✅ Works
export class MyComponent extends SignalWatcher(LitElement) {
```

### Challenge 2: "I'm getting 'Cannot read property of undefined' from Firebase"

**Solution:** Initialize stores before rendering components:

```typescript
// In your app's entry point (e.g., index.ts)
import {initializeAuth} from './stores/firebase-auth.store';
import {initializeTodosListener} from './stores/todos.store';

// Initialize Firebase and stores
const app = initializeApp(config);
initializeAuth();
initializeTodosListener();

// THEN render your app
render(html`<my-app></my-app>`, document.body);
```

### Challenge 3: "Signals update too frequently / performance issues"

**Solution:** Use `computed()` to derive state instead of setting signals in loops:

```typescript
// ❌ Bad: Setting signal in a map
todos.map(todo => {
  completedCountSignal.set(completedCountSignal.get() + (todo.completed ? 1 : 0));
});

// ✅ Good: Use computed
const completedCount = computed(() => {
  return todosSignal.get().filter(t => t.completed).length;
});
```

### Challenge 4: "How do I handle route guards?"

**Solution:** Create an auth guard helper:

```typescript
// src/utils/auth-guard.ts
import {firebaseAuthState} from '../stores/firebase-auth.store';

export function requireAuth(onUnauthorized?: () => void) {
  return function <T>(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const {authState} = firebaseAuthState.get();

      if (authState !== 'authenticated') {
        onUnauthorized?.();
        return null;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Usage
@customElement('protected-page')
export class ProtectedPage extends SignalWatcher(LitElement) {
  @requireAuth(() => window.location.href = '/login')
  async connectedCallback() {
    super.connectedCallback();
    // This only runs if user is authenticated
  }
}
```

---

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] Phase 1: Infrastructure
  - [ ] Install `@lit-labs/signals` and Firebase v11
  - [ ] Update `tsconfig.json` configuration
  - [ ] Set up Firebase emulators (optional but recommended)
  - [ ] Configure environment variables

- [ ] Phase 2: Firebase Initialization
  - [ ] Convert to modular API (`getAuth`, `getFirestore`, etc.)
  - [ ] Add emulator connection logic
  - [ ] Test that emulator connection works

- [ ] Phase 3: Authentication Migration
  - [ ] Create `firebase-auth.store.ts`
  - [ ] Convert auth components to `SignalWatcher`
  - [ ] Remove `@property` decorators from auth state
  - [ ] Test sign-in, sign-up, sign-out flows

- [ ] Phase 4: Firestore Migration
  - [ ] Create store files for each collection
  - [ ] Move Firestore queries to stores
  - [ ] Convert components to use signals
  - [ ] Test CRUD operations

- [ ] Phase 5: Storage Migration
  - [ ] Create `storage.store.ts`
  - [ ] Migrate upload/download logic
  - [ ] Test file uploads with progress tracking

- [ ] Phase 6: Testing
  - [ ] Set up Vitest with `@vitest/coverage-v8`
  - [ ] Write unit tests for stores (mock Firebase SDK)
  - [ ] Write integration tests with emulator (optional)
  - [ ] Verify coverage meets your targets

- [ ] Phase 7: Cleanup
  - [ ] Remove old context providers
  - [ ] Delete unused prop drilling code
  - [ ] Update documentation
  - [ ] Celebrate! 🎉

---

## Getting Help

**Resources:**
- [Signals Documentation](https://github.com/lit/lit/tree/main/packages/labs/signals)
- [Firebase Modular API Guide](https://firebase.google.com/docs/web/modular-upgrade)
- [Teaching App Pattern Guides](./README.md)

**Common Issues:**
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for Firebase-specific errors
- See [AUTHENTICATION_PATTERNS.md](../AUTHENTICATION_PATTERNS.md) for auth patterns
- Review [FIRESTORE_PATTERNS.md](../FIRESTORE_PATTERNS.md) for query patterns

**Still stuck?** Open an issue in the teaching app repository with:
1. Code snippet showing the problem
2. Expected vs actual behavior
3. Error messages (if any)

---

## Next Steps

After completing this migration:

1. **Optimize Performance:** Read [PERFORMANCE_PATTERNS.md](./PERFORMANCE_PATTERNS.md)
2. **Learn Advanced Patterns:** Check [COMPOSITE_PATTERNS.md](./COMPOSITE_PATTERNS.md)
3. **Copy-Paste Code:** Use [FIREBASE_COOKBOOK.md](./FIREBASE_COOKBOOK.md)
4. **Add Testing:** Follow examples in `packages/state/src/stores/__tests__/`

**Estimated Total Migration Time:** 8-15 hours for a medium-sized app

Good luck with your migration! 🚀
