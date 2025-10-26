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
  PushupDraft,
  PushupEntry,
  PushupSummaryState,
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

const defaultState: FirestoreCollectionState<PushupEntry> = {
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

const fallbackStateSignal = signal<FirestoreCollectionState<PushupEntry>>({...defaultState});
const storeSignal = signal<FirestoreCollectionStore<PushupEntry> | null>(null);
const collectionRefSignal = signal<CollectionReference<DocumentData> | null>(null);
const activeUserIdSignal = signal<string | null>(null);

export const pushupCollectionState = computed<FirestoreCollectionState<PushupEntry>>(() => {
  const store = storeSignal.get();
  return store ? store.state.get() : fallbackStateSignal.get();
});

export const pushupSummaryState = computed<PushupSummaryState>(() => {
  const documents = pushupCollectionState.get().documents;
  const totalPushups = documents.reduce((sum, entry) => sum + entry.count, 0);
  const entryCount = documents.length;
  const lastEntryAt = entryCount > 0 ? documents[0].recordedAt ?? null : null;

  return {
    totalPushups,
    entryCount,
    lastEntryAt,
  };
});

export async function initializePushupStore(
  app: FirebaseApp,
  userId: string,
  useEmulator: boolean
): Promise<void> {
  if (!userId) {
    throw new Error('A Firebase Auth user id is required to initialize the pushup store.');
  }

  if (userId === activeUserIdSignal.get() && storeSignal.get()) {
    return;
  }

  teardownPushupStore();

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

  const newStore = new FirestoreCollectionStore<PushupEntry>(ref, {
    defaultConstraints: [orderBy('recordedAt', 'desc')],
    defaultQueryDescription: 'Your pushup history (newest first)',
    pageSize: PAGE_SIZE,
    mapDocument: normalizeEntry,
  });

  collectionRefSignal.set(ref);
  storeSignal.set(newStore);
  activeUserIdSignal.set(userId);

  await newStore.loadInitialPage();
  newStore.startRealtime();
}

export function teardownPushupStore(): void {
  const store = storeSignal.get();
  if (store) {
    store.stopRealtime();
  }

  storeSignal.set(null);
  collectionRefSignal.set(null);
  activeUserIdSignal.set(null);
  fallbackStateSignal.set({...defaultState});
}

export async function logPushupEntry(draft: PushupDraft): Promise<string> {
  if (!Number.isFinite(draft.count)) {
    throw new Error('Pushup count must be a valid number.');
  }

  const count = Math.max(0, Math.trunc(draft.count));
  if (count <= 0) {
    throw new Error('Pushup count must be greater than zero.');
  }

  const now = new Date();
  const recordedAt = draft.recordedAt ?? now;
  const payload: FirestoreDocumentData<PushupEntry> = {
    count,
    note: normalizeNote(draft.note),
    recordedAt,
    createdAt: now,
    updatedAt: now,
    ownerId: ensureActiveUserId(),
  };

  const activeStore = ensureStore();
  const id = await activeStore.create(payload);
  await activeStore.refresh();
  return id;
}

export async function deletePushupEntry(id: string): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.delete(id);
  await activeStore.refresh();
}

export async function refreshPushupEntries(): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.refresh();
}

export function getActivePushupCollectionPath(): string | null {
  const ref = collectionRefSignal.get();
  return ref?.path ?? null;
}

function normalizeEntry(entry: PushupEntry): PushupEntry {
  const recordedAt = entry.recordedAt instanceof Timestamp ? entry.recordedAt.toDate() : entry.recordedAt ?? null;
  const createdAt = entry.createdAt instanceof Timestamp ? entry.createdAt.toDate() : entry.createdAt ?? null;
  const updatedAt = entry.updatedAt instanceof Timestamp ? entry.updatedAt.toDate() : entry.updatedAt ?? null;

  return {
    ...entry,
    recordedAt,
    createdAt,
    updatedAt,
  };
}

function ensureStore(): FirestoreCollectionStore<PushupEntry> {
  const store = storeSignal.get();
  if (!store) {
    throw new Error('Pushup store has not been initialized. Call initializePushupStore() after authentication.');
  }
  return store;
}

function ensureActiveUserId(): string {
  const userId = activeUserIdSignal.get();
  if (!userId) {
    throw new Error('Pushup actions require an authenticated user.');
  }
  return userId;
}

function normalizeNote(note: PushupDraft['note']): string | null {
  if (typeof note !== 'string') {
    return null;
  }

  const trimmed = note.trim();
  return trimmed.length ? trimmed : null;
}

function buildCollectionPath(userId: string): string {
  return `activity/${userId}/pushups`;
}
