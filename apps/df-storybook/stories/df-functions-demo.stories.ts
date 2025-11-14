import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

import '@df/ui-lit/firebase/df-functions-demo.js';
import {
  __setAuthDemoState,
  __resetAuthDemoState,
  resetCreateTodoState,
  resetCleanupState,
  resetExportState,
} from '@df/state';
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

function resetFunctionStates() {
  resetCreateTodoState();
  resetCleanupState();
  resetExportState();
}

const meta: Meta = {
  title: 'Firebase/Functions Demo',
  parameters: {
    docs: {
      description: {
        component: `
Teaching component that demonstrates calling Cloud Functions from the client using signals-based state management.

## Features
- **Callable Functions**: RPC-style functions with type-safe requests/responses
- **HTTP Functions**: REST-style endpoints accessed via fetch
- **State Management**: Signals-based reactive state for loading/success/error handling
- **Material Design 3**: All interactive elements use MD3 components

## Functions Demonstrated
1. \`createTodoAdvanced\` - Callable function with server-side business logic
2. \`manualCleanupExpiredTodos\` - Administrative callable function
3. \`todosExportAPI\` - HTTP function for data export

## Events
This component does not emit custom events. All interactions are handled through the functions demo store.

## State Management
Function call state is managed in \`@df/state/stores/functions-demo.store\` and consumed via signals:
- \`createTodoCallState\` - State for todo creation calls
- \`cleanupCallState\` - State for cleanup calls  
- \`exportCallState\` - State for export calls

## Requirements
- Requires Firebase Functions emulator running on port 5501
- Auth state available for authenticated calls
- Types from \`@df/types\` for request/response typing

## Accessibility
- All form inputs have associated labels
- Buttons indicate loading state with disabled attribute
- Error messages are clearly displayed
- Success feedback provided for all operations
        `,
      },
    },
  },
  decorators: [
    (story) => {
      resetFunctionStates();
      return story();
    },
  ],
};

export default meta;

type Story = StoryObj;

/**
 * Default view with authenticated user. Functions are ready to call.
 * Note: Actual function calls require the Firebase Functions emulator to be running.
 */
export const Authenticated: Story = {
  render: () => {
    setAuth(signedInState);
    resetFunctionStates();
    return html`<df-functions-demo></df-functions-demo>`;
  },
};

/**
 * Component when user is not authenticated. Some functions may require auth.
 */
export const Unauthenticated: Story = {
  render: () => {
    setAuth(signedOutState);
    resetFunctionStates();
    return html`<df-functions-demo></df-functions-demo>`;
  },
};

/**
 * Interactive demo showing all three function types.
 * Try calling each function to see the reactive state updates.
 */
export const Interactive: Story = {
  render: () => {
    setAuth(signedInState);
    resetFunctionStates();
    return html`
      <div style="max-width: 1200px; margin: 2rem auto;">
        <df-functions-demo></df-functions-demo>
      </div>
    `;
  },
};
