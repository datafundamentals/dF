/**
 * Firestore Trigger: onOpenclawMessage
 *
 * Bridges the df-openclaw-chat app to the OpenClaw agent API.
 *
 * Trigger: onWrite on openclawWorkRequests/{requestId}/messages/{messageId}
 * Condition: role === 'user' and status === 'pending' (idempotency guard)
 *
 * Request ids are stable from conversation creation through acceptance and are
 * reused as the OpenClaw session key in the request body. This path is
 * Cathy-only, so the session key is namespaced accordingly. We also send the
 * agent id in the request body because OpenClaw routing on this endpoint is
 * body-driven, and the session-key header has been observed to override
 * routing incorrectly.
 *
 * Operation sequence:
 * 1. Update triggered document: status → 'processing'
 * 2. POST to OpenClaw /v1/chat/completions (synchronous — blocks until reply)
 * 3. Write new assistant message doc (status: 'complete')
 * 4. Update original user doc: status → 'complete'
 *
 * Runtime: Node.js, Firebase Functions v2 (540s timeout)
 */

import * as functions from 'firebase-functions/v2';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import type {FirestoreEvent, Change} from 'firebase-functions/v2/firestore';
import type {DocumentSnapshot} from 'firebase-admin/firestore';

const OPENCLAW_BASE_URL = process.env.OPENCLAW_BASE_URL ?? '';
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN ?? '';
const WORK_REQUESTS_COLLECTION = 'openclawWorkRequests';
const MESSAGES_SUBCOLLECTION = 'messages';
const OPENCLAW_WORK_REQUEST_AGENT_ID = 'cathy';
const OPENCLAW_WORK_REQUEST_SESSION_PREFIX = 'openclaw-work-request-v2:cathy:';
const ACCEPTANCE_SIGNAL = 'This all sounds good to me';
const ACCEPTANCE_NOTICE = [
  'This work request has been accepted and submitted.',
  'Any further messages in this conversation will not change that submission.',
  'A new conversation should be used for anything additional.',
].join(' ');

interface OpenclawMessageData {
  role: string;
  content: string;
  sessionId: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export const onOpenclawMessage = functions.firestore.onDocumentWritten({
  document: 'openclawWorkRequests/{requestId}/messages/{messageId}',
  region: 'us-central1',
  timeoutSeconds: 540,
}, async (event: FirestoreEvent<Change<DocumentSnapshot> | undefined, {requestId: string; messageId: string}>) => {
  const afterSnap = event.data?.after;
  if (!afterSnap || !afterSnap.exists) {
    return;
  }

  const data = afterSnap.data() as OpenclawMessageData;

  if (data.role !== 'user' || data.status !== 'pending') {
    return;
  }

  const {requestId, messageId} = event.params;
  const {content} = data;

  const db = getFirestore();
  const conversationRef = db.collection(WORK_REQUESTS_COLLECTION).doc(requestId);
  const messageRef = conversationRef.collection(MESSAGES_SUBCOLLECTION).doc(messageId);
  const conversationSnap = await conversationRef.get();
  const agentId = (conversationSnap.get('agentId') as string | undefined) ?? OPENCLAW_WORK_REQUEST_AGENT_ID;

  await messageRef.update({status: 'processing'});
  functions.logger.info('OpenClaw message processing started', {
    requestId,
    messageId,
    agentId,
  });

  try {
    const historySnap = await conversationRef
      .collection(MESSAGES_SUBCOLLECTION)
      .orderBy('createdAt', 'asc')
      .get();

    const historyMessages = historySnap.docs
      .map((d) => d.data())
      .filter((m) => m.status === 'complete')
      .map((m) => ({role: m.role as string, content: m.content as string}));
    const sessionKey = `openclaw-work-request-v2:${agentId}:${requestId}`;
    const statusUrl = `https://hbb-a1.web.app/WR_Status/${requestId}/`;
    const systemContext = {
      role: 'system',
      content: `CONTEXT: The unique ID for this work request is ${requestId}. Status URL: ${statusUrl}`,
    };

    const requestBody = {
      agentId,
      sessionKey,
      model: `openclaw/${agentId}`,
      messages: [systemContext, ...historyMessages, {role: 'user', content}],
    };

    const endpoint = `${OPENCLAW_BASE_URL}/v1/chat/completions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenClaw chat completions error: ${response.status} ${body}`);
    }

    const result = await response.json() as ChatCompletionResponse;
    const assistantContent = result.choices?.[0]?.message?.content ?? '';

    if (!assistantContent) {
      throw new Error('Empty assistant reply from OpenClaw');
    }

    functions.logger.info('Got assistant reply', {requestId, messageId});

    await conversationRef.collection(MESSAGES_SUBCOLLECTION).add({
      role: 'assistant',
      content: assistantContent,
      sessionId: requestId,
      status: 'complete',
      createdAt: FieldValue.serverTimestamp(),
    });

    const accepted = assistantContent.includes(ACCEPTANCE_SIGNAL);
    const currentTitle = conversationSnap.get('title');
    const currentStatus = conversationSnap.get('status');

    const conversationUpdate: Record<string, unknown> = {
      lastMessageAt: FieldValue.serverTimestamp(),
    };

    if (accepted && currentStatus !== 'accepted') {
      conversationUpdate.status = 'accepted';
      if (typeof currentTitle !== 'string' || !currentTitle.trim()) {
        conversationUpdate.title = buildConversationTitle(historyMessages, content);
      }
    }

    const writes: Array<Promise<unknown>> = [
      messageRef.update({status: 'complete'}),
      conversationRef.set(conversationUpdate, {merge: true}),
    ];

    if (accepted && currentStatus !== 'accepted') {
      writes.push(
        conversationRef.collection(MESSAGES_SUBCOLLECTION).add({
          role: 'assistant',
          content: ACCEPTANCE_NOTICE,
          sessionId: requestId,
          status: 'complete',
          createdAt: FieldValue.serverTimestamp(),
        })
      );
    }

    await Promise.all(writes);

    functions.logger.info('OpenClaw message processed successfully', {requestId, messageId, accepted});
  } catch (error) {
    functions.logger.error('Failed to process OpenClaw message', {error, requestId, messageId});
    await Promise.all([
      messageRef.update({status: 'error'}),
      conversationRef.set({lastMessageAt: FieldValue.serverTimestamp()}, {merge: true}),
    ]);
    throw error;
  }
});

function buildConversationTitle(
  historyMessages: Array<{role: string; content: string}>,
  latestUserContent: string
): string {
  const combined = [...historyMessages, {role: 'user', content: latestUserContent}]
    .filter((message) => message.role === 'user')
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join(' ');

  const normalized = combined
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim();

  if (!normalized) {
    return 'Untitled';
  }

  const words = normalized.split(' ').slice(0, 8);
  const title = words.join(' ');

  return title.length > 72 ? `${title.slice(0, 69).trimEnd()}...` : title;
}
