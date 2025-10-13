/**
 * Firestore Trigger: onTodoCreated
 *
 * Demonstrates a Firestore onCreate trigger that:
 * - Fires when a new document is created in the 'todos' collection
 * - Accesses document data
 * - Performs side effects (logging, notifications, etc.)
 * - Updates related collections
 *
 * This is an APP-SPECIFIC trigger for the teaching app's todo functionality.
 *
 * In a real application, this might:
 * - Send notifications to users
 * - Update analytics/metrics
 * - Trigger webhooks
 * - Sync to external systems
 */
import * as functions from 'firebase-functions/v2';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
/**
 * Trigger that fires when a new todo is created.
 *
 * Actions performed:
 * 1. Log the creation event
 * 2. Update user's todo count (if createdBy field exists)
 * 3. Add to activity log
 * 4. Calculate and store word count for analytics
 */
export const onTodoCreated = functions.firestore.onDocumentCreated({
    document: 'todos/{todoId}',
    region: 'us-central1',
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        functions.logger.warn('No data in onCreate event');
        return;
    }
    const todoId = event.params.todoId;
    const todoData = snapshot.data();
    functions.logger.info('Todo created', {
        todoId,
        title: todoData.title,
        priority: todoData.priority,
        createdBy: todoData.createdBy || 'anonymous',
    });
    const db = getFirestore();
    try {
        // 1. Calculate analytics (word counts for reporting)
        const titleWords = todoData.title ? todoData.title.trim().split(/\s+/).length : 0;
        const descriptionWords = todoData.description ? todoData.description.trim().split(/\s+/).length : 0;
        const totalWords = titleWords + descriptionWords;
        // 2. Update or create analytics document
        const analyticsRef = db.collection('todoAnalytics').doc('summary');
        await analyticsRef.set({
            totalTodos: FieldValue.increment(1),
            totalWords: FieldValue.increment(totalWords),
            lastCreated: todoData.createdAt || FieldValue.serverTimestamp(),
            priorityCounts: {
                [todoData.priority || 'medium']: FieldValue.increment(1),
            },
        }, { merge: true });
        // 3. If user is authenticated, update their personal stats
        if (todoData.createdBy) {
            const userStatsRef = db.collection('userStats').doc(todoData.createdBy);
            await userStatsRef.set({
                todoCount: FieldValue.increment(1),
                lastActivity: todoData.createdAt || FieldValue.serverTimestamp(),
                todosCreated: FieldValue.arrayUnion(todoId),
            }, { merge: true });
            functions.logger.info('User stats updated', {
                userId: todoData.createdBy,
                todoId,
            });
        }
        // 4. Add to activity log (for teaching/demo purposes)
        const activityRef = db.collection('activity').doc();
        await activityRef.set({
            type: 'todo_created',
            todoId,
            title: todoData.title,
            priority: todoData.priority,
            createdBy: todoData.createdBy || 'anonymous',
            timestamp: FieldValue.serverTimestamp(),
            metadata: {
                titleWords,
                descriptionWords,
                tagCount: todoData.tags?.length || 0,
                hasDueDate: !!todoData.dueDate,
            },
        });
        functions.logger.info('Todo creation processing complete', {
            todoId,
            analyticsUpdated: true,
            activityLogged: true,
        });
    }
    catch (error) {
        // Don't throw - we don't want to retry on error
        // Just log it and let the todo creation succeed
        functions.logger.error('Failed to process todo creation', {
            error,
            todoId,
        });
    }
});
/**
 * Trigger that fires when a todo is updated.
 *
 * Demonstrates:
 * - Accessing both before and after snapshots
 * - Detecting specific field changes
 * - Conditional processing
 */
export const onTodoUpdated = functions.firestore.onDocumentUpdated({
    document: 'todos/{todoId}',
    region: 'us-central1',
}, async (event) => {
    const beforeSnapshot = event.data?.before;
    const afterSnapshot = event.data?.after;
    if (!beforeSnapshot || !afterSnapshot) {
        functions.logger.warn('Missing snapshot data in update event');
        return;
    }
    const todoId = event.params.todoId;
    const before = beforeSnapshot.data();
    const after = afterSnapshot.data();
    // Log what changed
    const changes = [];
    if (before.completed !== after.completed) {
        changes.push(`completed: ${before.completed} → ${after.completed}`);
    }
    if (before.priority !== after.priority) {
        changes.push(`priority: ${before.priority} → ${after.priority}`);
    }
    if (before.title !== after.title) {
        changes.push('title changed');
    }
    functions.logger.info('Todo updated', {
        todoId,
        changes,
    });
    // If todo was marked as completed, update analytics
    if (!before.completed && after.completed) {
        const db = getFirestore();
        try {
            const analyticsRef = db.collection('todoAnalytics').doc('summary');
            await analyticsRef.set({
                completedTodos: FieldValue.increment(1),
                lastCompleted: after.updatedAt || FieldValue.serverTimestamp(),
            }, { merge: true });
            functions.logger.info('Todo completion recorded', { todoId });
        }
        catch (error) {
            functions.logger.error('Failed to record todo completion', { error, todoId });
        }
    }
});
/**
 * Trigger that fires when a todo is deleted.
 *
 * Demonstrates:
 * - Cleanup operations
 * - Decrementing counters
 */
export const onTodoDeleted = functions.firestore.onDocumentDeleted({
    document: 'todos/{todoId}',
    region: 'us-central1',
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        functions.logger.warn('No data in delete event');
        return;
    }
    const todoId = event.params.todoId;
    const todoData = snapshot.data();
    functions.logger.info('Todo deleted', {
        todoId,
        title: todoData.title,
        wasCompleted: todoData.completed,
    });
    const db = getFirestore();
    try {
        // Update analytics
        const analyticsRef = db.collection('todoAnalytics').doc('summary');
        const decrements = {
            totalTodos: FieldValue.increment(-1),
        };
        if (todoData.completed) {
            decrements.completedTodos = FieldValue.increment(-1);
        }
        await analyticsRef.set(decrements, { merge: true });
        // Update user stats if applicable
        if (todoData.createdBy) {
            const userStatsRef = db.collection('userStats').doc(todoData.createdBy);
            await userStatsRef.set({
                todoCount: FieldValue.increment(-1),
                todosCreated: FieldValue.arrayRemove(todoId),
            }, { merge: true });
        }
        functions.logger.info('Todo deletion processing complete', { todoId });
    }
    catch (error) {
        functions.logger.error('Failed to process todo deletion', { error, todoId });
    }
});
