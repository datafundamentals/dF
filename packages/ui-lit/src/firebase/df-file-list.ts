/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * This component MUST use Material Design 3 web components from @material/web.
 *
 * ✅ ALLOWED:
 * - <md-filled-button>, <md-outlined-button>, <md-text-button>
 * - <md-outlined-text-field>, <md-filled-text-field>
 * - <md-filled-select>, <md-outlined-select> with <md-select-option>
 * - <md-checkbox>
 *
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 *
 * See:
 * - /guides/STANDARDS_STYLES.md#material-design-3
 * - /packages/ui-lit/src/df-upload-link.ts (compliant example)
 *
 * Build will FAIL if native HTML elements detected.
 */

import {css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {FirebaseError} from 'firebase/app';
import {listFilesWithMetadata} from '@df/state';
import type {StorageFileMetadata} from '@df/types';
import '@material/web/icon/icon.js';
import '@material/web/button/text-button.js';
import '@material/web/progress/circular-progress.js';

/**
 * Display a list of files from Firebase Storage
 *
 * @fires file-select - Fired when a file is selected
 * @fires file-delete - Fired when delete is requested for a file
 *
 * @example
 * ```html
 * <df-file-list
 *   directory="uploads/images"
 *   @file-select=${(e) => console.log('Selected:', e.detail)}
 *   @file-delete=${(e) => handleDelete(e.detail.file)}
 * ></df-file-list>
 * ```
 */
@customElement('df-file-list')
export class DfFileList extends LitElement {
  /**
   * Storage directory to list files from
   */
  @property({type: String})
  declare directory: string;

  /**
   * Whether to show delete buttons
   */
  @property({type: Boolean})
  declare showDelete: boolean;

  /**
   * Whether to show file previews (thumbnails for images)
   */
  @property({type: Boolean})
  declare showPreviews: boolean;

  @state()
  private declare files: StorageFileMetadata[];

  @state()
  private declare loading: boolean;

  @state()
  private declare error: string | null;

  constructor() {
    super();
    this.directory = 'uploads';
    this.showDelete = true;
    this.showPreviews = true;
    this.files = [];
    this.loading = false;
    this.error = null;
  }

  static override styles = css`
    :host {
      display: block;
      --md-sys-color-primary: #5f9ea0;
    }

    .file-list-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .loading-container,
    .error-container,
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      gap: 12px;
      color: var(--md-sys-color-on-surface-variant, #666);
    }

    .error-container {
      color: var(--md-sys-color-error, #b00020);
      background-color: var(--md-sys-color-error-container, #fdecea);
      border-radius: 8px;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border: 1px solid var(--md-sys-color-outline, #ccc);
      border-radius: 8px;
      background-color: var(--md-sys-color-surface, #fff);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .file-item:hover {
      background-color: var(--md-sys-color-surface-variant, #f5f5f5);
      border-color: var(--md-sys-color-primary, #5f9ea0);
    }

    .file-preview {
      width: 48px;
      height: 48px;
      border-radius: 6px;
      object-fit: cover;
      background-color: var(--md-sys-color-surface-variant, #f5f5f5);
    }

    .file-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background-color: var(--md-sys-color-primary-container, #e0f2f1);
    }

    .file-icon md-icon {
      color: var(--md-sys-color-primary, #5f9ea0);
      font-size: 32px;
    }

    .file-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .file-name {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-meta {
      display: flex;
      gap: 12px;
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface-variant, #666);
    }

    .file-actions {
      display: flex;
      gap: 4px;
    }

    md-text-button {
      --md-text-button-label-text-color: var(--md-sys-color-error, #b00020);
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.loadFiles();
  }

  override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('directory')) {
      this.loadFiles();
    }
  }

  private async loadFiles() {
    this.loading = true;
    this.error = null;

    try {
      this.files = await listFilesWithMetadata(this.directory);
    } catch (error) {
      if (error instanceof FirebaseError && error.code === 'storage/unauthorized') {
        this.error = 'Sign in is required to view files in this directory.';
      } else if (error instanceof Error) {
        this.error = error.message;
      } else {
        this.error = 'Failed to load files';
      }
    } finally {
      this.loading = false;
    }
  }

  /**
   * Public method to refresh the file list
   */
  public async refresh(): Promise<void> {
    await this.loadFiles();
  }

  private handleFileClick(file: StorageFileMetadata) {
    this.dispatchEvent(
      new CustomEvent('file-select', {
        detail: {file},
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleDeleteClick(e: Event, file: StorageFileMetadata) {
    e.stopPropagation();
    this.dispatchEvent(
      new CustomEvent('file-delete', {
        detail: {file},
        bubbles: true,
        composed: true,
      })
    );
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private isImage(contentType: string): boolean {
    return contentType.startsWith('image/');
  }

  private getFileIcon(contentType: string): string {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('video/')) return 'movie';
    if (contentType.startsWith('audio/')) return 'audio_file';
    if (contentType.includes('pdf')) return 'picture_as_pdf';
    if (contentType.includes('zip') || contentType.includes('archive')) return 'folder_zip';
    return 'insert_drive_file';
  }

  override render() {
    if (this.loading) {
      return html`
        <div class="loading-container">
          <md-circular-progress indeterminate></md-circular-progress>
          <span>Loading files...</span>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error-container">
          <md-icon>error</md-icon>
          <strong>Error loading files</strong>
          <span>${this.error}</span>
        </div>
      `;
    }

    if (this.files.length === 0) {
      return html`
        <div class="empty-container">
          <md-icon>folder_open</md-icon>
          <span>No files found in ${this.directory}</span>
        </div>
      `;
    }

    return html`
      <div class="file-list-container">
        ${this.files.map(
          (file) => html`
            <div class="file-item" @click=${() => this.handleFileClick(file)}>
              ${this.showPreviews && this.isImage(file.contentType)
                ? html`<img src="${file.downloadUrl}" alt="${file.name}" class="file-preview" />`
                : html`
                    <div class="file-icon">
                      <md-icon>${this.getFileIcon(file.contentType)}</md-icon>
                    </div>
                  `}

              <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">
                  <span>${this.formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>${this.formatDate(file.uploadedAt)}</span>
                </div>
              </div>

              ${this.showDelete
                ? html`
                    <div class="file-actions">
                      <md-text-button @click=${(e: Event) => this.handleDeleteClick(e, file)}>
                        <md-icon slot="icon">delete</md-icon>
                        Delete
                      </md-text-button>
                    </div>
                  `
                : ''}
            </div>
          `
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-file-list': DfFileList;
  }
}
