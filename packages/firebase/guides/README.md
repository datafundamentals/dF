# Firebase Package Guides

**Instructions for coding agents** When adding or changing the name of any guide within this folder, please make the appropriate changes below.

## What

- canonical documentation for firebase utilities that live under `packages/firebase`
- guidance that applies to multiple firebase-enabled apps (initialization helpers, emulator tooling, shared error handling, etc.)

## How

- author markdown that mirrors the exported package APIs and stays versioned with the code
- avoid duplicating the higher-level firebase patterns covered in `apps/df-firebase-teaching-app0/guides/`
- keep docs declarative and conflict-free with the root `guides/`

## Related locations

- `guides/` — repo-wide standards used by every ticket
- `packages/guides/` — shared library documentation beyond firebase
- `apps/df-firebase-teaching-app0/guides/` — teaching app usage patterns that demonstrate these helpers
