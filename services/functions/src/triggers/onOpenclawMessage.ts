/**
 * Firestore Trigger: onOpenclawMessage
 *
 * Bridges the df-agent-work-request app to the OpenClaw agent API.
 *
 * Trigger: onWrite on agentWorkRequests/{requestId}/messages/{messageId}
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
import {defineSecret} from 'firebase-functions/params';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import type {FirestoreEvent, Change} from 'firebase-functions/v2/firestore';
import type {DocumentSnapshot} from 'firebase-admin/firestore';
import {createHash} from 'node:crypto';
import {
  loadOpenclawWorkRequestGitConfig,
  persistOpenclawWorkRequestTurnToGit,
} from '../shared/openclawWorkRequestGit.js';

const OPENCLAW_BASE_URL = process.env.OPENCLAW_BASE_URL ?? '';
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN ?? '';
const OPENCLAW_ROOT_AGENT_ID = process.env.OPENCLAW_ROOT_AGENT_ID ?? 'john';
const WORK_REQUESTS_COLLECTION = 'agentWorkRequests';
const MESSAGES_SUBCOLLECTION = 'messages';
const PROMPT_CONTEXT_DEBUG_COLLECTION = 'promptContextDebug';
const PROMPT_CONTEXT_DEBUG_MESSAGES_SUBCOLLECTION = 'messages';
const OPENCLAW_WORK_REQUEST_AGENT_ID = 'cathy';
const OPENCLAW_WORK_REQUEST_SESSION_PREFIX = 'openclaw-work-request-v2:';
const ACCEPTANCE_SIGNAL = 'This all sounds good to me';
const ACCEPTANCE_NOTICE = [
  'This work request has been accepted and submitted.',
  'Any further messages in this conversation will not change that submission.',
  'A new conversation should be used for anything additional.',
].join(' ');
const githubPat = defineSecret('GITHUB_PAT');

interface OpenclawMessageData {
  role: string;
  content: string;
  sessionId: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  turnNumber?: number;
  userEmail?: string;
  userFirstName?: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

interface OpenclawAttachmentContext {
  url: string;
  name: string;
}

interface PromptContextDebugMetadata {
  requestId: string;
  userMessageId: string;
  assistantMessageId: string;
  correlationId: string;
  eventId: string | null;
  agentId: string;
  sessionKey: string;
  model: string;
  turnNumber: number;
  timestampIso: string;
}

export const onOpenclawMessage = functions.firestore.onDocumentWritten({
  document: 'agentWorkRequests/{requestId}/messages/{messageId}',
  region: 'us-central1',
  timeoutSeconds: 540,
  secrets: [githubPat],
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
  const correlationId = `${requestId}:${messageId}`;
  const logContext = {
    requestId,
    messageId,
    correlationId,
    eventId: event.id ?? null,
  };

  const db = getFirestore();
  const conversationRef = db.collection(WORK_REQUESTS_COLLECTION).doc(requestId);
  const messageRef = conversationRef.collection(MESSAGES_SUBCOLLECTION).doc(messageId);
  const conversationSnap = await conversationRef.get();
  
  const agentId = (conversationSnap.get('agentId') as string | undefined) ?? OPENCLAW_WORK_REQUEST_AGENT_ID;
  const isRoot = agentId === OPENCLAW_ROOT_AGENT_ID;
  
  const rawAttachments = conversationSnap.get('attachments') as OpenclawAttachmentContext[] | undefined;
  const attachments = Array.isArray(rawAttachments) ? rawAttachments : [];

  await messageRef.update({status: 'processing'});
  functions.logger.info('OpenClaw message processing started', {
    ...logContext,
    agentId: isRoot ? `${agentId} (root)` : agentId,
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
    const turnNumber = data.turnNumber ?? countPriorUserTurns(historyMessages) + 1;

    const previousAssistantContent = [...historyMessages]
      .reverse()
      .find((message) => message.role === 'assistant')?.content ?? null;
    await persistWorkRequestTurn({
      requestId,
      messageId,
      userContent: content,
      previousAssistantContent,
      turnNumber,
      baseMarkdownContent: readStringField(conversationSnap, 'workRequestMarkdown'),
      logContext,
      conversationRef,
    });
      
    // The root agent uses 'root' in the session key, others use their agentId
    const sessionSegment = isRoot ? 'root' : agentId;
    const sessionKey = `${OPENCLAW_WORK_REQUEST_SESSION_PREFIX}${sessionSegment}:${requestId}`;
    
    const currentTitle = conversationSnap.get('title') as string | undefined;
    const currentStatus = conversationSnap.get('status') as string | undefined;
    const userFirstName = resolveUserFirstName(data, conversationSnap);
    const userEmail = typeof data.userEmail === 'string' ? data.userEmail : readStringField(conversationSnap, 'userEmail');
    const baseSystemContent = [
      `User: ${userFirstName || '(unknown)'}`,
      `Email: ${userEmail || '(unknown)'}`,
      `Turn: ${turnNumber}`,
      `Attachments: ${attachments.length}`,
      `Agent: ${agentId}`,
      `Request ID: ${requestId}`,
    ].join('\n');
    const attachmentContext = attachments.length > 0
      ? `\n\nUploaded files available in this session:\n${attachments
        .map((attachment) => `- ${attachment.name}: ${attachment.url}`)
        .join('\n')}`
      : '';
    const systemContext = {
      role: 'system',
      content: `${baseSystemContent}${attachmentContext}`,
    };

    const promptFingerprint = createHash('sha256')
      .update(baseSystemContent)
      .digest('hex')
      .slice(0, 16);

    functions.logger.info('OpenClaw prompt prepared', {
      ...logContext,
      hasTitleLabel: baseSystemContent.includes('TITLE:'),
      hasSetTitleDirective: baseSystemContent.includes('[SET_TITLE:'),
      promptFingerprint,
    });

    const requestBody = {
      agentId: isRoot ? '' : agentId,
      sessionKey,
      model: isRoot ? 'openclaw' : `openclaw/${agentId}`,
      messages: [systemContext, ...historyMessages, {role: 'user', content}],
    };
    const model = requestBody.model;
    const requestBodyJson = JSON.stringify(requestBody);

    const endpoint = `${OPENCLAW_BASE_URL}/v1/chat/completions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
      },
      body: requestBodyJson,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`OpenClaw chat completions error: ${response.status} ${body}`);
    }

    const result = await response.json() as ChatCompletionResponse;
    const rawAssistantContent = result.choices?.[0]?.message?.content ?? '';

    if (!rawAssistantContent) {
      throw new Error('Empty assistant reply from OpenClaw');
    }

    const titleMatch = rawAssistantContent.match(/\[SET_TITLE:\s*(.*?)\]/);
    const extractedSetTitle = titleMatch?.[1]?.trim() || null;
    functions.logger.info('OpenClaw assistant reply metadata', {
      ...logContext,
      hasSetTitleTag: Boolean(titleMatch),
      extractedSetTitle,
      rawAssistantLength: rawAssistantContent.length,
      rawAssistantPreview: rawAssistantContent.slice(0, 280),
    });

    functions.logger.info('Got assistant reply', {...logContext});

    let finalAssistantContent = rawAssistantContent;
    let agentProvidedTitle: string | undefined;
    if (titleMatch) {
      agentProvidedTitle = titleMatch[1].trim() || undefined;
      finalAssistantContent = rawAssistantContent.replace(/\[SET_TITLE:.*?\]/g, '').trim();
    }

    functions.logger.info('OpenClaw assistant content transform', {
      ...logContext,
      hadSetTitleTag: Boolean(titleMatch),
      transformed: finalAssistantContent !== rawAssistantContent,
      beforeLength: rawAssistantContent.length,
      afterLength: finalAssistantContent.length,
      extractedSetTitle: agentProvidedTitle ?? null,
      transformedPreview: finalAssistantContent.slice(0, 280),
    });

    const assistantMessageRef = conversationRef.collection(MESSAGES_SUBCOLLECTION).doc();
    await assistantMessageRef.set({
      role: 'assistant',
      content: finalAssistantContent,
      sessionId: requestId,
      correlationId,
      status: 'complete',
      turnNumber,
      createdAt: FieldValue.serverTimestamp(),
    });

    await writePromptContextDebug({
      db,
      requestId,
      userMessageId: messageId,
      assistantMessageId: assistantMessageRef.id,
      systemContent: systemContext.content,
      historyMessages,
      attachmentContext,
      requestBodyJson,
      userEmail: typeof data.userEmail === 'string' ? data.userEmail : readStringField(conversationSnap, 'userEmail'),
      userFirstName,
      turnNumber,
      attachments,
      metadata: {
        requestId,
        userMessageId: messageId,
        assistantMessageId: assistantMessageRef.id,
        correlationId,
        eventId: event.id ?? null,
        agentId: isRoot ? OPENCLAW_ROOT_AGENT_ID : agentId,
        sessionKey,
        model,
        turnNumber,
        timestampIso: new Date().toISOString(),
      },
      openclawResponsePreview: finalAssistantContent.slice(0, 500),
    });

    const accepted = rawAssistantContent.includes(ACCEPTANCE_SIGNAL);

    const conversationUpdate: Record<string, unknown> = {
      lastMessageAt: FieldValue.serverTimestamp(),
    };

    if (agentProvidedTitle) {
      conversationUpdate.title = agentProvidedTitle;
    }

    if (accepted && currentStatus !== 'accepted') {
      conversationUpdate.status = 'accepted';
      if (!agentProvidedTitle && (typeof currentTitle !== 'string' || !currentTitle.trim())) {
        conversationUpdate.title = buildConversationTitle(historyMessages, content);
      }
    }

    functions.logger.info('OpenClaw title decision', {
      ...logContext,
      accepted,
      hasSetTitleTag: Boolean(titleMatch),
      agentProvidedTitle: agentProvidedTitle ?? null,
      currentTitle: typeof currentTitle === 'string' ? currentTitle : null,
      nextTitle: typeof conversationUpdate.title === 'string' ? conversationUpdate.title : null,
      statusTransition: accepted && currentStatus !== 'accepted' ? 'active->accepted' : 'no-change',
    });

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
          correlationId,
          status: 'complete',
          createdAt: FieldValue.serverTimestamp(),
        })
      );
    }

    await Promise.all(writes);

    functions.logger.info('OpenClaw message processed successfully', {
      ...logContext,
      accepted,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    functions.logger.error('Failed to process OpenClaw message', {
      ...logContext,
      error: errorMsg,
      detail: error,
    });
    await Promise.all([
      messageRef.update({status: 'error'}),
      conversationRef.set({lastMessageAt: FieldValue.serverTimestamp()}, {merge: true}),
    ]);
    throw error;
  }
});

async function writePromptContextDebug(input: {
  db: FirebaseFirestore.Firestore;
  requestId: string;
  userMessageId: string;
  assistantMessageId: string;
  systemContent: string;
  historyMessages: Array<{role: string; content: string}>;
  attachmentContext: string;
  requestBodyJson: string;
  userEmail: string;
  userFirstName: string;
  turnNumber: number;
  attachments: OpenclawAttachmentContext[];
  metadata: PromptContextDebugMetadata;
  openclawResponsePreview: string;
}): Promise<void> {
  await input.db
    .collection(PROMPT_CONTEXT_DEBUG_COLLECTION)
    .doc(input.requestId)
    .collection(PROMPT_CONTEXT_DEBUG_MESSAGES_SUBCOLLECTION)
    .doc(input.assistantMessageId)
    .set({
      systemContent: input.systemContent,
      historyMessages: input.historyMessages,
      attachmentContext: input.attachmentContext,
      requestBodyJson: input.requestBodyJson,
      userEmail: input.userEmail,
      userFirstName: input.userFirstName,
      turnNumber: input.turnNumber,
      attachmentsIncluded: input.attachments.length > 0,
      attachmentDetails: input.attachments.map((attachment) => ({
        name: attachment.name,
        url: attachment.url,
      })),
      constructedAt: FieldValue.serverTimestamp(),
      openclawResponsePreview: input.openclawResponsePreview,
      metadata: input.metadata,
    });
}

async function persistWorkRequestTurn(input: {
  requestId: string;
  messageId: string;
  userContent: string;
  previousAssistantContent: string | null;
  turnNumber: number;
  baseMarkdownContent: string;
  logContext: Record<string, unknown>;
  conversationRef: FirebaseFirestore.DocumentReference;
}): Promise<void> {
  const gitConfig = loadOpenclawWorkRequestGitConfig();
  if (!gitConfig) {
    functions.logger.info('OpenClaw work request git persistence skipped: repo config not set', input.logContext);
    return;
  }

  const token = githubPat.value();
  if (!token) {
    throw new Error('GITHUB_PAT secret is required when OPENCLAW_WORK_REQUEST_GIT_REPO is configured');
  }

  const gitResult = await persistOpenclawWorkRequestTurnToGit({
    requestId: input.requestId,
    messageId: input.messageId,
    userContent: input.userContent,
    previousAssistantContent: input.previousAssistantContent,
    turnNumber: input.turnNumber,
    token,
    baseMarkdownContent: input.baseMarkdownContent,
    config: gitConfig,
  });

  if (gitResult) {
    await input.conversationRef.set({
      workRequestMarkdown: gitResult.markdownContent,
      workRequestGit: {
        repo: gitResult.repo,
        branch: gitResult.branch,
        docPath: gitResult.docPath,
        commitSha: gitResult.commitSha,
        updatedAt: FieldValue.serverTimestamp(),
      },
    }, {merge: true});
  }

  functions.logger.info('OpenClaw work request turn persisted to git', {
    ...input.logContext,
    turnNumber: input.turnNumber,
    gitRepo: gitResult?.repo ?? gitConfig.repo,
    gitBranch: gitResult?.branch ?? gitConfig.branch,
    gitDocPath: gitResult?.docPath ?? null,
    gitCommitSha: gitResult?.commitSha ?? null,
  });
}

function countPriorUserTurns(historyMessages: Array<{role: string; content: string}>): number {
  return historyMessages.filter((message) => message.role === 'user').length;
}

function resolveUserFirstName(data: OpenclawMessageData, conversationSnap: DocumentSnapshot): string {
  const fromMessage = typeof data.userFirstName === 'string' ? data.userFirstName.trim() : '';
  if (fromMessage) {
    return fromMessage;
  }

  return readStringField(conversationSnap, 'userFirstName').trim();
}

function readStringField(snapshot: DocumentSnapshot, field: string): string {
  const value = snapshot.get(field);
  return typeof value === 'string' ? value : '';
}

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
