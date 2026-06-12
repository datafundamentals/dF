import {computed, signal} from '@lit-labs/signals';
import type {FirebaseApp} from 'firebase/app';
import type {Firestore} from 'firebase/firestore';
import {connectFirestoreToEmulator, getFirestoreDb} from '@df/firebase';
import {
  callable,
  connectFunctionsToEmulator,
  getFirebaseFunctions,
  DEFAULT_FUNCTIONS_REGION,
  type Functions,
} from '@df/firebase/functions';
import type {FirestoreCollectionState} from '@df/types/firebase-firestore.types';
import type {FirestoreDocument} from '@df/types/firebase-firestore.types';
import type {Attachment, OpenclawDeleteStatus} from '@df/types/openclaw-chat.types';
import type {OpenclawSendStatus} from '@df/types';
import {
  Timestamp,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type CollectionReference,
  type DocumentData,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';

const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8280;
const WORK_REQUESTS_COLLECTION = 'openclawWorkRequests';
const MESSAGES_SUBCOLLECTION = 'messages';
const DEFAULT_AGENT_ID = 'cathy';

interface OpenclawMessage extends FirestoreDocument {
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date | null;
  sessionId: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  turnNumber?: number;
}

interface OpenclawConversation extends FirestoreDocument {
  userId: string;
  agentId: string;
  title: string | null;
  status: 'active' | 'accepted';
  createdAt: Date | null;
  lastMessageAt: Date | null;
  attachments: Attachment[];
  currentTurnNumber: number;
}

const messagesSignal = signal<readonly OpenclawMessage[]>([]);
const conversationsSignal = signal<readonly OpenclawConversation[]>([]);

const messagesStatusSignal = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
const conversationsStatusSignal = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');

const messagesErrorSignal = signal<string | null>(null);
const conversationsErrorSignal = signal<string | null>(null);

const isMessagesListeningSignal = signal(false);
const isConversationsListeningSignal = signal(false);

let turnCountSignal = signal(0);

const sendStatusSignal = signal<OpenclawSendStatus>('idle');
const sendErrorSignal = signal<string | null>(null);
const deleteStatusSignal = signal<OpenclawDeleteStatus>('idle');
const deleteErrorSignal = signal<string | null>(null);
const deletingConversationIdSignal = signal<string | null>(null);
const activeConversationIdSignal = signal<string | null>(null);

let unsubscribeMessages: Unsubscribe | null = null;
let unsubscribeConversations: Unsubscribe | null = null;
let messagesCollectionRef: CollectionReference<DocumentData> | null = null;
let initializedDb: Firestore | null = null;
let initializedFunctions: Functions | null = null;
let initializedUserId: string | null = null;
let ensureConversationPromise: Promise<string | null> | null = null;
let demoMode = false;

export const openclawChatMessagesState = computed<FirestoreCollectionState<OpenclawMessage>>(() => ({
  status: messagesStatusSignal.get(),
  documents: messagesSignal.get(),
  error: messagesErrorSignal.get(),
  isListening: isMessagesListeningSignal.get(),
  lastUpdated: null,
  currentPage: 1,
  pageSize: 100,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'Conversation messages (oldest first)',
}));

export const openclawConversationsState = computed<FirestoreCollectionState<OpenclawConversation>>(() => ({
  status: conversationsStatusSignal.get(),
  documents: conversationsSignal.get(),
  error: conversationsErrorSignal.get(),
  isListening: isConversationsListeningSignal.get(),
  lastUpdated: null,
  currentPage: 1,
  pageSize: 100,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'OpenClaw work requests for current user',
}));

export const openclawActiveConversationState = computed(() => {
  const activeConversationId = activeConversationIdSignal.get();
  const conversation = conversationsSignal.get().find((item) => item.id === activeConversationId) ?? null;

  return {
    activeConversationId,
    conversation,
  };
});

export const openclawChatSendState = computed(() => ({
  status: sendStatusSignal.get(),
  error: sendErrorSignal.get(),
}));

export const openclawChatDeleteState = computed(() => ({
  status: deleteStatusSignal.get(),
  error: deleteErrorSignal.get(),
  deletingConversationId: deletingConversationIdSignal.get(),
}));

interface OpenclawDemoState {
  conversations: readonly OpenclawConversation[];
  messages: readonly OpenclawMessage[];
  activeConversationId?: string | null;
  conversationsStatus?: 'idle' | 'loading' | 'ready' | 'error';
  messagesStatus?: 'idle' | 'loading' | 'ready' | 'error';
  conversationsError?: string | null;
  messagesError?: string | null;
  sendStatus?: OpenclawSendStatus;
  sendError?: string | null;
  deleteStatus?: OpenclawDeleteStatus;
  deleteError?: string | null;
  deletingConversationId?: string | null;
  isConversationsListening?: boolean;
  isMessagesListening?: boolean;
}

export function __setOpenclawDemoState(state: OpenclawDemoState): void {
  if (initializedDb || initializedUserId || unsubscribeConversations || unsubscribeMessages) {
    throw new Error('Cannot set OpenClaw demo state after the store has been initialized.');
  }

  demoMode = true;
  conversationsSignal.set([...state.conversations]);
  messagesSignal.set([...state.messages]);
  activeConversationIdSignal.set(
    state.activeConversationId
      ?? state.conversations[0]?.id
      ?? null
  );
  conversationsStatusSignal.set(state.conversationsStatus ?? 'ready');
  messagesStatusSignal.set(state.messagesStatus ?? 'ready');
  conversationsErrorSignal.set(state.conversationsError ?? null);
  messagesErrorSignal.set(state.messagesError ?? null);
  sendStatusSignal.set(state.sendStatus ?? 'idle');
  sendErrorSignal.set(state.sendError ?? null);
  deleteStatusSignal.set(state.deleteStatus ?? 'idle');
  deleteErrorSignal.set(state.deleteError ?? null);
  deletingConversationIdSignal.set(state.deletingConversationId ?? null);
  isConversationsListeningSignal.set(state.isConversationsListening ?? false);
  isMessagesListeningSignal.set(state.isMessagesListening ?? false);
}

export function __resetOpenclawDemoState(): void {
  if (!demoMode) {
    return;
  }

  demoMode = false;
  conversationsSignal.set([]);
  messagesSignal.set([]);
  activeConversationIdSignal.set(null);
  conversationsStatusSignal.set('idle');
  messagesStatusSignal.set('idle');
  conversationsErrorSignal.set(null);
  messagesErrorSignal.set(null);
  sendStatusSignal.set('idle');
  sendErrorSignal.set(null);
  deleteStatusSignal.set('idle');
  deleteErrorSignal.set(null);
  deletingConversationIdSignal.set(null);
  isConversationsListeningSignal.set(false);
  isMessagesListeningSignal.set(false);
}

export function __setOpenclawFunctionsForTests(functions: Functions): void {
  initializedFunctions = functions;
}

export function __resetOpenclawStoreForTests(): void {
  stopOpenclawRealtime();
  messagesSignal.set([]);
  conversationsSignal.set([]);
  messagesStatusSignal.set('idle');
  conversationsStatusSignal.set('idle');
  messagesErrorSignal.set(null);
  conversationsErrorSignal.set(null);
  sendStatusSignal.set('idle');
  sendErrorSignal.set(null);
  deleteStatusSignal.set('idle');
  deleteErrorSignal.set(null);
  deletingConversationIdSignal.set(null);
  activeConversationIdSignal.set(null);
  messagesCollectionRef = null;
  initializedDb = null;
  initializedFunctions = null;
  initializedUserId = null;
  ensureConversationPromise = null;
  turnCountSignal.set(0);
  demoMode = false;
}

export async function initializeOpenclawChatStore(
  app: FirebaseApp,
  useEmulator: boolean,
  userId: string
): Promise<void> {
  if (initializedDb && initializedUserId === userId) {
    startOpenclawRealtime();
    return;
  }

  stopOpenclawRealtime();
  initializedUserId = userId;

  const db = getFirestoreDb(app);
  if (useEmulator) {
    connectFirestoreToEmulator(db, {host: FIRESTORE_HOST, port: FIRESTORE_PORT});
  }

  const functions = getFirebaseFunctions(app, DEFAULT_FUNCTIONS_REGION);
  if (useEmulator) {
    connectFunctionsToEmulator(functions, {host: FIRESTORE_HOST, port: 5501});
  }

  initializedDb = db;
  initializedFunctions = functions;
  startConversationsListener(db, userId);
}

export function startOpenclawRealtime(): void {
  if (!initializedDb || !initializedUserId) {
    return;
  }

  if (!unsubscribeConversations) {
    startConversationsListener(initializedDb, initializedUserId);
    return;
  }

  const activeConversationId = activeConversationIdSignal.get();
  if (activeConversationId && !unsubscribeMessages) {
    startMessagesListener(initializedDb, activeConversationId);
  }
}

export function stopOpenclawRealtime(): void {
  if (unsubscribeConversations) {
    unsubscribeConversations();
    unsubscribeConversations = null;
  }

  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }

  isConversationsListeningSignal.set(false);
  isMessagesListeningSignal.set(false);
}

export async function createOpenclawConversation(agentId?: string): Promise<string> {
  if (!initializedDb || !initializedUserId) {
    throw new Error('OpenClaw chat store is not initialized.');
  }

  const conversationRef = doc(collection(initializedDb, WORK_REQUESTS_COLLECTION));
  const requestId = conversationRef.id;

  await setDoc(conversationRef, {
    userId: initializedUserId,
    agentId: agentId ?? DEFAULT_AGENT_ID,
    title: null,
    status: 'active',
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    currentTurnNumber: 0,
  });

  switchOpenclawConversation(requestId);
  return requestId;
}

export function switchOpenclawConversation(requestId: string): void {
  if (!initializedDb) {
    return;
  }

  sendStatusSignal.set('idle');
  sendErrorSignal.set(null);
  startMessagesListener(initializedDb, requestId);
}

export async function renameOpenclawConversation(requestId: string, title: string): Promise<void> {
  if (!initializedDb) {
    throw new Error('OpenClaw chat store is not initialized.');
  }

  const normalizedTitle = title.trim();
  await updateDoc(doc(initializedDb, WORK_REQUESTS_COLLECTION, requestId), {
    title: normalizedTitle.length ? normalizedTitle : null,
  });
}

export async function addAttachmentToOpenclawConversation(
  conversationId: string,
  attachment: Attachment
): Promise<void> {
  if (!initializedDb) {
    throw new Error('OpenClaw chat store is not initialized.');
  }

  await updateDoc(doc(initializedDb, WORK_REQUESTS_COLLECTION, conversationId), {
    attachments: arrayUnion(attachment),
  });
}

export async function removeAttachmentFromOpenclawConversation(
  conversationId: string,
  path: string
): Promise<void> {
  if (!initializedDb) {
    throw new Error('OpenClaw chat store is not initialized.');
  }

  const ref = doc(initializedDb, WORK_REQUESTS_COLLECTION, conversationId);
  const snapshot = await getDoc(ref);
  const data = snapshot.data();
  const current = normalizeAttachments(data?.attachments);
  const filtered = current.filter((a) => a.path !== path);

  await updateDoc(ref, {attachments: filtered});
}

interface DeleteOpenclawConversationResponse {
  success: true;
  requestId: string;
  deletedMessageCount: number;
}

export async function deleteOpenclawConversation(requestId: string): Promise<void> {
  if (demoMode) {
    const nextConversations = conversationsSignal.get().filter((item) => item.id !== requestId);
    conversationsSignal.set(nextConversations);
    if (activeConversationIdSignal.get() === requestId) {
      const nextConversationId = nextConversations[0]?.id ?? null;
      activeConversationIdSignal.set(nextConversationId);
      messagesSignal.set(nextConversationId
        ? messagesSignal.get().filter((message) => message.sessionId === nextConversationId)
        : []);
    }
    deleteStatusSignal.set('idle');
    deleteErrorSignal.set(null);
    deletingConversationIdSignal.set(null);
    return;
  }

  if (!initializedFunctions) {
    throw new Error('OpenClaw chat store is not initialized.');
  }

  deleteStatusSignal.set('deleting');
  deleteErrorSignal.set(null);
  deletingConversationIdSignal.set(requestId);

  try {
    const fn = callable<{requestId: string}, DeleteOpenclawConversationResponse>(
      initializedFunctions,
      'deleteOpenclawConversation'
    );
    await fn({requestId});
    deleteStatusSignal.set('idle');
    deletingConversationIdSignal.set(null);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete conversation.';
    deleteStatusSignal.set('error');
    deleteErrorSignal.set(message);
    deletingConversationIdSignal.set(null);
    throw error;
  }
}

export async function sendOpenclawMessage(content: string): Promise<void> {
  const requestId = activeConversationIdSignal.get();
  if (!requestId || !messagesCollectionRef || !initializedDb) {
    throw new Error('No active conversation.');
  }

  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error('Cannot send an empty message.');
  }

  sendStatusSignal.set('sending');
  sendErrorSignal.set(null);

  const nextTurnNumber = turnCountSignal.get() + 1;
  turnCountSignal.set(nextTurnNumber);

  try {
    await Promise.all([
      addDoc(messagesCollectionRef, {
        role: 'user',
        content: trimmed,
        createdAt: serverTimestamp(),
        sessionId: requestId,
        status: 'pending',
        turnNumber: nextTurnNumber,
      }),
      updateDoc(doc(initializedDb, WORK_REQUESTS_COLLECTION, requestId), {
        currentTurnNumber: nextTurnNumber,
        lastMessageAt: serverTimestamp(),
      }),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message.';
    sendStatusSignal.set('error');
    sendErrorSignal.set(message);
    throw error;
  }
}

function startConversationsListener(db: Firestore, userId: string): void {
  if (unsubscribeConversations) {
    unsubscribeConversations();
    unsubscribeConversations = null;
  }

  conversationsStatusSignal.set('loading');
  conversationsErrorSignal.set(null);

  const conversationsRef = collection(db, WORK_REQUESTS_COLLECTION);
  const q = query(conversationsRef, where('userId', '==', userId));

  isConversationsListeningSignal.set(true);
  unsubscribeConversations = onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs
        .map((item) => normalizeConversationDoc(item))
        .sort(compareConversations);

      conversationsSignal.set(docs);
      conversationsStatusSignal.set('ready');

      const activeConversationId = activeConversationIdSignal.get();
      if (!docs.length) {
        if (!ensureConversationPromise) {
          ensureConversationPromise = createOpenclawConversation()
            .then((requestId) => requestId)
            .catch((error) => {
              const message = error instanceof Error ? error.message : 'Failed to create conversation.';
              conversationsErrorSignal.set(message);
              conversationsStatusSignal.set('error');
              return null;
            })
            .finally(() => {
              ensureConversationPromise = null;
            });
        }
        return;
      }

      const nextConversationId = activeConversationId && docs.some((item) => item.id === activeConversationId)
        ? activeConversationId
        : docs[0]?.id ?? null;

      if (nextConversationId && nextConversationId !== activeConversationId) {
        startMessagesListener(db, nextConversationId);
      }
    },
    (error) => {
      conversationsErrorSignal.set(error.message);
      conversationsStatusSignal.set('error');
    }
  );
}

function startMessagesListener(db: Firestore, requestId: string): void {
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }

  activeConversationIdSignal.set(requestId);
  messagesSignal.set([]);
  messagesStatusSignal.set('loading');
  messagesErrorSignal.set(null);

  const conversation = conversationsSignal.get().find((c) => c.id === requestId);
  turnCountSignal.set(conversation?.currentTurnNumber ?? 0);

  messagesCollectionRef = collection(db, WORK_REQUESTS_COLLECTION, requestId, MESSAGES_SUBCOLLECTION);
  const q = query(messagesCollectionRef, orderBy('createdAt', 'asc'));

  isMessagesListeningSignal.set(true);
  unsubscribeMessages = onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((item) => normalizeMessage({id: item.id, ...item.data()} as OpenclawMessage));
      messagesSignal.set(docs);
      messagesStatusSignal.set('ready');

      if (sendStatusSignal.get() === 'sending') {
        const lastUserMessage = [...docs].reverse().find((item) => item.role === 'user');
        if (lastUserMessage?.status === 'complete') {
          sendStatusSignal.set('idle');
        } else if (lastUserMessage?.status === 'error') {
          sendStatusSignal.set('error');
          sendErrorSignal.set('Failed to send message.');
        }
      }
    },
    (error) => {
      messagesErrorSignal.set(error.message);
      messagesStatusSignal.set('error');
    }
  );
}

function normalizeConversationDoc(
  snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>
): OpenclawConversation {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    userId: String(data.userId ?? ''),
    agentId: String(data.agentId ?? DEFAULT_AGENT_ID),
    title: typeof data.title === 'string' ? data.title : null,
    status: data.status === 'accepted' ? 'accepted' : 'active',
    createdAt: normalizeTimestamp(data.createdAt),
    lastMessageAt: normalizeTimestamp(data.lastMessageAt),
    attachments: normalizeAttachments(data.attachments),
    currentTurnNumber: typeof data.currentTurnNumber === 'number' ? data.currentTurnNumber : 0,
  };
}

function normalizeAttachments(raw: unknown): Attachment[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((item) => ({
      url: String(item.url ?? ''),
      name: String(item.name ?? ''),
      path: String(item.path ?? ''),
      uploadedAt: normalizeTimestamp(item.uploadedAt) ?? new Date(0),
    }));
}

function normalizeMessage(message: OpenclawMessage): OpenclawMessage {
  return {
    ...message,
    createdAt: normalizeTimestamp(message.createdAt),
  };
}

function normalizeTimestamp(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (value instanceof Date) {
    return value;
  }

  return null;
}

function compareConversations(a: OpenclawConversation, b: OpenclawConversation): number {
  const lastMessageDelta = toSortableTime(b.lastMessageAt) - toSortableTime(a.lastMessageAt);
  if (lastMessageDelta !== 0) {
    return lastMessageDelta;
  }

  return toSortableTime(b.createdAt) - toSortableTime(a.createdAt);
}

function toSortableTime(value: Date | null): number {
  return value?.getTime() ?? 0;
}
