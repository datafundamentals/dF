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
  __resetOpenclawDemoState,
  __resetOpenclawStoreForTests,
  __setOpenclawFunctionsForTests,
  __setOpenclawDemoState,
  deleteOpenclawConversation,
  openclawActiveConversationState,
  openclawChatDeleteState,
  openclawConversationsState,
} from '../openclaw-chat.store';

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

describe('openclaw-chat.store delete flow', () => {
  beforeEach(() => {
    __resetOpenclawDemoState();
    __resetOpenclawStoreForTests();
    resetCallableHandlers();
    vi.clearAllMocks();
  });

  it('removes a demo conversation and switches active conversation', async () => {
    __setOpenclawDemoState({
      conversations: [
        {
          id: 'request-1',
          userId: 'user-1',
          agentId: 'cathy',
          title: 'First',
          status: 'active',
          createdAt: new Date('2026-05-05T12:00:00Z'),
          lastMessageAt: new Date('2026-05-05T12:01:00Z'),
          attachments: [],
        },
        {
          id: 'request-2',
          userId: 'user-1',
          agentId: 'cathy',
          title: 'Second',
          status: 'accepted',
          createdAt: new Date('2026-05-04T12:00:00Z'),
          lastMessageAt: new Date('2026-05-04T12:01:00Z'),
          attachments: [],
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

    await deleteOpenclawConversation('request-1');

    expect(openclawConversationsState.get().documents.map((item) => item.id)).toEqual(['request-2']);
    expect(openclawActiveConversationState.get().activeConversationId).toBe('request-2');
    expect(openclawChatDeleteState.get()).toEqual({
      status: 'idle',
      error: null,
      deletingConversationId: null,
    });
  });

  it('calls the backend delete function for initialized store usage', async () => {
    const handler = setCallableHandler<{requestId: string}, {data: {success: true; requestId: string; deletedMessageCount: number}}>(
      'deleteOpenclawConversation',
      async (payload) => ({
        data: {
          success: true,
          requestId: payload.requestId,
          deletedMessageCount: 3,
        },
      })
    );

    __setOpenclawFunctionsForTests({} as never);
    await deleteOpenclawConversation('request-9');

    expect(handler).toHaveBeenCalledWith({requestId: 'request-9'});
    expect(openclawChatDeleteState.get()).toEqual({
      status: 'idle',
      error: null,
      deletingConversationId: null,
    });
  });

  it('stores an error when backend deletion fails', async () => {
    setCallableHandler('deleteOpenclawConversation', async () => {
      throw new Error('delete failure');
    });

    __setOpenclawFunctionsForTests({} as never);
    await expect(deleteOpenclawConversation('request-9')).rejects.toThrow('delete failure');

    expect(openclawChatDeleteState.get()).toEqual({
      status: 'error',
      error: 'delete failure',
      deletingConversationId: null,
    });
  });
});
