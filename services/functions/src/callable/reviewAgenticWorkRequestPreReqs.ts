import {randomUUID} from 'node:crypto';
import * as functions from 'firebase-functions/v2';
import type {
  AgenticPreReqReviewErrorDetails,
  AgenticPreReqReviewResponse,
  AgenticPreReqs,
} from '@df/types';
import {sendAgenticGatewayChat} from '../shared/agenticGatewayChat.js';

const ROOT_AGENT_ID = process.env.AGENTIC_ROOT_AGENT_ID?.trim() || 'john';
export const REVIEW_SYSTEM_PROMPT = `You are ${ROOT_AGENT_ID}, the main approval agent for a work request.
Use your installed work-request-key-fields skill to evaluate the four fields supplied as JSON.
Apply the latest contents of that skill as the sole approval policy; do not use approval criteria from this message or prior sessions.
Return only the structured JSON decision required by the skill.`;

export const reviewAgenticWorkRequestPreReqs = functions.https.onCall<
  AgenticPreReqs,
  Promise<AgenticPreReqReviewResponse>
>(
  {region: 'us-central1', cors: true, timeoutSeconds: 120},
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    const preReqs = normalizePreReqs(request.data);
    const content = await sendAgenticGatewayChat({
      agentId: '',
      sessionKey: `agentic-work-request-main-review:${request.auth.uid}:${randomUUID()}`,
      model: 'openclaw',
      messages: [
        {role: 'system', content: REVIEW_SYSTEM_PROMPT},
        {role: 'user', content: JSON.stringify(preReqs)},
      ],
    });

    try {
      return parseAgenticPreReqReviewResponse(content);
    } catch (error) {
      functions.logger.error('Invalid main-agent prerequisite review response', {
        userId: request.auth.uid,
        responsePreview: content.slice(0, 500),
        error,
      });
      const details: AgenticPreReqReviewErrorDetails = {agentResponse: content};
      throw new functions.https.HttpsError(
        'internal',
        'John returned an invalid review response',
        details
      );
    }
  }
);

function normalizePreReqs(data: AgenticPreReqs): AgenticPreReqs {
  const fields: Array<'title' | 'intent' | 'summary' | 'metrics'> = ['title', 'intent', 'summary', 'metrics'];
  const normalized = {} as AgenticPreReqs;

  for (const field of fields) {
    const value = data?.[field];
    if (typeof value !== 'string' || !value.trim()) {
      throw new functions.https.HttpsError('invalid-argument', `${field} is required`);
    }
    normalized[field] = value.trim();
  }

  return normalized;
}

/** Parses the JSON review contract from a main-agent response. */
export function parseAgenticPreReqReviewResponse(content: string): AgenticPreReqReviewResponse {
  const json = content.match(/\{[\s\S]*\}/)?.[0];
  if (!json) {
    throw new Error('Review response did not contain JSON');
  }

  const parsed = JSON.parse(json) as Partial<AgenticPreReqReviewResponse>;
  if (typeof parsed.approved !== 'boolean' || typeof parsed.feedback !== 'string') {
    throw new Error('Review response did not match the required shape');
  }

  return {approved: parsed.approved, feedback: parsed.feedback};
}
