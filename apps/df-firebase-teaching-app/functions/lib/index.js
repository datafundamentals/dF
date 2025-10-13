"use strict";
/**
 * Cloud Functions Entry Point
 *
 * This file exports all Cloud Functions for the df-firebase-teaching-app.
 *
 * Architecture Pattern: APP-SPECIFIC FUNCTIONS
 * ============================================
 * These functions live in apps/df-firebase-teaching-app/functions/ because they are
 * specific to the teaching app's functionality.
 *
 * For SHARED functions used by multiple apps (e.g., shared auth/roles system),
 * see services/firebase-functions-shared/ and reference:
 * - coding_docs/FUNCTIONS_PLACEMENT.md
 *
 * Function Organization:
 * - callable/     - Functions called directly from client apps (httpsCallable)
 * - http/         - HTTP endpoints accessed via fetch/axios
 * - triggers/     - Firestore/Auth event triggers
 * - scheduled/    - Cron-scheduled functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualCleanupExpiredTodos = exports.cleanupExpiredTodos = exports.onTodoDeleted = exports.onTodoUpdated = exports.onTodoCreated = exports.todosExportAPI = exports.createTodoAdvanced = void 0;
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin SDK
// This MUST be called before any other firebase-admin operations
(0, app_1.initializeApp)();
/**
 * Callable Functions
 * ==================
 * These functions are called from the client using httpsCallable().
 * They provide type-safe, authenticated RPC-style communication.
 */
var createTodoAdvanced_js_1 = require("./callable/createTodoAdvanced.js");
Object.defineProperty(exports, "createTodoAdvanced", { enumerable: true, get: function () { return createTodoAdvanced_js_1.createTodoAdvanced; } });
/**
 * HTTP Functions
 * ==============
 * These functions are accessed via standard HTTP requests (GET, POST, etc.).
 * Useful for webhooks, public APIs, or integration with non-Firebase clients.
 */
var todosExportAPI_js_1 = require("./http/todosExportAPI.js");
Object.defineProperty(exports, "todosExportAPI", { enumerable: true, get: function () { return todosExportAPI_js_1.todosExportAPI; } });
/**
 * Firestore Triggers
 * ==================
 * These functions run automatically when Firestore documents are created,
 * updated, or deleted. Perfect for side effects like analytics, notifications,
 * or data synchronization.
 */
var onTodoCreated_js_1 = require("./triggers/onTodoCreated.js");
Object.defineProperty(exports, "onTodoCreated", { enumerable: true, get: function () { return onTodoCreated_js_1.onTodoCreated; } });
Object.defineProperty(exports, "onTodoUpdated", { enumerable: true, get: function () { return onTodoCreated_js_1.onTodoUpdated; } });
Object.defineProperty(exports, "onTodoDeleted", { enumerable: true, get: function () { return onTodoCreated_js_1.onTodoDeleted; } });
/**
 * Scheduled Functions
 * ===================
 * These functions run on a cron schedule. Ideal for maintenance tasks,
 * daily reports, cache warming, or periodic data processing.
 */
var cleanupExpiredTodos_js_1 = require("./scheduled/cleanupExpiredTodos.js");
Object.defineProperty(exports, "cleanupExpiredTodos", { enumerable: true, get: function () { return cleanupExpiredTodos_js_1.cleanupExpiredTodos; } });
Object.defineProperty(exports, "manualCleanupExpiredTodos", { enumerable: true, get: function () { return cleanupExpiredTodos_js_1.manualCleanupExpiredTodos; } });
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
 * - coding_docs/FUNCTIONS_PLACEMENT.md - Complete architecture guide
 * - apps/df-firebase-teaching-app/README.md - App-specific documentation
 * - OUT_OF_SCOPE/FIREBASE_TEACHING_APP_ROADMAP.md - Ticket 9 details
 */
