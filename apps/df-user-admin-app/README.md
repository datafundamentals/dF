# DF User Admin App

Web application for managing users and their role-based access control (RBAC) in a Firebase project.

## Quick Start

```bash
# Install dependencies (root level, once)
pnpm install

# Start development server
pnpm --filter @df/df-user-admin-app dev

# Run with emulator (requires emulator running in another terminal)
VITE_USE_EMULATOR=true pnpm --filter @df/df-user-admin-app dev

# Build for production
pnpm --filter @df/df-user-admin-app run build

# Run tests
pnpm --filter @df/df-user-admin-app run test
```

## What This App Does

- **View all users** in your Firebase project
- **Assign roles** to users (admin, player, coderFomo, viewer)
- **Manage permissions** by changing user roles
- **See custom claims** set on each user's auth token

## Architecture

### Key Components

- **`user-admin-list`** – Table of all users with their current roles
- **`role-picker`** – UI for selecting and assigning roles to a user
- **`df-auth-wrapper`** – Protects the entire app behind Firebase Auth

### Data Flow

```
User logs in → Firebase Auth → Custom claims in ID token
              ↓
         Firestore userProfiles collection
              ↓
         Admin changes role → Cloud Function
              ↓
         Updates Firestore & custom claims
```

## Configuration

### Environment Variables

Managed automatically in `.env` files:

- **`.env.development`** – Local Firebase emulator settings
- **`.env.production`** – Cloud Firebase settings
- **`.env.emulator`** – Emulator-specific overrides

Set `VITE_USE_EMULATOR=true` to use local Firebase emulator instead of cloud.

### Firebase Project Setup

The app reads Firebase config from:
- Production: `src/config/firebase.config.ts` (uses `.env.production`)
- Emulator: Uses `VITE_USE_EMULATOR` flag to detect emulator mode

## Common Tasks

### Testing Locally with Emulator

```bash
# Terminal 1: Start Firebase emulator
cd apps/df-user-admin-app
pnpm emulators:start

# Port map lives in packages/firebase/firebase.json; keep this app’s firebase.json aligned to avoid emulator drift.

# Terminal 2: Run the app
VITE_USE_EMULATOR=true pnpm dev
```

Then sign in with any email (emulator allows any credentials).

### Deploying to Production

1. **Deploy auth-functions first** (required for user provisioning):
   ```bash
   pnpm --filter @df/auth-functions run deploy
   ```

2. **Deploy this app**:
   ```bash
   pnpm --filter @df/df-user-admin-app run build
   # Deploy the built dist/ directory to your preferred static host (Firebase Hosting is not used)
   ```

### Promoting First User to Admin

Use the Firebase Admin SDK script:

```bash
npx ts-node scripts/promote-admin.ts <user-uid>
```

See `guides/RBAC_SETUP.md` for detailed admin initialization instructions.

## Important Notes

- **Custom claims require token refresh**: When you change a user's role, their ID token isn't automatically updated. See "Token Refresh" in `guides/RBAC_SETUP.md`.
- **Auth triggers must be deployed**: The auth-functions in `services/auth-functions/` must be deployed to Firebase for new user provisioning to work.
- **Emulator support**: Use `apps/df-auth-trigd-func-tool` to test auth triggers locally.

## Documentation

- **RBAC Architecture**: `guides/RBAC_SETUP.md`
- **Bootstrap Problem**: `.z_/future/1118_BOOTSTRAP_PROBLEM_SOLUTION.md`
- **Many-to-Many Roles (Planned)**: `.z_/future/1120_FIX_MULTIPLE_ROLES.md`
- **Firebase Emulator Workflow**: `guides/firebase-emulator-workflow.md`

## Troubleshooting

**Users can't see admin features after role change?**
- They need to refresh their ID token: `await user.getIdTokenResult(true)`

**Auth triggers not firing (users without profiles)?**
- Check if `services/auth-functions/` is deployed: `firebase functions:list --project your-project-id`

**Emulator won't start?**
- Check port 4184 is free: `lsof -i :4184` and kill any existing processes
- Verify Firebase emulator is running: `firebase emulators:start --only auth,firestore,functions`

**Stale data in Firestore?**
- Emulator data persists between runs. Clear it: `rm -rf ~/.config/firebase/emulators/firestore_export/`

## Development Notes

- Components live in `packages/ui-lit/` (shared across apps)
- Cloud Functions live in `services/functions/`
- User profiles stored in Firestore `userProfiles` collection
- Roles and permissions defined in `services/auth-functions/src/index.ts`
- Types defined in `packages/types/src/firebase-rbac.types.ts`

See the root monorepo `README.md` for general workflow and available commands.
