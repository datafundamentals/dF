# Auth-Triggered Function Tool

Minimal Firebase emulator harness focused on Cloud Functions triggered by Firebase Authentication events. Clone of `df-firebase-teaching-app2` with everything stripped down to auth, functions, and a light UI shell for exercising `df-auth-wrapper`.

## What This Tool Provides
- Firebase Emulator Suite scoped to **Auth**, **Firestore**, **Functions**, and **Hosting** only
- `df-auth-wrapper` component (email/password UI) rendered in a bare page
- Local functions workspace for writing `onCreate`/`onDelete` auth triggers
- Pre-wired ports to avoid conflicts with other apps in the monorepo

## Quick Start
```bash
pnpm install
pnpm --filter @df/auth-triggered-function-tool emulators:start
pnpm --filter @df/auth-triggered-function-tool dev
```
- Visit `http://127.0.0.1:5510` for the UI (served by Hosting emulator)
- Emulator UI available at `http://127.0.0.1:5410`

### Available Scripts
| Command | Description |
| --- | --- |
| `pnpm --filter @df/auth-triggered-function-tool dev` | Run Vite dev server with emulator mode enabled |
| `pnpm --filter @df/auth-triggered-function-tool build` | Type-check TypeScript sources |
| `pnpm --filter @df/auth-triggered-function-tool start:test` | Launch minimal server on port 4184 for Playwright |
| `pnpm --filter @df/auth-triggered-function-tool emulators:start` | Start Auth + Functions + Hosting emulators |
| `pnpm --filter @df/auth-triggered-function-tool-functions build` | Compile Cloud Functions before deployment |

## Emulator Port Map
| Service | Host | Port |
| --- | --- | --- |
| Auth | 127.0.0.1 | 9156 |
| Firestore | 127.0.0.1 | 8280 |
| Functions | 127.0.0.1 | 5502 |
| Hosting | 127.0.0.1 | 5510 |
| Emulator UI | 127.0.0.1 | 5410 |

## Developing Auth Triggers
1. Edit Cloud Functions in `apps/auth-triggered-function-tool/functions/src/index.ts`
2. Run `pnpm --filter @df/auth-triggered-function-tool-functions build` (or `build:watch`) to recompile
3. Use the UI to create or delete users to fire `onCreate` / `onDelete`
4. View logs in the terminal running the emulators or in the Emulator UI

## Testing Notes
- Playwright support is wired through the root config with the `auth-triggered-function-tool` project on port 4184
- Use `pnpm --filter @df/auth-triggered-function-tool test` to execute Playwright flows once they are added
- Security rule tests from the teaching app remain for reference but will be removed once the UI is minimized further

## Firebase Configuration
- Uses the demo project ID `demo-auth-function-tool`
- Environment variables live in `.env.emulator` (symlink or copy to `.env.development` if needed)
- No production deployment support—this app is intentionally emulator-only

## Next Steps
- Trim demo components that are not needed for auth trigger development
- Add sample `onCreate` / `onDelete` handlers (see `.z_/future/AUTH_TRIGGERED_FUNCTION_EMULATE_TOOL.md`)
- Document any workflow tweaks discovered during usage in `.z_/future/`
