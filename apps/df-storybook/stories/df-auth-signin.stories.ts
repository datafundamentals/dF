import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/firebase';

interface DfSignInStoryArgs {
  onSignIn?: (event: CustomEvent) => void;
  onSignUp?: (event: CustomEvent) => void;
  onPasswordReset?: (event: CustomEvent) => void;
}

const meta: Meta<DfSignInStoryArgs> = {
  title: 'Firebase/Auth/df-sign-in',
  component: 'df-sign-in',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Firebase Authentication Sign-In Component

Material Design 3 component for email/password authentication with Firebase Auth.

## Features
- **Email/password** sign-in form with validation
- **Material Design 3** styling (md-outlined-text-field, md-filled-button)
- **Loading states** with disabled inputs during authentication
- **Error handling** with user-friendly messages
- **Responsive layout** adapts to container width
- **Signals-based state** for reactive UI updates

## Usage

\`\`\`typescript
import '@df/ui-lit/firebase';
import {initializeAuth} from '@df/state';

// Initialize auth first
const app = getFirebaseApp(config);
initializeAuth(app);

// Then use the component
<df-sign-in
  @sign-in=\${handleSignIn}
  @sign-up-link=\${handleSignUpLink}
  @password-reset-link=\${handlePasswordResetLink}
></df-sign-in>
\`\`\`

## Events
- \`sign-in\`: Fired when user attempts to sign in (detail: {email, password})
- \`sign-up-link\`: Fired when "Create account" link clicked
- \`password-reset-link\`: Fired when "Forgot password?" link clicked

## State Management
Uses Firebase Auth store from \`@df/state\`:
- Reads \`firebaseAuthState\` signal for loading/error states
- Calls \`signIn()\` function on form submission
- Automatically displays errors from auth store

## Testing
- **Unit tests**: Mock Firebase Auth SDK functions
- **Integration tests**: Use Firebase Auth Emulator
- **Storybook**: Visual testing with interactive controls
        `,
      },
    },
  },
  args: {},
  argTypes: {
    onSignIn: {action: 'sign-in'},
    onSignUp: {action: 'sign-up-link'},
    onPasswordReset: {action: 'password-reset-link'},
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<DfSignInStoryArgs>;

export const Default: Story = {
  render: (args) => html`
    <div style="width: 400px; padding: 24px; background: #f5f5f5; border-radius: 12px;">
      <df-sign-in
        @sign-in=${(event: CustomEvent) => args.onSignIn?.(event)}
        @sign-up-link=${(event: CustomEvent) => args.onSignUp?.(event)}
        @password-reset-link=${(event: CustomEvent) => args.onPasswordReset?.(event)}
      ></df-sign-in>
    </div>
  `,
};

export const WithInstructions: Story = {
  render: (args) => html`
    <div style="max-width: 500px; padding: 24px;">
      <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 500;">
        Sign In to Firebase Teaching App
      </h2>
      <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">
        Use test credentials from the emulator:
        <br><strong>Email:</strong> alice.anderson@example.com
        <br><strong>Password:</strong> password123
      </p>

      <df-sign-in
        @sign-in=${(event: CustomEvent) => {
          args.onSignIn?.(event);
          console.log('Sign in attempt:', event.detail);
        }}
        @sign-up-link=${(event: CustomEvent) => {
          args.onSignUp?.(event);
          console.log('Navigate to sign up');
        }}
        @password-reset-link=${(event: CustomEvent) => {
          args.onPasswordReset?.(event);
          console.log('Navigate to password reset');
        }}
      ></df-sign-in>

      <div style="margin-top: 24px; padding: 12px; background: #e3f2fd; border-radius: 8px; font-size: 13px;">
        <strong>Note:</strong> This demo does not connect to Firebase.
        In a real app, initialize auth before using this component.
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Sign-in form with instructions and test credentials for emulator usage.',
      },
    },
  },
};

export const ErrorState: Story = {
  render: (args) => html`
    <div style="width: 400px; padding: 24px; background: #f5f5f5; border-radius: 12px;">
      <h3 style="margin: 0 0 16px 0;">Error State Example</h3>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #666;">
        Enter invalid credentials to see error handling:
      </p>
      <df-sign-in
        @sign-in=${(event: CustomEvent) => {
          args.onSignIn?.(event);
          // Simulate error by logging
          console.error('Sign in failed: Invalid credentials');
        }}
        @sign-up-link=${(event: CustomEvent) => args.onSignUp?.(event)}
        @password-reset-link=${(event: CustomEvent) => args.onPasswordReset?.(event)}
      ></df-sign-in>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates error handling when authentication fails.',
      },
    },
  },
};

export const Minimal: Story = {
  render: (args) => html`
    <df-sign-in
      @sign-in=${(event: CustomEvent) => args.onSignIn?.(event)}
      @sign-up-link=${(event: CustomEvent) => args.onSignUp?.(event)}
      @password-reset-link=${(event: CustomEvent) => args.onPasswordReset?.(event)}
    ></df-sign-in>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Minimal usage without container styling.',
      },
    },
  },
};

export const WithCustomEventHandlers: Story = {
  render: (args) => html`
    <div style="width: 400px; padding: 24px; background: #f5f5f5; border-radius: 12px;">
      <h3 style="margin: 0 0 16px 0;">Custom Event Handling</h3>
      <df-sign-in
        @sign-in=${(event: CustomEvent) => {
          args.onSignIn?.(event);
          const {email} = event.detail;
          alert('Sign in attempt for: ' + email);
        }}
        @sign-up-link=${(event: CustomEvent) => {
          args.onSignUp?.(event);
          alert('Navigate to sign-up page');
        }}
        @password-reset-link=${(event: CustomEvent) => {
          args.onPasswordReset?.(event);
          alert('Navigate to password reset page');
        }}
      ></df-sign-in>

      <div style="margin-top: 16px; padding: 12px; background: white; border-radius: 8px; font-size: 12px; font-family: monospace;">
        <strong>Events logged to Actions tab</strong>
        <br>Open browser console to see event details
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates custom event handling with alerts and console logging.',
      },
    },
  },
};
