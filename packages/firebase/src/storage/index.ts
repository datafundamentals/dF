import type {FirebaseApp} from 'firebase/app';
import {
  connectStorageEmulator,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  type FirebaseStorage,
  type StorageReference,
  type UploadMetadata,
  type UploadResult,
} from 'firebase/storage';

import type {EmulatorHostConfig} from '@df/types/firebase.types';
import {getEmulatorHost, getEmulatorPort} from '../emulator-detection.js';

const connectedInstances = new WeakSet<FirebaseStorage>();

/** Returns the Storage instance associated with the Firebase app. */
export function getFirebaseStorage(app: FirebaseApp): FirebaseStorage {
  return getStorage(app);
}

/** Connects Storage to the emulator once. */
export function connectStorageToEmulator(storage: FirebaseStorage, config: EmulatorHostConfig): void {
  if (connectedInstances.has(storage)) {
    return;
  }

  connectStorageEmulator(storage, getEmulatorHost(config), getEmulatorPort(config));
  connectedInstances.add(storage);
}

/** Convenience helper to create a storage reference from a path. */
export function createStorageRef(storage: FirebaseStorage, path: string): StorageReference {
  return ref(storage, path);
}

/**
 * Uploads a blob or file buffer to the provided storage reference with optional
 * metadata. Returns the resulting download URL for quick chaining.
 */
export async function uploadAndGetUrl(
  reference: StorageReference,
  data: Blob | Uint8Array | ArrayBuffer,
  metadata?: UploadMetadata
): Promise<{result: UploadResult; downloadUrl: string}> {
  const result = await uploadBytes(reference, data, metadata);
  const downloadUrl = await getDownloadURL(reference);
  return {result, downloadUrl};
}

export type {FirebaseStorage, StorageReference, UploadMetadata, UploadResult};
