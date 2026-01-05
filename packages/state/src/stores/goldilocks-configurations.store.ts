import {computed, signal} from '@lit-labs/signals';
import type {FirebaseApp} from 'firebase/app';
import {
  connectFirestoreToEmulator,
  enableFirestoreOfflinePersistence,
  getFirestoreDb,
} from '@df/firebase';
import type {
  GoldilocksConfigurationDraft,
  GoldilocksConfigurationEntry,
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

const defaultState: FirestoreCollectionState<GoldilocksConfigurationEntry> = {
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

const fallbackStateSignal = signal<FirestoreCollectionState<GoldilocksConfigurationEntry>>({...defaultState});
const storeSignal = signal<FirestoreCollectionStore<GoldilocksConfigurationEntry> | null>(null);
const collectionRefSignal = signal<CollectionReference<DocumentData> | null>(null);
const activeUserIdSignal = signal<string | null>(null);

export const goldilocksConfigurationCollectionState = computed<FirestoreCollectionState<GoldilocksConfigurationEntry>>(() => {
  const store = storeSignal.get();
  return store ? store.state.get() : fallbackStateSignal.get();
});

export async function initializeGoldilocksConfigurationStore(
  app: FirebaseApp,
  userId: string,
  useEmulator: boolean
): Promise<void> {
  if (!userId) {
    throw new Error('A Firebase Auth user id is required to initialize goldilocks configurations.');
  }

  if (userId === activeUserIdSignal.get() && storeSignal.get()) {
    return;
  }

  teardownGoldilocksConfigurationStore();

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

  const newStore = new FirestoreCollectionStore<GoldilocksConfigurationEntry>(ref, {
    defaultConstraints: [orderBy('createdAt', 'desc')],
    defaultQueryDescription: 'Goldilocks configurations (newest first)',
    pageSize: PAGE_SIZE,
    mapDocument: normalizeGoldilocksConfiguration,
  });

  collectionRefSignal.set(ref);
  storeSignal.set(newStore);
  activeUserIdSignal.set(userId);

  await newStore.loadInitialPage();
  newStore.startRealtime();
}

export function teardownGoldilocksConfigurationStore(): void {
  const store = storeSignal.get();
  if (store) {
    store.stopRealtime();
  }

  storeSignal.set(null);
  collectionRefSignal.set(null);
  activeUserIdSignal.set(null);
  fallbackStateSignal.set({...defaultState});
}

export async function saveGoldilocksConfiguration(draft: GoldilocksConfigurationDraft): Promise<string> {
  const activeStore = ensureStore();
  const normalized = normalizeDraft(draft);
  const now = new Date();

  const payload: FirestoreDocumentData<GoldilocksConfigurationEntry> = {
    goldilocksTypeName: normalized.goldilocksTypeName,
    first: normalized.first,
    second: normalized.second,
    third: normalized.third,
    selectedOptions: normalized.selectedOptions,
    note: normalized.note ?? null,
    createdAt: now,
    updatedAt: now,
    ownerId: ensureActiveUserId(),
  };

  const id = await activeStore.create(payload);
  await activeStore.refresh();
  return id;
}

export async function deleteGoldilocksConfiguration(id: string): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.delete(id);
  await activeStore.refresh();
}

export async function refreshGoldilocksConfigurations(): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.refresh();
}

function normalizeGoldilocksConfiguration(entry: GoldilocksConfigurationEntry): GoldilocksConfigurationEntry {
  const createdAt = entry.createdAt instanceof Timestamp ? entry.createdAt.toDate() : entry.createdAt ?? null;
  const updatedAt = entry.updatedAt instanceof Timestamp ? entry.updatedAt.toDate() : entry.updatedAt ?? null;

  return {
    ...entry,
    createdAt,
    updatedAt,
  };
}

function normalizeDraft(draft: GoldilocksConfigurationDraft): GoldilocksConfigurationDraft {
  const typeName = draft.goldilocksTypeName.trim();
  if (!typeName) {
    throw new Error('Goldilocks type name is required.');
  }

  const first = draft.first.trim();
  const second = draft.second.trim();
  const third = draft.third.trim();

  if (!first || !second || !third) {
    throw new Error('All three option labels are required.');
  }

  if (!Array.isArray(draft.selectedOptions) || draft.selectedOptions.length !== 2) {
    throw new Error('Exactly 2 selected options are required.');
  }

  const [selected1, selected2] = draft.selectedOptions;
  if (!selected1?.trim() || !selected2?.trim()) {
    throw new Error('Selected options cannot be empty.');
  }

  return {
    goldilocksTypeName: typeName,
    first,
    second,
    third,
    selectedOptions: [selected1.trim(), selected2.trim()],
    note: draft.note?.trim() || null,
  };
}

function ensureStore(): FirestoreCollectionStore<GoldilocksConfigurationEntry> {
  const store = storeSignal.get();
  if (!store) {
    throw new Error('Goldilocks configuration store has not been initialized.');
  }
  return store;
}

function ensureActiveUserId(): string {
  const userId = activeUserIdSignal.get();
  if (!userId) {
    throw new Error('Goldilocks configuration actions require an authenticated user.');
  }
  return userId;
}

function buildCollectionPath(userId: string): string {
  return `goldilocks/${userId}/configurations`;
}

export function __setGoldilocksConfigurationDemoState(state: FirestoreCollectionState<GoldilocksConfigurationEntry>): void {
  if (storeSignal.get()) {
    throw new Error('Cannot set demo state after the goldilocks configuration store has been initialized.');
  }

  fallbackStateSignal.set(state);
}

if (typeof globalThis === 'object') {
  const target = globalThis as {
    __dfSetGoldilocksConfigurationDemoState?: typeof __setGoldilocksConfigurationDemoState;
  };

  target.__dfSetGoldilocksConfigurationDemoState = __setGoldilocksConfigurationDemoState;
}
