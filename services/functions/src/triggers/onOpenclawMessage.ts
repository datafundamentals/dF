/**
 * Firestore Trigger: onOpenclawMessage
 *
 * Bridges the df-openclaw-chat app to the OpenClaw agent API.
 *
 * Trigger: onWrite on sessions/{sessionId}/messages/{messageId}
 * Condition: role === 'user' and status === 'pending' (idempotency guard)
 *
 * Operation sequence:
 * 1. Update triggered document: status → 'processing'
 * 2. POST content + sessionId to the OpenClaw session API
 * 3. Write new assistant message document (status: 'complete')
 * 4. Update original user document: status → 'complete'
 *
 * Runtime: Node.js, Firebase Functions v2
 */

import * as functions from 'firebase-functions/v2';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import type {FirestoreEvent, Change} from 'firebase-functions/v2/firestore';
import type {DocumentSnapshot} from 'firebase-admin/firestore';

const OPENCLAW_API_URL = process.env.OPENCLAW_API_URL ?? '';
const OPENCLAW_API_KEY = process.env.OPENCLAW_API_KEY ?? '';

interface OpenclawMessageData {
  role: string;
  content: string;
  sessionId: string;
  status: string;
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
    const response = await fetch(`${OPENCLAW_API_URL}/sessions_send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_API_KEY}`,
      },
      body: JSON.stringify({sessionId, content}),
    });

    if (!response.ok) {
      throw new Error(`OpenClaw API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as {content: string};
    const assistantContent = result.content;

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
