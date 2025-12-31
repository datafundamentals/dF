import {computed, signal} from '@lit-labs/signals';
import type {FirebaseApp} from 'firebase/app';
import {
  connectFirestoreToEmulator,
  enableFirestoreOfflinePersistence,
  getFirestoreDb,
} from '@df/firebase';
import type {
  ActivityTypeDraft,
  ActivityTypeDocument,
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

const defaultState: FirestoreCollectionState<ActivityTypeDocument> = {
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

const fallbackStateSignal = signal<FirestoreCollectionState<ActivityTypeDocument>>({...defaultState});
const storeSignal = signal<FirestoreCollectionStore<ActivityTypeDocument> | null>(null);
const collectionRefSignal = signal<CollectionReference<DocumentData> | null>(null);
const activeUserIdSignal = signal<string | null>(null);

export const activityTypeCollectionState = computed<FirestoreCollectionState<ActivityTypeDocument>>(() => {
  const store = storeSignal.get();
  return store ? store.state.get() : fallbackStateSignal.get();
});

export async function initializeActivityTypeStore(
  app: FirebaseApp,
  userId: string,
  useEmulator: boolean
): Promise<void> {
  if (!userId) {
    throw new Error('A Firebase Auth user id is required to initialize activity types.');
  }

  if (userId === activeUserIdSignal.get() && storeSignal.get()) {
    return;
  }

  teardownActivityTypeStore();

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

  const newStore = new FirestoreCollectionStore<ActivityTypeDocument>(ref, {
    defaultConstraints: [orderBy('order', 'asc'), orderBy('typeNameLower', 'asc')],
    defaultQueryDescription: 'Activity types (ordered)',
    pageSize: PAGE_SIZE,
    mapDocument: normalizeActivityType,
  });

  collectionRefSignal.set(ref);
  storeSignal.set(newStore);
  activeUserIdSignal.set(userId);

  await newStore.loadInitialPage();
  newStore.startRealtime();
}

export function teardownActivityTypeStore(): void {
  const store = storeSignal.get();
  if (store) {
    store.stopRealtime();
  }

  storeSignal.set(null);
  collectionRefSignal.set(null);
  activeUserIdSignal.set(null);
  fallbackStateSignal.set({...defaultState});
}

export async function addActivityType(draft: ActivityTypeDraft): Promise<string> {
  const activeStore = ensureStore();
  const normalized = normalizeDraft(draft);
  const now = new Date();

  const payload: FirestoreDocumentData<ActivityTypeDocument> = {
    typeName: normalized.typeName,
    typeNameLower: normalized.typeName.toLowerCase(),
    unit: normalized.unit,
    defaultNumber: normalized.defaultNumber,
    order: normalized.order,
    createdAt: now,
    updatedAt: now,
    ownerId: ensureActiveUserId(),
  };

  const id = await activeStore.create(payload);
  await activeStore.refresh();
  return id;
}

export async function updateActivityType(
  id: string,
  updates: Partial<ActivityTypeDraft>
): Promise<void> {
  const activeStore = ensureStore();
  const payload: Partial<FirestoreDocumentData<ActivityTypeDocument>> = {};

  if (typeof updates.typeName === 'string') {
    const name = updates.typeName.trim();
    if (!name) {
      throw new Error('Type name is required.');
    }
    payload.typeName = name;
    payload.typeNameLower = name.toLowerCase();
  }

  if (typeof updates.unit === 'string') {
    const unit = updates.unit.trim();
    if (!unit) {
      throw new Error('Unit is required.');
    }
    payload.unit = unit;
  }

  if (typeof updates.defaultNumber === 'number') {
    payload.defaultNumber = normalizeDefaultNumber(updates.defaultNumber);
  }

  if (typeof updates.order === 'number') {
    payload.order = normalizeOrder(updates.order);
  }

  payload.updatedAt = new Date();

  await activeStore.update(id, payload);
  await activeStore.refresh();
}

export async function deleteActivityType(id: string): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.delete(id);
  await activeStore.refresh();
}

export async function refreshActivityTypes(): Promise<void> {
  const activeStore = ensureStore();
  await activeStore.refresh();
}

function normalizeActivityType(entry: ActivityTypeDocument): ActivityTypeDocument {
  const createdAt = entry.createdAt instanceof Timestamp ? entry.createdAt.toDate() : entry.createdAt ?? null;
  const updatedAt = entry.updatedAt instanceof Timestamp ? entry.updatedAt.toDate() : entry.updatedAt ?? null;

  return {
    ...entry,
    createdAt,
    updatedAt,
    typeNameLower: entry.typeNameLower ?? entry.typeName.toLowerCase(),
  };
}

function normalizeDraft(draft: ActivityTypeDraft): ActivityTypeDraft {
  const typeName = draft.typeName.trim();
  if (!typeName) {
    throw new Error('Type name is required.');
  }

  const unit = draft.unit.trim();
  if (!unit) {
    throw new Error('Unit is required.');
  }

  return {
    typeName,
    unit,
    defaultNumber: normalizeDefaultNumber(draft.defaultNumber),
    order: normalizeOrder(draft.order),
  };
}

function normalizeDefaultNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('Default number must be a valid number.');
  }
  const normalized = Math.trunc(value);
  if (normalized < 0) {
    throw new Error('Default number must be zero or greater.');
  }
  return normalized;
}

function normalizeOrder(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('Order must be a valid number.');
  }
  const normalized = Math.trunc(value);
  if (normalized < 0) {
    throw new Error('Order must be zero or greater.');
  }
  return normalized;
}

function ensureStore(): FirestoreCollectionStore<ActivityTypeDocument> {
  const store = storeSignal.get();
  if (!store) {
    throw new Error('Activity type store has not been initialized.');
  }
  return store;
}

function ensureActiveUserId(): string {
  const userId = activeUserIdSignal.get();
  if (!userId) {
    throw new Error('Activity type actions require an authenticated user.');
  }
  return userId;
}

function buildCollectionPath(userId: string): string {
  return `activity/${userId}/activityTypes`;
}

export function __setActivityTypeDemoState(state: FirestoreCollectionState<ActivityTypeDocument>): void {
  if (storeSignal.get()) {
    throw new Error('Cannot set demo state after the activity type store has been initialized.');
  }

  fallbackStateSignal.set(state);
}

if (typeof globalThis === 'object') {
  const target = globalThis as {
    __dfSetActivityTypeDemoState?: typeof __setActivityTypeDemoState;
  };

  target.__dfSetActivityTypeDemoState = __setActivityTypeDemoState;
}
