/**
 * Callable Function: createTodoAdvanced
 *
 * Demonstrates a callable function that:
 * - Validates authentication
 * - Accepts typed parameters from @df/types
 * - Enriches data with server-side logic
 * - Returns typed response
 * - Includes comprehensive error handling
 *
 * This is an APP-SPECIFIC function that lives in apps/df-firebase-teaching-app/functions/
 * because it's specific to the teaching app's todo functionality.
 *
 * For SHARED functions used by multiple apps, see services/firebase-functions-shared/
 * and reference guides/FUNCTIONS_PLACEMENT.md
 */

import * as functions from 'firebase-functions/v2';
import {getFirestore, Timestamp} from 'firebase-admin/firestore';
import type {TodoPriority} from '../types/bundled.js';

// TodoDraft not in bundled types, define locally
interface TodoDraft {
  title: string;
  description: string;
  priority?: TodoPriority;
  tags?: string[];
  dueDate?: string | null;
}

/** Request payload for creating an advanced todo */
export interface CreateTodoAdvancedRequest {
  title: string;
  description: string;
  priority?: TodoPriority;
  tags?: string[];
  dueDate?: string | null; // ISO string
}

/** Response from creating an advanced todo */
export interface CreateTodoAdvancedResponse {
  id: string;
  estimatedMinutes: number;
  urgencyScore: number;
  createdAt: string; // ISO string
}

/**
 * Estimates effort in minutes based on title and description length
 * This is example app-specific business logic
 */
function estimateEffort(title: string, description: string): number {
  const titleWords = title.trim().split(/\s+/).length;
  const descriptionWords = description.trim().split(/\s+/).length;

  // Simple heuristic: 5 minutes per word in title, 2 minutes per word in description
  const baseMinutes = (titleWords * 5) + (descriptionWords * 2);

  // Minimum 15 minutes, maximum 480 minutes (8 hours)
  return Math.min(Math.max(baseMinutes, 15), 480);
}

/**
 * Calculates urgency score based on priority and due date
 * Returns a score from 0-100
 */
function calculateUrgencyScore(priority: TodoPriority, dueDate: Date | null): number {
  // Base score from priority
  const priorityScores: Record<TodoPriority, number> = {
    high: 60,
    medium: 40,
    low: 20,
  };

  let score = priorityScores[priority];

  // Add urgency based on due date
  if (dueDate) {
    const daysUntilDue = (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);

    if (daysUntilDue < 1) {
      score += 40; // Due today or overdue
    } else if (daysUntilDue < 3) {
      score += 30; // Due within 3 days
    } else if (daysUntilDue < 7) {
      score += 20; // Due within a week
    } else {
      score += 10; // Due later
    }
  }

  return Math.min(score, 100); // Cap at 100
}

/**
 * Validates todo title follows best practices
 */
function validateTitle(title: string): void {
  const trimmed = title.trim();

  if (trimmed.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Title cannot be empty');
  }

  if (trimmed.length > 200) {
    throw new functions.https.HttpsError('invalid-argument', 'Title must be 200 characters or less');
  }

  // Encourage action-oriented titles
  const actionVerbs = ['create', 'update', 'delete', 'add', 'remove', 'fix', 'implement', 'refactor', 'test', 'document'];
  const startsWithActionVerb = actionVerbs.some(verb =>
    trimmed.toLowerCase().startsWith(verb)
  );

  if (!startsWithActionVerb) {
    functions.logger.info('Title could be more action-oriented', {title: trimmed});
  }
}

/**
 * Creates an enriched todo with server-side validation and calculated fields.
 *
 * This function demonstrates:
 * - Authentication requirement
 * - Input validation
 * - Server-side business logic (effort estimation, urgency scoring)
 * - Firestore writes from functions
 * - Typed request/response
 */
export const createTodoAdvanced = functions.https.onCall<
  CreateTodoAdvancedRequest,
  Promise<CreateTodoAdvancedResponse>
>({
  region: 'us-central1',
  cors: [
    'http://127.0.0.1:4176',
    'http://localhost:4176',
    'https://peg-2035.web.app',
    'https://peg-2035.firebaseapp.com',
  ],
}, async (request) => {
  // 1. Verify authentication
  if (!request.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create todos'
    );
  }

  const userId = request.auth.uid;
  functions.logger.info('Creating advanced todo', {userId, title: request.data.title});

  // 2. Extract and validate data
  const {
    title,
    description = '',
    priority = 'medium',
    tags = [],
    dueDate = null,
  } = request.data;

  validateTitle(title);

  // Validate priority
  const validPriorities: TodoPriority[] = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      `Priority must be one of: ${validPriorities.join(', ')}`
    );
  }

  // Parse due date if provided
  let parsedDueDate: Date | null = null;
  if (dueDate) {
    try {
      parsedDueDate = new Date(dueDate);
      if (isNaN(parsedDueDate.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Due date must be a valid ISO date string'
      );
    }
  }

  // 3. Calculate enriched fields (server-side business logic)
  const estimatedMinutes = estimateEffort(title, description);
  const urgencyScore = calculateUrgencyScore(priority, parsedDueDate);
  const now = new Date();

  // 4. Create Firestore document
  const db = getFirestore();
  const todosCollection = db.collection('todos');

  const todoData = {
    title: title.trim(),
    titleLower: title.trim().toLowerCase(), // For case-insensitive search
    description: description.trim(),
    completed: false,
    priority,
    tags,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
    dueDate: parsedDueDate ? Timestamp.fromDate(parsedDueDate) : null,
    // Enriched fields (app-specific)
    estimatedMinutes,
    urgencyScore,
    createdBy: userId,
  };

  try {
    const docRef = await todosCollection.add(todoData);

    functions.logger.info('Todo created successfully', {
      id: docRef.id,
      userId,
      urgencyScore,
      estimatedMinutes,
    });

    return {
      id: docRef.id,
      estimatedMinutes,
      urgencyScore,
      createdAt: now.toISOString(),
    };
  } catch (error) {
    functions.logger.error('Failed to create todo', {error, userId});
    throw new functions.https.HttpsError(
      'internal',
      'Failed to create todo. Please try again.'
    );
  }
});
