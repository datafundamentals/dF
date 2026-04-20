/**
 * Firestore Trigger: onOpenclawMessage
 *
 * Bridges the df-openclaw-chat app to the OpenClaw agent API.
 *
 * Trigger: onWrite on sessions/{sessionId}/messages/{messageId}
 * Condition: role === 'user' and status === 'pending' (idempotency guard)
 *
 * Session keys carry the 'hook:' prefix (e.g. 'hook:<uid>').
 * OpenClaw creates the session implicitly on first use when
 * hooks.allowRequestSessionKey is true.
 *
 * Operation sequence:
 * 1. Update triggered document: status → 'processing'
 * 2. POST to OpenClaw /hooks/agent — returns { ok, runId } (async dispatch)
 * 3. Poll /sessions/{sessionId}/history until a new assistant message appears
 * 4. Write new assistant message doc (status: 'complete')
 * 5. Update original user doc: status → 'complete'
 *
 * Runtime: Node.js, Firebase Functions v2 (540s timeout)
 */

import * as functions from 'firebase-functions/v2';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import type {FirestoreEvent, Change} from 'firebase-functions/v2/firestore';
import type {DocumentSnapshot} from 'firebase-admin/firestore';

// Full endpoint URL, e.g. http://192.168.64.3:18789/hooks/agent
const OPENCLAW_ENDPOINT = process.env.OPENCLAW_API_URL ?? '';
const OPENCLAW_API_KEY = process.env.OPENCLAW_API_KEY ?? '';
const OPENCLAW_AGENT_ID = process.env.OPENCLAW_AGENT_ID ?? 'cathy';
const OPENCLAW_CHANNEL = process.env.OPENCLAW_CHANNEL ?? 'last';
// Base URL for session history polling, e.g. http://192.168.64.3:18789
const OPENCLAW_BASE_URL = process.env.OPENCLAW_BASE_URL ?? '';

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 120_000;

interface OpenclawMessageData {
  role: string;
  content: string;
  sessionId: string;
  status: string;
}

interface OpenclawHookResponse {
  ok: boolean;
  runId: string;
}

interface OpenclawHistoryMessage {
  role: string;
  content: string;
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

  const db = getFirestore();
  const messageRef = db.collection('sessions').doc(sessionId).collection('messages').doc(messageId);

  await messageRef.update({status: 'processing'});
  functions.logger.info('OpenClaw message processing started', {sessionId, messageId});

  try {
    const hookResponse = await fetch(OPENCLAW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_API_KEY}`,
      },
      body: JSON.stringify({
        message: content,
        agentId: OPENCLAW_AGENT_ID,
        sessionKey: sessionId,
        channel: OPENCLAW_CHANNEL,
      }),
    });

    if (!hookResponse.ok) {
      throw new Error(`OpenClaw hook error: ${hookResponse.status} ${hookResponse.statusText}`);
    }

    const hookResult = await hookResponse.json() as OpenclawHookResponse;
    functions.logger.info('OpenClaw hook dispatched', {runId: hookResult.runId, sessionId});

    const assistantContent = await pollForAssistantReply(sessionId, hookResult.runId);

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
    await messageRef.update({status: 'complete'});
    throw error;
  }
});

async function pollForAssistantReply(sessionId: string, runId: string): Promise<string> {
  const historyUrl = `${OPENCLAW_BASE_URL}/sessions/${encodeURIComponent(sessionId)}/history`;
  const deadline = Date.now() + POLL_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    const res = await fetch(historyUrl, {
      headers: {'Authorization': `Bearer ${OPENCLAW_API_KEY}`},
    });

    if (!res.ok) {
      functions.logger.warn('History poll returned non-OK', {status: res.status, sessionId});
      continue;
    }

    const history = await res.json() as OpenclawHistoryMessage[];
    const lastMsg = history[history.length - 1];

    if (lastMsg?.role === 'assistant' && lastMsg.content) {
      functions.logger.info('Got assistant reply via history poll', {runId, sessionId});
      return lastMsg.content;
    }
  }

  throw new Error(`Timed out waiting for assistant reply (runId: ${runId})`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
