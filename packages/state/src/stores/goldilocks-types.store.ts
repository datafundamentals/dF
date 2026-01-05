import {computed, signal} from '@lit-labs/signals';
import type {FirebaseApp} from 'firebase/app';
import {
  connectFirestoreToEmulator,
  enableFirestoreOfflinePersistence,
  getFirestoreDb,
} from '@df/firebase';
import type {
  GoldilocksTypeDraft,
  GoldilocksTypeDocument,
  FirestoreCollectionState,
  FirestoreDocumentData,
} from '@df/types';
import {FirestoreCollectionStore} from './firestore-base.store.js';
import {
  Timestamp,
  collection,
  orderBy,
  type CollectionReference,
  type DocumentData,
} from 'firebase/firestore';

const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8280;
const PAGE_SIZE = 20;

const defaultState: FirestoreCollectionState<GoldilocksTypeDocument> = {
  status: 'idle',
  documents: [],
  error: null,
  isListening: false,
  lastUpdated: null,
  currentPage: 1,
  pageSize: PAGE_SIZE,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'Awaiting authentication',
};

const fallbackStateSignal = signal<FirestoreCollectionState<GoldilocksTypeDocument>>({...defaultState});
const storeSignal = signal<FirestoreCollectionStore<GoldilocksTypeDocument> | null>(null);
const collectionRefSignal = signal<CollectionReference<DocumentData> | null>(null);
const activeUserIdSignal = signal<string | null>(null);

export const goldilocksTypeCollectionState = computed<FirestoreCollectionState<GoldilocksTypeDocument>>(() => {
  const store = storeSignal.get();
  return store ? store.state.get() : fallbackStateSignal.get();
});

export async function initializeGoldilocksTypeStore(
  app: FirebaseApp,
  userId: string,
  useEmulator: boolean
): Promise<void> {
  if (!userId) {
    throw new Error('A Firebase Auth user id is required to initialize goldilocks types.');
  }

  if (userId === activeUserIdSignal.get() && storeSignal.get()) {
    return;
  }

  teardownGoldilocksTypeStore();

  const db = getFirestoreDb(app);

  if (useEmulator) {
    connectFirestoreToEmulator(db, {
      host: FIRESTORE_HOST,
      port: FIRESTORE_PORT,
    });
  }

  await enableFirestoreOfflinePersistence(db);

  const collectionPath = buildCollectionPath(userId);
  const ref = collection(db, collectionPath);

  const newStore = new FirestoreCollectionStore<GoldilocksTypeDocument>(ref, {
    defaultConstraints: [orderBy('nameLower', 'asc')],
    defaultQueryDescription: 'Goldilocks types (alphabetical)',
    pageSize: PAGE_SIZE,
    mapDocument: normalizeGoldilocksType,
  });

  collectionRefSignal.set(ref);
  storeSignal.set(newStore);
  activeUserIdSignal.set(userId);

  await newStore.loadInitialPage();
  newStore.startRealtime();
}

export function teardownGoldilocksTypeStore(): void {
  const store = storeSignal.get();
  if (store) {
    store.stopRealtime();
  }

  storeSignal.set(null);
  collectionRefSignal.set(null);
  activeUserIdSignal.set(null);
  fallbackStateSignal.set({...defaultState});
}

export async function addGoldilocksType(draft: GoldilocksTypeDraft): Promise<string> {
  const activeStore = ensureStore();
  const normalized = normalizeDraft(draft);
  const now = new Date();

  const payload: FirestoreDocumentData<GoldilocksTypeDocument> = {
    name: normalized.name,
    nameLower: normalized.name.toLowerCase(),
    first: normalized.first,
    second: normalized.second,
    third: normalized.third,
    createdAt: now,
    updatedAt: now,
    ownerId: ensureActiveUserId(),
  };

  const id = await activeStore.create(payload);
  await activeStore.refresh();
  return id;
}

export async function updateGoldilocksType(
  id: string,
  updates: Partial<GoldilocksTypeDraft>
): Promise<void> {
  const activeStore = ensureStore();
  const payload: Partial<FirestoreDocumentData<GoldilocksTypeDocument>> = {};

  if (typeof updates.name === 'string') {
    const name = updates.name.trim();
    if (!name) {
      throw new Error('Type name is required.');
    }
    payload.name = name;
    payload.nameLower = name.toLowerCase();
  }

  if (typeof updates.first === 'string') {
    const first = updates.first.trim();
    if (!first) {
      throw new Error('First option is required.');
    }
    payload.first = first;
  }

  if (typeof updates.second === 'string') {
    const second = updates.second.trim();
    if (!second) {
      throw new Error('Second option is required.');
    }
    payload.second = second;
  }

  if (typeof updates.third === 'string') {
    const third = updates.third.trim();
    if (!third) {
      throw new Error('Third option is required.');
    }
    payload.third = third;
  }

  payload.updatedAt = new Date();

  await activeStore.update(id, payload);
  await activeStore.refresh();
}

export async function deleteGoldilocksType(id: string): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.delete(id);
  await activeStore.refresh();
}

export async function refreshGoldilocksTypes(): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.refresh();
}

function normalizeGoldilocksType(entry: GoldilocksTypeDocument): GoldilocksTypeDocument {
  const createdAt = entry.createdAt instanceof Timestamp ? entry.createdAt.toDate() : entry.createdAt ?? null;
  const updatedAt = entry.updatedAt instanceof Timestamp ? entry.updatedAt.toDate() : entry.updatedAt ?? null;

  return {
    ...entry,
    createdAt,
    updatedAt,
    nameLower: entry.nameLower ?? entry.name.toLowerCase(),
  };
}

function normalizeDraft(draft: GoldilocksTypeDraft): GoldilocksTypeDraft {
  const name = draft.name.trim();
  if (!name) {
    throw new Error('Type name is required.');
  }

  const first = draft.first.trim();
  if (!first) {
    throw new Error('First option is required.');
  }

  const second = draft.second.trim();
  if (!second) {
    throw new Error('Second option is required.');
  }

  const third = draft.third.trim();
  if (!third) {
    throw new Error('Third option is required.');
  }

  return {
    name,
    first,
    second,
    third,
  };
}

function ensureStore(): FirestoreCollectionStore<GoldilocksTypeDocument> {
  const store = storeSignal.get();
  if (!store) {
    throw new Error('Goldilocks type store has not been initialized.');
  }
  return store;
}

function ensureActiveUserId(): string {
  const userId = activeUserIdSignal.get();
  if (!userId) {
    throw new Error('Goldilocks type actions require an authenticated user.');
  }
  return userId;
}

function buildCollectionPath(userId: string): string {
  return `goldilocks/${userId}/goldilocksTypes`;
}

export function __setGoldilocksTypeDemoState(state: FirestoreCollectionState<GoldilocksTypeDocument>): void {
  if (storeSignal.get()) {
    throw new Error('Cannot set demo state after the goldilocks type store has been initialized.');
  }

  fallbackStateSignal.set(state);
}

if (typeof globalThis === 'object') {
  const target = globalThis as {
    __dfSetGoldilocksTypeDemoState?: typeof __setGoldilocksTypeDemoState;
  };

  target.__dfSetGoldilocksTypeDemoState = __setGoldilocksTypeDemoState;
}
