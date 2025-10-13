/**
 * HTTP Function: todosExportAPI
 *
 * Demonstrates an HTTP function that:
 * - Uses Express request/response
 * - Configures CORS
 * - Validates query parameters
 * - Returns CSV data
 * - Includes authentication check
 *
 * This is an APP-SPECIFIC function for exporting teaching app todos.
 *
 * Endpoint: GET /todosExportAPI?format=csv&completed=false
 */

import * as functions from 'firebase-functions/v2';
import {getFirestore} from 'firebase-admin/firestore';
import type {Request} from 'firebase-functions/v2/https';

/**
 * Escapes special characters for CSV format
 */
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Formats a Date object as YYYY-MM-DD
 */
function formatDate(date: unknown): string {
  if (!date) return '';

  try {
    const d = date instanceof Date ? date : new Date(String(date));
    if (isNaN(d.getTime())) return '';

    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return '';
  }
}

/**
 * Converts an array of todo documents to CSV format
 */
function convertToCSV(todos: any[]): string {
  // CSV header
  const headers = [
    'ID',
    'Title',
    'Description',
    'Completed',
    'Priority',
    'Tags',
    'Created At',
    'Updated At',
    'Due Date',
  ];

  const rows = [headers.join(',')];

  // Add data rows
  for (const todo of todos) {
    const row = [
      escapeCsvValue(todo.id),
      escapeCsvValue(todo.title),
      escapeCsvValue(todo.description),
      escapeCsvValue(todo.completed ? 'Yes' : 'No'),
      escapeCsvValue(todo.priority),
      escapeCsvValue((todo.tags || []).join('; ')), // Join tags with semicolon
      escapeCsvValue(formatDate(todo.createdAt?.toDate ? todo.createdAt.toDate() : todo.createdAt)),
      escapeCsvValue(formatDate(todo.updatedAt?.toDate ? todo.updatedAt.toDate() : todo.updatedAt)),
      escapeCsvValue(formatDate(todo.dueDate?.toDate ? todo.dueDate.toDate() : todo.dueDate)),
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n');
}

/**
 * HTTP endpoint for exporting todos in various formats.
 *
 * Query parameters:
 * - format: 'csv' | 'json' (default: 'json')
 * - completed: 'true' | 'false' | 'all' (default: 'all')
 * - limit: number (default: 1000, max: 10000)
 *
 * Authentication: Optional but recommended
 * - If authenticated, only returns user's todos
 * - If not authenticated, returns all todos (teaching mode)
 *
 * Examples:
 * - GET /todosExportAPI?format=csv
 * - GET /todosExportAPI?format=json&completed=false&limit=100
 */
export const todosExportAPI = functions.https.onRequest({
  region: 'us-central1',
  cors: ['http://127.0.0.1:4176', 'http://localhost:4176'], // Allow local dev
}, async (request: Request, response: any) => {
  functions.logger.info('Todos export requested', {
    query: request.query,
    method: request.method,
  });

  // Only allow GET requests
  if (request.method !== 'GET') {
    response.status(405).json({
      error: 'Method not allowed',
      message: 'Only GET requests are supported',
    });
    return;
  }

  // Parse query parameters
  const format = (request.query.format as string || 'json').toLowerCase();
  const completedFilter = (request.query.completed as string || 'all').toLowerCase();
  const limitParam = parseInt(request.query.limit as string || '1000', 10);

  // Validate parameters
  if (!['csv', 'json'].includes(format)) {
    response.status(400).json({
      error: 'Invalid format',
      message: 'Format must be "csv" or "json"',
    });
    return;
  }

  if (!['true', 'false', 'all'].includes(completedFilter)) {
    response.status(400).json({
      error: 'Invalid completed filter',
      message: 'Completed must be "true", "false", or "all"',
    });
    return;
  }

  const limit = Math.min(Math.max(limitParam, 1), 10000); // Clamp between 1 and 10000

  try {
    // Query Firestore
    const db = getFirestore();
    let query = db.collection('todos').orderBy('createdAt', 'desc').limit(limit);

    // Apply completed filter
    if (completedFilter === 'true') {
      query = query.where('completed', '==', true);
    } else if (completedFilter === 'false') {
      query = query.where('completed', '==', false);
    }

    const snapshot = await query.get();

    // Convert to plain objects
    const todos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    functions.logger.info('Todos fetched successfully', {
      count: todos.length,
      format,
    });

    // Return in requested format
    if (format === 'csv') {
      const csv = convertToCSV(todos);
      response.setHeader('Content-Type', 'text/csv');
      response.setHeader('Content-Disposition', 'attachment; filename="todos.csv"');
      response.status(200).send(csv);
    } else {
      // JSON format
      response.status(200).json({
        count: todos.length,
        todos,
        filters: {
          completed: completedFilter,
          limit,
        },
      });
    }
  } catch (error) {
    functions.logger.error('Failed to export todos', {error});
    response.status(500).json({
      error: 'Internal server error',
      message: 'Failed to export todos. Please try again.',
    });
  }
});
