# Google Sign-In Production Deployment Checklist

Quick reference for deploying Google Sign-In to your production Firebase project.

## Pre-Deployment Checklist

- [ ] All builds passing locally (`pnpm build` succeeds)
- [ ] Firebase project created in Firebase Console
- [ ] `.env.production` configured with real Firebase credentials
- [ ] `VITE_USE_EMULATOR=false` in `.env.production`

## Firebase Console Setup (5 minutes)

### Step 1: Enable Google Authentication

1. Go to https://console.firebase.google.com
2. Select your project (e.g., `df-firebase-teaching-app` or your project name)
3. Navigate to **Authentication** → **Sign-in method** tab
4. Find "Google" in the Sign-in providers list
5. Click the Google row to expand it
6. Toggle **Enable** switch to ON
7. Click **Save**

✅ **That's it for basic setup!** Firebase handles all OAuth configuration automatically.

### Step 2: Add Authorized Domains (if using custom domain)

**Skip this if deploying to Firebase Hosting** - your `.web.app` and `.firebaseapp.com` domains are pre-authorized.

**For custom domains:**

1. Still in **Authentication** → **Settings** tab
2. Scroll to **Authorized domains** section
3. Click **Add domain**
4. Enter your custom domain (e.g., `myapp.com`)
5. Click **Add**

Pre-authorized domains (no action needed):
- `localhost` (local development)
- `*.web.app` (Firebase Hosting)
- `*.firebaseapp.com` (Firebase Hosting)

## Deployment Commands

### Quick Deploy (Recommended)

```bash
# From monorepo root
cd apps/df-firebase-teaching-app2

# Deploy everything (includes Google Sign-In)
pnpm deploy:prod
```

This runs:
1. Security rules tests (must pass)
2. Production build with `.env.production`
3. Deployment to Firebase Hosting

### Step-by-Step Deploy

If you prefer manual control:

```bash
# 1. Build production app
pnpm build:prod

# 2. Preview locally (optional)
pnpm preview:prod

# 3. Deploy security rules
pnpm deploy:rules

# 4. Deploy hosting
pnpm deploy:hosting
```

## Post-Deployment Verification

### 1. Visit Your Deployed App

Open your Firebase Hosting URL:
- `https://YOUR-PROJECT.web.app`
- OR `https://YOUR-PROJECT.firebaseapp.com`

### 2. Test Google Sign-In

1. Navigate to the Authentication demo page
2. You should see the **"Sign in with Google"** button (not hidden like in emulator)
3. Click the button
4. Google OAuth popup should open
5. Select your Google account
6. Grant permissions
7. Popup closes, you're signed in!

### 3. Verify User Data

After signing in, check:
- Display name shows your Google account name
- Photo URL shows your Google profile picture
- Email matches your Google account email

### 4. Check Firebase Console

1. Firebase Console → **Authentication** → **Users** tab
2. You should see your Google account listed
3. Provider column shows "google.com"

## Troubleshooting

### Button Doesn't Appear

**Check:**
- [ ] App is in production mode (`VITE_USE_EMULATOR=false`)
- [ ] Google provider enabled in Firebase Console
- [ ] Build succeeded without errors
- [ ] Check browser console for errors

### "This domain is not authorized"

**Fix:**
1. Go to Firebase Console → Authentication → Settings
2. Add your domain to Authorized domains
3. Wait 1-2 minutes for changes to propagate
4. Try again

### Popup Blocked

**Fix:**
1. Allow popups for your domain in browser settings
2. Try again

**Alternative:** Some browsers block popups aggressively. If this persists for users, consider implementing redirect-based sign-in (see `GOOGLE_SIGNIN_SETUP.md` for details).

### "Cross-Origin-Opener-Policy" Warning in Console

**Status:** ⚠️ **EXPECTED** - This warning is normal and harmless.

**What it is:**
- Chrome/Edge console shows COOP warning during Google Sign-In
- **Sign-in works perfectly** - warning doesn't affect functionality
- Caused by Google's OAuth popup, not your code
- Cannot be fixed with headers (Google's domain, not yours)

**Action:**
✅ **Ignore it** - If Google Sign-In completes successfully, the warning is harmless.

**For manual testers:**
See [MANUAL_TESTING_KNOWN_ISSUES.md](./MANUAL_TESTING_KNOWN_ISSUES.md) - this is documented as expected behavior. Do not report to coding agents.

### Sign-In Succeeds But No User Data

**Check:**
1. Browser console for errors
2. Network tab for failed API calls
3. Security rules - ensure authenticated users can read their own data

## Security Best Practices

### ✅ Completed by Default

Firebase handles these automatically:
- HTTPS enforcement (all Firebase Hosting URLs use HTTPS)
- OAuth token management (client ID, secret)
- Secure redirects (only to authorized domains)
- Token refresh (Firebase SDK handles this)

### ⚠️ Your Responsibility

Implement these in your app:
- [ ] Firestore security rules validate `request.auth.uid`
- [ ] Storage security rules check file ownership
- [ ] Don't store sensitive data in user profiles
- [ ] Log authentication errors for monitoring

## Common Issues

### Google Account Picker Shows Wrong Accounts

**This is normal** if you're signed into multiple Google accounts in your browser. Google shows all logged-in accounts for convenience.

**Not an issue** - users can sign in with whichever account they choose.

### User Cancelled Sign-In

**This is expected behavior.** Users can close the popup at any time.

Your app handles this gracefully:
```typescript
// In df-google-signin component
if (error.code === 'auth/popup-closed-by-user') {
  // No error shown - user intentionally cancelled
  return;
}
```

### Email Already in Use

**Scenario:** User previously signed up with email/password using `alice@gmail.com`, then tries to sign in with Google using the same email.

**Firebase behavior:** Links the accounts automatically if:
- Email is verified
- Same email address

**If linking fails:** Show user-friendly message:
```
This email is already registered with password sign-in.
Please use email/password to sign in, or try a different Google account.
```

## Next Steps After Successful Deployment

### 1. Add to Other Apps

Google Sign-In component is reusable! Use in any app:

```typescript
// In any app in the monorepo
import '@df/ui-lit/df-google-signin';

// In your template
html`<df-google-signin></df-google-signin>`
```

Each app needs:
- Its own Firebase project (or shared project)
- Google provider enabled in Firebase Console
- Authorized domains configured

### 2. Request Additional Google API Scopes

If you need access to Google Calendar, Drive, etc.:

```html
<df-google-signin
  .scopes=${[
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/drive.readonly'
  ]}>
</df-google-signin>
```

**Important:** You'll also need to enable these APIs in Google Cloud Console and request OAuth consent screen verification.

### 3. Customize Button Appearance

```html
<!-- Custom text -->
<df-google-signin button-text="Continue with Google"></df-google-signin>

<!-- Without icon -->
<df-google-signin show-icon="false"></df-google-signin>

<!-- With event handlers -->
<df-google-signin
  @google-signin-success=${this.handleSuccess}
  @google-signin-error=${this.handleError}>
</df-google-signin>
```

### 4. Monitor Usage

Firebase Console → **Authentication** → **Users**:
- Total users
- Sign-in methods breakdown
- Recent sign-ins

## Production Deployment Complete! 🎉

Your app now has production-ready Google Sign-In that:
- ✅ Works on any authorized domain
- ✅ Handles all OAuth flows automatically
- ✅ Provides user profile data (name, email, photo)
- ✅ Integrates with Firebase Auth seamlessly
- ✅ Shares authentication state across your app via signals

---

**Need help?** See [GOOGLE_SIGNIN_SETUP.md](./GOOGLE_SIGNIN_SETUP.md) for complete documentation.
