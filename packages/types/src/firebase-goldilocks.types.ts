import type {FirestoreDocument} from './firebase-firestore.types.js';

/**
 * Goldilocks type configuration persisted per user.
 * Defines the three options where users "pick 2" to create a Venn diagram.
 */
export interface GoldilocksTypeDocument extends FirestoreDocument {
  /** Name of this goldilocks type (e.g., "Project Management Tradeoffs"). */
  name: string;
  /** First option label (e.g., "Fast"). */
  first: string;
  /** Second option label (e.g., "Cheap"). */
  second: string;
  /** Third option label (e.g., "Good"). */
  third: string;
  /** Creation timestamp for auditing. */
  createdAt: Date | null;
  /** Last update timestamp for auditing. */
  updatedAt: Date | null;
  /** Owner identifier, mirrors the Firebase Auth UID. */
  ownerId: string;
  /** Managed internally for ordering/searching. */
  nameLower?: string;
}

/** Payload accepted by the UI before persisting to Firestore. */
export interface GoldilocksTypeDraft {
  name: string;
  first: string;
  second: string;
  third: string;
}

/**
 * A saved goldilocks configuration entry.
 * Records which type was used and which 2 options were selected.
 */
export interface GoldilocksConfigurationEntry extends FirestoreDocument {
  /** Reference to the goldilocks type name. */
  goldilocksTypeName: string;
  /** The three option labels from the type at time of save. */
  first: string;
  second: string;
  third: string;
  /** Array of exactly 2 selected option names (e.g., ["Fast", "Cheap"]). */
  selectedOptions: [string, string];
  /** Optional user note about this configuration. */
  note: string | null;
  /** Creation timestamp for auditing. */
  createdAt: Date | null;
  /** Last update timestamp for auditing. */
  updatedAt: Date | null;
  /** Owner identifier, mirrors the Firebase Auth UID. */
  ownerId: string;
}

/** Payload accepted by the UI before persisting a configuration. */
export interface GoldilocksConfigurationDraft {
  goldilocksTypeName: string;
  first: string;
  second: string;
  third: string;
  selectedOptions: [string, string];
  note?: string | null;
}
