import {beforeEach, describe, expect, it, vi} from 'vitest';

const mockCallableHandlers: Record<string, ReturnType<typeof vi.fn>> = {};

vi.mock('@df/firebase/functions', () => ({
  getFirebaseFunctions: vi.fn(() => ({})),
  connectFunctionsToEmulator: vi.fn(),
  callable: vi.fn((_functions, name: string) => {
    const handler = mockCallableHandlers[name];
    if (!handler) {
      throw new Error(`No mock handler registered for ${name}`);
    }
    return handler;
  }),
  DEFAULT_FUNCTIONS_REGION: 'us-central1',
}));

import {
  __resetAgenticDemoState,
  __resetAgenticStoreForTests,
  __setAgenticFunctionsForTests,
  __setAgenticDemoState,
  clearAgenticPreReqReview,
  deleteAgenticConversation,
  agenticActiveConversationState,
  agenticChatDeleteState,
  agenticConversationsState,
  agenticDebugPromptState,
  agenticPreReqReviewState,
  reviewAgenticPreReqs,
} from '../agentic-chat.store';

const validPreReqs = {
  title: 'Review the deployment flow',
  intent: 'Reduce deployment failures',
  summary: 'Audit and improve the current deployment workflow',
  metrics: 'All deployment checks pass',
};

function setCallableHandler<TArgs extends object = object, TResult = unknown>(
  name: string,
  impl: (args: TArgs) => Promise<TResult>
) {
  mockCallableHandlers[name] = vi.fn(impl);
  return mockCallableHandlers[name];
}

function resetCallableHandlers(): void {
  for (const key of Object.keys(mockCallableHandlers)) {
    delete mockCallableHandlers[key];
  }
}

describe('agentic-chat.store delete flow', () => {
  beforeEach(() => {
    __resetAgenticDemoState();
    __resetAgenticStoreForTests();
    resetCallableHandlers();
    vi.clearAllMocks();
  });

  it('removes a demo conversation and switches active conversation', async () => {
    __setAgenticDemoState({
      conversations: [
        {
          id: 'request-1',
          userId: 'user-1',
          agentId: 'cathy',
          title: 'First',
          intent: 'First intent',
          summary: 'First summary',
          metrics: 'First metrics',
          status: 'active',
          createdAt: new Date('2026-05-05T12:00:00Z'),
          lastMessageAt: new Date('2026-05-05T12:01:00Z'),
          attachments: [],
          currentTurnNumber: 0,
        },
        {
          id: 'request-2',
          userId: 'user-1',
          agentId: 'cathy',
          title: 'Second',
          intent: 'Second intent',
          summary: 'Second summary',
          metrics: 'Second metrics',
          status: 'accepted',
          createdAt: new Date('2026-05-04T12:00:00Z'),
          lastMessageAt: new Date('2026-05-04T12:01:00Z'),
          attachments: [],
          currentTurnNumber: 0,
        },
      ],
      messages: [
        {
          id: 'message-1',
          role: 'user',
          content: 'First message',
          createdAt: new Date('2026-05-05T12:01:00Z'),
          sessionId: 'request-1',
          status: 'complete',
        },
        {
          id: 'message-2',
          role: 'assistant',
          content: 'Second message',
          createdAt: new Date('2026-05-04T12:01:00Z'),
          sessionId: 'request-2',
          status: 'complete',
        },
      ],
      activeConversationId: 'request-1',
    });

    await deleteAgenticConversation('request-1');

    expect(agenticConversationsState.get().documents.map((item) => item.id)).toEqual(['request-2']);
    expect(agenticActiveConversationState.get().activeConversationId).toBe('request-2');
    expect(agenticChatDeleteState.get()).toEqual({
      status: 'idle',
      error: null,
      deletingConversationId: null,
    });
  });

  it('calls the backend delete function for initialized store usage', async () => {
    const handler = setCallableHandler<{requestId: string}, {data: {success: true; requestId: string; deletedMessageCount: number}}>(
      'deleteAgenticConversation',
      async (payload) => ({
        data: {
          success: true,
          requestId: payload.requestId,
          deletedMessageCount: 3,
        },
      })
    );

    __setAgenticFunctionsForTests({} as never);
    await deleteAgenticConversation('request-9');

    expect(handler).toHaveBeenCalledWith({requestId: 'request-9'});
    expect(agenticChatDeleteState.get()).toEqual({
      status: 'idle',
      error: null,
      deletingConversationId: null,
    });
  });

  it('stores an error when backend deletion fails', async () => {
    setCallableHandler('deleteAgenticConversation', async () => {
      throw new Error('delete failure');
    });

    __setAgenticFunctionsForTests({} as never);
    await expect(deleteAgenticConversation('request-9')).rejects.toThrow('delete failure');

    expect(agenticChatDeleteState.get()).toEqual({
      status: 'error',
      error: 'delete failure',
      deletingConversationId: null,
    });
  });

  it('formats prompt context debug data for display', () => {
    __setAgenticDemoState({
      conversations: [],
      messages: [],
      promptDebug: {
        systemContent: 'TITLE: Example\nCONTEXT: Debug this request',
        historyMessages: [
          {role: 'user', content: 'Initial request'},
          {role: 'assistant', content: 'Initial response'},
        ],
        attachmentContext: '.\nUploaded files available in this session:\n- spec.pdf: https://example.test/spec.pdf',
        requestBodyJson: JSON.stringify({
          agentId: 'cathy',
          sessionKey: 'agentic-work-request-v2:cathy:request-1',
          model: 'openclaw/cathy',
          messages: [{role: 'system', content: 'TITLE: Example'}],
        }),
        userEmail: 'pete@example.test',
        userFirstName: 'Pete',
        turnNumber: 2,
        attachmentsIncluded: true,
        attachmentDetails: [{name: 'spec.pdf', url: 'https://example.test/spec.pdf'}],
        constructedAt: new Date('2026-06-16T12:00:00Z'),
        agenticResponsePreview: 'Updated the request.',
        metadata: {
          agentId: 'cathy',
          requestId: 'request-1',
          userMessageId: 'user-message-1',
          assistantMessageId: 'assistant-message-1',
        },
      },
    });

    const formatted = agenticDebugPromptState.get().fullPromptContext;

    expect(formatted).toContain('"agentId": "cathy"');
    expect(formatted).toContain('"model": "openclaw/cathy"');
    expect(formatted).toContain('"messages"');
  });
});

describe('agentic-chat.store prerequisite review flow', () => {
  beforeEach(() => {
    __resetAgenticDemoState();
    __resetAgenticStoreForTests();
    resetCallableHandlers();
    vi.clearAllMocks();
  });

  it('returns approval and restores idle state', async () => {
    const handler = setCallableHandler('reviewAgenticWorkRequestPreReqs', async () => ({
      data: {approved: true, feedback: 'Approved.'},
    }));
    __setAgenticFunctionsForTests({} as never);

    await expect(reviewAgenticPreReqs(validPreReqs)).resolves.toBe(true);

    expect(handler).toHaveBeenCalledWith(validPreReqs);
    expect(agenticPreReqReviewState.get()).toEqual({status: 'idle', feedback: null});
  });

  it('preserves rejection feedback for the form', async () => {
    setCallableHandler('reviewAgenticWorkRequestPreReqs', async () => ({
      data: {approved: false, feedback: 'Remove bicycle from Summary and submit again.'},
    }));
    __setAgenticFunctionsForTests({} as never);

    await expect(reviewAgenticPreReqs(validPreReqs)).resolves.toBe(false);

    expect(agenticPreReqReviewState.get()).toEqual({
      status: 'rejected',
      feedback: 'Remove bicycle from Summary and submit again.',
    });
  });

  it('exposes callable failures and rethrows them', async () => {
    setCallableHandler('reviewAgenticWorkRequestPreReqs', async () => {
      throw new Error('review unavailable');
    });
    __setAgenticFunctionsForTests({} as never);

    await expect(reviewAgenticPreReqs(validPreReqs)).rejects.toThrow('review unavailable');

    expect(agenticPreReqReviewState.get()).toEqual({
      status: 'error',
      feedback: 'review unavailable',
    });
  });

  it('appends the complete agent response from callable error details', async () => {
    const agentResponse = 'I could not load the requested skill.\nSecond line remains intact.';
    setCallableHandler('reviewAgenticWorkRequestPreReqs', async () => {
      throw Object.assign(new Error('John returned an invalid review response'), {
        details: {agentResponse},
      });
    });
    __setAgenticFunctionsForTests({} as never);

    await expect(reviewAgenticPreReqs(validPreReqs)).rejects.toThrow(
      'John returned an invalid review response'
    );

    expect(agenticPreReqReviewState.get()).toEqual({
      status: 'error',
      feedback: `John returned an invalid review response\n\n${agentResponse}`,
    });
  });

  it('clears rejection feedback when a review form is abandoned', () => {
    __setAgenticDemoState({
      conversations: [],
      messages: [],
      preReqReview: {
        status: 'rejected',
        feedback: 'Update the Summary.',
      },
    });

    clearAgenticPreReqReview();

    expect(agenticPreReqReviewState.get()).toEqual({status: 'idle', feedback: null});
  });
});
