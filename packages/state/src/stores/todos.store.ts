import {computed, signal} from '@lit-labs/signals';
import type {FirebaseApp} from 'firebase/app';
import {
  connectFirestoreToEmulator,
  enableFirestoreOfflinePersistence,
  getFirestoreDb,
} from '@df/firebase';
import type {
  FirestoreCollectionState,
  FirestoreDocumentData,
  TodoDraft,
  TodoDocument,
  TodoFilterState,
  TodoPriority,
} from '@df/types';
import {FirestoreCollectionStore} from './firestore-base.store.js';
import {
  Timestamp,
  collection,
  orderBy,
  where,
  type CollectionReference,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';

const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8280;
const COLLECTION_PATH = 'todos';

const defaultFilters: TodoFilterState = {
  showCompleted: true,
  priority: 'all',
  tag: 'all',
  search: '',
};

const filterSignal = signal<TodoFilterState>({...defaultFilters});
const fallbackStateSignal = signal<FirestoreCollectionState<TodoDocument>>({
  status: 'idle',
  documents: [],
  error: null,
  isListening: false,
  lastUpdated: null,
  currentPage: 1,
  pageSize: 5,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'All todos',
});

let collectionRef: CollectionReference<DocumentData> | null = null;
const storeSignal = signal<FirestoreCollectionStore<TodoDocument> | null>(null);

export const todoCollectionState = computed<FirestoreCollectionState<TodoDocument>>(() => {
  const store = storeSignal.get();
  return store ? store.state.get() : fallbackStateSignal.get();
});

export const todoFilterState = computed(() => filterSignal.get());

export async function initializeTodosStore(app: FirebaseApp, useEmulator: boolean): Promise<void> {
  if (storeSignal.get()) {
    return;
  }

  const db = getFirestoreDb(app);

  if (useEmulator) {
    connectFirestoreToEmulator(db, {
      host: FIRESTORE_HOST,
      port: FIRESTORE_PORT,
    });
  }

  await enableFirestoreOfflinePersistence(db);

  collectionRef = collection(db, COLLECTION_PATH);

  const newStore = new FirestoreCollectionStore<TodoDocument>(collectionRef, {
    defaultConstraints: [orderBy('createdAt', 'desc')],
    defaultQueryDescription: 'All todos (newest first)',
    pageSize: 5,
    mapDocument: normalizeFromFirestore,
  });
  
  storeSignal.set(newStore);
  await applyTodoFilters();
}

export async function addTodo(draft: TodoDraft): Promise<string> {
  const activeStore = ensureStore();

  const now = new Date();
  const payload: FirestoreDocumentData<TodoDocument> = {
    title: draft.title,
    description: draft.description,
    completed: false,
    priority: draft.priority,
    tags: draft.tags,
    createdAt: now,
    updatedAt: now,
    dueDate: draft.dueDate,
    titleLower: draft.title.toLowerCase(),
  };

  const id = await activeStore.create(payload);
  await activeStore.refresh();
  return id;
}

export async function updateTodo(
  id: string,
  updates: Partial<Omit<TodoDraft, 'title'> & {title: string; completed: boolean}>
): Promise<void> {
  const activeStore = ensureStore();
  const payload: Partial<FirestoreDocumentData<TodoDocument>> = {};

  if (typeof updates.title === 'string') {
    payload.title = updates.title;
    payload.titleLower = updates.title.toLowerCase();
  }

  if (typeof updates.description === 'string') {
    payload.description = updates.description;
  }

  if (typeof updates.priority === 'string') {
    payload.priority = updates.priority as TodoPriority;
  }

  if (Array.isArray(updates.tags)) {
    payload.tags = updates.tags;
  }

  if (updates.dueDate !== undefined) {
    payload.dueDate = updates.dueDate;
  }

  if (typeof updates.completed === 'boolean') {
    payload.completed = updates.completed;
  }

  payload.updatedAt = new Date();

  await activeStore.update(id, payload);
  await activeStore.refresh();
}

export async function toggleTodoCompletion(id: string, completed: boolean): Promise<void> {
  await updateTodo(id, {completed});
}

export async function deleteTodo(id: string): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.delete(id);
  await activeStore.refresh();
}

export async function loadNextTodoPage(): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.loadNextPage();
}

export async function loadPreviousTodoPage(): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.loadPreviousPage();
}

export async function setTodoPageSize(size: number): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.setPageSize(size);
}

export function startTodoRealtime(): void {
  ensureStore().startRealtime();
}

export function stopTodoRealtime(): void {
  ensureStore().stopRealtime();
}

export async function setTodoFilters(next: Partial<TodoFilterState>): Promise<void> {
  filterSignal.set({...filterSignal.get(), ...next});
  await applyTodoFilters();
}

export async function resetTodoFilters(): Promise<void> {
  filterSignal.set({...defaultFilters});
  await applyTodoFilters();
}

async function applyTodoFilters(): Promise<void> {
  const activeStore = ensureStore();
  const filters = filterSignal.get();

  const constraints: QueryConstraint[] = [];
  const descriptions: string[] = [];

  if (!filters.showCompleted) {
    constraints.push(where('completed', '==', false));
    descriptions.push('Incomplete only');
  }

  if (filters.priority !== 'all') {
    constraints.push(where('priority', '==', filters.priority));
    descriptions.push(`Priority: ${filters.priority}`);
  }

  if (filters.tag !== 'all') {
    constraints.push(where('tags', 'array-contains', filters.tag));
    descriptions.push(`Tag: ${filters.tag}`);
  }

  const description = descriptions.length ? descriptions.join(' • ') : 'All todos (newest first)';

  await activeStore.setQuery(constraints, description);
}

function ensureStore(): FirestoreCollectionStore<TodoDocument> {
  const store = storeSignal.get();
  if (!store || !collectionRef) {
    throw new Error('Todo store has not been initialized. Call initializeTodosStore() first.');
  }

  return store;
}

function normalizeFromFirestore(doc: TodoDocument): TodoDocument {
  const createdAt = doc.createdAt instanceof Timestamp ? doc.createdAt.toDate() : doc.createdAt ?? null;
  const updatedAt = doc.updatedAt instanceof Timestamp ? doc.updatedAt.toDate() : doc.updatedAt ?? null;
  const dueDate = doc.dueDate instanceof Timestamp ? doc.dueDate.toDate() : doc.dueDate ?? null;

  return {
    ...doc,
    createdAt,
    updatedAt,
    dueDate,
    titleLower: doc.titleLower ?? doc.title.toLowerCase(),
  };
}

export function __setTodoDemoState(state: FirestoreCollectionState<TodoDocument>): void {
  if (storeSignal.get()) {
    throw new Error('Cannot set demo state after the todo store has been initialized.');
  }

  fallbackStateSignal.set(state);
}

export function __setTodoDemoFilters(filters: TodoFilterState): void {
  if (storeSignal.get()) {
    throw new Error('Cannot set demo filters after the todo store has been initialized.');
  }

  filterSignal.set(filters);
}

if (typeof globalThis === 'object') {
  const target = globalThis as {
    __dfSetTodoDemoState?: typeof __setTodoDemoState;
    __dfSetTodoDemoFilters?: typeof __setTodoDemoFilters;
  };

  target.__dfSetTodoDemoState = __setTodoDemoState;
  target.__dfSetTodoDemoFilters = __setTodoDemoFilters;
}
