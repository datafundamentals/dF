# df-auth-wrapper Component

A reusable Firebase Google Authentication wrapper component that protects content until users sign in.

## Features

- ✅ **Google Sign-In Only** - Simple popup-based authentication
- ✅ **Production Firebase** - Works with production Firebase (no emulator support)
- ✅ **Auto Token Storage** - Stores auth tokens in localStorage, sessionStorage, and cookies
- ✅ **Two Display Modes** - Headless or with header showing user info
- ✅ **Event-Driven** - Dispatches custom events for user state changes
- ✅ **Material Design 3** - Uses MD3 components for consistent styling
- ✅ **Standalone or Bundled** - Use within monorepo or bundle for external sites

## Usage

### Within Monorepo

```typescript
import {initializeApp} from 'firebase/app';
import {initializeGoogleAuth} from '@df/state';
import '@df/ui-lit/df-auth-wrapper';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
initializeGoogleAuth(app);
```

```html
<!-- Protect content with the wrapper -->
<df-auth-wrapper>
  <h1>Protected Content</h1>
  <p>Only visible when signed in</p>
</df-auth-wrapper>
```

### Display Modes

#### Default Mode (With Header)
Shows user photo, name, and logout button at the top:

```html
<df-auth-wrapper>
  <div>Your protected content here</div>
</df-auth-wrapper>
```

#### Headless Mode
Shows only login button or content (no header):

```html
<df-auth-wrapper headless>
  <div>Your protected content here</div>
</df-auth-wrapper>
```

### Accessing User Data

The component automatically stores user data and tokens:

```javascript
// Listen for user changes
const wrapper = document.querySelector('df-auth-wrapper');
wrapper.addEventListener('df-auth-wrapper-user-changed', (e) => {
  const user = e.detail.newValue;
  if (user) {
    console.log('Signed in:', user.displayName, user.email, user.uid);
  } else {
    console.log('Signed out');
  }
});

// Access stored user data
const userJson = localStorage.getItem('User');
const user = JSON.parse(userJson);
console.log('User ID:', user.uid);

// Access auth token
const authToken = sessionStorage.getItem('Authorization'); // "Bearer <token>"
```

### Debug Mode

Alt+Click the logout button to toggle display of the raw user JSON object.

```html
<df-auth-wrapper showHideUser>
  <!-- User JSON will display when showHideUser is true -->
</df-auth-wrapper>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `headless` | `boolean` | `false` | Hide header with user info and logout button |
| `showHideUser` | `boolean` | `false` | Show raw user JSON for debugging |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `df-auth-wrapper-user-changed` | `{newValue: User \| null}` | Fired when user signs in or out |

## Storage

The component stores authentication data in three locations:

1. **localStorage** - Full user object at key `'User'`
2. **sessionStorage** - Bearer token at key `'Authorization'`
3. **Cookie** - Auth token as `authToken` cookie (expires in 1 hour)

## Firebase Setup

### 1. Enable Google Sign-In

In Firebase Console:
1. Go to Authentication → Sign-in method
2. Enable Google provider
3. Configure OAuth consent screen

### 2. Configure Environment (Consumer Configures Pattern)

**Key Principle:** Each consuming app provides its own Firebase configuration. The `df-auth-wrapper` package never references app-level environment variables.

#### Pattern: Create an Initialization File

Each app should create its own initialization file that:
1. Reads the app's Firebase config (from `.env.production` or other source)
2. Initializes Firebase App
3. Calls `initializeGoogleAuth(app)` from `@df/state`

**Example:** `apps/your-app/src/init-google-auth.ts`

```typescript
import {initializeApp, type FirebaseApp} from 'firebase/app';
import {initializeGoogleAuth} from '@df/state';

let firebaseApp: FirebaseApp | null = null;

export async function initializeGoogleAuthForYourApp(): Promise<void> {
  if (firebaseApp) return; // Already initialized

  // Read your app's Firebase config
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  // Initialize Firebase and Google Auth
  firebaseApp = initializeApp(config);
  await initializeGoogleAuth(firebaseApp);
}
```

**Then in your HTML:**

```html
<script type="module">
  import {initializeGoogleAuthForYourApp} from './src/init-google-auth.js';
  import '@df/ui-lit/df-auth-wrapper';

  // Initialize before rendering components
  await initializeGoogleAuthForYourApp();
</script>

<df-auth-wrapper>
  <h1>Protected Content</h1>
</df-auth-wrapper>
```

#### Environment Variables for Your App

Create `.env.local` or `.env.production` **in your app directory**:

```bash
VITE_USE_EMULATOR=false  # Must be false for Google Sign-In
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Why this pattern?**
- ✅ No coupling between packages and app-level configs
- ✅ Each app owns its own Firebase credentials
- ✅ Easy to bundle for external deployment
- ✅ Follows separation of concerns principle
- ✅ Reusable across multiple apps with different Firebase projects

**Reference Implementation:**
- See `packages/ui-lit/examples/src/init-google-auth.ts` for complete example
- See `packages/ui-lit/examples/auth-wrapper-demo.html` for usage

### 3. Add Authorized Domains

In Firebase Console → Authentication → Settings → Authorized domains:
- Add your production domain
- `localhost` is pre-authorized for development

## Demo Pages

### Interactive Demo
```bash
cd packages/ui-lit/examples
pnpm dev
# Open http://127.0.0.1:4176/auth-wrapper-demo.html
```

### Standalone Example
See `auth-wrapper-standalone.html` for a complete standalone example showing:
- How to initialize Firebase and auth
- How to use the component in plain HTML
- How to access user data from JavaScript
- How to listen for auth events

## Building for External Use

To create a bundle for use outside the monorepo:

```bash
# Build the UI package
pnpm --filter @df/ui-lit run build

# The compiled component will be in:
# packages/ui-lit/dist/df-auth-wrapper.js
# packages/ui-lit/dist/df-auth-wrapper.d.ts
```

Then include in your external project:

```html
<script type="module">
  import {initializeApp} from 'firebase/app';
  import {initializeGoogleAuth} from './path/to/@df/state/dist/index.js';
  import './path/to/@df/ui-lit/dist/df-auth-wrapper.js';
  
  const app = initializeApp(yourFirebaseConfig);
  initializeGoogleAuth(app);
</script>

<df-auth-wrapper>
  <h1>Your Protected Content</h1>
</df-auth-wrapper>
```

## Architecture

### State Management
- Uses `@df/state/stores/google-auth.store.ts` for auth state
- Signals-first reactive architecture with `@lit-labs/signals`
- Presentation-only component (no business logic)

### Component Structure
- Extends `SignalWatcher(LitElement)` for automatic reactivity
- Conditionally renders login screen or protected content
- Material Design 3 buttons for authentication UI

### Legacy Compatibility
Based on the `boltup-authentication` component with improvements:
- Modern signals architecture instead of local state
- Material Design 3 compliance
- Better TypeScript typing
- Cleaner event naming

## Troubleshooting

### "Auth not initialized" Error
Make sure you call `initializeGoogleAuth(app)` before rendering the component.

### Google Sign-In Popup Blocked
- Ensure popup blockers allow your domain
- Check Firebase Console → Authorized domains

### Tokens Not Stored
- Check browser console for errors
- Verify Firebase initialization succeeded
- Ensure Google Sign-In is enabled in Firebase Console

### Works in Dev but Not Production
- Verify production Firebase config in `.env.production`
- Add your production domain to Firebase → Authorized domains
- Ensure `VITE_USE_EMULATOR=false` in production

## Related Components

- `df-sign-in` - Email/password sign-in (supports emulator)
- `df-sign-out` - Standalone sign-out button
- `df-user-profile` - User profile display widget
- `df-google-signin` - Alternative Google sign-in component

## See Also

- [Firebase Authentication Patterns](./guides/AUTHENTICATION_PATTERNS.md)
- [Firebase Patterns](./guides/FIREBASE_PATTERNS.md)
- [Component Standards](../../guides/WC_SHARED_DEFAULTS.md)
