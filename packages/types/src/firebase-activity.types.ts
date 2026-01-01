import type {FirestoreDocument} from './firebase-firestore.types.js';

/**
 * Activity type identifier (now dynamic, loaded from user's activity types).
 * Previously this was a hardcoded union type, but now users create their own
 * activity types via the df-activity-types-crud component.
 */
export type ActivityType = string;

/** Activity entry persisted inside the per-user activity collection. */
export interface ActivityEntry extends FirestoreDocument {
  /** Type of activity performed. */
  activityType: ActivityType;
  /** Value recorded (count or seconds depending on activity type). */
  value: number;
  /** Optional user-provided note about the effort. */
  note: string | null;
  /** When the activity was performed. */
  recordedAt: Date | null;
  /** Creation timestamp for auditing. */
  createdAt: Date | null;
  /** Last update timestamp for auditing. */
  updatedAt: Date | null;
  /** Owner identifier, mirrors the Firebase Auth UID. */
  ownerId: string;
}

/** Payload accepted by the UI before persisting to Firestore. */
export interface ActivityDraft {
  activityType: ActivityType;
  value: number;
  note?: string | null;
  recordedAt?: Date | null;
}

/** Activity type configuration persisted per user. */
export interface ActivityTypeDocument extends FirestoreDocument {
  typeName: string;
  unit: string;
  defaultNumber: number;
  order: number;
  createdAt: Date | null;
  updatedAt: Date | null;
  ownerId: string;
  /** Managed internally for ordering. */
  typeNameLower?: string;
}

export interface ActivityTypeDraft {
  typeName: string;
  unit: string;
  defaultNumber: number;
  order: number;
}
