# @df/firebase

Shared Firebase utilities used across teaching applications. This package keeps
all SDK initialization, emulator wiring, and cross-app helpers in one place so
individual apps can stay focused on feature code.

## When to use this package

- **Do use:** anything that applies to multiple Firebase apps—initializing the
  core SDK, connecting to emulators, reusable converter helpers, thin wrappers
  around Auth/Firestore/Functions/Storage, and strongly typed utilities that are
  safe to share.
- **Keep app-specific:** UI views, feature-specific Firestore queries, business
  logic, and any code that relies on a particular collection schema. That code
  belongs in the consuming app so this package can remain a clean reference.

## Key Exports

```ts
import {
  getFirebaseApp,
  connectFirebaseEmulators,
  shouldUseEmulators,
} from '@df/firebase';

import {getFirebaseAuth} from '@df/firebase/auth';
import {getFirestoreDb} from '@df/firebase/firestore';
import {getFirebaseStorage} from '@df/firebase/storage';
import {getFirebaseFunctions} from '@df/firebase/functions';
```

- `getFirebaseApp` returns a singleton `FirebaseApp` instance.
- `connectFirebaseEmulators` wires every configured service to the emulator
  suite exactly once.
- `shouldUseEmulators` centralises the feature flag logic so apps can decide at
  runtime whether to connect.
- Service entry points (`/auth`, `/firestore`, etc.) expose typed helpers and
  emulator connectors that can be composed as needed.

## Typical Usage

```ts
import {getFirebaseApp, connectFirebaseEmulators} from '@df/firebase';
import {getFirebaseAuth} from '@df/firebase/auth';
import {getFirestoreDb} from '@df/firebase/firestore';
import type {FirebaseConfig, EmulatorConfig} from '@df/types';

const appConfig: FirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const emulatorConfig: EmulatorConfig = {
  enabled: import.meta.env.VITE_USE_EMULATOR === 'true',
  auth: {host: '127.0.0.1', port: 9155},
  firestore: {host: '127.0.0.1', port: 8280},
  storage: {host: '127.0.0.1', port: 9390},
  functions: {host: '127.0.0.1', port: 5501, region: 'us-central1'},
};

const app = getFirebaseApp(appConfig);
connectFirebaseEmulators(app, emulatorConfig);

export const auth = getFirebaseAuth(app);
export const firestore = getFirestoreDb(app);
```

## Emulator-first development

`connectFirebaseEmulators` only connects when `EmulatorConfig.enabled` is truthy
(or when any service config is provided). In production, pass an empty config or
set `enabled: false` and the utilities fall back to the hosted Firebase
services.

This mirrors the docs-first recommendation from Firebase: initialise a single
app, connect via `connect*Emulator` helpers in development, and keep production
credentials outside of the repository.

## Building

```sh
pnpm --filter @df/firebase build
```

The build emits ESM JavaScript and type declarations to `dist/` so other
packages can import the utilities without hitting source TypeScript.
