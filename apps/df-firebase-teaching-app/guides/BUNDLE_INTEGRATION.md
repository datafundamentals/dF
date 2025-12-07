# Firebase Teaching App - Bundle Integration

## DANGER WILL ROBINSON

THIS DOCUMENT IS INTENTIONALLY INCOMPLETE AND INACCURATE AND MUST BE MODIFIED AS USED UNTIL IT PROVES OUT AS CORRECT

FOR A WORKING MODEL TO COMPARE AGAINST SEE APPWRITER IN THE LOCALLY RUNNING VERSION

**📚 For deployment almost all instructions, integration methods, and troubleshooting:** See [/guides/BUNDLE_DEPLOYMENT.md](../../../guides/BUNDLE_DEPLOYMENT.md)

This guide focuses only on the **app-specific components and requirements** for the Firebase Teaching App bundle. 

## Available Components

The Firebase Teaching App bundle ships these web components:

```html
<df-environment-banner></df-environment-banner>
<df-auth-wrapper></df-auth-wrapper> <!-- wrapper used around demos -->
<df-auth-demo></df-auth-demo>
<df-firestore-demo></df-firestore-demo>
<df-storage-demo></df-storage-demo>
<df-functions-demo></df-functions-demo>
```

## Common Component Combination Examples

**Default teaching layout** (matches the bundled embed):
```html
<df-auth-wrapper headless>
  <df-firestore-demo></df-firestore-demo>
  <df-storage-demo></df-storage-demo>
  <df-functions-demo></df-functions-demo>
</df-auth-wrapper>
```

**Auth + Firestore only** (most common teaching scenario):
```html
<df-auth-wrapper headless>
  <df-auth-demo></df-auth-demo>
  <df-firestore-demo></df-firestore-demo>
</df-auth-wrapper>
```

**Single component** (focused demonstration):
```html
<df-auth-demo></df-auth-demo>
```

## Firebase-Specific Requirements

### Firebase Connection
This app connects to Firebase services:

**Development/Testing (Emulator):**
- Build with `VITE_USE_EMULATOR=true` to connect to local Firebase Emulators
- Emulator ports: Auth (9155), Firestore (8280), Storage (9390), Functions (5501)

**Production (Real Firebase):**
- Firebase config is baked into bundle at build time
- **Important:** Add your deployment domain to Firebase Console → Authentication → Settings → Authorized domains
- Deploy Firestore and Storage security rules before deploying the app
- Deploy Cloud Functions if using `<df-functions-demo>`

### Authentication Domains
If you deploy this bundle to `https://example.com`, you must:
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add `example.com` to the list
3. Otherwise Google Sign-In and other auth features will fail with CORS errors

## Quick Reference

- **How to deploy this bundle:** [/guides/BUNDLE_DEPLOYMENT.md](../../../guides/BUNDLE_DEPLOYMENT.md)
- **Copy-paste template:** [example-integration.html](./example-integration.html)
- **Production Firebase setup:** [../README.md](../README.md)
