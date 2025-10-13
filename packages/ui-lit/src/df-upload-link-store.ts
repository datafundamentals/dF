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

/**
 * Upload a file to Firebase Storage with real-time progress tracking
 *
 * @param uploadIdentifier - Identifier for organizing uploads (e.g., "page|type")
 * @returns Promise that resolves to the download URL of the uploaded file
 *
 * @example
 * ```typescript
 * fileToUpload.set(selectedFile);
 * const downloadUrl = await uploadFileTask('gallery|image');
 * ```
 */
export async function uploadFileTask(uploadIdentifier: string): Promise<string> {
  const file = fileToUpload.get();
  if (!file) {
    throw new Error('No file to upload');
  }

  return new Promise((resolve, reject) => {
    try {
      const storage = getStorageInstance();

      // Generate storage path: uploads/{uploadIdentifier}/{timestamp}_{filename}
      const timestamp = Date.now();
      const sanitizedIdentifier = uploadIdentifier.replace(/\|/g, '/');
      const storagePath = `uploads/${sanitizedIdentifier}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, storagePath);

      // Start upload with resumable task for progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          // Track progress: 0 to 1 (0% to 100%)
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          // Show progress slightly ahead (legacy behavior: always 10% high vs never showing)
          fileUploadProgress.set(progress === 1 ? 0 : Math.min(progress + 0.1, 1));
        },
        (error: Error) => {
          console.error('[df-upload-link-store] Upload failed:', error);
          fileUploadProgress.set(0);
          reject(error);
        },
        async () => {
          try {
            // Upload complete - get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            fileUploadProgress.set(0); // Reset progress
            resolve(downloadURL);
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