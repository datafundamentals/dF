import type {FirebaseApp} from 'firebase/app';
import {
  connectFirestoreEmulator,
  collection,
  doc,
  getFirestore,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type Firestore,
  type FirestoreDataConverter,
  type Query,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from 'firebase/firestore';

import type {EmulatorHostConfig} from '@df/types/firebase.types';
import {getEmulatorHost, getEmulatorPort} from '../emulator-detection.js';

const connectedInstances = new WeakSet<Firestore>();

/** Returns the Firestore instance associated with the Firebase app. */
export function getFirestoreDb(app: FirebaseApp): Firestore {
  return getFirestore(app);
}

/** Connects Firestore to the emulator host exactly once. */
export function connectFirestoreToEmulator(firestore: Firestore, config: EmulatorHostConfig): void {
  if (connectedInstances.has(firestore)) {
    return;
  }

  connectFirestoreEmulator(firestore, getEmulatorHost(config), getEmulatorPort(config));
  connectedInstances.add(firestore);
}

/**
 * Helper to create typed collection references without repeating generics at
 * every call site. Keeps teaching snippets concise.
 */
export function createCollection<T = DocumentData>(db: Firestore, path: string): CollectionReference<T> {
  return collection(db, path) as CollectionReference<T>;
}

/**
 * Helper to create typed document references.
 */
export function createDocument<T = DocumentData>(db: Firestore, path: string): DocumentReference<T> {
  return doc(db, path) as DocumentReference<T>;
}

/**
 * Builds a `FirestoreDataConverter` from simple serialize/deserialize lambdas.
 */
export function makeConverter<T>(config: {
  toFirestore(value: T): DocumentData;
  fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData>, options: SnapshotOptions): T;
}): FirestoreDataConverter<T> {
  return {
    toFirestore: config.toFirestore,
    fromFirestore: config.fromFirestore,
  };
}

export type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
  FirestoreDataConverter,
  Query,
  QueryDocumentSnapshot,
  SnapshotOptions,
};
