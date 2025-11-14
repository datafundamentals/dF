# Shared Cloud Functions

This directory contains Cloud Functions that are shared across multiple apps in the monorepo, following the pattern documented in `guides/FUNCTIONS_PLACEMENT.md`.

## Architecture

These functions were originally app-specific but have been promoted to shared status as they may be consumed by multiple applications for teaching and demonstration purposes.

### Functions Included

1. **createTodoAdvanced** (callable) - Demonstrates server-side business logic with enriched todo creation
2. **manualCleanupExpiredTodos** (callable) - Administrative function for cleaning up old todos
3. **todosExportAPI** (HTTP) - Export todos in CSV or JSON format
4. **onTodoCreated, onTodoUpdated, onTodoDeleted** (triggers) - Firestore event handlers
5. **cleanupExpiredTodos** (scheduled) - Automated cleanup cron job

## Usage from Apps

Apps consume these functions via the Firebase SDK:

```typescript
import {getFunctions, httpsCallable} from 'firebase/functions';

const functions = getFunctions();
const createTodo = httpsCallable(functions, 'createTodoAdvanced');
const result = await createTodo({title: 'Example', priority: 'high'});
```

## Development

```bash
# Build functions
pnpm --filter @df/functions-shared run build

# Run emulator
cd services/functions
firebase emulators:start --only functions

# Deploy to production
cd services/functions
firebase deploy --only functions
```

## State Management

Function call state is managed in `packages/state/src/stores/functions-demo.store.ts` using signals-based architecture. Components consume this state reactively.

## Related Documentation

- `guides/FUNCTIONS_PLACEMENT.md` - Architecture patterns for functions
- `packages/state/src/stores/functions-demo.store.ts` - Client-side state management
- `packages/ui-lit/src/firebase/df-functions-demo.ts` - UI component demonstrating usage
