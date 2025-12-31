import type {FirestoreDocument} from './firebase-firestore.types.js';

/** Supported exercise types in the activity log. */
export type ExerciseType = 'pushups' | 'squats' | 'plank' | 'dumbbells' | 'bands' | 'hang';

/** Unit of measurement for each exercise type. */
export type ExerciseUnit = 'count' | 'seconds';

/** Configuration for each exercise type. */
export interface ExerciseTypeConfig {
  label: string;
  unit: ExerciseUnit;
  description: string;
}

/** Exercise type configurations. */
export const EXERCISE_TYPE_CONFIG: Record<ExerciseType, ExerciseTypeConfig> = {
  pushups: {
    label: 'Pushups',
    unit: 'count',
    description: 'Count of pushups completed',
  },
  squats: {
    label: 'Squats',
    unit: 'seconds',
    description: 'Duration in seconds',
  },
  plank: {
    label: 'Plank',
    unit: 'seconds',
    description: 'Hold duration in seconds',
  },
  dumbbells: {
    label: 'Dumbbells',
    unit: 'count',
    description: 'Count of reps completed',
  },
  bands: {
    label: 'Bands',
    unit: 'seconds',
    description: 'Pull duration in seconds',
  },
  hang: {
    label: 'Hang',
    unit: 'seconds',
    description: 'Hold duration in seconds',
  },
};

/** Exercise entry persisted inside the per-user activity collection. */
export interface ExerciseEntry extends FirestoreDocument {
  /** Type of exercise performed. */
  exerciseType: ExerciseType;
  /** Value recorded (count or seconds depending on exercise type). */
  value: number;
  /** Optional user-provided note about the effort. */
  note: string | null;
  /** When the exercise was performed. */
  recordedAt: Date | null;
  /** Creation timestamp for auditing. */
  createdAt: Date | null;
  /** Last update timestamp for auditing. */
  updatedAt: Date | null;
  /** Owner identifier, mirrors the Firebase Auth UID. */
  ownerId: string;
}

/** Payload accepted by the UI before persisting to Firestore. */
export interface ExerciseDraft {
  exerciseType: ExerciseType;
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

/** Backward compatibility: Pushup entry is now an exercise entry. */
export type PushupEntry = ExerciseEntry;

/** Backward compatibility: Pushup draft is now an exercise draft. */
export interface PushupDraft {
  count: number;
  note?: string | null;
  recordedAt?: Date | null;
}
