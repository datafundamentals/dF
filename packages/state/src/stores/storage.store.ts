import {computed, signal} from '@lit-labs/signals';
import type {FirebaseApp} from 'firebase/app';
import {
  connectStorageEmulator,
  deleteObject,
  getDownloadURL,
  getMetadata,
  getStorage,
  list,
  ref,
  uploadBytesResumable,
  type FirebaseStorage,
  type ListResult,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import type {
  StorageFileMetadata,
  StorageUploadState,
  StorageUploadStatus,
} from '@df/types';

const STORAGE_HOST = '127.0.0.1';
const STORAGE_PORT = 9390;

// Signals for storage state
const uploadStateSignal = signal<StorageUploadStatus>('idle');
const uploadProgressSignal = signal<number>(0);
const uploadErrorSignal = signal<string | null>(null);
const uploadedFileSignal = signal<StorageFileMetadata | null>(null);

let storageInstance: FirebaseStorage | null = null;

/**
 * Computed signal for complete upload state
 */
export const storageUploadState = computed<StorageUploadState>(() => ({
  status: uploadStateSignal.get(),
  progress: uploadProgressSignal.get(),
  error: uploadErrorSignal.get(),
  uploadedFile: uploadedFileSignal.get(),
}));

/**
 * Initialize Firebase Storage with optional emulator connection
 */
export function initializeStorage(app: FirebaseApp, useEmulator: boolean): FirebaseStorage {
  if (storageInstance) {
    return storageInstance;
  }

  storageInstance = getStorage(app);

  if (useEmulator) {
    connectStorageEmulator(storageInstance, STORAGE_HOST, STORAGE_PORT);
  }

  return storageInstance;
}

/**
 * Get the initialized storage instance
 */
export function getStorageInstance(): FirebaseStorage {
  if (!storageInstance) {
    throw new Error('Storage not initialized. Call initializeStorage() first.');
  }
  return storageInstance;
}

/**
 * Upload a file to Firebase Storage with progress tracking
 * @param path - Storage path (e.g., 'uploads/images/photo.jpg')
 * @param file - File to upload
 * @param metadata - Optional file metadata
 * @returns Promise resolving to download URL
 */
export async function uploadFile(
  path: string,
  file: File,
  metadata?: {contentType?: string; customMetadata?: Record<string, string>}
): Promise<string> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);

  // Reset state
  uploadStateSignal.set('uploading');
  uploadProgressSignal.set(0);
  uploadErrorSignal.set(null);
  uploadedFileSignal.set(null);

  return new Promise<string>((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        // Progress tracking
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        uploadProgressSignal.set(progress);
      },
      (error) => {
        // Error handling
        uploadStateSignal.set('error');
        uploadErrorSignal.set(error.message);
        uploadProgressSignal.set(0);
        reject(error);
      },
      async () => {
        // Upload complete
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const fileMetadata: StorageFileMetadata = {
            name: file.name,
            path,
            downloadUrl,
            size: file.size,
            contentType: file.type || metadata?.contentType || 'application/octet-stream',
            uploadedAt: new Date(),
          };

          uploadStateSignal.set('complete');
          uploadedFileSignal.set(fileMetadata);
          uploadProgressSignal.set(100);

          resolve(downloadUrl);
        } catch (error) {
          uploadStateSignal.set('error');
          uploadErrorSignal.set(error instanceof Error ? error.message : 'Failed to get download URL');
          reject(error);
        }
      }
    );
  });
}

/**
 * Download/get URL for a file in storage
 * @param path - Storage path
 * @returns Promise resolving to download URL
 */
export async function getFileDownloadURL(path: string): Promise<string> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
}

/**
 * Delete a file from storage
 * @param path - Storage path
 */
export async function deleteFile(path: string): Promise<void> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * List files in a directory
 * @param path - Directory path (e.g., 'uploads/images')
 * @param maxResults - Maximum number of results (default 100)
 * @returns Promise resolving to list result
 */
export async function listFiles(path: string, maxResults: number = 100): Promise<ListResult> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  return await list(storageRef, {maxResults});
}

/**
 * List all files in a directory with metadata
 * @param path - Directory path
 * @returns Promise resolving to array of file metadata
 */
export async function listFilesWithMetadata(path: string): Promise<StorageFileMetadata[]> {
  const listResult = await listFiles(path);
  const filesWithMetadata: StorageFileMetadata[] = [];

  for (const itemRef of listResult.items) {
    try {
      const downloadUrl = await getDownloadURL(itemRef);
      const metadata = await getMetadata(itemRef);

      filesWithMetadata.push({
        name: itemRef.name,
        path: itemRef.fullPath,
        downloadUrl,
        size: metadata.size,
        contentType: metadata.contentType || 'application/octet-stream',
        uploadedAt: new Date(metadata.timeCreated),
      });
    } catch (error) {
      console.error(`Failed to get metadata for ${itemRef.fullPath}:`, error);
    }
  }

  return filesWithMetadata;
}

/**
 * Reset upload state to idle
 */
export function resetUploadState(): void {
  uploadStateSignal.set('idle');
  uploadProgressSignal.set(0);
  uploadErrorSignal.set(null);
  uploadedFileSignal.set(null);
}

/**
 * Validate file before upload
 * @param file - File to validate
 * @param options - Validation options
 * @returns Validation result with error message if invalid
 */
export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): {valid: boolean; error?: string} {
  const {maxSizeMB = 10, allowedTypes} = options;

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type if specified
  if (allowedTypes && allowedTypes.length > 0) {
    const fileType = file.type;
    const isAllowed = allowedTypes.some((type) => {
      // Support wildcard types like 'image/*'
      if (type.endsWith('/*')) {
        const prefix = type.slice(0, -2);
        return fileType.startsWith(prefix);
      }
      return fileType === type;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: `File type '${fileType}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }
  }

  return {valid: true};
}

/**
 * Generate a unique storage path for a file
 * @param directory - Base directory (e.g., 'uploads/avatars')
 * @param fileName - Original file name
 * @param includeTimestamp - Whether to include timestamp in path (default true)
 * @returns Storage path
 */
export function generateStoragePath(
  directory: string,
  fileName: string,
  includeTimestamp: boolean = true
): string {
  // Sanitize filename
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

  if (includeTimestamp) {
    const timestamp = Date.now();
    const nameParts = sanitized.split('.');
    const ext = nameParts.length > 1 ? nameParts.pop() : '';
    const baseName = nameParts.join('.');
    return `${directory}/${baseName}_${timestamp}${ext ? '.' + ext : ''}`;
  }

  return `${directory}/${sanitized}`;
}
