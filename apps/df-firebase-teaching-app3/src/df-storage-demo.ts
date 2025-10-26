import {css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {firebaseAuthState} from '@df/state';
import type {StorageFileMetadata} from '@df/types';
import {fileUploadProgress} from '@df/ui-lit/df-upload-link-store';

// Ensure Storage UI components are registered
import '@df/ui-lit/firebase';
import '@df/ui-lit/df-upload-link';

/**
 * Storage Pattern Demo Component
 *
 * Demonstrates Firebase Storage patterns including:
 * - File upload with progress tracking
 * - File listing and browsing
 * - File preview (images, PDFs)
 * - File deletion with confirmation
 * - Drag-and-drop upload
 * - File validation
 */
@customElement('df-storage-demo')
export class DfStorageDemo extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--df-font-family, system-ui, sans-serif);
      width: min(1200px, 90vw);
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      padding: 2rem;
    }

    .container {
      display: grid;
      gap: 1.5rem;
    }

    header {
      background: linear-gradient(130deg, rgba(99, 102, 241, 0.08), rgba(79, 70, 229, 0.06));
      border-radius: 24px;
      padding: 2rem;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }

    h2 {
      margin: 0 0 0.75rem;
      font-size: 1.85rem;
      color: #1e293b;
      font-weight: 600;
    }

    p {
      margin: 0;
      color: #475569;
      line-height: 1.6;
    }

    .callouts {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }

    .callout {
      border-radius: 16px;
      padding: 1rem 1.25rem;
      background: rgba(241, 245, 249, 0.92);
      border: 1px solid rgba(148, 163, 184, 0.28);
      color: #0f172a;
      font-weight: 600;
      text-align: center;
    }

    .demo-section {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid rgba(148, 163, 184, 0.28);
    }

    .demo-section h3 {
      margin: 0 0 1rem;
      color: #1e1b4b;
      font-size: 1.25rem;
    }

    .two-column {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: 1fr 1fr;
    }

    .auth-hint {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      align-items: flex-start;
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px dashed rgba(99, 102, 241, 0.4);
      background: rgba(99, 102, 241, 0.08);
      color: #312e81;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .auth-hint strong {
      font-weight: 600;
    }

    @media (max-width: 768px) {
      .two-column {
        grid-template-columns: 1fr;
      }
    }

    .file-preview-area {
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  @state() private initialized = false;
  @state() private initError: string | null = null;
  @state() private selectedFile: StorageFileMetadata | null = null;
  @state() private uploadedUrl = '';

  override render() {
    const progress = fileUploadProgress.get();
    const auth = firebaseAuthState.get();
    const isAuthenticated = auth.authState === 'authenticated';
    const isAuthLoading = auth.authState === 'loading' || !auth.initialized;

    // Auto-initialize on first render (storage auto-initializes when accessed)
    if (!this.initialized) {
      this.initialized = true;
    }

    return html`
      <div class="container">
        <header>
          <h2>Storage Pattern</h2>
          <p>
            This teaching demo demonstrates Firebase Storage patterns including file upload with
            progress tracking, file listing, and deletion. Uses the df-upload-link component for
            uploads with inline preview. All operations work with the Firebase Storage emulator.
          </p>
        </header>

        <div class="callouts">
          <div class="callout">Upload Progress: ${Math.round(progress * 100)}%</div>
          <div class="callout">
            ${this.uploadedUrl ? `Last Upload: ${this.uploadedUrl.split('/').pop()}` : 'No file uploaded yet'}
          </div>
        </div>

        ${this.initError
          ? html`<div class="callout" style="background: rgba(220, 38, 38, 0.16); color: #b91c1c;">
              ${this.initError}
            </div>`
          : html`
              <div class="two-column">
                <div class="demo-section">
                  <h3>Upload Files</h3>
                  <df-upload-link
                    resourcePageType="storage"
                    resourceLinkType="image"
                    @upload-link-gather-url=${this.handleUploadComplete}
                  ></df-upload-link>
                </div>

                <div class="demo-section">
                  <h3>Uploaded Files</h3>
                  ${isAuthenticated
                    ? html`
                        <df-file-list
                          id="file-list"
                          directory="uploads/storage/image"
                          showDelete
                          showPreviews
                          @file-select=${this.handleFileSelect}
                          @file-delete=${this.handleFileDelete}
                        ></df-file-list>
                      `
                    : html`
                        <div class="auth-hint">
                          <strong>Authentication required</strong>
                          ${isAuthLoading
                            ? html`Connecting to Firebase Authentication...`
                            : html`Sign in using the Authentication demo (e.g.
                                <code>alice.anderson@example.com</code>) to view the
                                seeded Storage files.`}
                        </div>
                      `}
                </div>
              </div>
            `}
      </div>
    `;
  }

  private async handleUploadComplete(e: CustomEvent) {
    console.log('[df-storage-demo] Upload complete:', e.detail);
    this.uploadedUrl = e.detail.linkUrl;

    // Refresh file list by calling its public refresh method
    const fileList = this.shadowRoot?.querySelector('#file-list') as any;
    if (fileList && typeof fileList.refresh === 'function') {
      await fileList.refresh();
    }
  }

  private handleFileSelect(e: CustomEvent) {
    this.selectedFile = e.detail.file;
  }

  private async handleFileDelete(e: CustomEvent) {
    const {file} = e.detail;

    // Create and show delete confirmation
    const deleteComponent = document.createElement('df-file-delete');
    deleteComponent.file = file;
    deleteComponent.showButton = false;

    deleteComponent.addEventListener('delete-complete', async () => {
      console.log('[df-storage-demo] File deleted:', file);

      // Refresh file list by calling its public refresh method
      const fileList = this.shadowRoot?.querySelector('#file-list') as any;
      if (fileList && typeof fileList.refresh === 'function') {
        await fileList.refresh();
      }

      // Clear selected file if it was deleted
      if (this.selectedFile?.path === file.path) {
        this.selectedFile = null;
      }

      document.body.removeChild(deleteComponent);
    });

    deleteComponent.addEventListener('delete-cancel', () => {
      document.body.removeChild(deleteComponent);
    });

    document.body.appendChild(deleteComponent);
    deleteComponent.open();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-storage-demo': DfStorageDemo;
  }
}
