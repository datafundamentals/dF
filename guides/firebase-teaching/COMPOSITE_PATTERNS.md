# Composite Patterns: Coordinating Multiple Firebase Services

**Last Updated:** 2025-10-14  
**Ticket:** 10 - Composite Patterns & Best Practices  
**Status:** Teaching Guide

---

## Overview

A **composite pattern** in Firebase development occurs when a single feature coordinates multiple Firebase services to achieve its goal. Instead of using services in isolation, composite patterns orchestrate Auth, Firestore, Storage, and Functions together to create cohesive user experiences.

This guide documents proven composite patterns from the df-firebase-teaching-app, demonstrating how to coordinate services effectively while maintaining clean architecture.

**💡 Looking for code to copy?** See the [Firebase Cookbook](./FIREBASE_COOKBOOK.md) for ready-to-use implementations of these patterns.

---

## Core Principle: Coordinated State Updates

```
User Action → Store Function → Multiple Firebase Services → Coordinated State Update
```

**Example: Adding a todo**
```
addTodo() → checks auth.uid → writes to Firestore → triggers real-time listener → UI updates
```

Each composite operation:
1. **Validates context** (is user authenticated?)
2. **Coordinates services** (write to database, upload file, etc.)
3. **Updates state** (signals propagate changes to UI)
4. **Handles errors** (gracefully across all services)

---

## Pattern 1: User-Owned Data (Auth + Firestore)

### The Problem
Users should only see and modify their own data. How do we filter Firestore queries by the authenticated user?

### The Solution: Todos Store Composite

**Architecture:**
```
Firebase Auth → provides user.uid
     ↓
Todos Store → filters Firestore queries by ownership
     ↓
Firestore → returns only user's todos
     ↓
UI Components → display filtered results
```

### Implementation

**File:** `packages/state/src/stores/todos.store.ts`

#### Step 1: Initialize with Auth Context

```typescript
import {getFirebaseApp} from '@df/firebase';
import {firebaseAuthState} from '@df/state';

export async function initializeTodosStore(
  app: FirebaseApp, 
  useEmulator: boolean
): Promise<void> {
  // Get Firestore instance
  const db = getFirestoreDb(app);
  
  // Enable offline persistence (caching)
  await enableFirestoreOfflinePersistence(db);
  
  // Create collection reference
  collectionRef = collection(db, 'todos');
  
  // Initialize base store with default query
  const newStore = new FirestoreCollectionStore<TodoDocument>(collectionRef, {
    defaultConstraints: [orderBy('createdAt', 'desc')],
    pageSize: 5,
  });
  
  storeSignal.set(newStore);
}
```

#### Step 2: CRUD Operations Check Auth

```typescript
export async function addTodo(draft: TodoDraft): Promise<string> {
  const activeStore = ensureStore();
  
  // Get current auth state
  const authState = firebaseAuthState.get();
  const userId = authState.user?.uid;
  
  // Prepare document with ownership
  const payload: FirestoreDocumentData<TodoDocument> = {
    title: draft.title,
    description: draft.description,
    completed: false,
    priority: draft.priority,
    tags: draft.tags,
    createdAt: new Date(),
    updatedAt: new Date(),
    dueDate: draft.dueDate,
    // If implementing user-owned todos, add:
    // userId: userId, // Owner of this todo
  };
  
  // Write to Firestore
  const id = await activeStore.create(payload);
  
  // Refresh to get updated list (triggers real-time listener)
  await activeStore.refresh();
  
  return id;
}
```

#### Step 3: Security Rules Enforce Ownership

**File:** `firestore.rules`

```javascript
match /todos/{todoId} {
  // Users can only read their own todos
  allow read: if request.auth != null 
    && request.auth.uid == resource.data.userId;
  
  // Users can only create todos with their own userId
  allow create: if request.auth != null 
    && request.auth.uid == request.resource.data.userId;
  
  // Users can only update their own todos
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.userId;
  
  // Users can only delete their own todos
  allow delete: if request.auth != null 
    && request.auth.uid == resource.data.userId;
}
```

### Why This Works

1. **Auth provides context**: `firebaseAuthState.user.uid` identifies the current user
2. **Store coordinates**: Todos store writes userId field to Firestore documents
3. **Security enforces**: Firestore rules block unauthorized access server-side
4. **Signals propagate**: UI automatically updates when auth state or data changes

### When to Use

✅ **Use this pattern when:**
- Data belongs to specific users (todos, notes, profiles)
- Users should only see their own data
- Multi-tenancy is required (each user has isolated data)

❌ **Don't use this pattern when:**
- Data is public/shared (reference data, catalogs)
- All authenticated users should see the same data
- Admin users need to see all data (use role-based access instead)

---

## Pattern 2: File Upload with Metadata (Storage + Firestore)

### The Problem
Uploading a file to Storage is separate from tracking its metadata. How do we coordinate both operations and handle errors?

### The Solution: Storage + Firestore Composite

**Architecture:**
```
User selects file
     ↓
Storage Store → uploads file to Firebase Storage
     ↓ (on success)
Get download URL
     ↓
Firestore → stores metadata (name, size, URL, uploadDate)
     ↓
UI → displays file list with previews
```

### Implementation Example

```typescript
import {uploadFile, getDownloadURL} from '@df/state';
import {getFirestore, collection, addDoc} from 'firebase/firestore';

export async function uploadFileWithMetadata(
  file: File,
  path: string
): Promise<string> {
  try {
    // Step 1: Upload file to Storage
    const uploadResult = await uploadFile(file, path);
    
    // Step 2: Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    // Step 3: Store metadata in Firestore
    const db = getFirestore();
    const metadata = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date(),
      uploadedBy: firebaseAuthState.get().user?.uid,
      storagePath: path,
      downloadURL: downloadURL,
    };
    
    const docRef = await addDoc(collection(db, 'fileMetadata'), metadata);
    
    return docRef.id;
  } catch (error) {
    // Cleanup: If Firestore fails, optionally delete the uploaded file
    console.error('Failed to store metadata:', error);
    throw error;
  }
}
```

### Error Handling Strategy

**Scenario 1: Storage upload fails**
- No Firestore write attempted
- User sees upload error
- No cleanup needed

**Scenario 2: Storage succeeds, Firestore fails**
- File exists in Storage but no metadata
- Options:
  - Retry Firestore write
  - Delete uploaded file (cleanup)
  - Log orphaned file for manual cleanup

**Scenario 3: Both succeed**
- File accessible via downloadURL
- Metadata queryable in Firestore
- UI shows file immediately

### When to Use

✅ **Use this pattern when:**
- Files need searchable metadata (name, tags, upload date)
- Files are associated with other data (user profiles, project attachments)
- You need to query files without listing entire Storage buckets

❌ **Don't use this pattern when:**
- Simple file storage without querying (just use Storage)
- Metadata is only the filename (Storage metadata is sufficient)

---

## Pattern 3: Triggered Workflows (Firestore → Cloud Functions → Firestore)

### The Problem
Some operations require server-side processing after data changes. How do we trigger functions and update related collections?

### The Solution: Firestore Triggers

**Architecture:**
```
Client writes to Firestore
     ↓
Cloud Function triggers (onCreate, onUpdate, onDelete)
     ↓
Function processes data (validation, aggregation, notifications)
     ↓
Function writes results to other Firestore collections
     ↓
Real-time listeners propagate updates to UI
```

### Implementation Example

**Client-side: Create Todo**

```typescript
// User creates a todo
await addTodo({
  title: 'Complete project',
  description: 'Finish all tasks',
  priority: 'high',
  tags: ['work'],
  dueDate: new Date('2025-10-20'),
});
```

**Server-side: Cloud Function Trigger**

**File:** `apps/df-firebase-teaching-app1/functions/src/triggers/onTodoCreated.ts`

```typescript
import * as functions from 'firebase-functions/v2';
import {getFirestore} from 'firebase-admin/firestore';

export const onTodoCreated = functions.firestore
  .onDocumentCreated('todos/{todoId}', async (event) => {
    const todoData = event.data?.data();
    const todoId = event.params.todoId;
    
    if (!todoData) return;
    
    // Example: Log activity
    await getFirestore().collection('activityLog').add({
      type: 'TODO_CREATED',
      todoId: todoId,
      title: todoData.title,
      priority: todoData.priority,
      timestamp: new Date(),
    });
    
    // Example: Update user stats
    if (todoData.userId) {
      const userRef = getFirestore().collection('users').doc(todoData.userId);
      await userRef.update({
        totalTodos: FieldValue.increment(1),
        lastActivity: new Date(),
      });
    }
    
    console.log(`Todo created: ${todoId} - ${todoData.title}`);
  });
```

**Client-side: Real-time Updates**

```typescript
// Listen to activity log (updates automatically)
const activityStore = new FirestoreCollectionStore(
  collection(db, 'activityLog'),
  {
    defaultConstraints: [
      orderBy('timestamp', 'desc'),
      limit(10),
    ],
  }
);

activityStore.startRealtime(); // Auto-updates when function writes
```

### Why This Works

1. **Firestore triggers are reliable**: Function executes even if client disconnects
2. **Server-side authority**: Security rules can't be bypassed
3. **Cascading updates**: Function writes trigger real-time listeners in UI
4. **Decoupled architecture**: Client doesn't need to know about side effects

### When to Use

✅ **Use this pattern when:**
- Aggregating data (counts, statistics)
- Sending notifications (email, push)
- Validating/enriching data server-side
- Synchronizing across collections
- Audit logging

❌ **Don't use this pattern when:**
- Simple CRUD operations (client can do it)
- Real-time requirements (functions add latency)
- Expensive operations (use scheduled functions instead)

---

## Pattern 4: Multi-Service Coordination (Auth + Firestore + Storage + Functions)

### The Problem
Complex features like user profile management require coordinating all Firebase services. How do we keep everything in sync?

### The Solution: Orchestrated Store Pattern

**Architecture:**
```
User updates profile
     ↓
Profile Store orchestrates:
  1. Upload avatar to Storage (if changed)
  2. Get download URL
  3. Update Firestore profile document
  4. Update Auth displayName and photoURL
  5. Trigger Cloud Function for validation
     ↓
All services updated atomically
     ↓
UI reflects complete profile state
```

### Pseudo-Implementation

```typescript
export async function updateUserProfile(updates: {
  displayName?: string;
  bio?: string;
  avatarFile?: File;
}): Promise<void> {
  const user = firebaseAuthState.get().user;
  if (!user) throw new Error('Not authenticated');
  
  let photoURL = user.photoURL;
  
  // Step 1: Upload avatar if changed
  if (updates.avatarFile) {
    const path = `avatars/${user.uid}/${Date.now()}_${updates.avatarFile.name}`;
    const uploadResult = await uploadFile(updates.avatarFile, path);
    photoURL = await getDownloadURL(uploadResult.ref);
  }
  
  // Step 2: Update Firestore profile
  const profileData = {
    displayName: updates.displayName ?? user.displayName,
    bio: updates.bio ?? '',
    photoURL: photoURL,
    updatedAt: new Date(),
  };
  
  await setDoc(doc(getFirestore(), 'profiles', user.uid), profileData, {merge: true});
  
  // Step 3: Update Auth profile
  await updateProfile(user, {
    displayName: updates.displayName,
    photoURL: photoURL,
  });
  
  // Step 4: Trigger validation (Cloud Function reads Firestore)
  const validateProfile = httpsCallable(getFunctions(), 'validateProfile');
  await validateProfile({userId: user.uid});
  
  // Done! All services updated and in sync
}
```

### Error Handling

```typescript
try {
  await updateUserProfile(updates);
} catch (error) {
  if (error.code === 'storage/unauthorized') {
    // Storage upload failed
    console.error('Failed to upload avatar');
  } else if (error.code === 'permission-denied') {
    // Firestore write failed
    console.error('Failed to update profile');
  } else if (error.code === 'functions/unauthenticated') {
    // Function call failed
    console.error('Validation failed');
  }
  
  // Rollback strategy: depends on which step failed
  // Consider: transaction pattern, compensating actions
}
```

### When to Use

✅ **Use this pattern when:**
- User profiles (avatar + metadata + auth)
- Complex forms with file uploads
- Multi-step workflows requiring all-or-nothing

❌ **Don't use this pattern when:**
- Services can operate independently
- Partial updates are acceptable
- Complexity outweighs benefits

---

## State Management for Composite Patterns

### Signals-Based Coordination

Composite patterns benefit from **reactive state** that automatically propagates changes:

```typescript
// Auth state signal
export const firebaseAuthState = signal<AuthState>({
  status: 'loading',
  user: null,
  error: null,
});

// Firestore collection state signal
export const todoCollectionState = computed(() => {
  const store = storeSignal.get();
  return store ? store.state.get() : fallbackState;
});

// Derived composite state
export const userTodosState = computed(() => {
  const auth = firebaseAuthState.get();
  const todos = todoCollectionState.get();
  
  // Automatically recalculates when either changes
  return {
    isAuthenticated: auth.status === 'authenticated',
    userId: auth.user?.uid,
    todos: todos.documents,
    isLoading: auth.status === 'loading' || todos.status === 'loading',
  };
});
```

### Benefits

1. **Automatic UI updates**: Components watch signals, re-render on changes
2. **No manual synchronization**: Signals compute derived state reactively
3. **Clean separation**: Store manages data, signals manage state
4. **Minimal re-renders**: Only components using changed signals re-render

---

## Error Handling Across Service Boundaries

### Strategy 1: Fail Fast

```typescript
export async function compositeOperation(): Promise<void> {
  // If any step fails, entire operation fails
  await step1(); // throws on error
  await step2(); // never runs if step1 failed
  await step3();
}
```

**When to use:** Operations are atomic (all or nothing)

### Strategy 2: Partial Success

```typescript
export async function compositeOperation(): Promise<{
  step1: boolean;
  step2: boolean;
  step3: boolean;
}> {
  const results = {step1: false, step2: false, step3: false};
  
  try {
    await step1();
    results.step1 = true;
  } catch (e) {
    console.error('Step 1 failed:', e);
  }
  
  try {
    await step2();
    results.step2 = true;
  } catch (e) {
    console.error('Step 2 failed:', e);
  }
  
  try {
    await step3();
    results.step3 = true;
  } catch (e) {
    console.error('Step 3 failed:', e);
  }
  
  return results;
}
```

**When to use:** Independent steps, partial progress is acceptable

### Strategy 3: Compensating Actions

```typescript
export async function compositeOperation(): Promise<void> {
  let step1Done = false;
  let step2Done = false;
  
  try {
    await step1();
    step1Done = true;
    
    await step2();
    step2Done = true;
    
    await step3();
  } catch (error) {
    // Rollback completed steps
    if (step2Done) await undoStep2();
    if (step1Done) await undoStep1();
    
    throw error;
  }
}
```

**When to use:** Operations have rollback capability, consistency critical

---

## Best Practices

### ✅ DO

1. **Initialize services once** - Create store/service instances at app startup
2. **Use signals for coordination** - Let reactive state propagate changes
3. **Validate auth first** - Check authentication before any writes
4. **Handle errors gracefully** - Provide clear feedback for each service failure
5. **Document dependencies** - Make service relationships explicit
6. **Test composite operations** - Verify all services coordinate correctly

### ❌ DON'T

1. **Don't create service instances in loops** - Reuse existing instances
2. **Don't tightly couple services** - Keep clean interfaces between them
3. **Don't ignore partial failures** - Handle each service error appropriately
4. **Don't skip auth checks** - Always validate permissions
5. **Don't forget cleanup** - Detach listeners, cancel uploads on unmount
6. **Don't make assumptions** - Services can fail independently

---

## Common Patterns Summary

| Pattern | Services | Use Case | Complexity |
|---------|----------|----------|------------|
| User-Owned Data | Auth + Firestore | Todos, notes, user content | Low |
| File + Metadata | Storage + Firestore | Uploads with searchable data | Medium |
| Triggered Workflows | Firestore + Functions + Firestore | Side effects, aggregations | Medium |
| Full Profile | Auth + Storage + Firestore + Functions | User profiles, complex forms | High |

---

## See Also

- **[PERFORMANCE_PATTERNS.md](./PERFORMANCE_PATTERNS.md)** - Optimizing composite operations
- **[FIREBASE_COOKBOOK.md](./FIREBASE_COOKBOOK.md)** - Copy-paste examples
- **[FIRESTORE_PATTERNS.md](./FIRESTORE_PATTERNS.md)** - Query and pagination patterns
- **[AUTHENTICATION_PATTERNS.md](./AUTHENTICATION_PATTERNS.md)** - Auth integration

---

## Examples in This Codebase

**Auth + Firestore Composite:**
- `packages/state/src/stores/todos.store.ts` - User-owned todos pattern
- `apps/df-firebase-teaching-app1/src/df-firestore-demo.ts` - UI integration

**Storage + Firestore Composite:**
- `packages/state/src/stores/storage.store.ts` - File upload patterns
- `apps/df-firebase-teaching-app1/src/df-storage-demo.ts` - Metadata tracking

**Firestore Triggers:**
- `apps/df-firebase-teaching-app1/functions/src/triggers/onTodoCreated.ts`
- `apps/df-firebase-teaching-app1/functions/src/triggers/onTodoUpdated.ts`
- `apps/df-firebase-teaching-app1/functions/src/triggers/onTodoDeleted.ts`

---

**Questions or improvements?** See `FIREBASE_TEACHING_APP_ROADMAP.md` Ticket 10.
