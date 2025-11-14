import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

import '@df/ui-lit/firebase/df-firestore-demo.js';
import {
  __setTodoDemoFilters,
  __setTodoDemoState,
  __setAuthDemoState,
  __resetAuthDemoState,
} from '@df/state';
import type {
  FirestoreCollectionState,
  TodoDocument,
  TodoFilterState,
  FirebaseAuthState,
} from '@df/types';

const demoFilters: TodoFilterState = {
  showCompleted: true,
  priority: 'all',
  tag: 'all',
  search: '',
};

const demoTodos: TodoDocument[] = [
  {
    id: 'demo-todo',
    title: 'Publish Storybook docs',
    description: 'Ensure Firestore UI components appear with knobs and usage notes.',
    completed: false,
    priority: 'medium',
    tags: ['storybook', 'docs'],
    createdAt: new Date('2025-09-26T09:30:00Z'),
    updatedAt: new Date('2025-09-26T09:30:00Z'),
    dueDate: new Date('2025-09-30T21:00:00Z'),
  },
  {
    id: 'plan-firestore-demo',
    title: 'Plan Firestore CRUD walkthrough',
    description: 'Outline create, read, update, delete flows for the teaching app demo.',
    completed: false,
    priority: 'high',
    tags: ['teaching', 'planning'],
    createdAt: new Date('2025-09-18T14:30:00Z'),
    updatedAt: new Date('2025-09-18T14:30:00Z'),
    dueDate: new Date('2025-09-20T17:00:00Z'),
  },
];

const demoCollection = (): FirestoreCollectionState<TodoDocument> => ({
  status: 'ready',
  documents: demoTodos,
  error: null,
  isListening: false,
  lastUpdated: Date.now(),
  currentPage: 1,
  pageSize: 5,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'Storybook demo data',
});

const demoAuthUser = {
  uid: 'storybook-user',
  email: 'storybook@example.com',
  displayName: 'Storybook User',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  providerId: 'password',
  refreshToken: 'storybook-token',
  tenantId: null,
  delete: async () => undefined,
  getIdToken: async () => 'token',
  getIdTokenResult: async () => ({
    authTime: '',
    expirationTime: '',
    issuedAtTime: '',
    signInProvider: 'password',
    signInSecondFactor: null,
    token: 'token',
    claims: {},
  }),
  reload: async () => undefined,
  toJSON: () => ({}),
  phoneNumber: null,
} as unknown as FirebaseAuthState['authUser'];

const signedInState: FirebaseAuthState = {
  authUser: demoAuthUser,
  authState: 'authenticated',
  error: null,
  initialized: true,
};

const signedOutState: FirebaseAuthState = {
  authUser: null,
  authState: 'unauthenticated',
  error: null,
  initialized: true,
};

function prepareTodos() {
  __setTodoDemoFilters(demoFilters);
  __setTodoDemoState(demoCollection());
}

function setAuth(state: FirebaseAuthState) {
  __resetAuthDemoState();
  __setAuthDemoState(state);
}

const meta: Meta = {
  title: 'Firebase/Firestore Demo Shell',
  parameters: {
    docs: {
      description: {
        component:
          'Demo surface that wires shared Firestore stores to the todo UI components. Use the `use-demo-data` attribute for Storybook or tests to avoid connecting to Firebase.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const RequiresAuth: Story = {
  render: () => {
    setAuth(signedOutState);
    return html`<df-firestore-demo use-demo-data></df-firestore-demo>`;
  },
};

export const DemoData: Story = {
  render: () => {
    setAuth(signedInState);
    prepareTodos();
    return html`<df-firestore-demo use-demo-data></df-firestore-demo>`;
  },
};
