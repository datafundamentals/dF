import {signal} from '@lit-labs/signals';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import {getStorageInstance} from '@df/state';

export const fileToUpload = signal<File | null>(null);
export const fileUploadProgress = signal<number>(0);

export interface UploadResult {
  downloadUrl: string;
  storagePath: string;
}

/**
 * Upload a file to Firebase Storage with real-time progress tracking.
 *
 * @param uploadIdentifier - Identifier for organizing uploads (e.g., "page|type" or a subpath)
 * @returns Promise resolving to `{ downloadUrl, storagePath }`
 */
export async function uploadFileTask(uploadIdentifier: string): Promise<UploadResult> {
  const file = fileToUpload.get();
  if (!file) {
    throw new Error('No file to upload');
  }

  return new Promise((resolve, reject) => {
    try {
      const storage = getStorageInstance();

      const timestamp = Date.now();
      const sanitizedIdentifier = uploadIdentifier.replace(/\|/g, '/');
      const storagePath = `uploads/${sanitizedIdentifier}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          fileUploadProgress.set(progress === 1 ? 0 : Math.min(progress + 0.1, 1));
        },
        (error: Error) => {
          console.error('[df-upload-link-store] Upload failed:', error);
          fileUploadProgress.set(0);
          reject(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            fileUploadProgress.set(0);
            resolve({downloadUrl, storagePath});
          } catch (error) {
            console.error('[df-upload-link-store] Failed to get download URL:', error);
            fileUploadProgress.set(0);
            reject(error);
          }
        }
      );
    } catch (error) {
      console.error('[df-upload-link-store] Upload initialization failed:', error);
      fileUploadProgress.set(0);
      reject(error);
    }
  });
}

/**
 * Clear upload state signals
 */
export function clearUploadObservables(): void {
  fileToUpload.set(null);
  fileUploadProgress.set(0);
}