"use strict";
/**
 * Scheduled Function: cleanupExpiredTodos
 *
 * Demonstrates a scheduled function that:
 * - Runs on a cron schedule (daily at 2:00 AM)
 * - Queries Firestore for expired data
 * - Performs batch deletions
 * - Logs metrics for monitoring
 *
 * This is an APP-SPECIFIC scheduled function for the teaching app.
 *
 * In a real application, scheduled functions are commonly used for:
 * - Data cleanup/archival
 * - Daily reports
 * - Cache warming
 * - Periodic syncs with external systems
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualCleanupExpiredTodos = exports.cleanupExpiredTodos = void 0;
const functions = __importStar(require("firebase-functions/v2"));
const firestore_1 = require("firebase-admin/firestore");
/**
 * Runs daily at 2:00 AM UTC to clean up expired todos.
 *
 * Cleanup criteria:
 * - Todo is marked as completed
 * - Todo was completed more than 30 days ago
 *
 * This demonstrates:
 * - Cron scheduling
 * - Batch queries
 * - Batch deletions
 * - Metric logging
 */
exports.cleanupExpiredTodos = functions.scheduler.onSchedule({
    schedule: '0 2 * * *', // Every day at 2:00 AM UTC
    timeZone: 'UTC',
    region: 'us-central1',
    retryCount: 2, // Retry up to 2 times if function fails
    timeoutSeconds: 540, // 9 minutes (max for scheduled functions)
}, async (event) => {
    functions.logger.info('Starting expired todos cleanup', {
        timestamp: event.scheduleTime,
    });
    const db = (0, firestore_1.getFirestore)();
    // Calculate cutoff date (30 days ago)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffTimestamp = firestore_1.Timestamp.fromDate(thirtyDaysAgo);
    functions.logger.info('Cleanup cutoff date', {
        cutoffDate: thirtyDaysAgo.toISOString(),
    });
    try {
        // Query for completed todos older than 30 days
        const expiredTodosQuery = db.collection('todos')
            .where('completed', '==', true)
            .where('updatedAt', '<', cutoffTimestamp)
            .limit(500); // Process in batches of 500
        const snapshot = await expiredTodosQuery.get();
        if (snapshot.empty) {
            functions.logger.info('No expired todos found');
            return;
        }
        functions.logger.info('Found expired todos', { count: snapshot.size });
        // Delete in batches (Firestore has limit of 500 writes per batch)
        const batch = db.batch();
        const deletedIds = [];
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
            deletedIds.push(doc.id);
        });
        // Commit the batch delete
        await batch.commit();
        functions.logger.info('Expired todos deleted', {
            count: deletedIds.length,
            ids: deletedIds.slice(0, 10), // Log first 10 IDs
        });
        // Update cleanup metrics
        const metricsRef = db.collection('systemMetrics').doc('cleanup');
        await metricsRef.set({
            lastCleanup: firestore_1.FieldValue.serverTimestamp(),
            totalTodosDeleted: firestore_1.FieldValue.increment(deletedIds.length),
            lastCleanupCount: deletedIds.length,
            cleanupHistory: firestore_1.FieldValue.arrayUnion({
                timestamp: new Date().toISOString(),
                count: deletedIds.length,
            }),
        }, { merge: true });
        functions.logger.info('Cleanup complete', {
            deleted: deletedIds.length,
            message: `Successfully deleted ${deletedIds.length} expired todos`,
        });
    }
    catch (error) {
        functions.logger.error('Cleanup failed', { error });
        // Log failure metric
        try {
            const metricsRef = db.collection('systemMetrics').doc('cleanup');
            await metricsRef.set({
                lastFailure: firestore_1.FieldValue.serverTimestamp(),
                failureCount: firestore_1.FieldValue.increment(1),
            }, { merge: true });
        }
        catch (metricsError) {
            functions.logger.error('Failed to log cleanup failure', { metricsError });
        }
        throw error; // Re-throw to trigger retry
    }
});
/**
 * Manual cleanup trigger (callable function for admins).
 *
 * Allows admins to manually trigger cleanup without waiting for schedule.
 * Demonstrates auth-based access control for administrative functions.
 */
exports.manualCleanupExpiredTodos = functions.https.onCall({
    region: 'us-central1',
}, async (request) => {
    // Verify authentication
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated to trigger manual cleanup');
    }
    // In a real app, verify admin role
    // For teaching purposes, we allow any authenticated user
    const isAdmin = true; // In production: check custom claims or admin collection
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can trigger manual cleanup');
    }
    functions.logger.info('Manual cleanup triggered', {
        userId: request.auth.uid,
        daysOld: request.data?.daysOld || 30,
    });
    const db = (0, firestore_1.getFirestore)();
    const daysOld = request.data?.daysOld || 30;
    if (daysOld < 1 || daysOld > 365) {
        throw new functions.https.HttpsError('invalid-argument', 'daysOld must be between 1 and 365');
    }
    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffTimestamp = firestore_1.Timestamp.fromDate(cutoffDate);
    try {
        // Query for old completed todos
        const expiredTodosQuery = db.collection('todos')
            .where('completed', '==', true)
            .where('updatedAt', '<', cutoffTimestamp)
            .limit(500);
        const snapshot = await expiredTodosQuery.get();
        if (snapshot.empty) {
            return {
                deleted: 0,
                message: 'No expired todos found',
            };
        }
        // Delete in batch
        const batch = db.batch();
        const deletedIds = [];
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
            deletedIds.push(doc.id);
        });
        await batch.commit();
        functions.logger.info('Manual cleanup completed', {
            count: deletedIds.length,
            triggeredBy: request.auth.uid,
        });
        return {
            deleted: deletedIds.length,
            message: `Successfully deleted ${deletedIds.length} todos older than ${daysOld} days`,
        };
    }
    catch (error) {
        functions.logger.error('Manual cleanup failed', { error });
        throw new functions.https.HttpsError('internal', 'Cleanup failed. Please try again.');
    }
});
