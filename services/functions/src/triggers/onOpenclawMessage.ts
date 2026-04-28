/**
 * Firestore Trigger: onOpenclawMessage
 *
 * Bridges the df-openclaw-chat app to the OpenClaw agent API.
 *
 * Trigger: onWrite on sessions/{sessionId}/messages/{messageId}
 * Condition: role === 'user' and status === 'pending' (idempotency guard)
 *
 * Session keys carry the 'hook:' prefix (e.g. 'hook:<uid>').
 * Session state persists via x-openclaw-session-key header.
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
const OPENCLAW_DEFAULT_AGENT_ID = process.env.OPENCLAW_AGENT_ID ?? 'cathy';

// Extracts agent name from session key format: agent:<name>:hook:<uid>
function resolveAgentId(sessionId: string): string {
  const match = sessionId.match(/^agent:([a-z_-]+):hook:/);
  return match ? match[1] : OPENCLAW_DEFAULT_AGENT_ID;
}

interface OpenclawMessageData {
  role: string;
  content: string;
  sessionId: string;
  status: string;
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
  document: 'sessions/{sessionId}/messages/{messageId}',
  region: 'us-central1',
  timeoutSeconds: 540,
}, async (event: FirestoreEvent<Change<DocumentSnapshot> | undefined, {sessionId: string; messageId: string}>) => {
  const afterSnap = event.data?.after;
  if (!afterSnap || !afterSnap.exists) {
    return;
  }

  const data = afterSnap.data() as OpenclawMessageData;

  if (data.role !== 'user' || data.status !== 'pending') {
    return;
  }

  const {sessionId, messageId} = event.params;
  const {content} = data;
  const agentId = resolveAgentId(sessionId);

  const db = getFirestore();
  const messageRef = db.collection('sessions').doc(sessionId).collection('messages').doc(messageId);

  await messageRef.update({status: 'processing'});
  functions.logger.info('OpenClaw message processing started', {sessionId, messageId, agentId});

  try {
    const historySnap = await db
      .collection('sessions').doc(sessionId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();

    const historyMessages = historySnap.docs
      .map((d) => d.data())
      .filter((m) => m.status === 'complete')
      .map((m) => ({role: m.role as string, content: m.content as string}));

    const endpoint = `${OPENCLAW_BASE_URL}/v1/chat/completions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
        'x-openclaw-session-key': sessionId,
      },
      body: JSON.stringify({
        model: `openclaw/${agentId}`,
        messages: [...historyMessages, {role: 'user', content}],
      }),
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

    functions.logger.info('Got assistant reply', {sessionId, messageId});

    await db.collection('sessions').doc(sessionId).collection('messages').add({
      role: 'assistant',
      content: assistantContent,
      sessionId,
      status: 'complete',
      createdAt: FieldValue.serverTimestamp(),
    });

    await messageRef.update({status: 'complete'});

    functions.logger.info('OpenClaw message processed successfully', {sessionId, messageId});
  } catch (error) {
    functions.logger.error('Failed to process OpenClaw message', {error, sessionId, messageId});
    await messageRef.update({status: 'error'});
    throw error;
  }
});
