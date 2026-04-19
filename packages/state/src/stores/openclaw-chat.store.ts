import {computed, signal} from '@lit-labs/signals';
import type {FirebaseApp} from 'firebase/app';
import type {Firestore} from 'firebase/firestore';
import {
  connectFirestoreToEmulator,
  getFirestoreDb,
} from '@df/firebase';
import type {
  FirestoreCollectionState,
  OpenclawMessage,
  OpenclawSendStatus,
} from '@df/types';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type CollectionReference,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';

const FIRESTORE_HOST = '127.0.0.1';
const FIRESTORE_PORT = 8280;
const SESSIONS_COLLECTION = 'sessions';
const MESSAGES_SUBCOLLECTION = 'messages';
const USERS_COLLECTION = 'users';

const messagesSignal = signal<readonly OpenclawMessage[]>([]);
const statusSignal = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
const errorSignal = signal<string | null>(null);
const isListeningSignal = signal<boolean>(false);
const sendStatusSignal = signal<OpenclawSendStatus>('idle');
const sendErrorSignal = signal<string | null>(null);
const sessionIdSignal = signal<string | null>(null);

let unsubscribeMessages: Unsubscribe | null = null;
let messagesCollectionRef: CollectionReference<DocumentData> | null = null;

export const openclawChatMessagesState = computed<FirestoreCollectionState<OpenclawMessage>>(() => ({
  status: statusSignal.get(),
  documents: messagesSignal.get(),
  error: errorSignal.get(),
  isListening: isListeningSignal.get(),
  lastUpdated: null,
  currentPage: 1,
  pageSize: 100,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'Session messages (oldest first)',
}));

export const openclawChatSendState = computed(() => ({
  status: sendStatusSignal.get(),
  error: sendErrorSignal.get(),
}));

export async function initializeOpenclawChatStore(
  app: FirebaseApp,
  useEmulator: boolean,
  userId: string
): Promise<void> {
  const db = getFirestoreDb(app);

  if (useEmulator) {
    connectFirestoreToEmulator(db, {
      host: FIRESTORE_HOST,
      port: FIRESTORE_PORT,
    });
  }

  const sessionId = await resolveOrCreateSession(db, userId);
  await startSessionListener(db, sessionId);
}

export async function sendOpenclawMessage(content: string): Promise<void> {
  const sessionId = sessionIdSignal.get();
  if (!sessionId || !messagesCollectionRef) {
    throw new Error('No active session.');
  }

  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error('Cannot send an empty message.');
  }

  sendStatusSignal.set('sending');
  sendErrorSignal.set(null);

  try {
    await addDoc(messagesCollectionRef, {
      role: 'user',
      content: trimmed,
      createdAt: serverTimestamp(),
      sessionId,
      status: 'pending',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to send message.';
    sendStatusSignal.set('error');
    sendErrorSignal.set(message);
    throw error;
  }
}

export function stopOpenclawRealtime(): void {
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
    isListeningSignal.set(false);
  }
}

async function resolveOrCreateSession(
  db: Firestore,
  userId: string
): Promise<string> {
  const userDocRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userDocRef);

  if (userSnap.exists() && userSnap.data().openclawSessionId) {
    return userSnap.data().openclawSessionId as string;
  }

  const sessionRef = doc(collection(db, SESSIONS_COLLECTION));
  const newSessionId = sessionRef.id;

  await setDoc(userDocRef, {openclawSessionId: newSessionId}, {merge: true});

  return newSessionId;
}

async function startSessionListener(
  db: Firestore,
  sessionId: string
): Promise<void> {
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }

  sessionIdSignal.set(sessionId);
  messagesSignal.set([]);
  statusSignal.set('loading');
  errorSignal.set(null);

  messagesCollectionRef = collection(db, SESSIONS_COLLECTION, sessionId, MESSAGES_SUBCOLLECTION);
  const q = query(messagesCollectionRef, orderBy('createdAt', 'asc'));

  isListeningSignal.set(true);
  unsubscribeMessages = onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => normalizeMessage({id: d.id, ...d.data()} as OpenclawMessage));
      messagesSignal.set(docs);
      statusSignal.set('ready');

      if (sendStatusSignal.get() === 'sending') {
        const lastUserMsg = [...docs].reverse().find((m) => m.role === 'user');
        if (lastUserMsg && lastUserMsg.status === 'complete') {
          sendStatusSignal.set('idle');
        }
      }
    },
    (error) => {
      errorSignal.set(error.message);
      statusSignal.set('error');
    }
  );
}

function normalizeMessage(msg: OpenclawMessage): OpenclawMessage {
  const createdAt = msg.createdAt instanceof Timestamp
    ? msg.createdAt.toDate()
    : (msg.createdAt as unknown as Date | null) ?? null;
  return {...msg, createdAt};
}
