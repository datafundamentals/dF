import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

import '@df/ui-lit/df-chat-widget';
import {
  resetChatDemoState,
  __setChatDemoState,
  __setChatSendState,
  __setAuthDemoState,
  __resetAuthDemoState,
} from '@df/state';
import type {
  ChatMessage,
  FirestoreCollectionState,
  ChatSendStatus,
  FirebaseAuthState,
} from '@df/types';

const baseMessages: ChatMessage[] = [
  {
    id: 'alpha',
    userId: 'instructor-1',
    userDisplayName: 'Instructor Ava',
    userPhotoURL: null,
    text: 'Welcome to the live chat! Drop your questions below.',
    createdAt: new Date('2025-10-26T14:00:00Z'),
  },
  {
    id: 'bravo',
    userId: 'student-7',
    userDisplayName: 'Jordan',
    userPhotoURL: null,
    text: 'How often should we sync Firestore listeners?',
    createdAt: new Date('2025-10-26T14:01:10Z'),
  },
  {
    id: 'charlie',
    userId: 'instructor-1',
    userDisplayName: 'Instructor Ava',
    userPhotoURL: null,
    text: 'Great question—watch for the code sample in the next section.',
    createdAt: new Date('2025-10-26T14:02:05Z'),
  },
];

const createCollectionState = (
  messages: ChatMessage[],
  status: FirestoreCollectionState<ChatMessage>['status'],
  error: string | null = null
): FirestoreCollectionState<ChatMessage> => ({
  status,
  documents: messages,
  error,
  isListening: status === 'ready',
  lastUpdated: Date.now(),
  currentPage: 1,
  pageSize: 50,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'Messages (demo data)',
});

type ChatArgs = {
  heading: string;
  submitOnEnter: boolean;
  autoFocus: boolean;
  onMessageSent?: (detail: {text: string}) => void;
  onError?: (detail: unknown) => void;
  sendStatus?: ChatSendStatus;
  sendError?: string | null;
  authenticated?: boolean;
};

const meta: Meta<ChatArgs> = {
  title: 'Firebase/Chat Widget',
  component: 'df-chat-widget',
  args: {
    heading: 'Classroom Chat',
    submitOnEnter: true,
    autoFocus: false,
    sendStatus: 'idle',
    sendError: null,
    authenticated: false,
  },
  argTypes: {
    heading: {control: 'text'},
    submitOnEnter: {control: 'boolean'},
    autoFocus: {control: 'boolean'},
    sendStatus: {
      options: ['idle', 'sending', 'error'],
      control: {type: 'inline-radio'},
    },
    sendError: {
      control: 'text',
    },
    authenticated: {control: 'boolean'},
    onMessageSent: {action: 'message-sent'},
    onError: {action: 'error'},
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Lightweight classroom chat widget backed by the shared chat.store.

## Events
- \`df-chat-widget-message-sent\`: Fires after a message is dispatched.
- \`df-chat-widget-error\`: Fires when message submission fails.

## Usage
Initialize the chat store before rendering:


	o initialize chat state
	import {initializeChatStore} from '@df/state';
	await initializeChatStore(app, true);

The Storybook stories use \`__setChatDemoState\` helpers to provide deterministic demo data without touching Firestore.
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<ChatArgs>;

const demoAuthenticatedState: FirebaseAuthState = {
  authUser: {
    uid: 'demo-auth-user',
    email: 'demo.student@example.com',
    displayName: 'Demo Student',
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

function prepareDemo(state: FirestoreCollectionState<ChatMessage>, status: ChatSendStatus, error: string | null) {
  resetChatDemoState();
  __setChatDemoState(state);
  __setChatSendState(status, error ?? null);
}

function prepareAuth(authenticated: boolean | undefined) {
  __resetAuthDemoState();
  __setAuthDemoState(authenticated ? demoAuthenticatedState : demoSignedOutState);
}

const renderWidget = (args: ChatArgs) => {
  prepareAuth(args.authenticated);
  prepareDemo(createCollectionState(baseMessages, 'ready'), args.sendStatus ?? 'idle', args.sendError ?? null);

  return html`
    <df-chat-widget
      .heading=${args.heading}
      .submitOnEnter=${args.submitOnEnter}
      .autoFocus=${args.autoFocus}
      @df-chat-widget-message-sent=${(event: CustomEvent<{text: string}>) => args.onMessageSent?.(event.detail)}
      @df-chat-widget-error=${(event: CustomEvent) => args.onError?.(event.detail)}
    ></df-chat-widget>
  `;
};

export const Default: Story = {
  render: renderWidget,
};

export const Sending: Story = {
  args: {
    sendStatus: 'sending',
  },
  render: renderWidget,
};

export const SubmissionError: Story = {
  args: {
    sendStatus: 'error',
    sendError: 'Network unavailable. Try again shortly.',
  },
  render: renderWidget,
};

export const LoadingState: Story = {
  render: (args) => {
    prepareAuth(args.authenticated);
    prepareDemo(createCollectionState([], 'loading'), args.sendStatus ?? 'idle', args.sendError ?? null);
    return html`
      <df-chat-widget
        .heading=${args.heading}
        .submitOnEnter=${args.submitOnEnter}
        .autoFocus=${args.autoFocus}
      ></df-chat-widget>
    `;
  },
};

export const EmptyState: Story = {
  render: (args) => {
    prepareAuth(args.authenticated);
    prepareDemo(createCollectionState([], 'ready'), args.sendStatus ?? 'idle', args.sendError ?? null);
    return html`
      <df-chat-widget
        .heading=${args.heading}
        .submitOnEnter=${args.submitOnEnter}
        .autoFocus=${args.autoFocus}
      ></df-chat-widget>
    `;
  },
};
