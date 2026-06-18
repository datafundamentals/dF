import type {FirestoreDocument} from './firebase-firestore.types.js';

export interface Attachment {
  url: string;
  name: string;
  /** Firebase storage path for deletion tracking */
  path: string;
  uploadedAt: Date;
}

/**
 * Normalized Agentic message used by UI components. Timestamps are converted
 * to native `Date` instances for ergonomic rendering and comparisons.
 */
export interface AgenticMessage extends FirestoreDocument {
  /** Identifies the author of the message. */
  role: 'user' | 'assistant';
  /** Message content as plain text. */
  content: string;
  /** Time the message was created, expressed as a local Date where available. */
  createdAt: Date | null;
  /** The session this message belongs to. */
  sessionId: string;
  /** Lifecycle status of this message in the Firebase Function bridge. */
  status: 'pending' | 'processing' | 'complete' | 'error';
}

/**
 * Lifecycle status for Agentic message submissions from the client perspective.
 */
export type AgenticSendStatus = 'idle' | 'sending' | 'error';
export type AgenticDeleteStatus = 'idle' | 'deleting' | 'error';

export type AgenticConversationStatus = 'active' | 'accepted';

export interface AgenticConversation extends FirestoreDocument {
  userId: string;
  agentId: string;
  title: string | null;
  status: AgenticConversationStatus;
  createdAt: Date | null;
  lastMessageAt: Date | null;
  workRequestMarkdown?: string;
  attachments?: Attachment[];
}
