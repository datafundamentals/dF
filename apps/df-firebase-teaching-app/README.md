# DF Firebase Teaching App

Offline-friendly host application for teaching Firebase development patterns with all other monorepo patterns, Firebase,  and the Firebase Emulator Suite running locally, and added seed data.

## Setting Up Firebase Emulators

1. Install workspace dependencies:
   ```sh
   pnpm install
   ```
2. Configure the Firebase CLI (only needed once per machine, **optional for emulator-only development**):
   ```sh
   pnpm dlx firebase-tools login
   ```
   
   **Note:** You can skip this step for emulator-only work. Login is only required when deploying to production Firebase (Ticket 13).

3. Start the emulators against the shared demo project. This command keeps the suite running and persists data across restarts:
   ```sh
   pnpm --filter @df/df-firebase-teaching-app emulators:start
   ```
4. Launch the web app in a second terminal:
   ```sh
   pnpm --filter @df/df-firebase-teaching-app dev
   ```
5. Open `http://127.0.0.1:4176` in your browser. The banner in the landing page confirms whether the Emulator UI is reachable (port `4000`).

### Port Map

| Service        | Port |
| -------------- | ---- |
| Auth           | 9155 |
| Firestore      | 8280 |
| Storage        | 9390 |
| Functions      | 5501 |
| Hosting        | 5500 |
| Emulator UI    | 5400 |

Avoid running other Firebase workspaces on the same ports. If you already have emulators running, shut them down or update one project's ports before continuing.

## Environment Configuration

This app uses environment variables for Firebase configuration, enabling seamless switching between emulator and production modes.

### Quick Start (Emulator Development)

1. The `.env.emulator` file is already included with placeholder values that work perfectly for emulator development:
   ```sh
   # Already exists - no need to copy from .env.example
   ```

2. For Vite dev server compatibility, a symlink `.env.development` → `.env.emulator` is created automatically:
   ```sh
   ln -sf .env.emulator .env.development
   ```

3. The `.env.emulator` file contains placeholder values:
   ```
   VITE_USE_EMULATOR=true
   VITE_FIREBASE_PROJECT_ID=demo-firebase-teaching-app
   # ... other placeholder values
   ```

4. **No real Firebase project needed!** The placeholder values in `.env.emulator` are sufficient for all local development (Tickets 1-12).

### Environment Variables

All environment variables use the `VITE_` prefix for Vite compatibility:

| Variable | Purpose | Emulator Value | Production Value |
|----------|---------|----------------|------------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | Any placeholder | Real key from Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | `demo-project.firebaseapp.com` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | `demo-firebase-teaching-app` | Your real project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | `demo-project.appspot.com` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender | `000000000000` | Your real sender ID |
| `VITE_FIREBASE_APP_ID` | App ID | `1:000000000000:web:abc123` | Your real app ID |
| `VITE_USE_EMULATOR` | Enable emulator mode | `true` | `false` |
| `VITE_FIREBASE_EMULATOR_UI` | Emulator UI URL | `http://127.0.0.1:5400` | (not used) |

### Switching Between Emulator and Live Firebase

**Emulator Mode (Default - Recommended for Development):**
- Uses `.env.emulator` file
- `VITE_USE_EMULATOR=true`
- Placeholder Firebase config values work fine
- 100% offline development
- No Firebase project or billing required

**Production Mode (Demonstrated in Ticket 13):**
- Uses `.env.production` file (you create this)
- `VITE_USE_EMULATOR=false`
- Requires real Firebase project credentials
- Connects to actual Firebase services
- See `.env.production.example` for template

To switch modes, simply use different `.env.*` files. Vite automatically loads `.env.emulator` during development.

### Security Best Practices

- ✅ `.env.example` and `.env.production.example` are committed (templates only)
- ✅ `.env.emulator` is committed (contains safe placeholder values)
- ✅ `.env.development` is a symlink to `.env.emulator` (for Vite compatibility, not committed)
- ❌ `.env.production` is **NEVER** committed (contains real credentials)
- ❌ Never commit files with real Firebase credentials
- ✅ Use GitHub Secrets for CI/CD deployments
- ✅ Rotate credentials immediately if accidentally exposed

### Troubleshooting Environment Issues

- **Missing environment variables**: If you see an error about missing `VITE_FIREBASE_*` variables, ensure you have `.env.emulator` file. Copy from `.env.example` if needed.
- **Emulator not connecting**: Verify `VITE_USE_EMULATOR=true` in your `.env.emulator` file.
- **Wrong Firebase project**: Check that your environment file has the correct `VITE_FIREBASE_PROJECT_ID` value.

## Working with Seed Data

The Firebase Emulator Suite persists state to `apps/df-firebase-teaching-app/emulator-data/`. This app includes comprehensive seed data for authentication, Firestore collections, and Storage files.

### Seeding the Emulators

**First-time setup or reset:**
```sh
pnpm --filter @df/df-firebase-teaching-app seed
```

This populates the emulators with:
- **10 authentication users** with diverse states (verified/unverified)
- **5 Firestore collections** with 10+ documents each:
  - `flowers` - 12 botanical examples
  - `continents` - 7 geographic regions
  - `chemicalElements` - 13 elements from periodic table
  - `musicalInstruments` - 12 instruments from various families
  - `todos` - 12 classroom coaching tasks for CRUD demos
- **Storage files** - Sample images, documents, and user avatars (when available)

The seed script is **idempotent** - safe to run multiple times. It skips existing data and only creates what's missing.

**Clear and reseed:**
```sh
pnpm --filter @df/df-firebase-teaching-app seed:reset
```

This clears all emulator data and repopulates from scratch.

### Viewing Seed Data

Open the Firebase Emulator UI to browse the seeded data:
```sh
open http://127.0.0.1:5400
```

Navigate to:
- **Authentication** → See 10 test users (alice.anderson@example.com, bob.builder@example.com, etc.)
- **Firestore Database** → Browse collections (flowers, continents, chemicalElements, musicalInstruments)
- **Storage** → View uploaded files (images, documents, avatars)

**Test user credentials:**
- Email: Any user from `scripts/seed-data/auth-users.json`
- Password: `password123` (all users - teaching only, never use in production!)

### Testing Authentication

To verify that the seeded authentication users work correctly:

```sh
pnpm --filter @df/df-firebase-teaching-app test:auth
```

This script tests logging in with all 10 users and displays their authentication details (UID, email verification status, display name, photo URL).

**Example output:**
```
✅ Alice Anderson
   Email: alice.anderson@example.com
   UID: RJjbp5cAylLirrlVdVlRsnpHPR5G
   Email Verified: false
   Display Name: Alice Anderson
   Photo URL: avatars/alice.jpg
```

**Note:** The teaching app doesn't yet have a login UI (coming in later tickets). For now, authentication can be tested via:
- The test script above
- Browser console with Firebase SDK
- Building your own UI components as practice

### Manual Export/Import

- Export current emulator state:
  ```sh
  pnpm --filter @df/df-firebase-teaching-app emulators:export
  ```
  
- Import a saved snapshot and start emulators:
  ```sh
  pnpm --filter @df/df-firebase-teaching-app emulators:import
  ```
  
- Clear all persisted data:
  ```sh
  pnpm --filter @df/df-firebase-teaching-app emulators:clear
  ```

### Seed Data Documentation

For detailed information about seed data structure, adding new data, or troubleshooting:

📚 **See:** [`scripts/seed-data/README.md`](./scripts/seed-data/README.md)

This includes:
- Seed data philosophy and design principles
- Complete data schemas for all collections
- Instructions for adding new seed data
- Versioning and compatibility guidelines
- Troubleshooting common issues

### Teaching Workflow

**For instructors:**
1. Start emulators: `pnpm emulators:start`
2. Seed initial data: `pnpm seed`
3. Teach your session, creating/modifying data
4. Export at end: `pnpm emulators:export`
5. Students can replay by running `pnpm emulators:import`

**For students:**
1. Start with clean slate: `pnpm seed:reset`
2. Or resume from instructor's export: `pnpm emulators:import`
3. Experiment freely - seed again anytime to reset

## Authentication (Ticket 5: ✅ Complete)

The Firebase teaching app now includes complete authentication patterns demonstrating:
- ✅ Sign in / Sign up with email and password
- ✅ Sign out
- ✅ Password reset
- ✅ User profile display
- ✅ Auth guards for protected content
- ✅ Signals-first architecture
- ✅ Presentation-only UI components

### Quick Auth Demo

```bash
# Terminal 1: Start emulators
pnpm --filter @df/df-firebase-teaching-app emulators:start

# Terminal 2: Start dev server
pnpm --filter @df/df-firebase-teaching-app dev
```

Then:
1. Open http://127.0.0.1:4176
2. Scroll to the "Authentication Pattern Demo" section
3. Use test credentials:
   - Email: `alice.anderson@example.com` (or any seeded user)
   - Password: `password123`

**Alternative:** You can also use production build with `pnpm build && pnpm preview` if preferred.

### Auth Documentation

See [AUTHENTICATION_PATTERNS.md](./AUTHENTICATION_PATTERNS.md) for complete documentation including:
- Architecture overview
- Component API reference
- Auth guard usage
- Integration examples
- Testing strategies

## Firestore Pattern (Ticket 6: ✅ Complete)

The Firestore demo showcases end-to-end CRUD flows powered by the shared todos store:
- ✅ Base store with pagination, query switching, and real-time listeners
- ✅ Offline persistence via IndexedDB (automatically enabled)
- ✅ Filter UI for priority, tags, and completion state
- ✅ Teaching-friendly todo dataset with due dates and tags
- ✅ Reusable UI components (`df-firestore-list`, `df-firestore-item`, `df-firestore-form`, `df-firestore-delete`)
- ✅ Playwright coverage for create → update → paginate → delete

### Quick Firestore Tour

1. Start the emulators: `pnpm --filter @df/df-firebase-teaching-app emulators:start`
2. Launch the dev server: `pnpm --filter @df/df-firebase-teaching-app dev`
3. Visit the "Firestore CRUD Pattern" section
4. Toggle real-time updates, adjust filters, and add/edit/delete todos
5. Switch page size to explore pagination

### Offline Testing

1. Enable airplane mode (or run `networksetup -setairportpower en0 off` on macOS)
2. Reload the page — todos render from IndexedDB cache
3. Create/edit a todo while offline
4. Re-enable connectivity; the change syncs automatically

📚 See [FIRESTORE_PATTERNS.md](./FIRESTORE_PATTERNS.md) for full documentation, including architecture
notes and Storybook links.

## Development Tasks

- `pnpm --filter @df/df-firebase-teaching-app build` – Type-check and emit static assets.
- `pnpm --filter @df/df-firebase-teaching-app preview` – Serve the production build on port `4176`.
- `pnpm --filter @df/df-firebase-teaching-app test` – Run the Playwright smoke test (ensures the shell renders).

## Troubleshooting

- **Emulators not detected**: The landing page raises a warning if the Emulator UI on `http://127.0.0.1:4000` cannot be reached. Start the suite or update `VITE_FIREBASE_EMULATOR_UI` in your `.env` file.
- **Port already in use**: Another process may still be listening on one of the custom ports (`9155`, `8280`, `9390`, `5501`, `5500`, `5400`). Use `lsof -nP -i :<port>` to identify and stop it, or update the port numbers in `firebase.json` and the README tables.
- **Stale seed data**: Run `pnpm --filter @df/df-firebase-teaching-app emulators:clear` to reset the `emulator-data/` directory, then restart the suite.
- **CLI login prompts**: The CLI only needs login when you interact with remote Firebase projects. For emulator-only work you can skip the login step.
