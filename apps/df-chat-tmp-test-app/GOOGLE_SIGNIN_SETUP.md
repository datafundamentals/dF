# Google Sign-In Setup Guide

Complete guide for enabling Google Sign-In across all apps in the monorepo.

## Table of Contents

- [Quick Start](#quick-start)
- [Production Setup](#production-setup)
- [Component Usage](#component-usage)
- [Emulator vs Production](#emulator-vs-production)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

**For developers building apps:** Just use the component!

```html
<df-google-signin></df-google-signin>
```

That's it! The component is production-ready and works automatically when:
1. Google Auth is enabled in Firebase Console
2. Your domain is added to authorized domains
3. App is deployed to production

---

## Production Setup

### Step 1: Enable Google Authentication Provider

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Find "Google" in the list of providers
5. Click **Enable**
6. Click **Save**

**That's all!** No API keys, no OAuth client IDs needed - Firebase handles everything.

### Step 2: Add Authorized Domains

Firebase automatically authorizes:
- ✅ `localhost` (for local development)
- ✅ `*.web.app` (your Firebase Hosting domain)
- ✅ `*.firebaseapp.com` (your Firebase Hosting domain)

**If using a custom domain:**

1. Firebase Console → **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Click **Add domain**
4. Enter your custom domain (e.g., `myapp.com`)
5. Click **Add**

### Step 3: Deploy Your App

```bash
# Build for production
pnpm --filter @df/df-chat-tmp-test-app build:prod

# Deploy to Firebase Hosting
pnpm --filter @df/df-chat-tmp-test-app deploy:hosting
```

**Google Sign-In now works!** No code changes required.

---

## Component Usage

### Basic Usage

```html
<!-- Simplest form - uses all defaults -->
<df-google-signin></df-google-signin>
```

### Custom Button Text

```html
<df-google-signin button-text="Continue with Google"></df-google-signin>
```

### Without Google Logo Icon

```html
<df-google-signin show-icon="false"></df-google-signin>
```

### With Event Handlers

```typescript
import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@df/ui-lit/df-google-signin';

@customElement('my-app')
export class MyApp extends LitElement {
  render() {
    return html`
      <df-google-signin
        @google-signin-success=${this.handleSuccess}
        @google-signin-error=${this.handleError}>
      </df-google-signin>
    `;
  }

  private handleSuccess(e: CustomEvent) {
    console.log('User signed in at:', e.detail.timestamp);
    // Navigate to dashboard, etc.
  }

  private handleError(e: CustomEvent) {
    console.error('Sign-in failed:', e.detail.message);
    // Show error toast, etc.
  }
}
```

### Requesting Additional Google API Scopes

```html
<!-- Request access to Google Calendar API -->
<df-google-signin
  .scopes=${['https://www.googleapis.com/auth/calendar.readonly']}>
</df-google-signin>
```

**Common Google API Scopes:**
- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar events
- `https://www.googleapis.com/auth/drive.readonly` - Read Google Drive files
- `https://www.googleapis.com/auth/gmail.readonly` - Read Gmail messages
- `https://www.googleapis.com/auth/userinfo.profile` - Profile info (included by default)
- `https://www.googleapis.com/auth/userinfo.email` - Email address (included by default)

See [Google OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes) for full list.

---

## Emulator vs Production

### Development (Emulator Mode)

**Google Sign-In does NOT work in the emulator.**

**Why?** The Firebase Auth Emulator is a local simulation that doesn't connect to real Google OAuth servers. Google has no knowledge of your `localhost` and can't redirect back to it securely.

**For local development, use:**
- ✅ Email/Password authentication (works perfectly in emulator)
- ✅ Anonymous authentication (works in emulator)
- ✅ Test users from seed data

The teaching app automatically hides the Google Sign-In button when running in emulator mode and shows an informational message instead.

### Production (Real Firebase)

**Google Sign-In works automatically!**

When you deploy to Firebase Hosting (or any authorized domain), the button appears and works with real Google OAuth:

1. User clicks "Sign in with Google"
2. Popup window opens with Google account picker
3. User selects their Google account
4. User grants permissions
5. Popup closes, user is signed in
6. Your app receives user info (name, email, photo, UID)

**User Data Available:**
```typescript
import {firebaseAuthState} from '@df/state';

const {authUser} = firebaseAuthState.get();
console.log('Name:', authUser.displayName);     // "John Doe"
console.log('Email:', authUser.email);           // "john@gmail.com"
console.log('Photo:', authUser.photoURL);        // "https://..."
console.log('UID:', authUser.uid);               // "abc123..."
console.log('Provider:', authUser.providerId);   // "google.com"
```

---

## Programmatic Usage (Without Component)

If you need direct control (e.g., custom button styling):

```typescript
import {signInWithGoogle} from '@df/state';

async function handleGoogleSignIn() {
  try {
    await signInWithGoogle();
    console.log('Signed in successfully!');
    // User info is now available in firebaseAuthState
  } catch (error) {
    if (error.code === 'auth/popup-blocked') {
      alert('Please allow popups for this site');
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.log('User cancelled sign-in');
    } else {
      console.error('Sign-in failed:', error);
    }
  }
}

// In your component
render() {
  return html`
    <button @click=${handleGoogleSignIn}>
      My Custom Google Sign-In Button
    </button>
  `;
}
```

---

## Troubleshooting

### "Popup blocked by browser"

**Problem:** Browser blocks the Google OAuth popup.

**Solution:**
1. Allow popups for your domain in browser settings
2. OR use redirect mode instead of popup (on mobile):

```typescript
import {signInWithGoogleRedirect} from '@df/firebase/auth';
import {getFirebaseAuth} from '@df/firebase/auth';

// Initiate redirect
await signInWithGoogleRedirect(auth);

// On return (in app initialization)
import {getRedirectResult} from 'firebase/auth';
const result = await getRedirectResult(auth);
if (result) {
  console.log('Signed in:', result.user.email);
}
```

### "This domain is not authorized"

**Problem:** Error message says domain not authorized.

**Solution:**
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your production domain (e.g., `myapp.com`)
3. Wait 1-2 minutes for changes to propagate
4. Try again

### Google Sign-In button doesn't appear

**Check:**
1. ✅ Are you in production mode? (`VITE_USE_EMULATOR=false`)
2. ✅ Is Google provider enabled in Firebase Console?
3. ✅ Did you import the component? (`import '@df/ui-lit/df-google-signin'`)
4. ✅ Is Firebase initialized? (`initializeAuth(app)` called)

### Sign-in succeeds but no user data

**Check:**
1. Ensure you're reading from signals correctly:
   ```typescript
   import {SignalWatcher} from '@lit-labs/signals';
   import {firebaseAuthState} from '@df/state';

   // Component must extend SignalWatcher
   export class MyComponent extends SignalWatcher(LitElement) {
     render() {
       const {authUser, authState} = firebaseAuthState.get();
       if (authState === 'authenticated') {
         return html`<p>Welcome ${authUser.email}</p>`;
       }
     }
   }
   ```

2. Check browser console for auth state listener errors

### "User cancelled sign-in" errors

**This is normal!** Users can close the popup at any time. Your error handler should treat this gracefully:

```typescript
@google-signin-error=${(e: CustomEvent) => {
  if (e.detail.error.code === 'auth/popup-closed-by-user') {
    // Do nothing - user intentionally cancelled
    return;
  }
  // Handle other errors
  showErrorToast(e.detail.message);
}}
```

### "Cross-Origin-Opener-Policy would block window.close" warning

**Status:** ⚠️ **KNOWN CHROME/EDGE QUIRK** - Cannot be fixed, safe to ignore.

**What's happening:**
- Chrome/Edge show console warning during Google Sign-In
- Firefox/Safari don't show the warning
- **Sign-in works perfectly** - warning is cosmetic only
- Caused by Google's OAuth popup code, not your app

**Why it can't be fixed:**
- Warning comes from `accounts.google.com` (Google's domain)
- Headers on your domain can't affect Google's domain
- Firebase SDK acknowledged limitation
- Happens to every Firebase app using Google Sign-In

**For manual testers:**

See [MANUAL_TESTING_KNOWN_ISSUES.md](./MANUAL_TESTING_KNOWN_ISSUES.md) for complete testing guidance. **Do not report this warning** - it's expected behavior.

**For developers:**

This warning only appears in browser DevTools. End users never see it. If Google Sign-In completes successfully, ignore the warning.

**Alternative: Use Redirect Instead of Popup (Mobile)**

For mobile apps where popups are problematic, use redirect-based sign-in:

```typescript
import {signInWithGoogleRedirect} from '@df/firebase/auth';
import {getAuth, getRedirectResult} from 'firebase/auth';

// On button click
await signInWithGoogleRedirect(auth);

// On app initialization (after redirect returns)
const result = await getRedirectResult(auth);
if (result) {
  console.log('Signed in:', result.user.email);
}
```

Redirect-based sign-in doesn't use popups, so no COOP issues.

---

## Security Best Practices

### ✅ DO:
- Enable Google Sign-In only in production Firebase projects you control
- Add only domains you own to authorized domains list
- Use HTTPS for custom domains (Firebase Hosting enforces this automatically)
- Implement proper security rules in Firestore/Storage based on `request.auth.uid`
- Log authentication errors for debugging

### ❌ DON'T:
- Share your Firebase config publicly with Google Auth enabled (low risk, but avoid)
- Add `*` or wildcard domains to authorized domains
- Trust client-side authentication alone - always validate with security rules
- Store sensitive data in user profile (display name, photo URL)

---

## Advanced: Multiple Google Accounts

Firebase automatically handles:
- Users signing in with different Google accounts
- Users who have multiple Google accounts logged into browser
- Account picker shows all available Google accounts

Your app doesn't need to do anything special - Firebase Auth manages this automatically.

---

## Integration with Other Apps

### Using in Any App in the Monorepo

1. **Import the component:**
   ```typescript
   import '@df/ui-lit/df-google-signin';
   ```

2. **Use in your template:**
   ```html
   <df-google-signin></df-google-signin>
   ```

3. **Access user state:**
   ```typescript
   import {firebaseAuthState} from '@df/state';
   const {authUser, authState} = firebaseAuthState.get();
   ```

**That's it!** The component is production-ready and shared across the entire monorepo.

### Enabling Google Auth for Your App

Each app needs its own Firebase project configuration:

1. Create Firebase project in Firebase Console (or use existing)
2. Enable Google Sign-in provider (see [Production Setup](#production-setup))
3. Add your app's domain to authorized domains
4. Configure `.env.production` with your Firebase config
5. Deploy - Google Sign-In works automatically!

---

## Example: Complete Login Page

```typescript
import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState} from '@df/state';

import '@df/ui-lit/df-google-signin';
import '@df/ui-lit/firebase'; // Email/password components

@customElement('login-page')
export class LoginPage extends SignalWatcher(LitElement) {
  static styles = css`
    .container {
      max-width: 400px;
      margin: 0 auto;
      padding: 2rem;
    }
    .divider {
      margin: 2rem 0;
      text-align: center;
      position: relative;
    }
    .divider::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 100%;
      height: 1px;
      background: #e0e0e0;
    }
    .divider span {
      background: white;
      padding: 0 1rem;
      position: relative;
      color: #666;
    }
  `;

  render() {
    const {authState, authUser} = firebaseAuthState.get();

    if (authState === 'authenticated') {
      return html`
        <div class="container">
          <h1>Welcome, ${authUser.displayName || authUser.email}!</h1>
          <df-sign-out></df-sign-out>
        </div>
      `;
    }

    return html`
      <div class="container">
        <h1>Sign In</h1>

        <!-- Google Sign-In (production only) -->
        <df-google-signin
          @google-signin-success=${this.handleSuccess}
          @google-signin-error=${this.handleError}>
        </df-google-signin>

        <!-- Divider -->
        <div class="divider">
          <span>or</span>
        </div>

        <!-- Email/Password Sign-In -->
        <df-sign-in
          @df-sign-in-success=${this.handleSuccess}
          @df-sign-in-error=${this.handleError}>
        </df-sign-in>
      </div>
    `;
  }

  private handleSuccess() {
    // Navigate to dashboard, etc.
    window.location.href = '/dashboard';
  }

  private handleError(e: CustomEvent) {
    alert(`Sign-in failed: ${e.detail.message}`);
  }
}
```

---

## Summary

**For app developers:**
1. Import `@df/ui-lit/df-google-signin`
2. Use `<df-google-signin></df-google-signin>` in your template
3. Done!

**For Firebase admins:**
1. Enable Google provider in Firebase Console
2. Add authorized domains
3. Deploy
4. Done!

**The component handles everything else automatically!**

---

## Related Documentation

- [Authentication Patterns](./AUTHENTICATION_PATTERNS.md) - Complete auth guide
- [Production Deployment](./PRODUCTION_READINESS.md) - Deployment checklist
- [Firebase Console](https://console.firebase.google.com) - Manage providers
- [Google OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes) - API permissions

---

**Questions?** Check the [Troubleshooting Guide](./guides/TROUBLESHOOTING.md) or file an issue.
