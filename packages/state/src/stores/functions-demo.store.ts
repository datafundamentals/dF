/**
 * Functions Demo Store
 *
 * Demonstrates calling Cloud Functions from the client using signals-based state management.
 *
 * Patterns demonstrated:
 * - Callable functions (RPC-style)
 * - HTTP functions (REST-style)
 * - Loading state tracking
 * - Error handling
 * - Typed requests/responses
 *
 * This store shows how to integrate Cloud Functions into a signals-based architecture,
 * making function calls reactive and easily consumable by UI components.
 */

import {signal, computed} from '@lit-labs/signals';
import type {FirebaseApp} from 'firebase/app';
import {
  getFirebaseFunctions,
  connectFunctionsToEmulator,
  callable,
  type Functions,
} from '@df/firebase/functions';
import type {TodoPriority} from '@df/types';
import {
  getInitializedFirebaseApp,
  shouldUseEmulatorForService,
} from './firebase-init.js';

// Function call state types
export interface FunctionCallState<T = unknown> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: T | null;
  error: string | null;
  lastCalled: Date | null;
}

// Request/Response types for createTodoAdvanced
export interface CreateTodoAdvancedRequest {
  title: string;
  description?: string;
  priority?: TodoPriority;
  tags?: string[];
  dueDate?: string; // ISO string
}

export interface CreateTodoAdvancedResponse {
  todoId: string;
  title: string;
  estimatedEffort: number; // in minutes
  urgencyScore: number; // 0-10
  message: string;
}

// Request/Response types for manualCleanupExpiredTodos
export interface ManualCleanupRequest {
  daysOld?: number; // Default 30
}

export interface ManualCleanupResponse {
  deleted: number;
  message: string;
}

// Store signals
const functionsInstanceSignal = signal<Functions | null>(null);
const createTodoStateSignal = signal<FunctionCallState<CreateTodoAdvancedResponse>>({
  status: 'idle',
  data: null,
  error: null,
  lastCalled: null,
});
const cleanupStateSignal = signal<FunctionCallState<ManualCleanupResponse>>({
  status: 'idle',
  data: null,
  error: null,
  lastCalled: null,
});
const exportStateSignal = signal<FunctionCallState<string>>({
  status: 'idle',
  data: null,
  error: null,
  lastCalled: null,
});

// Computed signals for UI consumption
export const createTodoCallState = computed(() => createTodoStateSignal.get());
export const cleanupCallState = computed(() => cleanupStateSignal.get());
export const exportCallState = computed(() => exportStateSignal.get());

/**
 * Initialize the Functions demo store
 * @param app Firebase app instance
 * @param useEmulator Whether to connect to the emulator
 * @param emulatorHost Emulator host (default: 127.0.0.1)
 * @param emulatorPort Emulator port (default: 5501)
 */
export function initializeFunctionsStore(
  app: FirebaseApp,
  useEmulator: boolean,
  emulatorHost: string = '127.0.0.1',
  emulatorPort: number = 5501
): void {
  if (functionsInstanceSignal.get()) {
    return; // Already initialized
  }

  const functions = getFirebaseFunctions(app, 'us-central1');

  if (useEmulator) {
    connectFunctionsToEmulator(functions, {
      host: emulatorHost,
      port: emulatorPort,
    });
  }

  functionsInstanceSignal.set(functions);
}

/**
 * Call the createTodoAdvanced Cloud Function
 *
 * This demonstrates a callable function that:
 * - Accepts typed parameters
 * - Performs server-side business logic
 * - Returns typed response with computed values
 * - Handles authentication automatically
 */
export async function callCreateTodoAdvanced(
  request: CreateTodoAdvancedRequest
): Promise<CreateTodoAdvancedResponse> {
  const functions = ensureFunctions();

  createTodoStateSignal.set({
    status: 'loading',
    data: null,
    error: null,
    lastCalled: new Date(),
  });

  try {
    const fn = callable<CreateTodoAdvancedRequest, CreateTodoAdvancedResponse>(
      functions,
      'createTodoAdvanced'
    );

    const result = await fn(request);

    createTodoStateSignal.set({
      status: 'success',
      data: result.data,
      error: null,
      lastCalled: new Date(),
    });

    return result.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    createTodoStateSignal.set({
      status: 'error',
      data: null,
      error: errorMessage,
      lastCalled: new Date(),
    });

    throw error;
  }
}

/**
 * Call the manualCleanupExpiredTodos Cloud Function
 *
 * This demonstrates a callable function that:
 * - Performs administrative tasks
 * - Requires authentication
 * - Returns operation metrics
 */
export async function callManualCleanup(
  request: ManualCleanupRequest = {}
): Promise<ManualCleanupResponse> {
  const functions = ensureFunctions();

  cleanupStateSignal.set({
    status: 'loading',
    data: null,
    error: null,
    lastCalled: new Date(),
  });

  try {
    const fn = callable<ManualCleanupRequest, ManualCleanupResponse>(
      functions,
      'manualCleanupExpiredTodos'
    );

    const result = await fn(request);

    cleanupStateSignal.set({
      status: 'success',
      data: result.data,
      error: null,
      lastCalled: new Date(),
    });

    return result.data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    cleanupStateSignal.set({
      status: 'error',
      data: null,
      error: errorMessage,
      lastCalled: new Date(),
    });

    throw error;
  }
}

/**
 * Call the todosExportAPI HTTP Function
 *
 * This demonstrates an HTTP function that:
 * - Uses standard fetch/HTTP methods
 * - Accepts query parameters
 * - Returns non-JSON responses (CSV in this case)
 * - Requires manual URL construction
 */
export async function callTodosExport(format: 'csv' | 'json' = 'csv'): Promise<string> {
  exportStateSignal.set({
    status: 'loading',
    data: null,
    error: null,
    lastCalled: new Date(),
  });

  try {
    // Construct the HTTP function URL
    // In emulator: http://127.0.0.1:5501/<project-id>/us-central1/todosExportAPI
    // In production: https://us-central1-<project-id>.cloudfunctions.net/todosExportAPI
    const app = getInitializedFirebaseApp();
    const projectId = app.options.projectId || 'peg-2035';
    const baseUrl = shouldUseEmulatorForService('functions')
      ? `http://127.0.0.1:5501/${projectId}/us-central1`
      : `https://us-central1-${projectId}.cloudfunctions.net`;

    const url = `${baseUrl}/todosExportAPI?format=${format}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();

    exportStateSignal.set({
      status: 'success',
      data,
      error: null,
      lastCalled: new Date(),
    });

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    exportStateSignal.set({
      status: 'error',
      data: null,
      error: errorMessage,
      lastCalled: new Date(),
    });

    throw error;
  }
}

/**
 * Reset the state for a specific function call
 */
export function resetCreateTodoState(): void {
  createTodoStateSignal.set({
    status: 'idle',
    data: null,
    error: null,
    lastCalled: null,
  });
}

export function resetCleanupState(): void {
  cleanupStateSignal.set({
    status: 'idle',
    data: null,
    error: null,
    lastCalled: null,
  });
}

export function resetExportState(): void {
  exportStateSignal.set({
    status: 'idle',
    data: null,
    error: null,
    lastCalled: null,
  });
}

/**
 * Ensure the Functions instance is initialized with lazy loading.
 * Safe to call multiple times - will only initialize once.
 */
function ensureFunctions(): Functions {
  let functions = functionsInstanceSignal.get();
  
  if (!functions) {
    // Lazy initialization
    const app = getInitializedFirebaseApp();
    functions = getFirebaseFunctions(app, 'us-central1');

    // Connect to emulator if configured
    if (shouldUseEmulatorForService('functions')) {
      connectFunctionsToEmulator(functions, {
        host: '127.0.0.1',
        port: 5501, // matches firebase.json
      });
    }

    functionsInstanceSignal.set(functions);
  }
  
  return functions;
}
