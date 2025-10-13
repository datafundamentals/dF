import type {QueryConstraint} from 'firebase/firestore';

/**
 * Shared Firestore document shape used by teaching stores. Concrete document
 * interfaces should extend this to ensure an `id` field is always present in
 * consumer-facing data.
 */
export interface FirestoreDocument {
  id: string;
  [key: string]: unknown;
}

/**
 * Internal representation of Firestore document data prior to attaching the
 * generated document id.
 */
export type FirestoreDocumentData<T extends FirestoreDocument> = Omit<T, 'id'>;

/**
 * Supported loading states for Firestore collection stores.
 */
export type FirestoreRequestState = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Reactive state returned by the Firestore base store. Additional store
 * implementations may extend this interface to expose domain-specific data.
 */
export interface FirestoreCollectionState<T extends FirestoreDocument> {
  /** Current request lifecycle status. */
  status: FirestoreRequestState;
  /** Documents for the active page/query. */
  documents: readonly T[];
  /** Details about the last failure, if any. */
  error: string | null;
  /** Indicates whether a real-time listener is currently active. */
  isListening: boolean;
  /** Time the state last updated, expressed as epoch milliseconds. */
  lastUpdated: number | null;
  /** 1-based page index for UI display. */
  currentPage: number;
  /** Number of documents requested per page. */
  pageSize: number;
  /** Whether additional pages exist after the current one. */
  hasNextPage: boolean;
  /** Whether a page exists before the current one. */
  hasPreviousPage: boolean;
  /** Human-readable description of the active query/filter set. */
  queryDescription: string | null;
}

/**
 * Configuration passed to Firestore collection stores.
 */
export interface FirestoreCollectionConfig<T extends FirestoreDocument> {
  /** Default query constraints (ordering, where clauses, etc.). */
  defaultConstraints?: QueryConstraint[];
  /** Initial description surfaced to the UI for the default query. */
  defaultQueryDescription?: string | null;
  /** Default page size when pagination is enabled. */
  pageSize?: number;
  /** Optional post-processing hook for documents returned from Firestore. */
  mapDocument?: (input: T) => T;
}

/**
 * Optional hooks for transforming create/update payloads before they are sent
 * to Firestore. Useful for injecting timestamps or other derived metadata.
 */
export interface FirestoreMutationTransforms<T extends FirestoreDocument> {
  /**
   * Mutate the data used for `create()` operations. Should return the final
   * payload that will be persisted to Firestore (without an `id` field).
   */
  transformCreate?: (input: FirestoreDocumentData<T>) => Record<string, unknown>;
  /**
   * Mutate the data used for `update()` operations. Return value is merged into
   * the existing document.
   */
  transformUpdate?: (input: Partial<FirestoreDocumentData<T>>) => Record<string, unknown>;
}
