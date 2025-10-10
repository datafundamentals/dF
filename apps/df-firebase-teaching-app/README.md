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
