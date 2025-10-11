# DF Firebase Teaching App

Offline-friendly host application for teaching Firebase development patterns with Lit and the Firebase Emulator Suite.

## Setting Up Firebase Emulators

1. Install workspace dependencies:
   ```sh
   pnpm install
   ```
2. Configure the Firebase CLI (only needed once per machine):
   ```sh
   pnpm --filter @df/df-firebase-teaching-app dlx firebase-tools login
   ```
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

1. Copy the example environment file:
   ```sh
   cp .env.example .env.emulator
   ```

2. The `.env.emulator` file contains placeholder values that work perfectly for emulator development:
   ```
   VITE_USE_EMULATOR=true
   VITE_FIREBASE_PROJECT_ID=demo-firebase-teaching-app
   # ... other placeholder values
   ```

3. **No real Firebase project needed!** The placeholder values in `.env.emulator` are sufficient for all local development (Tickets 1-12).

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
- ❌ `.env.production` is **NEVER** committed (contains real credentials)
- ❌ Never commit files with real Firebase credentials
- ✅ Use GitHub Secrets for CI/CD deployments
- ✅ Rotate credentials immediately if accidentally exposed

### Troubleshooting Environment Issues

- **Missing environment variables**: If you see an error about missing `VITE_FIREBASE_*` variables, ensure you have `.env.emulator` file. Copy from `.env.example` if needed.
- **Emulator not connecting**: Verify `VITE_USE_EMULATOR=true` in your `.env.emulator` file.
- **Wrong Firebase project**: Check that your environment file has the correct `VITE_FIREBASE_PROJECT_ID` value.

## Working with Seed Data

The suite persists state to `apps/df-firebase-teaching-app/emulator-data/`.

- Export a snapshot without starting the web app:
  ```sh
  pnpm --filter @df/df-firebase-teaching-app emulators:export
  ```
- Import a saved snapshot and start the suite:
  ```sh
  pnpm --filter @df/df-firebase-teaching-app emulators:import
  ```
- Clear the persisted state:
  ```sh
  pnpm --filter @df/df-firebase-teaching-app emulators:clear
  ```

When teaching, export data at the end of each session so new students can replay the same state by running `emulators:import` before `emulators:start`.

## Development Tasks

- `pnpm --filter @df/df-firebase-teaching-app build` – Type-check and emit static assets.
- `pnpm --filter @df/df-firebase-teaching-app preview` – Serve the production build on port `4176`.
- `pnpm --filter @df/df-firebase-teaching-app test` – Run the Playwright smoke test (ensures the shell renders).

## Troubleshooting

- **Emulators not detected**: The landing page raises a warning if the Emulator UI on `http://127.0.0.1:4000` cannot be reached. Start the suite or update `VITE_FIREBASE_EMULATOR_UI` in your `.env` file.
- **Port already in use**: Another process may still be listening on one of the custom ports (`9155`, `8280`, `9390`, `5501`, `5500`, `5400`). Use `lsof -nP -i :<port>` to identify and stop it, or update the port numbers in `firebase.json` and the README tables.
- **Stale seed data**: Run `pnpm --filter @df/df-firebase-teaching-app emulators:clear` to reset the `emulator-data/` directory, then restart the suite.
- **CLI login prompts**: The CLI only needs login when you interact with remote Firebase projects. For emulator-only work you can skip the login step.
