import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

import '@df/ui-lit/firebase/df-goldilocks-visualizer.js';
import {
  __setGoldilocksTypeDemoState,
  __setGoldilocksConfigurationDemoState,
  __setAuthDemoState,
  __resetAuthDemoState,
} from '@df/state';
import type {
  GoldilocksTypeDocument,
  GoldilocksConfigurationEntry,
  FirestoreCollectionState,
  FirebaseAuthState,
} from '@df/types';

const demoTypes: GoldilocksTypeDocument[] = [
  {
    id: 'demo-1',
    name: 'Project Management',
    first: 'Fast',
    second: 'Cheap',
    third: 'Good',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T10:00:00Z'),
    ownerId: 'storybook-user',
    nameLower: 'project management',
  },
  {
    id: 'demo-2',
    name: 'Work-Life Balance',
    first: 'Career',
    second: 'Family',
    third: 'Health',
    createdAt: new Date('2025-01-02T10:00:00Z'),
    updatedAt: new Date('2025-01-02T10:00:00Z'),
    ownerId: 'storybook-user',
    nameLower: 'work-life balance',
  },
];

const demoConfigurations: GoldilocksConfigurationEntry[] = [
  {
    id: 'config-1',
    goldilocksTypeName: 'Project Management',
    first: 'Fast',
    second: 'Cheap',
    third: 'Good',
    selectedOptions: ['Fast', 'Good'],
    note: 'Prioritizing speed and quality over cost',
    createdAt: new Date('2025-01-03T10:00:00Z'),
    updatedAt: new Date('2025-01-03T10:00:00Z'),
    ownerId: 'storybook-user',
  },
  {
    id: 'config-2',
    goldilocksTypeName: 'Work-Life Balance',
    first: 'Career',
    second: 'Family',
    third: 'Health',
    selectedOptions: ['Family', 'Health'],
    note: null,
    createdAt: new Date('2025-01-04T10:00:00Z'),
    updatedAt: new Date('2025-01-04T10:00:00Z'),
    ownerId: 'storybook-user',
  },
];

const demoTypesCollection = (): FirestoreCollectionState<GoldilocksTypeDocument> => ({
  status: 'ready',
  documents: demoTypes,
  error: null,
  isListening: false,
  lastUpdated: Date.now(),
  currentPage: 1,
  pageSize: 10,
  hasNextPage: false,
  hasPreviousPage: false,
  queryDescription: 'Storybook demo data',
});

const demoConfigsCollection = (): FirestoreCollectionState<GoldilocksConfigurationEntry> => ({
  status: 'ready',
  documents: demoConfigurations,
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
  title: 'Firebase/Goldilocks Visualizer',
  parameters: {
    docs: {
      description: {
        component:
          'Complete goldilocks visualizer with interactive Venn diagram for "pick 2" decision-making. Includes type management, configuration creator with SVG animations, and saved configurations list.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const RequiresAuth: Story = {
  render: () => {
    setAuth(signedOutState);
    return html`<df-goldilocks-visualizer></df-goldilocks-visualizer>`;
  },
};

export const WithDemoData: Story = {
  render: () => {
    setAuth(signedInState);
    const types = demoTypesCollection();
    const configs = demoConfigsCollection();
    console.log('[Storybook] Setting demo types:', types);
    console.log('[Storybook] Setting demo configs:', configs);
    __setGoldilocksTypeDemoState(types);
    __setGoldilocksConfigurationDemoState(configs);
    return html`<df-goldilocks-visualizer use-demo-data></df-goldilocks-visualizer>`;
  },
};

export const EmptyState: Story = {
  render: () => {
    setAuth(signedInState);
    __setGoldilocksTypeDemoState({
      status: 'ready',
      documents: [],
      error: null,
      isListening: false,
      lastUpdated: Date.now(),
      currentPage: 1,
      pageSize: 10,
      hasNextPage: false,
      hasPreviousPage: false,
      queryDescription: 'Empty demo data',
    });
    __setGoldilocksConfigurationDemoState({
      status: 'ready',
      documents: [],
      error: null,
      isListening: false,
      lastUpdated: Date.now(),
      currentPage: 1,
      pageSize: 10,
      hasNextPage: false,
      hasPreviousPage: false,
      queryDescription: 'Empty demo data',
    });
    return html`<df-goldilocks-visualizer use-demo-data></df-goldilocks-visualizer>`;
  },
};
