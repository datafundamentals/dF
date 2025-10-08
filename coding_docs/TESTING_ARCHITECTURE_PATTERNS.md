# Testing Architecture Patterns

## Overview

This document defines the testing patterns and standards established across the three teaching apps in this monorepo. These patterns serve as templates for future app development and set the minimum standards for test coverage and architecture.

**Purpose:** Each of the three apps (`df-lit-starter`, `df-teaching-app`, `df-npm-info-app`) exists as a teaching example for coding agents to reference when setting up new apps. The patterns documented here represent best practices and minimum standards.

## Test Runner Distribution

### Pattern 1: Hybrid Testing (WTR + Playwright)
**Example App:** `df-lit-starter`

Use this pattern for **component libraries** or apps that need both unit/component testing AND integration/e2e testing.

**Configuration:**
```json
{
  "scripts": {
    "test": "pnpm test:integration && pnpm test:e2e",
    "test:integration": "pnpm test:dev && pnpm test:prod",
    "test:dev": "wtr --config web-test-runner.config.js",
    "test:prod": "MODE=prod wtr --config web-test-runner.config.js",
    "test:e2e": "playwright test --config ../../playwright.config.ts --project=df-lit-starter"
  }
}
```

**Key Features:**
- **Web Test Runner (WTR)**: Component-level tests in isolation
  - Tests both dev and production builds
  - Runs on Chromium, Firefox, and Webkit
  - Fast, focused component testing
- **Playwright**: End-to-end user flow testing
  - Browser automation for realistic scenarios
  - Tests complete application workflows
- **Separation of Concerns**: Component tests verify individual pieces, e2e tests verify complete flows

**When to Use:**
- Building reusable component libraries
- Need to test component behavior in isolation
- Want comprehensive coverage at multiple levels
- Developing design systems or UI kits

### Pattern 2: Playwright-Only Testing
**Example Apps:** `df-teaching-app`, `df-npm-info-app`

Use this pattern for **application development** where integration testing is the primary concern.

**Configuration:**
```json
{
  "scripts": {
    "pretest": "pnpm build",
    "test": "pnpm test:integration",
    "test:integration": "playwright test --config ../../playwright.config.ts --project=df-npm-info-app",
    "start:test": "pnpm build && pnpm exec vite dev --host 127.0.0.1 --port 4173 --strictPort --mode test --logLevel error"
  }
}
```

**Key Features:**
- **Playwright Only**: Single test runner for simplicity
- **Integration Focus**: Tests real user workflows end-to-end
- **Build Verification**: Always builds before testing to catch TypeScript errors
- **Vite Dev Server**: Serves the app during tests

**When to Use:**
- Building complete applications (not component libraries)
- Integration testing is sufficient for coverage needs
- Want simpler test architecture with fewer moving parts
- Primary concern is user-facing functionality

## Test Server Architecture

### Vite's Role
**Important:** Vite is **NOT a test runner** - it's the **development server** that serves your application during testing.

**Configuration Pattern:**
```json
{
  "start:test": "pnpm build && pnpm exec vite dev --host 127.0.0.1 --port 4173 --strictPort --mode test --logLevel error"
}
```

**Critical Implementation Details:**
1. **Use `pnpm exec`**: Required in monorepo workspaces to ensure proper binary resolution
   - ❌ Wrong: `"start:test": "vite dev ..."`
   - ✅ Correct: `"start:test": "pnpm exec vite dev ..."`
   
2. **Port Assignment**: Each app gets a unique port
   - `df-npm-info-app`: 4173
   - `df-teaching-app`: 4174
   - `df-lit-starter`: 4175

3. **Required Flags**:
   - `--host 127.0.0.1`: Explicit localhost binding
   - `--strictPort`: Fail if port is taken (prevents port conflicts)
   - `--mode test`: Environment mode for test-specific config
   - `--logLevel error`: Reduce noise in test output

### Playwright Configuration (Shared)

All apps share a root-level `playwright.config.ts` with per-project configuration:

```typescript
{
  projects: [
    {
      name: 'df-npm-info-app',
      testDir: './apps/df-npm-info-app/tests/integration',
      use: { baseURL: 'http://127.0.0.1:4173' },
    },
    {
      name: 'df-teaching-app',
      testDir: './apps/df-teaching-app/tests/integration',
      use: { baseURL: 'http://127.0.0.1:4174' },
    },
    {
      name: 'df-lit-starter',
      testDir: './apps/df-lit-starter/tests/integration',
      use: { baseURL: 'http://127.0.0.1:4175' },
    },
  ],
  webServer: [
    {
      command: 'cd apps/df-npm-info-app && pnpm start:test',
      port: 4173,
      reuseExistingServer: !process.env.CI,
    },
    // ... similar configs for other apps
  ],
}
```

## Minimum Standards for New Apps

### Required Test Coverage
1. **Build Validation**: All tests must run `pnpm build` before testing (catches TypeScript errors)
2. **Integration Tests**: Minimum 2 test scenarios covering primary user flows
3. **Test Organization**: Tests in `tests/integration/*.spec.ts`

### Required Scripts (package.json)
Every app must include:
```json
{
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "pretest": "pnpm build",
    "test": "pnpm test:integration",
    "test:integration": "playwright test --config ../../playwright.config.ts --project=<app-name>",
    "start:test": "pnpm build && pnpm exec vite dev --host 127.0.0.1 --port <unique-port> --strictPort --mode test --logLevel error"
  }
}
```

### Playwright Project Registration
New apps must be added to root `playwright.config.ts`:
1. Add project configuration with unique name and port
2. Add webServer configuration matching the `start:test` script
3. Ensure port doesn't conflict with existing apps

### Test File Structure
```
apps/
  your-new-app/
    tests/
      integration/
        main-flow.spec.ts       # Primary user journey
        edge-cases.spec.ts      # Error handling, edge cases
```

## Decision Tree: Which Pattern to Use?

```
Are you building a component library or design system?
├─ YES → Use Pattern 1 (Hybrid: WTR + Playwright)
│        - Set up Web Test Runner for component tests
│        - Add Playwright for integration tests
│        - Reference df-lit-starter as template
│
└─ NO → Are you building a complete application?
         └─ YES → Use Pattern 2 (Playwright Only)
                  - Simpler setup, single test runner
                  - Focus on user workflows
                  - Reference df-teaching-app or df-npm-info-app as template
```

## Common Patterns Across All Apps

### TypeScript Compilation
- **Always build before testing**: `"pretest": "pnpm build"`
- Catches type errors before running tests
- Ensures test environment matches production build

### Port Management
- Each app gets a unique port (4173+)
- Use `--strictPort` to fail fast on conflicts
- Document port assignments in root config

### Error Handling in Tests
- Test both happy paths and error scenarios
- Verify error messages are user-friendly
- Ensure graceful degradation

### CI/CD Considerations
- `reuseExistingServer: !process.env.CI` in webServer config
- Ensures fresh server start in CI environment
- Faster local development with server reuse

## Troubleshooting Common Issues

### Issue: "vite: command not found"
**Solution:** Use `pnpm exec vite` in monorepo workspaces

### Issue: Port already in use
**Solution:** Check `--strictPort` is set and ports are unique across apps

### Issue: Tests pass locally but fail in CI
**Solution:** Verify `reuseExistingServer` is conditional on `!process.env.CI`

## Future Expansion

When adding new apps to this monorepo:

1. **Choose your pattern** (Hybrid vs Playwright-only)
2. **Copy from reference app**:
   - Pattern 1: Use `df-lit-starter` as template
   - Pattern 2: Use `df-teaching-app` or `df-npm-info-app` as template
3. **Update ports**: Assign next available port (4176, 4177, etc.)
4. **Register in playwright.config.ts**: Add project and webServer entries
5. **Write minimum 2 integration tests**: Cover primary user flows
6. **Verify**: Run `pnpm test` from workspace root

## Related Documentation

- [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md) - Detailed Playwright implementation guide
- [CODING_TEST_METHODOLOGY.md](./CODING_TEST_METHODOLOGY.md) - General testing philosophy
- [CODING_TESTING_STRATEGY.md](./CODING_TESTING_STRATEGY.md) - Broader testing strategy

## Version History

- **2025-10-07**: Initial documentation of testing architecture patterns
  - Documented WTR + Playwright hybrid pattern (df-lit-starter)
  - Documented Playwright-only pattern (df-teaching-app, df-npm-info-app)
  - Established minimum standards for new apps
  - Fixed webserver startup bug in df-npm-info-app (pnpm exec vite)
