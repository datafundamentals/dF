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
import type {
  Attachment,
  AgenticDeleteStatus,
  AgenticConversation as AgenticConversationBase,
  AgenticMessage as AgenticMessageBase,
  AgenticPreReqReviewErrorDetails,
  AgenticPreReqs,
  AgenticPreReqReviewResponse,
  AgenticPreReqReviewState as AgenticPreReqReviewStateConfig,
  AgenticPreReqReviewStatus,
} from '@df/types/agentic-chat.types';
import type {AgenticSendStatus} from '@df/types';
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
const WORK_REQUESTS_COLLECTION = 'agentWorkRequests';
const MESSAGES_SUBCOLLECTION = 'messages';
const PROMPT_CONTEXT_DEBUG_COLLECTION = 'promptContextDebug';
const PROMPT_CONTEXT_DEBUG_MESSAGES_SUBCOLLECTION = 'messages';
const DEFAULT_AGENT_ID = 'cathy';

/**
 * Store-local view of a message. Extends the canonical `AgenticMessage` from
 * `@df/types` with `turnNumber`, an internal bookkeeping field the store tracks
 * but does not expose to consumers.
 */
interface AgenticMessage extends AgenticMessageBase {
  turnNumber?: number;
}

/**
 * Store-local view of a conversation. Extends the canonical `AgenticConversation`
 * from `@df/types` with fields only the store needs:
 * - `attachments` is required here (the store always normalizes to an array)
 * - `currentTurnNumber` is internal bookkeeping, not part of the shared contract
 */
interface AgenticConversation extends AgenticConversationBase {
  attachments: Attachment[];
  currentTurnNumber: number;
}

interface AgenticPromptDebugMessage {
  role: string;
  content: string;
}

interface AgenticPromptDebugAttachment {
  name: string;
  url: string;
}

interface AgenticPromptDebugData {
  systemContent: string;
  historyMessages: AgenticPromptDebugMessage[];
  attachmentContext: string;
  requestBodyJson: string;
  userEmail: string;
  userFirstName: string;
  turnNumber: number;
  attachmentsIncluded: boolean;
  attachmentDetails: AgenticPromptDebugAttachment[];
  constructedAt: Date | null;
  agenticResponsePreview: string;
  metadata: Record<string, unknown>;
}

const messagesSignal = signal<readonly AgenticMessage[]>([]);
const conversationsSignal = signal<readonly AgenticConversation[]>([]);
const promptDebugSignal = signal<AgenticPromptDebugData | null>(null);

const messagesStatusSignal = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
const conversationsStatusSignal = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
const promptDebugStatusSignal = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');

const messagesErrorSignal = signal<string | null>(null);
const conversationsErrorSignal = signal<string | null>(null);
const promptDebugErrorSignal = signal<string | null>(null);

const isMessagesListeningSignal = signal(false);
const isConversationsListeningSignal = signal(false);

const turnCountSignal = signal(0);

const sendStatusSignal = signal<AgenticSendStatus>('idle');
const sendErrorSignal = signal<string | null>(null);
const deleteStatusSignal = signal<AgenticDeleteStatus>('idle');
const deleteErrorSignal = signal<string | null>(null);
const preReqReviewStatusSignal = signal<AgenticPreReqReviewStatus>('idle');
const preReqReviewFeedbackSignal = signal<string | null>(null);
const deletingConversationIdSignal = signal<string | null>(null);
const activeConversationIdSignal = signal<string | null>(null);

let unsubscribeMessages: Unsubscribe | null = null;
let unsubscribeConversations: Unsubscribe | null = null;
let unsubscribePromptDebug: Unsubscribe | null = null;
let messagesCollectionRef: CollectionReference<DocumentData> | null = null;
let initializedDb: Firestore | null = null;
let initializedFunctions: Functions | null = null;
let initializedUserId: string | null = null;
let initializedUserContext: AgenticUserContext = {};
let defaultWorkRequestMarkdown = '';
let demoMode = false;

interface AgenticUserContext {
  userEmail?: string;
  userFirstName?: string;
}

export const agenticChatMessagesState = computed<FirestoreCollectionState<AgenticMessage>>(() => ({
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

export const agenticConversationsState = computed<FirestoreCollectionState<AgenticConversation>>(() => ({
  status: conversationsStatusSignal.get(),
  documents: conversationsSignal.get(),
  error: conversationsErrorSignal.get(),
  isListening: isConversationsListeningSignal.get(),
  lastUpdated: null,
  currentPage: 1,
  pageSize: 100,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'Agentic work requests for current user',
}));

export const agenticActiveConversationState = computed(() => {
  const activeConversationId = activeConversationIdSignal.get();
  const conversation = conversationsSignal.get().find((item) => item.id === activeConversationId) ?? null;

  return {
    activeConversationId,
    conversation,
  };
});

export const agenticChatSendState = computed(() => ({
  status: sendStatusSignal.get(),
  error: sendErrorSignal.get(),
}));

export const agenticChatDeleteState = computed(() => ({
  status: deleteStatusSignal.get(),
  error: deleteErrorSignal.get(),
  deletingConversationId: deletingConversationIdSignal.get(),
}));

export const agenticPreReqReviewState = computed<AgenticPreReqReviewStateConfig>(() => ({
  status: preReqReviewStatusSignal.get(),
  feedback: preReqReviewFeedbackSignal.get(),
}));

/** Clears review feedback when the user abandons one review form for another. */
export function clearAgenticPreReqReview(): void {
  preReqReviewStatusSignal.set('idle');
  preReqReviewFeedbackSignal.set(null);
}

export const agenticDebugPromptState = computed(() => {
  const data = promptDebugSignal.get();

  return {
    status: promptDebugStatusSignal.get(),
    data,
    error: promptDebugErrorSignal.get(),
    fullPromptContext: formatPromptDebugContext(data),
  };
});

interface AgenticDemoState {
  conversations: readonly AgenticConversation[];
  messages: readonly AgenticMessage[];
  activeConversationId?: string | null;
  conversationsStatus?: 'idle' | 'loading' | 'ready' | 'error';
  messagesStatus?: 'idle' | 'loading' | 'ready' | 'error';
  conversationsError?: string | null;
  messagesError?: string | null;
  sendStatus?: AgenticSendStatus;
  sendError?: string | null;
  deleteStatus?: AgenticDeleteStatus;
  deleteError?: string | null;
  deletingConversationId?: string | null;
  isConversationsListening?: boolean;
  isMessagesListening?: boolean;
  promptDebug?: AgenticPromptDebugData | null;
  promptDebugStatus?: 'idle' | 'loading' | 'ready' | 'error';
  promptDebugError?: string | null;
  preReqReview?: AgenticPreReqReviewStateConfig;
}

export function __setAgenticDemoState(state: AgenticDemoState): void {
  if (initializedDb || initializedUserId || unsubscribeConversations || unsubscribeMessages) {
    throw new Error('Cannot set Agentic demo state after the store has been initialized.');
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
  preReqReviewStatusSignal.set(state.preReqReview?.status ?? 'idle');
  preReqReviewFeedbackSignal.set(state.preReqReview?.feedback ?? null);
  promptDebugSignal.set(state.promptDebug ?? null);
  promptDebugStatusSignal.set(state.promptDebugStatus ?? (state.promptDebug ? 'ready' : 'idle'));
  promptDebugErrorSignal.set(state.promptDebugError ?? null);
  isConversationsListeningSignal.set(state.isConversationsListening ?? false);
  isMessagesListeningSignal.set(state.isMessagesListening ?? false);
}

export function __resetAgenticDemoState(): void {
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
  preReqReviewStatusSignal.set('idle');
  preReqReviewFeedbackSignal.set(null);
  deletingConversationIdSignal.set(null);
  promptDebugSignal.set(null);
  promptDebugStatusSignal.set('idle');
  promptDebugErrorSignal.set(null);
  isConversationsListeningSignal.set(false);
  isMessagesListeningSignal.set(false);
}

export function __setAgenticFunctionsForTests(functions: Functions): void {
  initializedFunctions = functions;
}

export function __resetAgenticStoreForTests(): void {
  stopAgenticRealtime();
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
  preReqReviewStatusSignal.set('idle');
  preReqReviewFeedbackSignal.set(null);
  deletingConversationIdSignal.set(null);
  activeConversationIdSignal.set(null);
  promptDebugSignal.set(null);
  promptDebugStatusSignal.set('idle');
  promptDebugErrorSignal.set(null);
  messagesCollectionRef = null;
  initializedDb = null;
  initializedFunctions = null;
  initializedUserId = null;
  initializedUserContext = {};
  defaultWorkRequestMarkdown = '';
  turnCountSignal.set(0);
  demoMode = false;
}

export async function initializeAgenticChatStore(
  app: FirebaseApp,
  useEmulator: boolean,
  userId: string,
  initialWorkRequestMarkdown = '',
  userContext: AgenticUserContext = {}
): Promise<void> {
  if (initializedDb && initializedUserId === userId) {
    startAgenticRealtime();
    return;
  }

  stopAgenticRealtime();
  initializedUserId = userId;
  initializedUserContext = normalizeUserContext(userContext);
  defaultWorkRequestMarkdown = initialWorkRequestMarkdown;

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

export function startAgenticRealtime(): void {
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

export function stopAgenticRealtime(): void {
  if (unsubscribeConversations) {
    unsubscribeConversations();
    unsubscribeConversations = null;
  }

  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }

  stopPromptDebugListener();
  isConversationsListeningSignal.set(false);
  isMessagesListeningSignal.set(false);
}

export async function createAgenticConversation(
  agentId?: string,
  workRequestMarkdown = defaultWorkRequestMarkdown,
  userContext: AgenticUserContext = initializedUserContext,
  preReqs?: AgenticPreReqs
): Promise<string> {
  if (!initializedDb || !initializedUserId) {
    throw new Error('Agentic chat store is not initialized.');
  }

  const conversationRef = doc(collection(initializedDb, WORK_REQUESTS_COLLECTION));
  const requestId = conversationRef.id;
  const normalizedUserContext = normalizeUserContext(userContext);

  await setDoc(conversationRef, {
    userId: initializedUserId,
    agentId: agentId ?? DEFAULT_AGENT_ID,
    title: preReqs?.title.trim() || null,
    intent: preReqs?.intent.trim() ?? null,
    summary: preReqs?.summary.trim() ?? null,
    metrics: preReqs?.metrics.trim() ?? null,
    status: 'active',
    workRequestMarkdown,
    userEmail: normalizedUserContext.userEmail ?? '',
    userFirstName: normalizedUserContext.userFirstName ?? '',
    createdAt: serverTimestamp(),
    lastMessageAt: serverTimestamp(),
    currentTurnNumber: 0,
  });

  switchAgenticConversation(requestId);
  return requestId;
}

export function switchAgenticConversation(requestId: string): void {
  if (!initializedDb) {
    return;
  }

  sendStatusSignal.set('idle');
  sendErrorSignal.set(null);
  startMessagesListener(initializedDb, requestId);
}

export async function renameAgenticConversation(requestId: string, title: string): Promise<void> {
  if (!initializedDb) {
    throw new Error('Agentic chat store is not initialized.');
  }

  const normalizedTitle = title.trim();
  await updateDoc(doc(initializedDb, WORK_REQUESTS_COLLECTION, requestId), {
    title: normalizedTitle.length ? normalizedTitle : null,
  });
}

export async function updateAgenticConversationPreReqs(
  requestId: string,
  preReqs: AgenticPreReqs
): Promise<void> {
  if (!initializedDb) {
    throw new Error('Agentic chat store is not initialized.');
  }

  await updateDoc(doc(initializedDb, WORK_REQUESTS_COLLECTION, requestId), {
    title: preReqs.title.trim() || null,
    intent: preReqs.intent.trim(),
    summary: preReqs.summary.trim(),
    metrics: preReqs.metrics.trim(),
  });
}

/** Requests main-agent approval before prerequisite fields are persisted. */
export async function reviewAgenticPreReqs(preReqs: AgenticPreReqs): Promise<boolean> {
  if (!initializedFunctions) {
    throw new Error('Agentic chat store is not initialized.');
  }

  preReqReviewStatusSignal.set('reviewing');
  preReqReviewFeedbackSignal.set(null);

  try {
    const fn = callable<AgenticPreReqs, AgenticPreReqReviewResponse>(
      initializedFunctions,
      'reviewAgenticWorkRequestPreReqs'
    );
    const result = await fn(preReqs);
    const feedback = result.data.feedback.trim();

    if (!result.data.approved) {
      preReqReviewStatusSignal.set('rejected');
      preReqReviewFeedbackSignal.set(feedback || 'John did not approve these fields. Update them and try again.');
      return false;
    }

    preReqReviewStatusSignal.set('idle');
    preReqReviewFeedbackSignal.set(null);
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'John could not review these fields.';
    const agentResponse = readAgentResponseFromReviewError(error);
    preReqReviewStatusSignal.set('error');
    preReqReviewFeedbackSignal.set(agentResponse === null ? message : `${message}\n\n${agentResponse}`);
    throw error;
  }
}

function readAgentResponseFromReviewError(error: unknown): string | null {
  if (!error || typeof error !== 'object' || !('details' in error)) {
    return null;
  }

  const details = error.details as Partial<AgenticPreReqReviewErrorDetails> | null;
  return details && typeof details.agentResponse === 'string'
    ? details.agentResponse
    : null;
}

export async function addAttachmentToAgenticConversation(
  conversationId: string,
  attachment: Attachment
): Promise<void> {
  if (!initializedDb) {
    throw new Error('Agentic chat store is not initialized.');
  }

  await updateDoc(doc(initializedDb, WORK_REQUESTS_COLLECTION, conversationId), {
    attachments: arrayUnion(attachment),
  });
}

export async function removeAttachmentFromAgenticConversation(
  conversationId: string,
  path: string
): Promise<void> {
  if (!initializedDb) {
    throw new Error('Agentic chat store is not initialized.');
  }

  const ref = doc(initializedDb, WORK_REQUESTS_COLLECTION, conversationId);
  const snapshot = await getDoc(ref);
  const data = snapshot.data();
  const current = normalizeAttachments(data?.attachments);
  const filtered = current.filter((a) => a.path !== path);

  await updateDoc(ref, {attachments: filtered});
}

interface DeleteAgenticConversationResponse {
  success: true;
  requestId: string;
  deletedMessageCount: number;
}

export async function deleteAgenticConversation(requestId: string): Promise<void> {
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
    throw new Error('Agentic chat store is not initialized.');
  }

  deleteStatusSignal.set('deleting');
  deleteErrorSignal.set(null);
  deletingConversationIdSignal.set(requestId);

  try {
    const fn = callable<{requestId: string}, DeleteAgenticConversationResponse>(
      initializedFunctions,
      'deleteAgenticConversation'
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

export async function sendAgenticMessage(content: string, userContext: AgenticUserContext = {}): Promise<void> {
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
  const normalizedUserContext = normalizeUserContext(userContext);

  try {
    await Promise.all([
      addDoc(messagesCollectionRef, {
        role: 'user',
        content: trimmed,
        createdAt: serverTimestamp(),
        sessionId: requestId,
        status: 'pending',
        turnNumber: nextTurnNumber,
        userEmail: normalizedUserContext.userEmail ?? '',
        userFirstName: normalizedUserContext.userFirstName ?? '',
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
        activeConversationIdSignal.set(null);
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
  resetPromptDebugState();

  const conversation = conversationsSignal.get().find((c) => c.id === requestId);
  turnCountSignal.set(conversation?.currentTurnNumber ?? 0);

  messagesCollectionRef = collection(db, WORK_REQUESTS_COLLECTION, requestId, MESSAGES_SUBCOLLECTION);
  const q = query(messagesCollectionRef, orderBy('createdAt', 'asc'));

  isMessagesListeningSignal.set(true);
  unsubscribeMessages = onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((item) => normalizeMessage({id: item.id, ...item.data()} as AgenticMessage));
      messagesSignal.set(docs);
      messagesStatusSignal.set('ready');
      updatePromptDebugListener(db, requestId, docs);

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

function updatePromptDebugListener(db: Firestore, requestId: string, messages: readonly AgenticMessage[]): void {
  const latestAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');
  if (!latestAssistantMessage) {
    resetPromptDebugState();
    return;
  }

  startPromptDebugListener(db, requestId, latestAssistantMessage.id);
}

function startPromptDebugListener(db: Firestore, requestId: string, messageId: string): void {
  const activeDebugKey = `${requestId}/${messageId}`;
  const currentDebugKey = promptDebugSignal.get()?.metadata?.debugKey;
  if (currentDebugKey === activeDebugKey && unsubscribePromptDebug) {
    return;
  }

  stopPromptDebugListener();
  promptDebugStatusSignal.set('loading');
  promptDebugErrorSignal.set(null);

  const debugRef = doc(
    db,
    PROMPT_CONTEXT_DEBUG_COLLECTION,
    requestId,
    PROMPT_CONTEXT_DEBUG_MESSAGES_SUBCOLLECTION,
    messageId
  );

  unsubscribePromptDebug = onSnapshot(
    debugRef,
    (snapshot) => {
      if (!snapshot.exists()) {
        promptDebugSignal.set(null);
        promptDebugStatusSignal.set('ready');
        return;
      }

      const normalized = normalizePromptDebugData(snapshot.data());
      promptDebugSignal.set({
        ...normalized,
        metadata: {
          ...normalized.metadata,
          debugKey: activeDebugKey,
        },
      });
      promptDebugStatusSignal.set('ready');
    },
    (error) => {
      promptDebugErrorSignal.set(error.message);
      promptDebugStatusSignal.set('error');
    }
  );
}

function stopPromptDebugListener(): void {
  if (unsubscribePromptDebug) {
    unsubscribePromptDebug();
    unsubscribePromptDebug = null;
  }
}

function resetPromptDebugState(): void {
  stopPromptDebugListener();
  promptDebugSignal.set(null);
  promptDebugStatusSignal.set('idle');
  promptDebugErrorSignal.set(null);
}

function normalizeConversationDoc(
  snapshot: QueryDocumentSnapshot<DocumentData, DocumentData>
): AgenticConversation {
  const data = snapshot.data();

  return {
    id: snapshot.id,
    userId: String(data.userId ?? ''),
    agentId: String(data.agentId ?? DEFAULT_AGENT_ID),
    title: typeof data.title === 'string' ? data.title : null,
    intent: typeof data.intent === 'string' ? data.intent : null,
    summary: typeof data.summary === 'string' ? data.summary : null,
    metrics: typeof data.metrics === 'string' ? data.metrics : null,
    status: data.status === 'accepted' ? 'accepted' : 'active',
    createdAt: normalizeTimestamp(data.createdAt),
    lastMessageAt: normalizeTimestamp(data.lastMessageAt),
    workRequestMarkdown: typeof data.workRequestMarkdown === 'string' ? data.workRequestMarkdown : '',
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

function normalizeMessage(message: AgenticMessage): AgenticMessage {
  return {
    ...message,
    createdAt: normalizeTimestamp(message.createdAt),
  };
}

function normalizePromptDebugData(raw: DocumentData): AgenticPromptDebugData {
  return {
    systemContent: String(raw.systemContent ?? ''),
    historyMessages: normalizePromptDebugMessages(raw.historyMessages),
    attachmentContext: String(raw.attachmentContext ?? ''),
    requestBodyJson: String(raw.requestBodyJson ?? ''),
    userEmail: String(raw.userEmail ?? ''),
    userFirstName: String(raw.userFirstName ?? ''),
    turnNumber: typeof raw.turnNumber === 'number' ? raw.turnNumber : 0,
    attachmentsIncluded: raw.attachmentsIncluded === true,
    attachmentDetails: normalizePromptDebugAttachments(raw.attachmentDetails),
    constructedAt: normalizeTimestamp(raw.constructedAt),
    agenticResponsePreview: String(raw.agenticResponsePreview ?? ''),
    metadata: isRecord(raw.metadata) ? raw.metadata : {},
  };
}

function normalizePromptDebugMessages(raw: unknown): AgenticPromptDebugMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => ({
      role: String(item.role ?? ''),
      content: String(item.content ?? ''),
    }));
}

function normalizePromptDebugAttachments(raw: unknown): AgenticPromptDebugAttachment[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => isRecord(item))
    .map((item) => ({
      name: String(item.name ?? ''),
      url: String(item.url ?? ''),
    }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function formatPromptDebugContext(data: AgenticPromptDebugData | null): string {
  if (!data) {
    return 'No prompt context debug document is available for the latest assistant message.';
  }

  try {
    const parsed = JSON.parse(data.requestBodyJson || '{}');
    const prettyJson = JSON.stringify(parsed, null, 2);
    const unescaped = prettyJson.replace(/\\n/g, '\n');
    const tokenCount = Math.ceil(data.requestBodyJson.length / 4);
    return `[Token Count: ${tokenCount} tokens]\n\n${unescaped}`;
  } catch {
    return data.requestBodyJson || '{}';
  }
}

function normalizeUserContext(userContext: AgenticUserContext): AgenticUserContext {
  return {
    userEmail: userContext.userEmail?.trim() || '',
    userFirstName: userContext.userFirstName?.trim() || '',
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

function compareConversations(a: AgenticConversation, b: AgenticConversation): number {
  const lastMessageDelta = toSortableTime(b.lastMessageAt) - toSortableTime(a.lastMessageAt);
  if (lastMessageDelta !== 0) {
    return lastMessageDelta;
  }

  return toSortableTime(b.createdAt) - toSortableTime(a.createdAt);
}

function toSortableTime(value: Date | null): number {
  return value?.getTime() ?? 0;
}
