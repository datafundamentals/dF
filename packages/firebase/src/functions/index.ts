import type {FirebaseApp} from 'firebase/app';
import {
  connectFunctionsEmulator,
  getFunctions,
  httpsCallable,
  type Functions,
  type HttpsCallable,
  type HttpsCallableOptions,
  type HttpsCallableResult,
} from 'firebase/functions';

import type {EmulatorHostConfig} from '@df/types/firebase.types';
import {getEmulatorHost, getEmulatorPort} from '../emulator-detection.js';

const connectedInstances = new WeakSet<Functions>();

/** Default region to align with emulator expectations. */
export const DEFAULT_FUNCTIONS_REGION = 'us-central1';

/** Returns the Functions instance for the provided app and region. */
export function getFirebaseFunctions(app: FirebaseApp, region: string = DEFAULT_FUNCTIONS_REGION): Functions {
  return getFunctions(app, region);
}

/** Connects the Functions instance to the emulator once. */
export function connectFunctionsToEmulator(functions: Functions, config: EmulatorHostConfig): void {
  if (connectedInstances.has(functions)) {
    return;
  }

  connectFunctionsEmulator(functions, getEmulatorHost(config), getEmulatorPort(config));
  connectedInstances.add(functions);
}

/** Convenience wrapper around `httpsCallable` with typed responses. */
export function callable<Request = unknown, Response = unknown>(
  functions: Functions,
  name: string,
  options?: HttpsCallableOptions
): HttpsCallable<Request, Response> {
  return httpsCallable<Request, Response>(functions, name, options);
}

export type {Functions, HttpsCallable, HttpsCallableOptions, HttpsCallableResult};
