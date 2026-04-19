import type {FirestoreDocument} from './firebase-firestore.types.js';

/**
 * Normalized OpenClaw message used by UI components. Timestamps are converted
 * to native `Date` instances for ergonomic rendering and comparisons.
 */
export interface OpenclawMessage extends FirestoreDocument {
  /** Identifies the author of the message. */
  role: 'user' | 'assistant';
  /** Message content as plain text. */
  content: string;
  /** Time the message was created, expressed as a local Date where available. */
  createdAt: Date | null;
  /** The session this message belongs to. */
  sessionId: string;
  /** Lifecycle status of this message in the Firebase Function bridge. */
  status: 'pending' | 'processing' | 'complete';
}

/**
 * Lifecycle status for OpenClaw message submissions from the client perspective.
 */
export type OpenclawSendStatus = 'idle' | 'sending' | 'error';
