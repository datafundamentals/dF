# Shared Package Guides

**Instructions for coding agents** When adding or changing the name of any guide within this folder, please make the appropriate changes below.

## What

- documentation that explains how libraries inside `packages/` are used across apps (state stores, UI kits, firebase helpers, etc.)
- cross-package conventions or APIs that multiple consumers need to follow

## How

- write markdown that stays in sync with the exported code
- keep it canonical—do not duplicate root `guides/` or app/service instructions
- stay concise and actionable, focusing on the package’s public surface

## Related locations

- `guides/` — repo-wide standards that apply to every ticket
- `packages/firebase/guides/` — firebase-specific helpers shared across packages
- `services/guides/` — backend/service execution patterns
- `apps/df-firebase-teaching-app/guides/` — teaching app patterns and examples
