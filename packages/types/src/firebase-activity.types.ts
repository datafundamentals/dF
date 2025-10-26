import type {FirestoreDocument} from './firebase-firestore.types.js';

/** Pushup entry persisted inside the per-user activity collection. */
export interface PushupEntry extends FirestoreDocument {
  /** Total pushups completed for this entry. */
  count: number;
  /** Optional user-provided note about the effort. */
  note: string | null;
  /** When the pushups were performed. */
  recordedAt: Date | null;
  /** Creation timestamp for auditing. */
  createdAt: Date | null;
  /** Last update timestamp for auditing. */
  updatedAt: Date | null;
  /** Owner identifier, mirrors the Firebase Auth UID. */
  ownerId: string;
}

/** Payload accepted by the UI before persisting to Firestore. */
export interface PushupDraft {
  count: number;
  note?: string | null;
  recordedAt?: Date | null;
}

/** Lightweight stats derived from the current set of pushup documents. */
export interface PushupSummaryState {
  totalPushups: number;
  entryCount: number;
  lastEntryAt: Date | null;
}
