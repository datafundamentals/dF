/**
 * Firebase Storage Store
 *
 * Centralized state management for Firebase Storage operations using signals.
 * Provides file upload, download, delete, and listing capabilities with reactive progress tracking.
 *
 * @module storage.store
 *
 * @example Basic Usage
 * ```typescript
 * import {initializeStorage, uploadFile, storageUploadState} from '@df/state';
 * import {SignalWatcher} from '@lit-labs/signals';
 *
 * // 1. Initialize storage (in app entry point)
 * const app = getFirebaseApp(config);
 * const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';
 * initializeStorage(app, useEmulator);
 *
 * // 2. Upload a file
 * const file = input.files[0];
 * const downloadURL = await uploadFile('uploads/photos/image.jpg', file);
 *
 * // 3. Monitor upload progress in components
 * export class MyComponent extends SignalWatcher(LitElement) {
 *   render() {
 *     const {status, progress} = storageUploadState.get();
 *     return html`
 *       ${status === 'uploading' ? html`<progress value=${progress} max="100"></progress>` : ''}
 *     `;
 *   }
 * }
 * ```
 *
 * @see {@link https://firebase.google.com/docs/storage | Firebase Storage Documentation}
 */

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
import {
  getInitializedFirebaseApp,
  shouldUseEmulatorForService,
} from './firebase-init.js';

/** Storage emulator host for local development */
const STORAGE_HOST = '127.0.0.1';

/** Storage emulator port for local development - matches firebase.json */
const STORAGE_PORT = 9390;

/**
 * Internal signal tracking upload status.
 * @internal
 */
const uploadStateSignal = signal<StorageUploadStatus>('idle');

/**
 * Internal signal tracking upload progress (0-100).
 * @internal
 */
const uploadProgressSignal = signal<number>(0);

/**
 * Internal signal holding upload error message.
 * @internal
 */
const uploadErrorSignal = signal<string | null>(null);

/**
 * Internal signal holding metadata of uploaded file.
 * @internal
 */
const uploadedFileSignal = signal<StorageFileMetadata | null>(null);

/** Singleton storage instance */
let storageInstance: FirebaseStorage | null = null;

/**
 * Ensures storage is initialized with lazy loading.
 * Safe to call multiple times - will only initialize once.
 * 
 * @internal
 */
function ensureStorageInitialized(): void {
  if (storageInstance) {
    // Already initialized
    return;
  }

  const app = getInitializedFirebaseApp();
  storageInstance = getStorage(app);

  // Connect to emulator if configured
  if (shouldUseEmulatorForService('storage')) {
    connectStorageEmulator(storageInstance, STORAGE_HOST, STORAGE_PORT);
  }
}

/**
 * Computed state combining all storage upload signals.
 *
 * Access this to get reactive upload status, progress, errors, and file metadata.
 * Components using SignalWatcher automatically re-render when state changes.
 *
 * @returns {StorageUploadState} Combined upload state
 * @property {StorageUploadStatus} status - Upload status: 'idle' | 'uploading' | 'complete' | 'error'
 * @property {number} progress - Upload progress percentage (0-100)
 * @property {string | null} error - Error message if status is 'error'
 * @property {StorageFileMetadata | null} uploadedFile - Metadata of uploaded file when complete
 *
 * @example
 * ```typescript
 * const {status, progress, error, uploadedFile} = storageUploadState.get();
 *
 * if (status === 'uploading') {
 *   return html`<progress value=${progress} max="100">${Math.round(progress)}%</progress>`;
 * }
 *
 * if (status === 'error') {
 *   return html`<p class="error">${error}</p>`;
 * }
 *
 * if (status === 'complete' && uploadedFile) {
 *   return html`<a href=${uploadedFile.downloadUrl}>Download ${uploadedFile.name}</a>`;
 * }
 * ```
 */
export const storageUploadState = computed<StorageUploadState>(() => ({
  status: uploadStateSignal.get(),
  progress: uploadProgressSignal.get(),
  error: uploadErrorSignal.get(),
  uploadedFile: uploadedFileSignal.get(),
}));

/**
 * Initialize Firebase Storage with optional emulator connection.
 *
 * Uses singleton pattern - returns existing instance if already initialized.
 * Call this once in your app's entry point before using storage functions.
 *
 * @param {FirebaseApp} app - Initialized Firebase app instance
 * @param {boolean} useEmulator - Whether to connect to Firebase Storage emulator
 *
 * @returns {FirebaseStorage} Firebase Storage instance
 *
 * @example Production
 * ```typescript
 * const app = initializeApp(firebaseConfig);
 * const storage = initializeStorage(app, false);
 * ```
 *
 * @example Development with Emulator
 * ```typescript
 * const app = initializeApp(firebaseConfig);
 * const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';
 * const storage = initializeStorage(app, useEmulator);
 *
 * // Emulator runs at 127.0.0.1:9390
 * // Access UI at http://127.0.0.1:5400
 * ```
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
 * Get the initialized Firebase Storage instance.
 *
 * @throws {Error} If storage not initialized via `initializeStorage()`
 * @returns {FirebaseStorage} Firebase Storage instance
 *
 * @example
 * ```typescript
 * const storage = getStorageInstance();
 * const storageRef = ref(storage, 'uploads/file.jpg');
 * ```
 */
export function getStorageInstance(): FirebaseStorage {
  ensureStorageInitialized();
  
  if (!storageInstance) {
    throw new Error('Storage initialization failed');
  }
  return storageInstance;
}

/**
 * Upload a file to Firebase Storage with reactive progress tracking.
 *
 * Automatically updates `storageUploadState` signal with progress and status.
 * Components using SignalWatcher will re-render as upload progresses.
 *
 * @param {string} path - Storage path (e.g., 'uploads/images/photo.jpg')
 * @param {File} file - File to upload
 * @param {object} [metadata] - Optional file metadata
 * @param {string} [metadata.contentType] - MIME type (defaults to file.type)
 * @param {Record<string, string>} [metadata.customMetadata] - Custom key-value pairs
 *
 * @throws {Error} If storage not initialized or upload fails
 * @returns {Promise<string>} Promise resolving to file's download URL
 *
 * @example Basic Upload
 * ```typescript
 * const file = input.files[0];
 * const downloadURL = await uploadFile('uploads/photos/vacation.jpg', file);
 * console.log('File available at:', downloadURL);
 * ```
 *
 * @example Upload with Metadata
 * ```typescript
 * const file = input.files[0];
 * const downloadURL = await uploadFile(
 *   'uploads/documents/report.pdf',
 *   file,
 *   {
 *     contentType: 'application/pdf',
 *     customMetadata: {
 *       uploadedBy: currentUser.uid,
 *       department: 'sales',
 *     }
 *   }
 * );
 * ```
 *
 * @example Monitoring Progress
 * ```typescript
 * export class UploadComponent extends SignalWatcher(LitElement) {
 *   private async handleUpload(file: File) {
 *     try {
 *       const url = await uploadFile('uploads/' + file.name, file);
 *       console.log('Upload complete:', url);
 *     } catch (error) {
 *       console.error('Upload failed:', error);
 *     }
 *   }
 *
 *   render() {
 *     const {status, progress} = storageUploadState.get();
 *
 *     return html`
 *       ${status === 'uploading'
 *         ? html`<progress value=${progress} max="100"></progress>`
 *         : ''}
 *     `;
 *   }
 * }
 * ```
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
 * Get the download URL for a file in Firebase Storage.
 *
 * Use this to get a public URL for displaying images, linking to downloads, etc.
 *
 * @param {string} path - Storage path (e.g., 'uploads/images/photo.jpg')
 *
 * @throws {Error} If storage not initialized or file doesn't exist
 * @returns {Promise<string>} Promise resolving to file's download URL
 *
 * @example
 * ```typescript
 * const url = await getFileDownloadURL('uploads/avatars/user-123.jpg');
 * return html`<img src=${url} alt="User avatar" />`;
 * ```
 */
export async function getFileDownloadURL(path: string): Promise<string> {
  const storage = getStorageInstance();
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
}

/**
 * Delete a file from Firebase Storage.
 *
 * Permanently removes the file. This operation cannot be undone.
 *
 * @param {string} path - Storage path of file to delete
 *
 * @throws {Error} If storage not initialized or file doesn't exist
 * @returns {Promise<void>} Promise resolving when file deleted
 *
 * @example
 * ```typescript
 * try {
 *   await deleteFile('uploads/temp/old-file.jpg');
 *   console.log('File deleted successfully');
 * } catch (error) {
 *   if (error.code === 'storage/object-not-found') {
 *     console.log('File already deleted');
 *   }
 * }
 * ```
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
 * Reset upload state to idle.
 *
 * Clears progress, errors, and uploaded file metadata.
 * Useful when starting a new upload or dismissing upload UI.
 *
 * @example
 * ```typescript
 * // After successful upload
 * await uploadFile('uploads/file.jpg', file);
 * // ... show success message ...
 * resetUploadState(); // Clear for next upload
 * ```
 */
export function resetUploadState(): void {
  uploadStateSignal.set('idle');
  uploadProgressSignal.set(0);
  uploadErrorSignal.set(null);
  uploadedFileSignal.set(null);
}

/**
 * Validate a file before uploading.
 *
 * Checks file size and type against specified constraints.
 * Use this to provide early feedback to users before attempting upload.
 *
 * @param {File} file - File to validate
 * @param {object} [options] - Validation options
 * @param {number} [options.maxSizeMB=10] - Maximum file size in megabytes
 * @param {string[]} [options.allowedTypes] - Allowed MIME types (supports wildcards like 'image/*')
 *
 * @returns {{valid: boolean; error?: string}} Validation result with error message if invalid
 *
 * @example Size Validation
 * ```typescript
 * const file = input.files[0];
 * const result = validateFile(file, {maxSizeMB: 5});
 *
 * if (!result.valid) {
 *   alert(result.error); // "File size exceeds 5MB limit"
 *   return;
 * }
 * ```
 *
 * @example Type Validation
 * ```typescript
 * const result = validateFile(file, {
 *   allowedTypes: ['image/jpeg', 'image/png', 'image/*']
 * });
 *
 * if (!result.valid) {
 *   alert(result.error); // "File type 'application/pdf' is not allowed..."
 *   return;
 * }
 *
 * await uploadFile('uploads/' + file.name, file);
 * ```
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
 * Generate a unique, sanitized storage path for a file.
 *
 * Sanitizes filename by replacing special characters with underscores.
 * Optionally appends timestamp to ensure uniqueness.
 *
 * @param {string} directory - Base directory (e.g., 'uploads/avatars')
 * @param {string} fileName - Original file name
 * @param {boolean} [includeTimestamp=true] - Whether to include timestamp in path
 *
 * @returns {string} Sanitized storage path
 *
 * @example With Timestamp (Default)
 * ```typescript
 * const path = generateStoragePath('uploads/photos', 'my vacation.jpg');
 * // Returns: 'uploads/photos/my_vacation_1704123456789.jpg'
 * ```
 *
 * @example Without Timestamp
 * ```typescript
 * const path = generateStoragePath('uploads/avatars', 'user@avatar.png', false);
 * // Returns: 'uploads/avatars/user_avatar.png'
 * ```
 *
 * @example Full Upload Flow
 * ```typescript
 * const file = input.files[0];
 * const path = generateStoragePath('uploads/documents', file.name);
 * const downloadURL = await uploadFile(path, file);
 * ```
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
