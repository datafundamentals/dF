import type {Timestamp} from 'firebase/firestore';
import type {FirestoreDocument} from './firebase-firestore.types.js';

/**
 * Normalized chat message used by UI components. Timestamps are converted to
 * native `Date` instances for ergonomic rendering and comparisons.
 */
export interface ChatMessage extends FirestoreDocument {
  /** Unique identifier for the authenticated user that authored the message. */
  userId: string;
  /** Display name sourced from Firebase Auth (falls back to email). */
  userDisplayName: string;
  /** Optional photo URL for the user; null when unavailable. */
  userPhotoURL: string | null;
  /** Message content as plain text. Markdown/HTML is intentionally unsupported. */
  text: string;
  /** Time the message was created, expressed as a local Date where available. */
  createdAt: Date | null;
}

/**
 * Draft payload accepted by the chat store when creating a message.
 */
export interface ChatMessageDraft {
  /** Raw message body authored by the current user. */
  text: string;
}

/**
 * Firestore representation of the chat message. Timestamps remain as
 * `Timestamp` objects for accurate persistence.
 */
export interface ChatMessageFirestoreData {
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  text: string;
  createdAt: Timestamp | null;
}

/**
 * Lifecycle status for chat message submissions.
 */
export type ChatSendStatus = 'idle' | 'sending' | 'error';
