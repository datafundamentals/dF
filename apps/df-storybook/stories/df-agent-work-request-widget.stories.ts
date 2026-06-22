import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

import '@df/ui-lit/df-agent-work-request-widget';
import {
  __resetAuthDemoState,
  __resetAgenticDemoState,
  __setAuthDemoState,
  __setAgenticDemoState,
} from '@df/state';
import type {
  FirebaseAuthState,
  AgenticConversation,
  AgenticMessage,
} from '@df/types';

type AgenticStoryArgs = {
  heading: string;
  authenticated: boolean;
  acceptedConversation: boolean;
};

const baseConversations: AgenticConversation[] = [
  {
    id: '9R53Bj9qEux4tloGfvKV',
    userId: 'demo-user-1',
    agentId: 'cathy',
    title: 'Need a new landing page audit',
    intent: 'Audit the landing page for visual and accessibility issues.',
    summary: 'Run a full audit of the landing page layout and flag any MD3 violations.',
    metrics: 'All audit findings documented with severity ratings before end of sprint.',
    status: 'active',
    createdAt: new Date('2026-05-04T15:00:00Z'),
    lastMessageAt: new Date('2026-05-04T15:24:00Z'),
  },
  {
    id: 'request-older-2',
    userId: 'demo-user-1',
    agentId: 'cathy',
    title: 'Research recurring bug reports',
    intent: 'Investigate the root cause of recurring null pointer errors in auth flow.',
    summary: 'Reproduce the issue, trace the call stack, and propose a fix.',
    metrics: 'Bug root cause identified and fix verified against regression suite.',
    status: 'accepted',
    createdAt: new Date('2026-05-02T12:00:00Z'),
    lastMessageAt: new Date('2026-05-02T13:10:00Z'),
  },
];

const baseMessages: AgenticMessage[] = [
  {
    id: 'message-1',
    role: 'user',
    content: 'Can you help me organize this work request and suggest the right scope?',
    createdAt: new Date('2026-05-04T15:01:00Z'),
    sessionId: '9R53Bj9qEux4tloGfvKV',
    status: 'complete',
  },
  {
    id: 'message-2',
    role: 'assistant',
    content: 'Yes. I can help shape the request, clarify acceptance criteria, and prepare it for submission.',
    createdAt: new Date('2026-05-04T15:02:00Z'),
    sessionId: '9R53Bj9qEux4tloGfvKV',
    status: 'complete',
  },
  {
    id: 'message-3',
    role: 'user',
    content: 'Please make the first pass focus on visual placement only, then split backend work into follow-up tickets.',
    createdAt: new Date('2026-05-04T15:03:00Z'),
    sessionId: '9R53Bj9qEux4tloGfvKV',
    status: 'complete',
  },
];

const demoAuthenticatedState: FirebaseAuthState = {
  authUser: {
    uid: 'demo-auth-user',
    email: 'pete@example.com',
    displayName: 'Pete Carapetyan',
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {} as never,
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => undefined,
    getIdToken: async () => 'demo-token',
    getIdTokenResult: async () => ({
      token: 'demo-token',
      authTime: '',
      expirationTime: '',
      issuedAtTime: '',
      signInProvider: 'password',
      claims: {},
      signInSecondFactor: null,
    }),
    reload: async () => undefined,
    toJSON: () => ({}),
    phoneNumber: null,
    providerId: 'password',
  } as unknown as FirebaseAuthState['authUser'],
  authState: 'authenticated',
  error: null,
  initialized: true,
};

const demoSignedOutState: FirebaseAuthState = {
  authUser: null,
  authState: 'unauthenticated',
  error: null,
  initialized: true,
};

const meta: Meta<AgenticStoryArgs> = {
  title: 'Firebase/Agentic Chat Widget',
  component: 'df-agent-work-request-widget',
  args: {
    heading: 'Chatty Cathy Work Request System',
    authenticated: true,
    acceptedConversation: false,
  },
  argTypes: {
    heading: {control: 'text'},
    authenticated: {control: 'boolean'},
    acceptedConversation: {control: 'boolean'},
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Shared Agentic work-request widget.

These stories use auth and Agentic demo-state helpers so the widget can be reviewed visually without connecting to Firebase or the Agentic backend.
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<AgenticStoryArgs>;

function prepareAuth(authenticated: boolean): void {
  __resetAuthDemoState();
  __setAuthDemoState(authenticated ? demoAuthenticatedState : demoSignedOutState);
}

function prepareAgenticState(acceptedConversation: boolean, reviewFeedback: string | null = null): void {
  __resetAgenticDemoState();
  __setAgenticDemoState({
    conversations: baseConversations.map((conversation, index) => index === 0
      ? {
          ...conversation,
          status: acceptedConversation ? 'accepted' : 'active',
        }
      : conversation),
    messages: baseMessages,
    activeConversationId: baseConversations[0]?.id ?? null,
    conversationsStatus: 'ready',
    messagesStatus: 'ready',
    sendStatus: 'idle',
    preReqReview: {
      status: reviewFeedback ? 'rejected' : 'idle',
      feedback: reviewFeedback,
    },
  });
}

function preparePreReqReviewState(feedback: string | null = null): void {
  __resetAgenticDemoState();
  __setAgenticDemoState({
    conversations: [],
    messages: [],
    conversationsStatus: 'ready',
    messagesStatus: 'idle',
    preReqReview: {
      status: feedback ? 'rejected' : 'idle',
      feedback,
    },
  });
}

const renderWidget = (args: AgenticStoryArgs) => {
  prepareAuth(args.authenticated);
  prepareAgenticState(args.acceptedConversation);

  return html`
    <div style="padding: 24px; background: #eef2ff; min-height: 100vh; box-sizing: border-box;">
      <df-agent-work-request-widget .heading=${args.heading}></df-agent-work-request-widget>
    </div>
  `;
};

export const Default: Story = {
  render: renderWidget,
};

export const AcceptedRequest: Story = {
  args: {
    acceptedConversation: true,
  },
  render: renderWidget,
};

export const PrerequisiteReview: Story = {
  render: (args) => {
    prepareAuth(args.authenticated);
    preparePreReqReviewState();
    return html`<df-agent-work-request-widget .heading=${args.heading}></df-agent-work-request-widget>`;
  },
};

export const PrerequisiteReviewRejected: Story = {
  render: (args) => {
    prepareAuth(args.authenticated);
    preparePreReqReviewState('Summary contains “bicycle”. Remove it and submit the fields again.');
    return html`<df-agent-work-request-widget .heading=${args.heading}></df-agent-work-request-widget>`;
  },
};

export const EditReviewRejected: Story = {
  render: renderWidget,
  play: async ({canvasElement}) => {
    const widget = canvasElement.querySelector('df-agent-work-request-widget');
    if (!widget) {
      throw new Error('Work request widget was not rendered');
    }

    await widget.updateComplete;
    const editButton = [...(widget.shadowRoot?.querySelectorAll('md-outlined-button') ?? [])]
      .find((button) => button.textContent?.includes('Edit Conversation Details'));
    if (!(editButton instanceof HTMLElement)) {
      throw new Error('Edit Conversation Details button was not rendered');
    }

    editButton.click();
    prepareAgenticState(false, 'Summary contains “bicycle”. Remove it and submit the edits again.');
    await widget.updateComplete;
  },
};
