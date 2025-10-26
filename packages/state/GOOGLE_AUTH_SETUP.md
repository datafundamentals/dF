# Google Auth Configuration Setup

This package requires a separate Firebase project for Google Sign-In functionality.

## Why Separate Config?

The `df-auth-wrapper` component uses **production Google OAuth**, which requires real Firebase credentials. This is completely separate from any consuming app's Firebase configuration (which might use emulators or a different project).

## Setup Steps

### 1. Create Firebase Project

1. Go to https://console.firebase.google.com
2. Create a new project (e.g., "DF Google Auth")
3. Enable Google Sign-In provider:
   - Authentication → Sign-in method
   - Enable "Google" provider
   - Configure OAuth consent screen
4. Add authorized domains (your app's domains)

### 2. Get Firebase Config

1. Firebase Console → Project Settings → General
2. Scroll to "Your apps"
3. Copy the Firebase SDK configuration

### 3. Configure Package

```bash
# From repository root
cd packages/state

# Copy example file
cp .env.production.example .env.production

# Edit .env.production with your Firebase project values
nano .env.production
```

Fill in your Firebase project credentials:

```bash
GOOGLE_AUTH_API_KEY=AIzaSyC...your-actual-api-key
GOOGLE_AUTH_AUTH_DOMAIN=your-project.firebaseapp.com
GOOGLE_AUTH_PROJECT_ID=your-project-id
GOOGLE_AUTH_STORAGE_BUCKET=your-project.appspot.com
GOOGLE_AUTH_MESSAGING_SENDER_ID=123456789012
GOOGLE_AUTH_APP_ID=1:123456789012:web:abc123def456
```

### 4. Build Package

```bash
# From repository root
pnpm --filter @df/state run build
```

This will:
1. Run `prebuild` script (generates `google-auth-config.ts` from `.env.production`)
2. Compile TypeScript with the baked-in config
3. Output to `dist/` with Firebase credentials embedded

### 5. Use in Apps

```typescript
// Any app can now use Google auth without configuration
import {initializeGoogleAuth} from '@df/state';

await initializeGoogleAuth(); // No parameters needed!
```

## Architecture

```
packages/state/
├── .env.production          # Your Firebase credentials (gitignored)
├── .env.production.example  # Template (committed)
├── scripts/
│   └── generate-auth-config.mjs  # Build-time generator
└── src/stores/
    ├── google-auth-config.ts     # Generated file (gitignored)
    └── google-auth.store.ts      # Uses generated config
```

**Build flow:**
1. Developer creates `.env.production` with real credentials
2. `prebuild` script reads `.env.production`
3. Generates `google-auth-config.ts` with values
4. TypeScript compiles with config baked in
5. Consuming apps get working Google auth "for free"

## Security

- ✅ `.env.production` is gitignored (your secrets stay local)
- ✅ `google-auth-config.ts` is gitignored (generated file)
- ✅ Config is baked into bundle at build time
- ✅ No runtime environment variable coupling

## For Students/Contributors

Each developer needs their own Firebase project:

1. Follow setup steps above
2. Create your own `.env.production`
3. Build the package locally
4. The bundle will work with your Firebase project

This teaches the real-world workflow: every developer has their own Firebase project for authentication.

## Troubleshooting

**Error: "Missing packages/state/.env.production"**
- You need to create `.env.production` from the example file
- Fill in real Firebase credentials (not placeholders)

**Error: "API key not valid"**
- Your `.env.production` still has placeholder values
- Get real credentials from Firebase Console

**Error: "Cannot find module 'google-auth-config.js'"**
- The `prebuild` script didn't run or failed
- Manually run: `node scripts/generate-auth-config.mjs`
- Then build: `pnpm build`

## Related Documentation

- [Teaching App Setup](../../apps/df-firebase-teaching-app0/README.md#google-sign-in-production)
- [Firebase Patterns](../../apps/df-firebase-teaching-app0/guides/FIREBASE_PATTERNS.md)
- [Component Documentation](../ui-lit/DF_AUTH_WRAPPER_README.md)
