/**
 * Firebase Storage type definitions for the DF monorepo
 */

/**
 * Status of a storage upload operation
 */
export type StorageUploadStatus = 'idle' | 'uploading' | 'complete' | 'error';

/**
 * Status of a storage delete operation
 */
export type StorageDeleteStatus = 'idle' | 'deleting' | 'error';

/**
 * Complete state of a storage delete operation
 */
export interface StorageDeleteState {
  /** Current delete status */
  status: StorageDeleteStatus;
  /** Error message if delete failed */
  error: string | null;
}

/**
 * Complete state of a storage upload operation
 */
export interface StorageUploadState {
  /** Current upload status */
  status: StorageUploadStatus;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Error message if upload failed */
  error: string | null;
  /** Metadata of uploaded file if complete */
  uploadedFile: StorageFileMetadata | null;
}

/**
 * Metadata for a file in Firebase Storage
 */
export interface StorageFileMetadata {
  /** File name */
  name: string;
  /** Full storage path */
  path: string;
  /** Public download URL */
  downloadUrl: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  contentType: string;
  /** Upload timestamp */
  uploadedAt: Date;
  /** Optional custom metadata */
  customMetadata?: Record<string, string>;
}

/**
 * Options for file validation
 */
export interface FileValidationOptions {
  /** Maximum file size in megabytes */
  maxSizeMB?: number;
  /** Allowed MIME types (supports wildcards like 'image/*') */
  allowedTypes?: string[];
}

/**
 * Result of file validation
 */
export interface FileValidationResult {
  /** Whether the file is valid */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Options for listing files in a directory
 */
export interface ListFilesOptions {
  /** Maximum number of results to return */
  maxResults?: number;
  /** Page token for pagination */
  pageToken?: string;
}

/**
 * Category of storage directory for organization
 */
export type StorageDirectory =
  | 'uploads/images'
  | 'uploads/documents'
  | 'uploads/avatars'
  | 'uploads/videos'
  | 'temp';
