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
  ExerciseDraft,
  ExerciseEntry,
  PushupDraft,
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

const defaultState: FirestoreCollectionState<ExerciseEntry> = {
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

const fallbackStateSignal = signal<FirestoreCollectionState<ExerciseEntry>>({...defaultState});
const storeSignal = signal<FirestoreCollectionStore<ExerciseEntry> | null>(null);
const collectionRefSignal = signal<CollectionReference<DocumentData> | null>(null);
const activeUserIdSignal = signal<string | null>(null);

export const pushupCollectionState = computed<FirestoreCollectionState<ExerciseEntry>>(() => {
  const store = storeSignal.get();
  return store ? store.state.get() : fallbackStateSignal.get();
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

  const newStore = new FirestoreCollectionStore<ExerciseEntry>(ref, {
    defaultConstraints: [orderBy('recordedAt', 'desc')],
    defaultQueryDescription: 'Your activity history (newest first)',
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
  // Convert legacy pushup format to new exercise format
  const exerciseDraft: ExerciseDraft = {
    exerciseType: 'pushups',
    value: draft.count,
    note: draft.note,
    recordedAt: draft.recordedAt,
  };
  return logExerciseEntry(exerciseDraft);
}

export async function logExerciseEntry(draft: ExerciseDraft): Promise<string> {
  if (!Number.isFinite(draft.value)) {
    throw new Error('Exercise value must be a valid number.');
  }

  const value = Math.max(0, Math.trunc(draft.value));
  if (value <= 0) {
    throw new Error('Exercise value must be greater than zero.');
  }

  const now = new Date();
  const recordedAt = draft.recordedAt ?? now;
  const payload: FirestoreDocumentData<ExerciseEntry> = {
    exerciseType: draft.exerciseType,
    value,
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

function normalizeEntry(entry: ExerciseEntry): ExerciseEntry {
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

function ensureStore(): FirestoreCollectionStore<ExerciseEntry> {
  const store = storeSignal.get();
  if (!store) {
    throw new Error('Exercise store has not been initialized. Call initializePushupStore() after authentication.');
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
