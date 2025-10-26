# Firebase Cookbook

**Copy-paste ready code examples for common Firebase patterns**

This cookbook provides production-ready code snippets you can copy directly into your Firebase applications. Each recipe is tested, follows best practices, and includes inline comments explaining key concepts.

## 📖 How This Relates to Other Guides

**Cookbook vs. Pattern Guides:**
- **This Cookbook** → Focuses on **ready-to-use code** you can copy/paste and adapt for your app
- **[Composite Patterns](./COMPOSITE_PATTERNS.md)** → Explains **why and when** to coordinate multiple Firebase services
- **[Performance Patterns](./PERFORMANCE_PATTERNS.md)** → Explains **optimization strategies** with benchmarks and anti-patterns

**Recommended workflow:**
1. Read the pattern guides to understand the architecture and decision-making
2. Return to this cookbook when you need to implement those patterns
3. Copy the relevant code and adapt it to your use case

**Example:** Want to add user-owned data to your app?
- Read [Composite Patterns → User-Owned Data](./COMPOSITE_PATTERNS.md#user-owned-data-auth--firestore) to understand the pattern
- Then grab code from [this cookbook's User-Owned Data recipe](#user-owned-data-auth--firestore) to implement it

---

## Table of Contents

1. [User-Owned Data (Auth + Firestore)](#user-owned-data-auth--firestore)
2. [File Upload with Metadata (Storage + Firestore)](#file-upload-with-metadata-storage--firestore)
3. [Paginated List with Filters](#paginated-list-with-filters)
4. [Filtered Real-Time Updates](#filtered-real-time-updates)
5. [Offline-First CRUD Operations](#offline-first-crud-operations)
6. [Batch Operations](#batch-operations)
7. [Optimistic Updates with Rollback](#optimistic-updates-with-rollback)

---

## User-Owned Data (Auth + Firestore)

**Pattern:** Store data scoped to authenticated users, ensuring each user only sees their own data.

**Security Rules:**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User-owned todos collection
    match /users/{userId}/todos/{todoId} {
      // Users can only access their own todos
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Store Implementation:**
```typescript
import {signal, computed} from '@lit-labs/signals';
import {getAuth, onAuthStateChanged, type User} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  type CollectionReference,
} from 'firebase/firestore';
import type {FirebaseApp} from 'firebase/app';

// Type definitions
interface UserTodo {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

// Signals
const currentUserSignal = signal<User | null>(null);
const userTodosSignal = signal<UserTodo[]>([]);

// Computed values
export const isAuthenticated = computed(() => currentUserSignal.get() !== null);
export const userTodos = computed(() => userTodosSignal.get());

// Initialize auth listener
export function initUserAuth(app: FirebaseApp): void {
  const auth = getAuth(app);
  
  onAuthStateChanged(auth, (user) => {
    currentUserSignal.set(user);
    
    if (user) {
      // Load user's todos when they sign in
      void loadUserTodos(app, user.uid);
    } else {
      // Clear todos when user signs out
      userTodosSignal.set([]);
    }
  });
}

// CRUD operations - all scoped to current user
async function loadUserTodos(app: FirebaseApp, userId: string): Promise<void> {
  const db = getFirestore(app);
  const todosRef = collection(db, `users/${userId}/todos`);
  const q = query(todosRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  const todos = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as UserTodo[];
  
  userTodosSignal.set(todos);
}

export async function createUserTodo(
  app: FirebaseApp,
  title: string
): Promise<string> {
  const user = currentUserSignal.get();
  if (!user) throw new Error('User must be authenticated');
  
  const db = getFirestore(app);
  const todosRef = collection(db, `users/${user.uid}/todos`);
  
  const docRef = await addDoc(todosRef, {
    userId: user.uid,
    title,
    completed: false,
    createdAt: new Date(),
  });
  
  // Reload to update UI
  await loadUserTodos(app, user.uid);
  return docRef.id;
}

export async function updateUserTodo(
  app: FirebaseApp,
  todoId: string,
  updates: Partial<Omit<UserTodo, 'id' | 'userId'>>
): Promise<void> {
  const user = currentUserSignal.get();
  if (!user) throw new Error('User must be authenticated');
  
  const db = getFirestore(app);
  const todoRef = doc(db, `users/${user.uid}/todos/${todoId}`);
  
  await updateDoc(todoRef, updates);
  await loadUserTodos(app, user.uid);
}

export async function deleteUserTodo(
  app: FirebaseApp,
  todoId: string
): Promise<void> {
  const user = currentUserSignal.get();
  if (!user) throw new Error('User must be authenticated');
  
  const db = getFirestore(app);
  const todoRef = doc(db, `users/${user.uid}/todos/${todoId}`);
  
  await deleteDoc(todoRef);
  await loadUserTodos(app, user.uid);
}
```

**Key Benefits:**
- ✅ Data automatically scoped to user (no accidental cross-user access)
- ✅ Security rules enforce server-side access control
- ✅ Auth state changes automatically trigger data reload/clear
- ✅ Simple path structure: `users/{userId}/todos/{todoId}`

---

## File Upload with Metadata (Storage + Firestore)

**Pattern:** Upload files to Storage, store metadata in Firestore, and keep them in sync.

```typescript
import {signal} from '@lit-labs/signals';
import {getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject} from 'firebase/storage';
import {getFirestore, collection, addDoc, deleteDoc, doc, serverTimestamp} from 'firebase/firestore';
import type {FirebaseApp} from 'firebase/app';

interface FileMetadata {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
  storageUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface UploadProgress {
  fileName: string;
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
}

const uploadProgressSignal = signal<UploadProgress | null>(null);
export const uploadProgress = uploadProgressSignal.get.bind(uploadProgressSignal);

/**
 * Upload file to Storage and create Firestore metadata record
 * Returns the Firestore document ID
 */
export async function uploadFileWithMetadata(
  app: FirebaseApp,
  file: File,
  userId: string,
  folderPath: string = 'uploads'
): Promise<string> {
  const storage = getStorage(app);
  const db = getFirestore(app);
  
  // Step 1: Upload file to Storage
  const fileName = `${Date.now()}-${file.name}`;
  const storageRef = ref(storage, `${folderPath}/${userId}/${fileName}`);
  const uploadTask = uploadBytesResumable(storageRef, file);
  
  // Track upload progress
  uploadTask.on('state_changed', (snapshot) => {
    const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    uploadProgressSignal.set({
      fileName: file.name,
      bytesTransferred: snapshot.bytesTransferred,
      totalBytes: snapshot.totalBytes,
      percent,
    });
  });
  
  // Wait for upload to complete
  const snapshot = await uploadTask;
  const downloadUrl = await getDownloadURL(snapshot.ref);
  
  // Step 2: Create Firestore metadata document
  const metadataRef = collection(db, 'file_metadata');
  const metadataDoc = await addDoc(metadataRef, {
    fileName: file.name,
    contentType: file.type,
    size: file.size,
    storageUrl: downloadUrl,
    storagePath: snapshot.ref.fullPath, // For deletion later
    uploadedBy: userId,
    uploadedAt: serverTimestamp(),
  });
  
  // Clear progress
  uploadProgressSignal.set(null);
  
  return metadataDoc.id;
}

/**
 * Delete file from Storage AND Firestore metadata
 * IMPORTANT: Always delete both to prevent orphaned data
 */
export async function deleteFileWithMetadata(
  app: FirebaseApp,
  metadataId: string,
  storagePath: string
): Promise<void> {
  const storage = getStorage(app);
  const db = getFirestore(app);
  
  try {
    // Step 1: Delete from Storage
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
    
    // Step 2: Delete Firestore metadata
    const metadataRef = doc(db, 'file_metadata', metadataId);
    await deleteDoc(metadataRef);
    
  } catch (error) {
    console.error('Error deleting file:', error);
    // Consider adding cleanup logic here (e.g., mark metadata as "orphaned")
    throw error;
  }
}

/**
 * UI Component Example: File Upload with Progress
 */
import {LitElement, html, css} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';

@customElement('file-upload-demo')
export class FileUploadDemo extends SignalWatcher(LitElement) {
  @state() private uploading = false;
  
  override render() {
    const progress = uploadProgress();
    
    return html`
      <input
        type="file"
        @change=${this.handleFileSelect}
        ?disabled=${this.uploading}
      />
      
      ${progress ? html`
        <div class="progress">
          <div class="progress-bar" style="width: ${progress.percent}%"></div>
          <span>${Math.round(progress.percent)}% - ${progress.fileName}</span>
        </div>
      ` : ''}
    `;
  }
  
  private async handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    
    this.uploading = true;
    
    try {
      // Get app and userId from your app state
      const app = getFirebaseApp();
      const userId = getCurrentUserId();
      
      const metadataId = await uploadFileWithMetadata(app, file, userId);
      console.log('Upload complete:', metadataId);
      
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      this.uploading = false;
      input.value = ''; // Reset input
    }
  }
}
```

**Key Benefits:**
- ✅ Progress tracking built-in
- ✅ Atomic operations (both Storage + Firestore succeed or fail together)
- ✅ Proper cleanup prevents orphaned files
- ✅ User-scoped file organization

---

## Paginated List with Filters

**Pattern:** Load data in pages with dynamic filtering, using Firestore's pagination cursors.

```typescript
import {signal, computed} from '@lit-labs/signals';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  getDocs,
  type QueryConstraint,
  type DocumentSnapshot,
} from 'firebase/firestore';
import type {FirebaseApp} from 'firebase/app';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

interface PaginationState {
  documents: Todo[];
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  firstDoc: DocumentSnapshot | null;
  lastDoc: DocumentSnapshot | null;
}

interface FilterState {
  showCompleted: boolean;
  priority: 'all' | 'low' | 'medium' | 'high';
}

// Signals
const paginationSignal = signal<PaginationState>({
  documents: [],
  currentPage: 1,
  pageSize: 10,
  hasNextPage: false,
  hasPreviousPage: false,
  firstDoc: null,
  lastDoc: null,
});

const filterSignal = signal<FilterState>({
  showCompleted: true,
  priority: 'all',
});

// Computed values
export const todos = computed(() => paginationSignal.get().documents);
export const currentPage = computed(() => paginationSignal.get().currentPage);
export const canGoNext = computed(() => paginationSignal.get().hasNextPage);
export const canGoPrevious = computed(() => paginationSignal.get().hasPreviousPage);

/**
 * Build query constraints from current filter state
 */
function buildQueryConstraints(state: PaginationState, filters: FilterState): QueryConstraint[] {
  const constraints: QueryConstraint[] = [];
  
  // Apply filters
  if (!filters.showCompleted) {
    constraints.push(where('completed', '==', false));
  }
  
  if (filters.priority !== 'all') {
    constraints.push(where('priority', '==', filters.priority));
  }
  
  // Always order by createdAt for consistent pagination
  constraints.push(orderBy('createdAt', 'desc'));
  
  // Apply pagination
  constraints.push(limit(state.pageSize + 1)); // +1 to detect hasNextPage
  
  return constraints;
}

/**
 * Load first page (or reload after filter change)
 */
export async function loadFirstPage(app: FirebaseApp): Promise<void> {
  const db = getFirestore(app);
  const state = paginationSignal.get();
  const filters = filterSignal.get();
  
  const constraints = buildQueryConstraints(state, filters);
  const q = query(collection(db, 'todos'), ...constraints);
  
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  
  // Check if there's a next page
  const hasNext = docs.length > state.pageSize;
  const displayDocs = hasNext ? docs.slice(0, state.pageSize) : docs;
  
  paginationSignal.set({
    documents: displayDocs.map(doc => ({id: doc.id, ...doc.data()} as Todo)),
    currentPage: 1,
    pageSize: state.pageSize,
    hasNextPage: hasNext,
    hasPreviousPage: false,
    firstDoc: displayDocs[0] ?? null,
    lastDoc: displayDocs[displayDocs.length - 1] ?? null,
  });
}

/**
 * Load next page using cursor
 */
export async function loadNextPage(app: FirebaseApp): Promise<void> {
  const db = getFirestore(app);
  const state = paginationSignal.get();
  const filters = filterSignal.get();
  
  if (!state.hasNextPage || !state.lastDoc) return;
  
  const constraints = buildQueryConstraints(state, filters);
  const q = query(
    collection(db, 'todos'),
    ...constraints,
    startAfter(state.lastDoc) // Cursor pagination
  );
  
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  
  const hasNext = docs.length > state.pageSize;
  const displayDocs = hasNext ? docs.slice(0, state.pageSize) : docs;
  
  paginationSignal.set({
    documents: displayDocs.map(doc => ({id: doc.id, ...doc.data()} as Todo)),
    currentPage: state.currentPage + 1,
    pageSize: state.pageSize,
    hasNextPage: hasNext,
    hasPreviousPage: true, // We came from a previous page
    firstDoc: displayDocs[0] ?? null,
    lastDoc: displayDocs[displayDocs.length - 1] ?? null,
  });
}

/**
 * Load previous page using cursor
 */
export async function loadPreviousPage(app: FirebaseApp): Promise<void> {
  const db = getFirestore(app);
  const state = paginationSignal.get();
  const filters = filterSignal.get();
  
  if (!state.hasPreviousPage || !state.firstDoc) return;
  
  const constraints = buildQueryConstraints(state, filters);
  const q = query(
    collection(db, 'todos'),
    ...constraints,
    endBefore(state.firstDoc) // Cursor pagination (backwards)
  );
  
  const snapshot = await getDocs(q);
  const docs = snapshot.docs;
  
  const hasNext = state.currentPage > 2; // Not first page
  const displayDocs = docs.slice(0, state.pageSize);
  
  paginationSignal.set({
    documents: displayDocs.map(doc => ({id: doc.id, ...doc.data()} as Todo)),
    currentPage: state.currentPage - 1,
    pageSize: state.pageSize,
    hasNextPage: true, // We came from a next page
    hasPreviousPage: hasNext,
    firstDoc: displayDocs[0] ?? null,
    lastDoc: displayDocs[displayDocs.length - 1] ?? null,
  });
}

/**
 * Update filters and reload first page
 */
export async function setFilters(
  app: FirebaseApp,
  updates: Partial<FilterState>
): Promise<void> {
  filterSignal.set({...filterSignal.get(), ...updates});
  await loadFirstPage(app); // Filters changed, restart pagination
}
```

**Key Benefits:**
- ✅ Cursor-based pagination (efficient, no offset scanning)
- ✅ Detects next/previous page availability
- ✅ Filter changes reset to page 1
- ✅ +1 limit trick to detect hasNextPage

---

## Filtered Real-Time Updates

**Pattern:** Subscribe to live Firestore changes with query filters.

```typescript
import {signal, computed} from '@lit-labs/signals';
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import type {FirebaseApp} from 'firebase/app';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

// State
const todosSignal = signal<Todo[]>([]);
const isListeningSignal = signal<boolean>(false);
let unsubscribe: Unsubscribe | null = null;

// Computed
export const realtimeTodos = computed(() => todosSignal.get());
export const isListening = computed(() => isListeningSignal.get());

/**
 * Start real-time listener with filters
 */
export function startRealtimeListener(
  app: FirebaseApp,
  filters: {priority?: string; showCompleted?: boolean} = {}
): void {
  // Stop existing listener if any
  stopRealtimeListener();
  
  const db = getFirestore(app);
  const constraints: QueryConstraint[] = [];
  
  // Apply filters
  if (filters.priority && filters.priority !== 'all') {
    constraints.push(where('priority', '==', filters.priority));
  }
  
  if (filters.showCompleted === false) {
    constraints.push(where('completed', '==', false));
  }
  
  constraints.push(orderBy('createdAt', 'desc'));
  
  const q = query(collection(db, 'todos'), ...constraints);
  
  // Subscribe to changes
  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const todos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Todo[];
      
      todosSignal.set(todos);
      isListeningSignal.set(true);
    },
    (error) => {
      console.error('[Realtime] Listener error:', error);
      stopRealtimeListener();
    }
  );
}

/**
 * Stop real-time listener
 * IMPORTANT: Always call this when component unmounts
 */
export function stopRealtimeListener(): void {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  isListeningSignal.set(false);
}

/**
 * Component lifecycle example
 */
@customElement('realtime-todos')
export class RealtimeTodos extends SignalWatcher(LitElement) {
  override connectedCallback() {
    super.connectedCallback();
    const app = getFirebaseApp();
    startRealtimeListener(app, {showCompleted: false});
  }
  
  override disconnectedCallback() {
    super.disconnectedCallback();
    stopRealtimeListener(); // Prevent memory leaks!
  }
  
  override render() {
    const todos = realtimeTodos();
    const listening = isListening();
    
    return html`
      <div>
        <span>Status: ${listening ? 'Live 🟢' : 'Offline 🔴'}</span>
        <ul>
          ${todos.map(todo => html`
            <li>${todo.title}</li>
          `)}
        </ul>
      </div>
    `;
  }
}
```

**Key Benefits:**
- ✅ Automatic UI updates when data changes
- ✅ Filters applied at query level (not client-side)
- ✅ Proper cleanup prevents memory leaks
- ✅ Works offline with cache

---

## Offline-First CRUD Operations

**Pattern:** Enable offline persistence, perform optimistic updates, sync when online.

```typescript
import {getFirestore, enableIndexedDbPersistence} from 'firebase/firestore';
import type {FirebaseApp} from 'firebase/app';

/**
 * Enable offline persistence (call once at app startup)
 */
export async function enableOfflineSupport(app: FirebaseApp): Promise<void> {
  const db = getFirestore(app);
  
  try {
    await enableIndexedDbPersistence(db);
    console.log('[Firestore] Offline persistence enabled');
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      // Multiple tabs open, persistence only works in one tab
      console.warn('[Firestore] Persistence failed: multiple tabs open');
    } else if (error.code === 'unimplemented') {
      // Browser doesn't support persistence
      console.warn('[Firestore] Persistence not supported in this browser');
    } else {
      throw error;
    }
  }
}

/**
 * Offline-first CRUD operations
 * These work immediately (from cache) and sync when online
 */
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

export async function createTodoOfflineFirst(
  app: FirebaseApp,
  title: string
): Promise<string> {
  const db = getFirestore(app);
  
  // This returns immediately with a local document ID
  // Syncs to server when online
  const docRef = await addDoc(collection(db, 'todos'), {
    title,
    completed: false,
    createdAt: serverTimestamp(), // Resolved on server
    updatedAt: serverTimestamp(),
  });
  
  return docRef.id;
}

export async function updateTodoOfflineFirst(
  app: FirebaseApp,
  todoId: string,
  updates: {title?: string; completed?: boolean}
): Promise<void> {
  const db = getFirestore(app);
  const todoRef = doc(db, 'todos', todoId);
  
  await updateDoc(todoRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
  
  // Returns immediately, syncs when online
}

export async function deleteTodoOfflineFirst(
  app: FirebaseApp,
  todoId: string
): Promise<void> {
  const db = getFirestore(app);
  const todoRef = doc(db, 'todos', todoId);
  
  await deleteDoc(todoRef);
  // Returns immediately, syncs when online
}
```

**Key Benefits:**
- ✅ App works fully offline
- ✅ Changes sync automatically when online
- ✅ No code changes needed for offline support
- ✅ IndexedDB provides persistent local cache

---

## Batch Operations

**Pattern:** Write multiple documents atomically (all succeed or all fail).

```typescript
import {getFirestore, writeBatch, doc, collection, serverTimestamp} from 'firebase/firestore';
import type {FirebaseApp} from 'firebase/app';

/**
 * Batch create multiple todos (10-50x faster than individual writes)
 */
export async function batchCreateTodos(
  app: FirebaseApp,
  titles: string[]
): Promise<void> {
  const db = getFirestore(app);
  const batch = writeBatch(db);
  
  // Add all operations to batch
  titles.forEach(title => {
    const docRef = doc(collection(db, 'todos')); // Auto-generated ID
    batch.set(docRef, {
      title,
      completed: false,
      createdAt: serverTimestamp(),
    });
  });
  
  // Execute all writes atomically
  await batch.commit();
}

/**
 * Batch update multiple documents
 * Example: Mark all todos as completed
 */
export async function batchUpdateTodos(
  app: FirebaseApp,
  todoIds: string[],
  updates: {completed?: boolean; priority?: string}
): Promise<void> {
  const db = getFirestore(app);
  const batch = writeBatch(db);
  
  todoIds.forEach(id => {
    const docRef = doc(db, 'todos', id);
    batch.update(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  });
  
  await batch.commit();
}

/**
 * Batch delete (with 500-document limit awareness)
 */
export async function batchDeleteTodos(
  app: FirebaseApp,
  todoIds: string[]
): Promise<void> {
  const db = getFirestore(app);
  
  // Firestore batches max 500 operations
  const chunks = chunkArray(todoIds, 500);
  
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    
    chunk.forEach(id => {
      const docRef = doc(db, 'todos', id);
      batch.delete(docRef);
    });
    
    await batch.commit();
  }
}

// Helper: Split array into chunks
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
```

**Key Benefits:**
- ✅ 10-50x faster than individual writes
- ✅ All-or-nothing atomicity
- ✅ Reduces network round trips
- ✅ Handles 500-operation limit automatically

---

## Optimistic Updates with Rollback

**Pattern:** Update UI immediately, then sync with server. Rollback if server rejects.

```typescript
import {signal} from '@lit-labs/signals';
import {getFirestore, doc, updateDoc} from 'firebase/firestore';
import type {FirebaseApp} from 'firebase/app';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
}

const todosSignal = signal<Todo[]>([]);

/**
 * Toggle todo completion with optimistic update
 */
export async function toggleTodoOptimistic(
  app: FirebaseApp,
  todoId: string
): Promise<void> {
  const todos = todosSignal.get();
  
  // Find todo to update
  const index = todos.findIndex(t => t.id === todoId);
  if (index === -1) return;
  
  const todo = todos[index];
  const newCompleted = !todo.completed;
  
  // Step 1: Optimistic UI update (instant feedback)
  const optimisticTodos = [...todos];
  optimisticTodos[index] = {...todo, completed: newCompleted};
  todosSignal.set(optimisticTodos);
  
  // Step 2: Sync with server
  try {
    const db = getFirestore(app);
    const todoRef = doc(db, 'todos', todoId);
    await updateDoc(todoRef, {completed: newCompleted});
    
    // Success! Optimistic update was correct
    
  } catch (error) {
    // Step 3: Rollback on error
    console.error('Failed to update todo:', error);
    
    // Revert to previous state
    todosSignal.set(todos);
    
    // Show error to user
    throw error;
  }
}

/**
 * Component example with error handling
 */
@customElement('optimistic-todo-item')
export class OptimisticTodoItem extends LitElement {
  @property() todo!: Todo;
  @state() private updating = false;
  @state() private error: string | null = null;
  
  override render() {
    return html`
      <div>
        <input
          type="checkbox"
          .checked=${this.todo.completed}
          ?disabled=${this.updating}
          @change=${this.handleToggle}
        />
        <span>${this.todo.title}</span>
        
        ${this.error ? html`
          <span class="error">${this.error}</span>
        ` : ''}
      </div>
    `;
  }
  
  private async handleToggle() {
    this.updating = true;
    this.error = null;
    
    try {
      const app = getFirebaseApp();
      await toggleTodoOptimistic(app, this.todo.id);
    } catch (error) {
      this.error = 'Failed to update. Please try again.';
      setTimeout(() => this.error = null, 3000);
    } finally {
      this.updating = false;
    }
  }
}
```

**Key Benefits:**
- ✅ Instant UI feedback (feels fast)
- ✅ Graceful error handling with rollback
- ✅ Works well with offline mode
- ✅ Better UX than "loading" spinners

---

## Best Practices Summary

### Always Do ✅
- Enable offline persistence at app startup
- Use `serverTimestamp()` for server-set dates
- Clean up listeners in `disconnectedCallback()`
- Use batch writes for multiple operations
- Handle errors with user-friendly messages

### Never Do ❌
- Store sensitive data in Firestore (use Auth tokens or Functions)
- Query without indexes (check console warnings)
- Forget to unsubscribe from listeners (memory leaks!)
- Use client-side timestamps for server data
- Ignore offline mode in your app logic

### Performance Tips 🚀
- Use pagination for large lists (10-20 items per page)
- Apply filters at query level, not client-side
- Batch writes are 10-50x faster than loops
- Cache static data in signals
- Use `limit()` to prevent over-fetching

---

## Related Documentation

- [Composite Patterns](./COMPOSITE_PATTERNS.md) - Multi-service coordination
- [Performance Patterns](./PERFORMANCE_PATTERNS.md) - Optimization techniques
- [Firestore Patterns](../FIRESTORE_PATTERNS.md) - Data modeling and queries

---

**Last Updated:** October 2025  
**Firebase SDK:** v11.x  
**Teaching App:** df-firebase-teaching-app
