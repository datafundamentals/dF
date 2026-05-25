// src/df-upload-link.ts
import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { clearUploadObservables, fileToUpload, fileUploadProgress, uploadFileTask } from './df-upload-link-store';
import '@material/web/progress/circular-progress.js';
import '@material/web/textfield/outlined-text-field.js';
import './df-segmented-button';
import { isLoggedIn } from './df-upload-link-auth';

import { SignalWatcher } from '@lit-labs/signals';
import { ResourcePageType, UrlMediaType } from './df-upload-link-types';

@customElement('df-upload-link')
export class DfUploadLink extends SignalWatcher(LitElement) {
  @property() declare resourceLinkType: UrlMediaType;
  @property() declare resourcePageType: ResourcePageType;
  @property({ type: String }) declare label: string;
  @property({ type: String }) declare uploadSubpath: string;
  @property({ type: String }) declare linkUrl: string;
  @property({ type: Boolean }) declare imageValid: boolean;
  @state()
  declare private showUrlContainer: boolean;

  @state()
  declare private showUploader: boolean;

  @state()
  declare private showContent: boolean;

  @state()
  declare private showLinkInput: boolean;

  @state()
  declare fileName: string;

  @state()
  declare private generatedLink: string;

  @state()
  declare public disabledOptions: string[];

  @state()
  declare private uploadError: string | null;

  constructor() {
    super();
    this.resourceLinkType = 'void';
    this.resourcePageType = 'void';
    this.label = '';
    this.uploadSubpath = '';
    this.linkUrl = '';
    this.imageValid = false;
    this.showUrlContainer = false;
    this.showUploader = false;
    this.showContent = false;
    this.showLinkInput = false;
    this.fileName = 'Select File to Upload';
    this.generatedLink = '';
    this.disabledOptions = ['Add', '0'];
    this.uploadError = null;
  }
  static override styles = css`
    :host {
      display: block;
      padding: 10px;
      font-family: 'Roboto', sans-serif;
      margin-top: 3px;
      --md-sys-color-primary: #5f9ea0;
    }

    div:first-of-type {
      display: flex;
      flex-direction: row; /* Aligns children in a row */
      align-items: center; /* Aligns items vertically in the center */
      gap: 10px; /* Adds space between elements */
    }

    .file-input-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      border-radius: 12px;
    }

    .file-label {
      height: 70px;
      border-radius: 12px;
      cursor: pointer;
      margin-right: 10px;
      font-size: 14px;
      white-space: nowrap;
      padding: 8px 16px;
      text-align: center;
      background-color: var(--md-sys-color-primary, #6200ea);
      color: var(--md-sys-color-on-primary, #ffffff);
      border: none;
      outline: none;
      line-height: 20px;
    }

    .file-input {
      display: none;
    }

    .input-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-width: 350px;
    }

    .thumbnail {
      height: 50px;
      object-fit: contain;
      border-radius: 12px;
      display: block;
    }

    .thumbnail.hidden {
      display: none;
    }

    df-segmented-button {
      display: inline-flex;
      flex-wrap: nowrap;
      white-space: nowrap;
      width: auto; /* Set width to auto to fit content */
    }

    .upload-error {
      margin-top: 6px;
      font-size: 0.82rem;
      color: var(--md-sys-color-error, #b00020);
    }
  `;

  public reset(): void {
    this.linkUrl = '';
    this.imageValid = false;
    this.showUrlContainer = false;
    this.showUploader = false;
    this.showContent = false;
    this.showLinkInput = false;
    this.fileName = 'Select File to Upload';
    this.generatedLink = '';
    this.disabledOptions = ['Add', '0'];
    clearUploadObservables();
  }

  private resolveUploadErrorMessage(error: unknown): string {
    const code = (error as {code?: string})?.code ?? '';
    if (code === 'storage/unauthorized') {
      return 'Upload failed: file may be too large or you are not authorized.';
    }
    if (code === 'storage/quota-exceeded') {
      return 'Upload failed: storage quota exceeded.';
    }
    if (code === 'storage/canceled') {
      return 'Upload canceled.';
    }
    return 'Upload failed. Please try again.';
  }

  private async _processFileUpload(file: File): Promise<void> {
    const uploadIdentifier = this.uploadSubpath || (this.resourcePageType + '|' + this.resourceLinkType);
    this.uploadError = null;
    this.fileName = file.name;
    fileToUpload.set(file);
    try {
      const {downloadUrl, storagePath} = await uploadFileTask(uploadIdentifier);
      this.generatedLink = downloadUrl;
      this.linkUrl = downloadUrl;
      this.showUrlContainer = true;
      this.imageValid = true;
      this.disabledOptions = ['Site', 'Upload'];
      this.dispatchEvent(new CustomEvent('upload-link-gather-url', {
        detail: {
          linkUrl: downloadUrl,
          storagePath,
          fileName: file.name,
          uploadedAt: new Date(),
        },
      }));
    } catch (error) {
      console.error('[df-upload-link] Upload failed:', error);
      this.uploadError = this.resolveUploadErrorMessage(error);
      this.reset();
    }
  }

  async uploadFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && isLoggedIn.get()) {
      await this._processFileUpload(file);
    } else {
      console.error('No file selected or user not authenticated.');
    }
  }

  handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.linkUrl = input.value;
    this.validateImage();
  }

  validateImage() {
    const img = new Image();
    img.src = this.linkUrl;
    img.onload = () => {
      this.imageValid = true;
      this.showUrlContainer = true;
      this.requestUpdate();
      this.disabledOptions = ['Site', 'Upload'];
      this.dispatchEvent(new CustomEvent('upload-link-gather-url', { detail: { linkUrl: this.linkUrl } }));
    };
    img.onerror = () => {
      console.error('ERROR ON IMAGE');
      this.imageValid = false;
      this.requestUpdate();
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      this.linkUrl = url;
      return true;
    } catch {
      return false;
    }
  }

  private handleSelectionChange(event: CustomEvent) {
    const selectedOption = event.detail.id;
    switch (selectedOption) {
      case 'Upload':
        this.triggerUpload();
        break;
      case 'Site':
        this.triggerLink();
        break;
      case 'Add':
        this.triggerAdd();
        break;
      default:
        this.triggerNone();
        break;
    }
  }

  private triggerUpload() {
    this.showContent = true;
    this.showUrlContainer = false;
    this.showUploader = true;
    this.showLinkInput = false;
  }

  private triggerLink() {
    this.showUrlContainer = true;
    this.showUploader = false;
    this.showContent = true;
    this.showLinkInput = true;
  }

  private triggerAdd() {
    this.dispatchEvent(new CustomEvent('upload-link-allocate', { detail: { linkUrl: this.linkUrl } }));
    this.disabledOptions = ['Add', '0'];
  }

  private triggerNone() {
    this.showUrlContainer = false;
    this.showUploader = false;
    this.showContent = false;
    this.showLinkInput = false;
    this.disabledOptions = ['Add', '0'];
  }

  override render() {
    this.showUrlContainer = this.isValidUrl(this.generatedLink);
    this.showUrlContainer = true;
    return html`
      <div>${this.label || 'Gather [' + this.resourceLinkType + 's]:'}
        <df-segmented-button
          @df-segmented-button-change=${this.handleSelectionChange}
          .disabledOptions=${this.disabledOptions}
        ></df-segmented-button>
        <div style="display: ${this.showContent ? 'flex' : 'none'};">
          <div style="display: ${this.showUploader ? 'block' : 'none'};">
            <label class="file-label">
              <span>${this.fileName}</span>
              <!-- md3-gap: native file input required to invoke OS file picker per MD3 upload guidelines -->
              <input type="file" class="file-input" @change="${this.uploadFile}"/>
            </label>
          </div>
          <a href="${this.generatedLink.valueOf()}" style="display: ${this.showUrlContainer ? 'block' : 'none'};"
             target="_blank"><img
            class="thumbnail" ${this.imageValid ? '' : 'hidden'}"
              src=${this.imageValid ? this.linkUrl : ''}
            /></a>
          <md-outlined-text-field
            style="display: ${this.showLinkInput ? 'block' : 'none'};"
            label="URL" .value=${this.linkUrl}
            @input=${this.handleInput}></md-outlined-text-field>
          <md-circular-progress four-color value="${fileUploadProgress.get()}"></md-circular-progress>
        </div>
      </div>
      ${this.uploadError ? html`<div class="upload-error">${this.uploadError}</div>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-upload-link': DfUploadLink;
  }
}
