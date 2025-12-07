import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

import '@df/ui-lit/firebase/df-storage-demo.js';
import {__setAuthDemoState, __resetAuthDemoState} from '@df/state';
import type {FirebaseAuthState} from '@df/types';

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
  title: 'Firebase/Storage Demo Shell',
  parameters: {
    docs: {
      description: {
        component: `
Storage Pattern Demo Component

Demonstrates Firebase Storage patterns including:
- File upload with progress tracking using df-upload-link
- File listing and browsing with df-file-list
- File preview (images, PDFs)
- File deletion with confirmation
- Drag-and-drop upload
- File validation

## Authentication
This component requires authentication to view uploaded files. The upload functionality works without authentication, but file listing requires a signed-in user.

## Usage
\`\`\`html
<df-storage-demo></df-storage-demo>
\`\`\`

## Events
- File uploads emit progress events tracked by fileUploadProgress signal
- File selection emits custom events for preview/download
- File deletion shows confirmation dialog before removing files
        `,
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const SignedOut: Story = {
  render: () => {
    setAuth(signedOutState);
    return html`<df-storage-demo></df-storage-demo>`;
  },
};

export const SignedIn: Story = {
  render: () => {
    setAuth(signedInState);
    return html`<df-storage-demo></df-storage-demo>`;
  },
};

export const Default: Story = {
  render: () => {
    setAuth(signedInState);
    return html`<df-storage-demo></df-storage-demo>`;
  },
};
