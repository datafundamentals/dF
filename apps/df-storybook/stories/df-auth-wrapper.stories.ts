import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';
import '@df/ui-lit/df-auth-wrapper';

interface DfAuthWrapperStoryArgs {
  headless?: boolean;
  showHideUser?: boolean;
  onUserChanged?: (event: CustomEvent) => void;
}

const meta: Meta<DfAuthWrapperStoryArgs> = {
  title: 'Firebase/Auth/df-auth-wrapper',
  component: 'df-auth-wrapper',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Google Authentication Wrapper Component

A wrapper component that protects content behind Google Sign-In authentication.
Content inside the wrapper is only visible after successful authentication.

## Key Features
- **Google Sign-In only** - Uses popup-based OAuth flow
- **Production Firebase** - Requires real Firebase (no emulator support)
- **Auto token storage** - Stores tokens in localStorage, sessionStorage, and cookies
- **Two display modes** - Header with user info or headless
- **Material Design 3** - Uses MD3 buttons for authentication UI
- **Event-driven** - Dispatches custom events for auth state changes

## Storage

Authentication data is automatically stored in three locations:
- \`localStorage.getItem('User')\` - Full user object JSON
- \`sessionStorage.getItem('Authorization')\` - Bearer token string
- \`document.cookie\` - authToken cookie (1 hour expiry)

## Usage

\`\`\`typescript
import {loadFirebaseConfig} from '@df/firebase/firebase-config';
import {initializeGoogleAuth} from '@df/state';
import '@df/ui-lit/df-auth-wrapper';

// Load Firebase config from environment variables
const config = loadFirebaseConfig();
await initializeGoogleAuth(config);
\`\`\`

\`\`\`html
<!-- Wrap protected content -->
<df-auth-wrapper>
  <h1>Protected Content</h1>
  <p>Only visible after Google Sign-In</p>
</df-auth-wrapper>

<!-- Headless mode (no header) -->
<df-auth-wrapper headless>
  <div>Protected content without header</div>
</df-auth-wrapper>
\`\`\`

## Events
- \`df-auth-wrapper-user-changed\`: Dispatched when user signs in/out
  - Detail: \`{newValue: User | null}\`

## Properties
- \`headless\` (boolean): Hide header with user info/logout
- \`showHideUser\` (boolean): Show raw user JSON for debugging

## Debug Mode
Alt+Click the logout button to toggle display of raw user JSON.

## Firebase Setup Required
1. Enable Google Sign-In in Firebase Console → Authentication
2. Set \`VITE_USE_EMULATOR=false\` in environment
3. Configure valid Firebase production credentials
4. Add authorized domains in Firebase Console

## Accessibility
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support via MD3 buttons

## Legacy Compatibility
Based on \`boltup-authentication\` component with modernizations:
- Signals-first architecture (\`@lit-labs/signals\`)
- Material Design 3 compliance
- Improved TypeScript typing
- Standardized event naming
        `,
      },
    },
  },
  args: {
    headless: false,
    showHideUser: false,
  },
  argTypes: {
    headless: {
      control: 'boolean',
      description: 'Hide the header with user info and logout button',
      table: {
        defaultValue: {summary: 'false'},
      },
    },
    showHideUser: {
      control: 'boolean',
      description: 'Show raw user JSON for debugging (or Alt+Click logout)',
      table: {
        defaultValue: {summary: 'false'},
      },
    },
    onUserChanged: {action: 'df-auth-wrapper-user-changed'},
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<DfAuthWrapperStoryArgs>;

export const Default: Story = {
  render: (args) => html`
    <df-auth-wrapper
      ?headless=${args.headless}
      ?showHideUser=${args.showHideUser}
      @df-auth-wrapper-user-changed=${(event: CustomEvent) => {
        args.onUserChanged?.(event);
        console.log('User changed:', event.detail);
      }}
    >
      <div style="padding: 40px; max-width: 800px; margin: 0 auto;">
        <h1 style="margin: 0 0 16px 0; color: #1976d2;">🎉 Welcome!</h1>
        <p style="font-size: 18px; color: #333; margin: 0 0 24px 0;">
          You successfully authenticated with Google.
        </p>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px 0; color: #1565c0;">Protected Content</h3>
          <p style="margin: 0; color: #0d47a1;">
            This content is only visible after Google Sign-In. The authentication
            wrapper handles all the OAuth flow and token storage automatically.
          </p>
        </div>

        <h3 style="margin: 0 0 12px 0;">Your Authentication Data:</h3>
        <ul style="line-height: 1.8;">
          <li><strong>User Object:</strong> Stored in localStorage as 'User'</li>
          <li><strong>Bearer Token:</strong> Stored in sessionStorage as 'Authorization'</li>
          <li><strong>Cookie:</strong> authToken cookie (1 hour expiry)</li>
        </ul>

        <div style="background: #fff3e0; padding: 16px; border-radius: 8px; margin-top: 24px; border-left: 4px solid #ff9800;">
          <strong>💡 Tip:</strong> Alt+Click the logout button to toggle debug mode
          and see your raw user object JSON.
        </div>
      </div>
    </df-auth-wrapper>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Default mode with header showing user info and logout button. Protected content is only visible after authentication.',
      },
    },
  },
};

export const Headless: Story = {
  args: {
    headless: true,
  },
  render: (args) => html`
    <df-auth-wrapper
      ?headless=${args.headless}
      ?showHideUser=${args.showHideUser}
      @df-auth-wrapper-user-changed=${(event: CustomEvent) => {
        args.onUserChanged?.(event);
        console.log('User changed:', event.detail);
      }}
    >
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white;">
        <h1 style="margin: 0 0 16px 0;">🔒 Headless Mode</h1>
        <p style="font-size: 18px; margin: 0 0 24px 0; opacity: 0.9;">
          In headless mode, the wrapper shows only the login button or content—no header.
        </p>

        <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 12px 0;">Custom UI Integration</h3>
          <p style="margin: 0; opacity: 0.9;">
            Headless mode is perfect when you want to build your own header/navigation
            and just need the authentication protection. You can place your own
            user profile component anywhere in your app layout.
          </p>
        </div>

        <div style="background: rgba(255,255,255,0.1); padding: 24px; border-radius: 12px; margin-top: 24px; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 12px 0;">Use Cases:</h3>
          <ul style="margin: 12px 0 0 0; opacity: 0.9;">
            <li>Custom branded headers</li>
            <li>Mobile app layouts</li>
            <li>Minimal authentication flows</li>
            <li>Integration with existing navigation</li>
          </ul>
        </div>
      </div>
    </df-auth-wrapper>
  `,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Headless mode hides the built-in header. Perfect for custom UI integration where you want to build your own navigation and user display.',
      },
    },
  },
};

export const WithDebugMode: Story = {
  args: {
    showHideUser: true,
  },
  render: (args) => html`
    <df-auth-wrapper
      ?headless=${args.headless}
      ?showHideUser=${args.showHideUser}
      @df-auth-wrapper-user-changed=${(event: CustomEvent) => {
        args.onUserChanged?.(event);
        console.log('User changed:', event.detail);
      }}
    >
      <div style="padding: 40px; max-width: 1000px; margin: 0 auto;">
        <h1 style="margin: 0 0 16px 0;">🐛 Debug Mode Active</h1>
        <p style="font-size: 16px; color: #666; margin: 0 0 24px 0;">
          When debug mode is enabled, the raw user object JSON is displayed.
          You can also toggle this by Alt+Clicking the logout button.
        </p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h3 style="margin: 0 0 12px 0;">User Object Contents:</h3>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #666;">
            The Firebase User object contains:
          </p>
          <ul style="font-size: 14px; line-height: 1.8; color: #666;">
            <li><code>uid</code> - Unique user identifier</li>
            <li><code>displayName</code> - User's full name from Google</li>
            <li><code>email</code> - User's email address</li>
            <li><code>photoURL</code> - Profile photo URL</li>
            <li><code>emailVerified</code> - Email verification status</li>
            <li>Plus metadata, provider data, and more...</li>
          </ul>
        </div>
      </div>
    </df-auth-wrapper>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Debug mode displays the raw Firebase User object JSON. Useful for development and troubleshooting.',
      },
    },
  },
};

export const MinimalExample: Story = {
  render: (args) => html`
    <df-auth-wrapper
      @df-auth-wrapper-user-changed=${(event: CustomEvent) => args.onUserChanged?.(event)}
    >
      <div style="padding: 24px; text-align: center;">
        <h2 style="margin: 0 0 16px 0; color: #1976d2;">✅ Authenticated</h2>
        <p style="margin: 0; color: #666;">This is the minimal protected content.</p>
      </div>
    </df-auth-wrapper>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Minimal example showing just the wrapper with simple protected content.',
      },
    },
  },
};

export const EventLogging: Story = {
  render: (args) => html`
    <df-auth-wrapper
      ?headless=${args.headless}
      @df-auth-wrapper-user-changed=${(event: CustomEvent) => {
        args.onUserChanged?.(event);
        const user = event.detail.newValue;
        if (user) {
          console.group('🟢 User Signed In');
          console.log('Display Name:', user.displayName);
          console.log('Email:', user.email);
          console.log('UID:', user.uid);
          console.log('Photo URL:', user.photoURL);
          console.log('Full User Object:', user);
          console.groupEnd();
        } else {
          console.log('🔴 User Signed Out');
        }
      }}
    >
      <div style="padding: 40px; max-width: 800px; margin: 0 auto;">
        <h1 style="margin: 0 0 16px 0;">📋 Event Logging Demo</h1>
        <p style="font-size: 16px; color: #666; margin: 0 0 24px 0;">
          Open your browser console to see detailed authentication event logging.
        </p>

        <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50;">
          <h3 style="margin: 0 0 12px 0; color: #2e7d32;">Event: df-auth-wrapper-user-changed</h3>
          <p style="margin: 0 0 12px 0; color: #1b5e20;">
            This event fires whenever the user signs in or out.
          </p>
          <pre style="background: #c8e6c9; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 13px;"><code>element.addEventListener('df-auth-wrapper-user-changed', (e) => {
  const user = e.detail.newValue;
  if (user) {
    console.log('User signed in:', user.displayName);
    console.log('User ID:', user.uid);
  } else {
    console.log('User signed out');
  }
});</code></pre>
        </div>

        <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #ff9800;">
          <h3 style="margin: 0 0 12px 0; color: #e65100;">Accessing Stored Data</h3>
          <pre style="background: #ffe0b2; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 13px;"><code>// Get user from localStorage
const userJson = localStorage.getItem('User');
const user = JSON.parse(userJson);

// Get auth token from sessionStorage
const token = sessionStorage.getItem('Authorization');

// Read from cookie
const cookies = document.cookie;</code></pre>
        </div>
      </div>
    </df-auth-wrapper>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates event listening and logging. Check the browser console and Storybook Actions panel to see authentication events.',
      },
    },
  },
};

export const RealWorldLayout: Story = {
  render: (args) => html`
    <div style="min-height: 100vh; background: #f5f5f5;">
      <df-auth-wrapper
        ?headless=${args.headless}
        ?showHideUser=${args.showHideUser}
        @df-auth-wrapper-user-changed=${(event: CustomEvent) => args.onUserChanged?.(event)}
      >
        <!-- Simulated app content -->
        <div style="max-width: 1200px; margin: 0 auto; padding: 24px;">
          <!-- Hero Section -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 60px 40px; border-radius: 16px; color: white; margin-bottom: 32px;">
            <h1 style="margin: 0 0 16px 0; font-size: 3rem;">Welcome to Your Dashboard</h1>
            <p style="margin: 0; font-size: 1.25rem; opacity: 0.9;">
              You're signed in and ready to access all premium features.
            </p>
          </div>

          <!-- Feature Cards -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 32px;">
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 12px 0; color: #1976d2;">📊 Analytics</h3>
              <p style="margin: 0; color: #666;">View detailed analytics and insights about your account.</p>
            </div>
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 12px 0; color: #1976d2;">⚙️ Settings</h3>
              <p style="margin: 0; color: #666;">Manage your preferences and account settings.</p>
            </div>
            <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h3 style="margin: 0 0 12px 0; color: #1976d2;">👥 Team</h3>
              <p style="margin: 0; color: #666;">Collaborate with your team members.</p>
            </div>
          </div>

          <!-- Data Table -->
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 16px 0;">Recent Activity</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #e0e0e0;">
                  <th style="padding: 12px; text-align: left; color: #666;">Date</th>
                  <th style="padding: 12px; text-align: left; color: #666;">Action</th>
                  <th style="padding: 12px; text-align: left; color: #666;">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 12px;">Oct 21, 2025</td>
                  <td style="padding: 12px;">Signed in with Google</td>
                  <td style="padding: 12px;"><span style="background: #4caf50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">Success</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 12px;">Oct 20, 2025</td>
                  <td style="padding: 12px;">Updated profile</td>
                  <td style="padding: 12px;"><span style="background: #4caf50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">Success</span></td>
                </tr>
                <tr>
                  <td style="padding: 12px;">Oct 19, 2025</td>
                  <td style="padding: 12px;">Viewed dashboard</td>
                  <td style="padding: 12px;"><span style="background: #4caf50; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px;">Success</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </df-auth-wrapper>
    </div>
  `,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Real-world example showing a complete dashboard layout protected by the auth wrapper. Demonstrates how protected content appears in a production application.',
      },
    },
  },
};

export const SetupInstructions: Story = {
  render: () => html`
    <div style="padding: 40px; max-width: 900px; margin: 0 auto; font-family: system-ui, sans-serif;">
      <h1 style="margin: 0 0 24px 0; color: #1976d2;">⚠️ Storybook Demo Notice</h1>

      <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
        <h2 style="margin: 0 0 16px 0; color: #856404;">Firebase Setup Required</h2>
        <p style="margin: 0 0 12px 0; color: #856404;">
          The <code>df-auth-wrapper</code> component requires <strong>production Firebase</strong> 
          with Google Sign-In enabled. This Storybook story demonstrates the UI but won't 
          function without proper Firebase initialization.
        </p>
        <p style="margin: 0; color: #856404;">
          For a working demo, see: <code>packages/ui-lit/examples/auth-wrapper-demo.html</code>
        </p>
      </div>

      <h2 style="margin: 0 0 16px 0;">Setup Checklist:</h2>

      <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px 0; color: #1976d2;">1️⃣ Enable Google Sign-In</h3>
        <ol style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li>Go to Firebase Console → Authentication</li>
          <li>Click "Sign-in method" tab</li>
          <li>Enable "Google" provider</li>
          <li>Configure OAuth consent screen</li>
        </ol>
      </div>

      <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px 0; color: #1976d2;">2️⃣ Configure Environment</h3>
        <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; font-size: 13px;"><code>VITE_USE_EMULATOR=false
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id</code></pre>
      </div>

      <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 12px 0; color: #1976d2;">3️⃣ Initialize in Your App</h3>
        <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; overflow-x: auto; font-size: 13px;"><code>import {loadFirebaseConfig} from '@df/firebase/firebase-config';
import {initializeGoogleAuth} from '@df/state';
import '@df/ui-lit/df-auth-wrapper';

const config = loadFirebaseConfig();
await initializeGoogleAuth(config);</code></pre>
      </div>

      <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 24px;">
        <h3 style="margin: 0 0 12px 0; color: #1976d2;">4️⃣ Add Authorized Domains</h3>
        <p style="margin: 0 0 12px 0;">In Firebase Console → Authentication → Settings → Authorized domains:</p>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8;">
          <li><code>localhost</code> (pre-authorized for development)</li>
          <li>Your production domain(s)</li>
        </ul>
      </div>

      <div style="margin-top: 32px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
        <strong style="color: #1565c0;">📚 Full Documentation:</strong>
        <p style="margin: 8px 0 0 0; color: #0d47a1;">
          See <code>packages/ui-lit/DF_AUTH_WRAPPER_README.md</code> for complete setup 
          instructions, usage examples, and troubleshooting.
        </p>
      </div>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Setup instructions for using df-auth-wrapper in your application. This component requires production Firebase with Google Sign-In enabled.',
      },
    },
  },
};
