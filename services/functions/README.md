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
6. **reviewAgenticWorkRequestPreReqs** (callable) - Sends Work Request fields to the OpenClaw main agent, which applies its installed `work-request-key-fields` skill

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

# Run function unit tests
pnpm --filter @df/functions-shared run test

# Run emulator
cd services/functions
firebase emulators:start --only functions

# Deploy to production
cd services/functions
firebase deploy --only functions
```

## Agentic Work Request Git Persistence

`onAgenticMessage` can persist each Work Request turn into a GitHub-backed markdown file. The feature is disabled unless `AGENTIC_WORK_REQUEST_GIT_REPO` is configured.

Required secret when enabled:

```bash
firebase functions:secrets:set GITHUB_PAT
```

Runtime configuration:

- `AGENTIC_WORK_REQUEST_GIT_REPO` - GitHub repo as `owner/repo` or an HTTPS repo URL.
- `AGENTIC_WORK_REQUEST_GIT_BRANCH` - target branch, defaults to `main`.
- `AGENTIC_WORK_REQUEST_GIT_DOCS_DIR` - directory for `[requestId].md`, defaults to `agentic-work-requests`.
- `AGENTIC_WORK_REQUEST_GIT_AUTHOR_NAME` - commit author name, defaults to `Agentic Work Request Bot`.
- `AGENTIC_WORK_REQUEST_GIT_AUTHOR_EMAIL` - commit author email, defaults to `agentic-work-requests@datafundamentals.com`.

The above were hard-coded into agenticWorkRequestGit.ts by Pete as follows. This might not have been the right approach but the repository is private so not sure that it hurts anything?

```
const DEFAULT_BRANCH = 'main';
const DEFAULT_DOCS_DIR = 'wr';
const DEFAULT_AUTHOR_NAME = 'R2D4agent';
const DEFAULT_AUTHOR_EMAIL = 'pete@couldbe.net';
---
  const DEFAULT_REPO = 'R2D4agent/workRequest';
```

The function writes the current Work Request markdown document to `[requestId].md`, appends a deterministic turn fragment, commits it, rebases against the target branch, and pushes. After a successful push, it stores the exact committed markdown and git commit metadata back on the Firestore Work Request. No LLM is involved in this persistence step.

## State Management

Function call state is managed in `packages/state/src/stores/functions-demo.store.ts` using signals-based architecture. Components consume this state reactively.

## Related Documentation

- `guides/FUNCTIONS_PLACEMENT.md` - Architecture patterns for functions
- `packages/state/src/stores/functions-demo.store.ts` - Client-side state management
- `packages/ui-lit/src/firebase/df-functions-demo.ts` - UI component demonstrating usage
