# Cloud Functions for Firebase Teaching App

**⚠️⚠️⚠️ MONOREPO EXCEPTION WARNING ⚠️⚠️⚠️**

This functions package **violates the monorepo's core principle** of "no copy-paste" by bundling type definitions.

**📚 READ FIRST:** [`../guides/CLOUD_FUNCTIONS_BUNDLING.md`](../guides/CLOUD_FUNCTIONS_BUNDLING.md)

**Quick explanation:** Google Cloud Build doesn't support pnpm `workspace:*` dependencies. Types from `packages/types` are copied to `src/types/bundled.ts` as a pragmatic exception.

---

## Function Types Demonstrated

This package demonstrates all major Cloud Function types:

### 1. Callable Functions (`callable/`)

Direct RPC-style functions called from client with `httpsCallable()`:

- **`createTodoAdvanced`** - Complex todo creation with validation
  - Type-safe request/response
  - Automatic authentication context
  - Server-side business logic

**Client usage:**
```typescript
import {getFunctions, httpsCallable} from 'firebase/functions';

const functions = getFunctions();
const createTodo = httpsCallable(functions, 'createTodoAdvanced');

const result = await createTodo({
  title: 'My Todo',
  priority: 'high',
});
```

### 2. HTTP Functions (`http/`)

Standard HTTP endpoints accessed via fetch/axios:

- **`todosExportAPI`** - Export todos as CSV/JSON
  - GET/POST request handling
  - CORS configuration
  - File download responses

**Client usage:**
```typescript
const response = await fetch(
  'https://us-central1-YOUR-PROJECT.cloudfunctions.net/todosExportAPI?format=csv'
);
const csv = await response.text();
```

### 3. Firestore Triggers (`triggers/`)

Automatic event handlers for Firestore changes:

- **`onTodoCreated`** - Fires when new todo document created
- **`onTodoUpdated`** - Fires when todo document updated
- **`onTodoDeleted`** - Fires when todo document deleted

**Use cases:**
- Update analytics/counters
- Send notifications
- Maintain data consistency
- Sync to external systems

**Automatic - no client code needed:**
```typescript
// Just create a todo in Firestore
await addDoc(collection(db, 'todos'), {
  title: 'New Todo',
  // ... onTodoCreated automatically fires
});
```

### 4. Scheduled Functions (`scheduled/`)

Cron-scheduled maintenance tasks:

- **`cleanupExpiredTodos`** - Daily cleanup of expired todos (1am UTC)
- **`manualCleanupExpiredTodos`** - Callable version for manual trigger

**Schedule format (cron):**
```typescript
schedule: 'every day 01:00'  // Daily at 1am UTC
```

**Manual trigger (for testing):**
```typescript
const cleanup = httpsCallable(functions, 'manualCleanupExpiredTodos');
await cleanup();
```

---

## Development Workflow

### Local Development (Emulators)

```bash
# Terminal 1: Start emulators
cd apps/df-firebase-teaching-app3
pnpm emulators:start

# Terminal 2: Watch TypeScript compilation
cd functions
pnpm run build:watch

# Functions UI: http://127.0.0.1:5400 → Functions tab
```

**Emulator features:**
- Hot reload on code changes
- Function logs in terminal
- Trigger functions manually via UI
- Test with local Firestore/Auth data

### Testing Functions

**Via Client App:**
```bash
# In terminal 1: Emulators running
# In terminal 2: Dev server
cd apps/df-firebase-teaching-app3
pnpm dev

# Open http://127.0.0.1:4176
# Use "Cloud Functions Demo" section
```

**Via Emulator UI:**
1. Open `http://127.0.0.1:5400`
2. Click "Functions" tab
3. Select function to test
4. Enter request data
5. Click "Run Function"

**Via curl (HTTP functions only):**
```bash
curl "http://127.0.0.1:5501/peg-2035/us-central1/todosExportAPI?format=json"
```

### Production Deployment

**⚠️ Known Issue:** Functions deployment requires bundled types (see top of README).

**Deploy all functions:**
```bash
cd apps/df-firebase-teaching-app3
pnpm deploy:functions
```

**Deploy specific function:**
```bash
cd functions
firebase deploy --only functions:createTodoAdvanced
```

**View logs:**
```bash
firebase functions:log
```

---

## Architecture Notes

### App-Specific vs Shared Functions

**These functions are APP-SPECIFIC** because they:
- Implement todo-specific business logic
- Only needed by this teaching app
- Tightly coupled to teaching app's data model

**Use shared functions** (`services/firebase-functions-shared/`) when:
- Multiple apps need same functionality
- Centralized auth/roles management
- Cross-app data synchronization

**📚 See:** [`../../guides/FUNCTIONS_PLACEMENT.md`](../../guides/FUNCTIONS_PLACEMENT.md)

### Type Safety Pattern

**⚠️ Exception:** This package uses bundled types instead of `@df/types`.

**Normal pattern (other packages):**
```typescript
import {TodoFirestoreData} from '@df/types';  // ✅ Normal
```

**This package (exception):**
```typescript
import {TodoFirestoreData} from './types/bundled.js';  // ⚠️ Bundled
```

**Why:** Google Cloud Build limitation. See [`../guides/CLOUD_FUNCTIONS_BUNDLING.md`](../guides/CLOUD_FUNCTIONS_BUNDLING.md)

---

## Function Reference

### Callable Functions

| Function | Purpose | Auth Required | Request | Response |
|----------|---------|---------------|---------|----------|
| `createTodoAdvanced` | Create todo with validation | Yes | `{title, description, priority, tags, dueDate}` | `{success, todoId}` |
| `manualCleanupExpiredTodos` | Trigger cleanup manually | No | `{}` | `{deletedCount}` |

### HTTP Functions

| Function | Method | Purpose | Query Params |
|----------|--------|---------|--------------|
| `todosExportAPI` | GET | Export todos | `format=csv|json`, `completed=true|false` |

### Firestore Triggers

| Function | Trigger | Document Path | Action |
|----------|---------|---------------|--------|
| `onTodoCreated` | onCreate | `todos/{todoId}` | Update analytics, user stats |
| `onTodoUpdated` | onUpdate | `todos/{todoId}` | Track completion, changes |
| `onTodoDeleted` | onDelete | `todos/{todoId}` | Cleanup stats, counters |

### Scheduled Functions

| Function | Schedule | Purpose |
|----------|----------|---------|
| `cleanupExpiredTodos` | Daily 1am UTC | Delete todos past due date |

---

## Security Patterns

All functions implement security best practices:

✅ **Authentication checks** - Callable functions verify `auth` context  
✅ **Input validation** - All inputs validated before processing  
✅ **Rate limiting** - Prevent abuse via Firebase quotas  
✅ **Error handling** - Graceful failures with detailed logs  
✅ **Idempotent operations** - Safe to retry without side effects  

---

## Common Issues

### "workspace:*" Error During Deployment

**Error:**
```
npm error Unsupported URL Type "workspace:": workspace:*
```

**Cause:** Google Cloud Build doesn't support pnpm workspace protocol.

**Solution:** This is resolved by using bundled types. See [`../guides/CLOUD_FUNCTIONS_BUNDLING.md`](../guides/CLOUD_FUNCTIONS_BUNDLING.md)

### Function Not Deploying

**Check:**
1. TypeScript compiles without errors: `pnpm build`
2. Function exported from `src/index.ts`
3. Function name matches export name
4. Region specified (default: `us-central1`)

### Function Times Out

**Possible causes:**
- Infinite loop in code
- External API not responding
- Firestore query too large
- Missing error handling

**Solutions:**
- Add timeout configuration: `{timeoutSeconds: 60}`
- Add error handling with try/catch
- Limit query size with `.limit(100)`
- Test locally in emulators first

---

## Teaching Resources

**Guides:**
- [`../guides/CLOUD_FUNCTIONS_BUNDLING.md`](../guides/CLOUD_FUNCTIONS_BUNDLING.md) - Why bundled types
- [`../guides/COMPOSITE_PATTERNS.md`](../guides/COMPOSITE_PATTERNS.md) - Multi-service patterns
- [`../../guides/FUNCTIONS_PLACEMENT.md`](../../guides/FUNCTIONS_PLACEMENT.md) - Where to put functions

**Examples in Code:**
- `src/callable/createTodoAdvanced.ts` - Complex validation pattern
- `src/triggers/onTodoCreated.ts` - Analytics tracking pattern
- `src/scheduled/cleanupExpiredTodos.ts` - Batch processing pattern

**Firebase Docs:**
- [Cloud Functions Overview](https://firebase.google.com/docs/functions)
- [Callable Functions](https://firebase.google.com/docs/functions/callable)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)
- [Scheduled Functions](https://firebase.google.com/docs/functions/schedule-functions)

---

## Summary

This functions package demonstrates all major Cloud Function patterns while documenting a **deliberate exception** to monorepo principles due to Google Cloud Build limitations.

**For teaching:** This exception demonstrates that real-world platform constraints sometimes require pragmatic compromises to architectural ideals.

**For production:** Consider automated bundling solutions (esbuild, rollup) documented in [`../guides/CLOUD_FUNCTIONS_BUNDLING.md`](../guides/CLOUD_FUNCTIONS_BUNDLING.md).
