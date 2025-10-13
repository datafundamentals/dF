import type {FirestoreDocument} from './firebase-firestore.types.js';
import type {Timestamp} from 'firebase/firestore';

export type TodoPriority = 'low' | 'medium' | 'high';

/**
 * Domain model used by UI components and demos. Dates are represented as
 * JavaScript `Date` objects (or `null` when unset) for ergonomics.
 */
export interface TodoDocument extends FirestoreDocument {
  title: string;
  description: string;
  completed: boolean;
  priority: TodoPriority;
  tags: string[];
  createdAt: Date | null;
  updatedAt: Date | null;
  dueDate: Date | null;
  /** Managed internally for search queries. */
  titleLower?: string;
}

/**
 * Firestore storage representation of a todo document. Timestamps remain as
 * native Firestore `Timestamp` values for accurate persistence.
 */
export interface TodoFirestoreData {
  title: string;
  titleLower: string;
  description: string;
  completed: boolean;
  priority: TodoPriority;
  tags: string[];
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  dueDate: Timestamp | null;
  [key: string]: unknown;
}

export interface TodoDraft {
  title: string;
  description: string;
  priority: TodoPriority;
  tags: string[];
  dueDate: Date | null;
}

export interface TodoFilterState {
  showCompleted: boolean;
  priority: TodoPriority | 'all';
  tag: string | 'all';
  search: string;
}
