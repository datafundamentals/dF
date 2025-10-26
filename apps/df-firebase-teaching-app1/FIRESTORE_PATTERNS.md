# Firestore CRUD Patterns

**Status:** ✅ Implemented (Ticket 6)
**Last Updated:** 2025-10-12

This document captures the Firestore architecture used by the teaching app. It accompanies the
`df-firestore-demo` surface, the shared todos store, and the reusable UI components that model
create/read/update/delete flows.

## Architecture Overview

### Core Store

- `packages/state/src/stores/firestore-base.store.ts` exposes a generic
  `FirestoreCollectionStore` with pagination, query management, CRUD helpers, and optional
  real-time listeners.
- `packages/state/src/stores/todos.store.ts` composes the base store with the teaching `todos`
  collection, connecting to the emulator, enabling IndexedDB persistence, and exposing
  convenience helpers for filters and mutations.
- Shared types live in `packages/types/src/firebase-firestore.types.ts` (base interfaces) and
  `packages/types/src/firebase-todos.types.ts` (domain model).

### UI Components

All Firestore UI components live in `packages/ui-lit/src/firebase/` and are exported via
`@df/ui-lit/firebase`:

- `<df-firestore-list>` — orchestration component that renders filters, pagination, real-time
  toggle, and uses the shared store to power the todos list.
- `<df-firestore-item>` — presentational card for a single todo.
- `<df-firestore-form>` — create/edit form that emits events with todo drafts.
- `<df-firestore-delete>` — confirmation panel for destructive actions.

Storybook coverage is provided in
`apps/df-storybook/stories/df-firestore-todos.stories.ts` so instructors can review each component
in isolation.

### Teaching Demo Surface

- `apps/df-firebase-teaching-app0/src/df-firestore-demo.ts` initialises the shared store, connects to
  the emulator (when `VITE_USE_EMULATOR=true`), enables offline persistence, and renders the
  Firestore list.
- `apps/df-firebase-teaching-app0/index.html` registers the demo alongside the emulator workspace and
  authentication demo.

## Offline Persistence & Emulator Wiring

```ts
import {initializeTodosStore} from '@df/state';
import {getFirebaseApp} from '@df/firebase';

const app = getFirebaseApp(getFirebaseConfig());
await initializeTodosStore(app, useEmulator());
```

- When running with `VITE_USE_EMULATOR=true`, the store connects to `127.0.0.1:8280` (configured in
  `firebase.json`).
- `initializeTodosStore` calls `enableFirestoreOfflinePersistence`, so todos remain available while
  offline and sync once connectivity returns.

## Queries, Pagination, Real-time

The base store accepts query constraints and manages cursors for pagination:

```ts
await setTodoFilters({priority: 'high', showCompleted: false});
await setTodoPageSize(10);
await loadNextTodoPage();
startTodoRealtime(); // toggles onSnapshot listener
```

UI patterns exercised in the demo:

- Equality filters (priority) and `array-contains` filters (tags) with matching composite indexes
  defined in `firestore.indexes.json`.
- Range-based pagination (`limit` + `startAfter`) with `Next page` / `Previous page` controls.
- Real-time listener toggle (`Enable/Disable real-time`) to demonstrate syncing without manual
  refresh.

## Seed Data

`scripts/seed-data/firestore-collections/todos.json` contains 12 teaching-centric todo documents that
exercise different priorities, tags, and date combinations. Seeding converts ISO timestamps into
Firestore `Timestamp` values to match production usage.

## Integration Tests

`apps/df-firebase-teaching-app0/tests/integration/firestore.spec.ts` covers:

1. Creating a todo via the UI
2. Updating and completing the todo
3. Pagination controls
4. Real-time toggle feedback
5. Priority filter
6. Deleting the created todo

Run the suite with `pnpm --filter @df/df-firebase-teaching-app0 test` once emulators are running.

