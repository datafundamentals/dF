/**
 * Cloud Functions Entry Point
 *
 * This file exports all Cloud Functions for the df-firebase-teaching-app.
 *
 * Architecture Pattern: APP-SPECIFIC FUNCTIONS
 * ============================================
 * These functions live in apps/df-firebase-teaching-app0/functions/ because they are
 * specific to the teaching app's functionality.
 *
 * For SHARED functions used by multiple apps (e.g., shared auth/roles system),
 * see services/firebase-functions-shared/ and reference:
 * - guides/FUNCTIONS_PLACEMENT.md
 *
 * Function Organization:
 * - callable/     - Functions called directly from client apps (httpsCallable)
 * - http/         - HTTP endpoints accessed via fetch/axios
 * - triggers/     - Firestore/Auth event triggers
 * - scheduled/    - Cron-scheduled functions
 */
import { initializeApp } from 'firebase-admin/app';
// Initialize Firebase Admin SDK
// This MUST be called before any other firebase-admin operations
initializeApp();
/**
 * Callable Functions
 * ==================
 * These functions are called from the client using httpsCallable().
 * They provide type-safe, authenticated RPC-style communication.
 */
export { createTodoAdvanced } from './callable/createTodoAdvanced.js';
/**
 * HTTP Functions
 * ==============
 * These functions are accessed via standard HTTP requests (GET, POST, etc.).
 * Useful for webhooks, public APIs, or integration with non-Firebase clients.
 */
export { todosExportAPI } from './http/todosExportAPI.js';
/**
 * Firestore Triggers
 * ==================
 * These functions run automatically when Firestore documents are created,
 * updated, or deleted. Perfect for side effects like analytics, notifications,
 * or data synchronization.
 */
export { onTodoCreated, onTodoUpdated, onTodoDeleted, } from './triggers/onTodoCreated.js';
/**
 * Scheduled Functions
 * ===================
 * These functions run on a cron schedule. Ideal for maintenance tasks,
 * daily reports, cache warming, or periodic data processing.
 */
export { cleanupExpiredTodos, manualCleanupExpiredTodos, // Callable version for manual trigger
 } from './scheduled/cleanupExpiredTodos.js';
/**
 * Teaching Notes:
 * ===============
 *
 * ## Function Types Demonstrated Here:
 *
 * 1. **Callable Functions** (createTodoAdvanced)
 *    - Called from client: httpsCallable(functions, 'createTodoAdvanced')
 *    - Automatic authentication context
 *    - Type-safe requests/responses
 *    - Best for: User-initiated actions, data mutations
 *
 * 2. **HTTP Functions** (todosExportAPI)
 *    - Called via: fetch('/todosExportAPI?format=csv')
 *    - Standard HTTP GET/POST
 *    - CORS configuration required
 *    - Best for: Webhooks, public APIs, file downloads
 *
 * 3. **Firestore Triggers** (onTodoCreated, onTodoUpdated, onTodoDeleted)
 *    - Automatic: Fires on document changes
 *    - Access to before/after snapshots
 *    - Idempotent operations recommended
 *    - Best for: Analytics, notifications, data consistency
 *
 * 4. **Scheduled Functions** (cleanupExpiredTodos)
 *    - Runs on cron schedule
 *    - No user initiation
 *    - Batch processing
 *    - Best for: Maintenance, reports, cleanups
 *
 * ## App-Specific vs Shared Functions:
 *
 * **Use app-specific functions** (this directory) when:
 * - Function is specific to one app's features
 * - Business logic is tightly coupled to app
 * - Only this app needs the functionality
 * - Example: Todo-specific operations (this app)
 *
 * **Use shared functions** (services/firebase-functions-shared/) when:
 * - Multiple apps need the same functionality
 * - Centralized auth/roles management
 * - Cross-app data synchronization
 * - Example: Setting custom claims for 6+ apps
 *
 * ## See Also:
 * - guides/FUNCTIONS_PLACEMENT.md - Complete architecture guide
 * - apps/df-firebase-teaching-app0/README.md - App-specific documentation
 * - .z_/WIP/FIREBASE_TEACHING_APP_ROADMAP.md - Ticket 9 details
 */
