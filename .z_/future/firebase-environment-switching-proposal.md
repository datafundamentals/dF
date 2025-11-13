# Firebase Environment Switching Proposal

**Status**: Proposed
**Created**: 2025-11-12

## 1. Problem Statement

Developers in this monorepo face friction when switching between local Firebase emulator development and testing against live cloud-based Firebase services. The current process is manual, error-prone, and lacks clear visual feedback, leading to potential confusion and accidental operations against production data.

There are two primary development modalities required:

1.  **Emulator Mode**: Using production Firebase Authentication but connecting to local emulators for Firestore, Storage, and Functions. This is the standard for day-to-day feature development.
2.  **Cloud Mode**: Using production Firebase services for everything (Auth, Firestore, Storage, Functions). This is used for final integration testing before deployment, allowing developers to run the local Vite server against live cloud data.

A streamlined, reliable mechanism is needed to toggle between these two states.

## 2. Proposed Solution

We will implement a centralized, environment-variable-driven system to manage Firebase service connections. This solution consists of three main parts: a configuration module, a UI indicator, and a clear developer workflow.

### 2.1. Core Logic: Environment Configuration

A new module will be created to define and manage the environments.

**File**: `packages/firebase/src/environment-config.ts`

This file will export a function, `getFirebaseEnvironmentConfig()`, which reads a Vite environment variable (`VITE_FIREBASE_ENV`) and returns the appropriate configuration.

```typescript
// packages/firebase/src/environment-config.ts

import type { EmulatorConfig } from './app-firebase-config';

/**
 * Defines the two supported Firebase environments.
 * 'fb-emulator': Prod Auth, emulated backend services.
 * 'fb-cloud': All services live in the cloud.
 */
export type FirebaseEnvironment = 'fb-emulator' | 'fb-cloud';

export interface EnvironmentConfig extends EmulatorConfig {
  label: string;
  description: string;
}

// Defines the connection settings for each environment.
// Auth is always false (not emulated) per monorepo policy.
export const ENVIRONMENT_CONFIGS: Record<FirebaseEnvironment, EnvironmentConfig> = {
  'fb-emulator': {
    auth: false,
    firestore: true,
    storage: true,
    functions: true,
    label: 'Emulator Mode (fb-emulator)',
    description: 'Using production authentication with local emulators for data and functions.',
  },
  'fb-cloud': {
    auth: false,
    firestore: false,
    storage: false,
    functions: false,
    label: 'Cloud Mode (fb-cloud)',
    description: 'All Firebase services are connected to the live cloud environment.',
  },
};

/**
 * Gets the current Firebase environment configuration.
 * Reads from `import.meta.env.VITE_FIREBASE_ENV`.
 * Defaults to 'fb-emulator' if the variable is not set or invalid.
 *
 * @returns The configuration object for the current environment.
 */
export function getFirebaseEnvironmentConfig(): EnvironmentConfig {
  const env = import.meta.env.VITE_FIREBASE_ENV as FirebaseEnvironment;
  if (!ENVIRONMENT_CONFIGS[env]) {
    // Default to the safest, most common mode.
    return ENVIRONMENT_CONFIGS['fb-emulator'];
  }
  return ENVIRONMENT_CONFIGS[env];
}
```

### 2.2. UI: Visual Environment Indicator

To provide immediate visual feedback and prevent errors, a banner component will be displayed at the top of the application.

**File**: `packages/ui-lit/src/df-environment-banner.ts`

**Features**:
*   **Color-Coded**: Yellow for 'Emulator' mode, Red for 'Cloud' mode to signify caution.
*   **Informative**: Displays the current environment's `label` and `description`.
*   **Always Visible**: Remains fixed at the top of the viewport during development.

This component will internally use `getFirebaseEnvironmentConfig()` to determine which banner to display.

### 2.3. Developer Workflow

Switching between environments will be simple and explicit.

1.  **Default Behavior**: If no environment is specified, the system defaults to **`fb-emulator`** mode (local emulators).

2.  **Switching to Cloud Mode**: A developer creates a `.env.local` file in the root of the specific app they are working on.

    ```env
    # apps/df-npm-info-app/.env.local
    # This switches the app to use live cloud services.
    VITE_FIREBASE_ENV=fb-cloud
    ```

3.  **Switching Back**: The developer can delete the `.env.local` file or change the value to `fb-emulator`.

This approach is simple, not prone to being committed to Git, and is scoped to the specific app being tested.

## 3. Benefits

*   **Reduces Errors**: Minimizes the risk of accidentally performing development actions on live production data.
*   **Improves Developer Experience**: Switching is fast, simple, and requires no code changes.
*   **Clarity**: The on-screen banner provides constant, unambiguous context about the connected environment.
*   **Consistency**: Establishes a single, monorepo-wide pattern for managing Firebase environments.

## 4. High-Level Implementation Steps

1.  **Create `environment-config.ts`**: Implement the core logic in `packages/firebase`.
2.  **Create `df-environment-banner.ts`**: Build the UI component in `packages/ui-lit`.
3.  **Update a Reference App**: Modify one app (e.g., `df-npm-info-app`) to use the new system by updating its `firebase.config.ts` to call `getFirebaseEnvironmentConfig()` and adding the `<df-environment-banner>` to its main layout.
4.  **Document**: Create a new guide in `/guides/FIREBASE_ENVIRONMENT_SWITCHING.md` explaining the feature and workflow.
5.  **Rollout**: Gradually update other apps to use this new, standardized system.

## 5. Definition of Done

The task will be considered complete when all of the following acceptance criteria are met:

1.  **Core Logic Implemented**:
    *   [ ] The `environment-config.ts` module is created within `packages/firebase/src`.
    *   [ ] The module correctly exports `getFirebaseEnvironmentConfig`, `FirebaseEnvironment`, and `ENVIRONMENT_CONFIGS`.
    *   [ ] The logic defaults to `fb-emulator` mode if `VITE_FIREBASE_ENV` is missing or invalid.
    *   [ ] The new module is exported from `packages/firebase/src/index.ts`.

2.  **UI Component Created**:
    *   [ ] The `<df-environment-banner>` web component is created in `packages/ui-lit/src`.
    *   [ ] The banner displays a yellow background for `fb-emulator` mode.
    *   [ ] The banner displays a red background for `fb-cloud` mode.
    *   [ ] The banner correctly shows the `label` and `description` for the active mode.
    *   [ ] The new component is exported from `packages/ui-lit/src/index.ts`.

3.  **Reference Implementation Updated**:
    *   [ ] `apps/df-app-starter-template` is refactored to use the new system.
    *   [ ] The app's `firebase.config.ts` is updated to use `getFirebaseEnvironmentConfig()`.
    *   [ ] The `<df-environment-banner>` is added to the app's main UI shell.

4.  **Functionality Verified**:
    *   [ ] The reference app defaults to `fb-emulator` mode when launched normally (`pnpm dev`).
    *   [ ] Creating a `.env.local` file with `VITE_FIREBASE_ENV=fb-cloud` successfully switches the app to Cloud Mode on restart.
    *   [ ] Removing the `.env.local` file reverts the app to Emulator Mode on restart.

5.  **Documentation Completed**:
    *   [ ] A new guide, `guides/FIREBASE_ENVIRONMENT_SWITCHING.md`, is created.
    *   [ ] The guide clearly explains the two modes, the workflow for switching between them, and the purpose of the `.env.local` file.
