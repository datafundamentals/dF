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
import {SignalWatcher} from '@lit-labs/signals';
import {deleteFileWithStatus, storageDeleteState} from '@df/state';
import type {StorageFileMetadata} from '@df/types';

/**
 * Delete confirmation component for files from Firebase Storage
 *
 * Provides a confirmation dialog before deleting files.
 *
 * @fires delete-confirm - Fired when user confirms deletion
 * @fires delete-cancel - Fired when user cancels deletion
 * @fires delete-complete - Fired when deletion completes successfully
 * @fires delete-error - Fired when deletion fails
 *
 * @example
 * ```html
 * <df-file-delete
 *   .file=${fileMetadata}
 *   @delete-complete=${() => refreshFileList()}
 * ></df-file-delete>
 * ```
 */
@customElement('df-file-delete')
export class DfFileDelete extends SignalWatcher(LitElement) {
  /**
   * File metadata to delete
   */
  @property({type: Object})
  declare file: StorageFileMetadata | null;

  /**
   * Whether to show the delete button inline
   */
  @property({type: Boolean})
  declare showButton: boolean;

  /**
   * Button label text
   */
  @property({type: String})
  declare buttonLabel: string;

  @state()
  private declare dialogOpen: boolean;

  constructor() {
    super();
    this.file = null;
    this.showButton = true;
    this.buttonLabel = 'Delete';
    this.dialogOpen = false;
  }

  static override styles = css`
    :host {
      display: inline-block;
      --md-sys-color-primary: #5f9ea0;
    }

    .delete-button {
      --md-text-button-label-text-color: var(--md-sys-color-error, #b00020);
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
      min-width: 300px;
    }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .dialog-header md-icon {
      font-size: 32px;
      color: var(--md-sys-color-error, #b00020);
    }

    .dialog-title {
      font-size: 1.25rem;
      font-weight: 500;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: var(--md-sys-color-surface-variant, #f5f5f5);
      border-radius: 8px;
    }

    .file-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      background-color: var(--md-sys-color-error-container, #fdecea);
    }

    .file-icon md-icon {
      color: var(--md-sys-color-error, #b00020);
    }

    .file-details {
      flex: 1;
      min-width: 0;
    }

    .file-name {
      font-weight: 500;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-path {
      font-size: 0.875rem;
      color: var(--md-sys-color-on-surface-variant, #666);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .warning-message {
      color: var(--md-sys-color-error, #b00020);
      font-size: 0.875rem;
      padding: 12px;
      background-color: var(--md-sys-color-error-container, #fdecea);
      border-radius: 8px;
    }

    .error-message {
      color: var(--md-sys-color-error, #b00020);
      padding: 12px;
      background-color: var(--md-sys-color-error-container, #fdecea);
      border-radius: 8px;
      font-size: 0.875rem;
    }

    .dialog-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      padding-top: 8px;
    }

    md-filled-button.delete-action {
      --md-filled-button-container-color: var(--md-sys-color-error, #b00020);
    }
  `;

  /**
   * Open the delete confirmation dialog
   */
  public open(): void {
    this.dialogOpen = true;
  }

  /**
   * Close the dialog
   */
  public close(): void {
    this.dialogOpen = false;
  }

  private handleButtonClick() {
    this.open();
  }

  private handleCancel() {
    this.close();
    this.dispatchEvent(
      new CustomEvent('delete-cancel', {
        bubbles: true,
        composed: true,
      })
    );
  }

  private async handleConfirm() {
    if (!this.file || storageDeleteState.get().status === 'deleting') return;

    this.dispatchEvent(
      new CustomEvent('delete-confirm', {
        detail: {file: this.file},
        bubbles: true,
        composed: true,
      })
    );

    try {
      await deleteFileWithStatus(this.file.path);

      this.dispatchEvent(
        new CustomEvent('delete-complete', {
          detail: {file: this.file},
          bubbles: true,
          composed: true,
        })
      );

      this.close();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete file';
      this.dispatchEvent(
        new CustomEvent('delete-error', {
          detail: {file: this.file, error: message},
          bubbles: true,
          composed: true,
        })
      );
    }
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
    return html`
      ${this.showButton
        ? html`
            <md-text-button class="delete-button" @click=${this.handleButtonClick}>
              <md-icon slot="icon">delete</md-icon>
              ${this.buttonLabel}
            </md-text-button>
          `
        : ''}
      ${this.dialogOpen ? this.renderDialog() : ''}
    `;
  }

  private renderDialog() {
    if (!this.file) {
      return html`
        <div class="dialog-content">
          <div class="error-message">No file selected for deletion</div>
          <div class="dialog-actions">
            <md-text-button @click=${this.handleCancel}>Close</md-text-button>
          </div>
        </div>
      `;
    }

    return html`
      <div class="dialog-content">
        <div class="dialog-header">
          <md-icon>warning</md-icon>
          <div class="dialog-title">Delete File?</div>
        </div>

        <div class="file-info">
          <div class="file-icon">
            <md-icon>${this.getFileIcon(this.file.contentType)}</md-icon>
          </div>
          <div class="file-details">
            <div class="file-name">${this.file.name}</div>
            <div class="file-path">${this.file.path}</div>
          </div>
        </div>

        <div class="warning-message">
          <strong>Warning:</strong> This action cannot be undone. The file will be permanently
          deleted from storage.
        </div>

        ${storageDeleteState.get().error
          ? html` <div class="error-message"><strong>Error:</strong> ${storageDeleteState.get().error}</div> `
          : ''}

        <div class="dialog-actions">
          <md-text-button @click=${this.handleCancel} ?disabled=${storageDeleteState.get().status === 'deleting'}>
            Cancel
          </md-text-button>
          <md-filled-button
            class="delete-action"
            @click=${this.handleConfirm}
            ?disabled=${storageDeleteState.get().status === 'deleting'}
          >
            <md-icon slot="icon">${storageDeleteState.get().status === 'deleting' ? 'hourglass_empty' : 'delete'}</md-icon>
            ${storageDeleteState.get().status === 'deleting' ? 'Deleting...' : 'Delete'}
          </md-filled-button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-file-delete': DfFileDelete;
  }
}
