import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

import '@df/ui-lit/firebase/df-activity-types-crud.js';
import {
  __setActivityTypeDemoState,
  __setAuthDemoState,
  __resetAuthDemoState,
} from '@df/state';
import type {ActivityTypeDocument, FirestoreCollectionState, FirebaseAuthState} from '@df/types';

const demoDocs: ActivityTypeDocument[] = [
  {
    id: 'demo-1',
    typeName: 'Pushups',
    unit: 'count',
    defaultNumber: 12,
    order: 1,
    createdAt: new Date('2025-09-18T10:00:00Z'),
    updatedAt: new Date('2025-09-19T10:00:00Z'),
    ownerId: 'storybook-user',
  },
  {
    id: 'demo-2',
    typeName: 'Plank',
    unit: 'seconds',
    defaultNumber: 45,
    order: 2,
    createdAt: new Date('2025-09-18T10:05:00Z'),
    updatedAt: new Date('2025-09-19T10:05:00Z'),
    ownerId: 'storybook-user',
  },
];

const demoCollection = (): FirestoreCollectionState<ActivityTypeDocument> => ({
  status: 'ready',
  documents: demoDocs,
  error: null,
  isListening: false,
  lastUpdated: Date.now(),
  currentPage: 1,
  pageSize: 10,
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

function setAuth(state: FirebaseAuthState) {
  __resetAuthDemoState();
  __setAuthDemoState(state);
}

const meta: Meta = {
  title: 'Firebase/Activity Types CRUD',
  parameters: {
    docs: {
      description: {
        component:
          'Presentation-only CRUD surface for activity type presets. Uses the shared activity type Firestore store and MD3 controls.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const RequiresAuth: Story = {
  render: () => {
    setAuth(signedOutState);
    return html`<df-activity-types-crud use-demo-data></df-activity-types-crud>`;
  },
};

export const DemoData: Story = {
  render: () => {
    setAuth(signedInState);
    __setActivityTypeDemoState(demoCollection());
    return html`<df-activity-types-crud use-demo-data></df-activity-types-crud>`;
  },
};
