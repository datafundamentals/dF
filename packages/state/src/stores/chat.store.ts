import {computed, signal} from '@lit-labs/signals';
import type {FirebaseApp} from 'firebase/app';
import {
  connectFirestoreToEmulator,
  getFirestoreDb,
} from '@df/firebase';
import type {
  ChatMessage,
  ChatMessageDraft,
  FirestoreCollectionState,
  FirestoreDocumentData,
  ChatSendStatus,
} from '@df/types';
import {FirestoreCollectionStore} from './firestore-base.store.js';
import {
  Timestamp,
  collection,
  orderBy,
  type CollectionReference,
  type DocumentData,
} from 'firebase/firestore';
import {firebaseAuthState} from './firebase-auth.store.js';

const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8280;
const COLLECTION_PATH = 'chatMessage';
const DEFAULT_PAGE_SIZE = 50;

const fallbackStateSignal = signal<FirestoreCollectionState<ChatMessage>>({
  status: 'idle',
  documents: [],
  error: null,
  isListening: false,
  lastUpdated: null,
  currentPage: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'Latest messages',
});

const sendStatusSignal = signal<ChatSendStatus>('idle');
const sendErrorSignal = signal<string | null>(null);

let collectionRef: CollectionReference<DocumentData> | null = null;
const storeSignal = signal<FirestoreCollectionStore<ChatMessage> | null>(null);

export const chatMessagesState = computed<FirestoreCollectionState<ChatMessage>>(() => {
  const store = storeSignal.get();
  return store ? store.state.get() : fallbackStateSignal.get();
});

export const chatSendState = computed(() => ({
  status: sendStatusSignal.get(),
  error: sendErrorSignal.get(),
}));

export async function initializeChatStore(app: FirebaseApp, useEmulator: boolean): Promise<void> {
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

  // Offline persistence disabled for chat - we want fresh data on every load
  // and real-time updates are more important than offline viewing for chat
  // await enableFirestoreOfflinePersistence(db);

  collectionRef = collection(db, COLLECTION_PATH);

  const newStore = new FirestoreCollectionStore<ChatMessage>(collectionRef, {
    defaultConstraints: [orderBy('createdAt', 'asc')],
    defaultQueryDescription: 'Messages (oldest first)',
    pageSize: DEFAULT_PAGE_SIZE,
    transformCreate: applyCreateTransforms,
    mapDocument: normalizeFromFirestore,
  });

  storeSignal.set(newStore);
  await newStore.loadInitialPage();
  newStore.startRealtime();
}

export async function sendChatMessage(draft: ChatMessageDraft): Promise<string> {
  const trimmed = draft.text.trim();
  if (!trimmed) {
    throw new Error('Cannot send an empty message.');
  }

  const activeStore = ensureStore();
  const {authUser} = firebaseAuthState.get();

  if (!authUser) {
    throw new Error('You must be signed in to send messages.');
  }

  sendStatusSignal.set('sending');
  sendErrorSignal.set(null);

  const payload: FirestoreDocumentData<ChatMessage> = {
    text: trimmed,
    userId: authUser.uid,
    userDisplayName: resolveDisplayName(authUser.displayName, authUser.email),
    userPhotoURL: authUser.photoURL ?? null,
    createdAt: new Date(),
  };

  try {
    const id = await activeStore.create(payload);
    sendStatusSignal.set('idle');
    return id;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send chat message.';
    sendStatusSignal.set('error');
    sendErrorSignal.set(message);
    throw error;
  }
}

export function startChatRealtime(): void {
  ensureStore().startRealtime();
}

export function stopChatRealtime(): void {
  ensureStore().stopRealtime();
}

export function resetChatDemoState(): void {
  storeSignal.set(null);
  collectionRef = null;
  sendStatusSignal.set('idle');
  sendErrorSignal.set(null);
  fallbackStateSignal.set({
    status: 'idle',
    documents: [],
    error: null,
    isListening: false,
    lastUpdated: null,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    hasNextPage: false,
    hasPreviousPage: false,
    queryDescription: 'Latest messages',
  });
}

export function __setChatDemoState(state: FirestoreCollectionState<ChatMessage>): void {
  if (storeSignal.get()) {
    throw new Error('Cannot set chat demo state after the chat store has been initialized.');
  }

  fallbackStateSignal.set(state);
}

export function __setChatSendState(status: ChatSendStatus, error: string | null = null): void {
  if (storeSignal.get()) {
    throw new Error('Cannot override chat send state after initialization.');
  }

  sendStatusSignal.set(status);
  sendErrorSignal.set(error);
}

function ensureStore(): FirestoreCollectionStore<ChatMessage> {
  const store = storeSignal.get();
  if (!store || !collectionRef) {
    throw new Error('Chat store has not been initialized. Call initializeChatStore() first.');
  }

  return store;
}

function resolveDisplayName(displayName?: string | null, email?: string | null): string {
  if (displayName && displayName.trim()) {
    return displayName.trim();
  }

  if (email && email.trim()) {
    const [localPart] = email.split('@');
    return localPart;
  }

  return 'Anonymous';
}

function applyCreateTransforms(data: FirestoreDocumentData<ChatMessage>): Record<string, unknown> {
  return {
    ...data,
    createdAt: data.createdAt ?? new Date(),
  };
}

function normalizeFromFirestore(doc: ChatMessage): ChatMessage {
  const createdAt = doc.createdAt instanceof Timestamp ? doc.createdAt.toDate() : doc.createdAt ?? null;

  return {
    ...doc,
    createdAt,
  };
}
