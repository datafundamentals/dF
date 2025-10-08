# DF Monorepo - Claude Context

**Last Updated:** 2025-09-30
**Current Status:** Active development on NPM info consolidation

## Current Monorepo State

### Recent Work Completed
- **NPM Info Consolidation (2025-09-30)**: Successfully removed duplicate npm-info store from `apps/df-npm-info-app/src/stores/` and consolidated to use shared store from `@df/state`
  - Removed: `apps/df-npm-info-app/src/stores/npm-info.ts` (legacy AsyncComputed implementation)
  - Updated: `apps/df-npm-info-app/src/ui/npm-info.ts` to use `@df/state` exports
  - Verified: Build passes, lint passes

### Current Priorities
1. Maintain consolidated pattern where apps use shared stores from `@df/state`
2. Avoid duplicate implementations across apps
3. Follow signals-based state management patterns

### Architecture Notes
- **State Management**: Centralized in `@df/state` using `@lit-labs/signals`
- **UI Components**: Shared components in `@df/ui-lit`, app-specific in individual apps
- **Types**: Centralized in `@df/types`
- **Build System**: Turbo-powered monorepo with pnpm workspaces

### Active Apps
- `@df/df-npm-info-app`: NPM package information viewer (recently consolidated)
- `@df/df-teaching-app`: Teaching/demo components
- `@df/df-storybook`: Component documentation
- `@df/df-lit-starter`: Basic Lit starter template

### Commands
- Build: `pnpm build`
- Lint: `pnpm lint`
- Dev: `pnpm dev` (app-specific)

## Notes for Future Sessions
- Always check if functionality exists in shared packages before creating app-specific implementations
- Follow the pattern of importing from `@df/state`, `@df/types`, `@df/ui-lit` rather than creating local duplicates
- TypeScript builds are working correctly across all packages