import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { markdownTokensState, updateTokenCount } from '@df/state';
import type { MarkdownTokensState } from '@df/types';

declare const acquireVsCodeApi: undefined | (() => { postMessage: (message: unknown) => void });

@customElement('df-yaml-tools-app')
export class DfYamlToolsApp extends SignalWatcher(LitElement) {
  @property({ type: String }) declare fileName: string;
  @state() private currentContent = '';
  @state() private isDirty = false;
  @state() private taggingStatus: 'idle' | 'working' | 'success' | 'error' = 'idle';
  @state() private taggingMessage = '';
  @state() private tagInput = '';
  @state() private archiveChecked = true;

  private vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;

  constructor() {
    super();
    this.fileName = '...';

    // Listen for messages from VS Code
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'updateContent') {
        this.fileName = message.data.fileName;
        this.currentContent = message.data.content;
        this.isDirty = message.data.isDirty ?? false;
        // reset tagging status on new content to reduce stale state
        this.taggingStatus = 'idle';
        this.taggingMessage = '';
        // Sync checkbox state with actual file content
        this._syncArchiveCheckboxFromContent(message.data.content);
      }

      if (message.command === 'taggingResult') {
        this.taggingStatus = message.status;
        this.taggingMessage = message.message;
        // Clear tag input on successful tagging
        if (message.status === 'success') {
          this.tagInput = '';
        }
      }
    });
  }

  static styles = css`
    :host {
      display: flex;
      min-height: 100vh;
      padding: 16px;
      font-family: var(--vscode-font-family, sans-serif);
      color: var(--vscode-foreground);
      box-sizing: border-box;
    }
    .container {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      min-height: calc(100vh - 32px);
    }
    .file-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      opacity: 0.8;
    }
    .file-name {
      margin: 0;
    }
    .saved-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--vscode-testing-iconPassed, #73c991);
    }
    .footer {
      margin-top: auto;
      padding-top: 12px;
      padding-bottom: 8px;
      border-top: 1px solid var(--vscode-panel-border, rgba(255, 255, 255, 0.1));
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.75rem;
      opacity: 0.6;
      flex-shrink: 0;
    }
    .footer button {
      background: none;
      border: none;
      color: var(--vscode-textLink-foreground, #3794ff);
      cursor: pointer;
      padding: 0;
      font-size: inherit;
      text-decoration: underline;
    }
    .footer button:hover {
      color: var(--vscode-textLink-activeForeground, #4daafc);
    }
    .footer button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      text-decoration: none;
    }
    .footer .token-result {
      color: var(--vscode-symbolIcon-numberForeground, #b5cea8);
    }
    .file-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background-color: var(--vscode-editor-background);
      border-radius: 4px;
      flex-shrink: 0;
      margin-top: 40vh;
    }
    .status {
      margin: 0;
      opacity: 0.6;
      font-size: 0.85rem;
    }
    .status.error {
      color: var(--vscode-errorForeground, #f48771);
      opacity: 1;
    }
    .tag-form {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    md-outlined-text-field {
      width: 100%;
      --md-outlined-text-field-container-shape: 4px;
      --md-outlined-text-field-top-space: 8px;
      --md-outlined-text-field-bottom-space: 8px;
      --md-outlined-text-field-leading-space: 12px;
      --md-outlined-text-field-trailing-space: 12px;
      --md-outlined-text-field-outline-color: var(--vscode-input-border, rgba(255, 255, 255, 0.1));
      --md-outlined-text-field-focus-outline-color: var(--vscode-focusBorder, #007acc);
      --md-outlined-text-field-input-text-color: var(--vscode-input-foreground, var(--vscode-foreground));
      --md-outlined-text-field-label-text-color: var(--vscode-input-foreground, var(--vscode-foreground));
      --md-sys-color-on-surface: var(--vscode-input-foreground, var(--vscode-foreground));
      --md-sys-color-on-surface-variant: var(--vscode-input-foreground, var(--vscode-foreground));
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
    }
    md-checkbox {
      --md-checkbox-container-size: 16px;
      --md-checkbox-selected-container-color: var(--vscode-checkbox-background, #007acc);
      --md-checkbox-outline-color: var(--vscode-checkbox-border, rgba(255, 255, 255, 0.3));
      --md-checkbox-state-layer-size: 18px;
      flex-shrink: 0;
    }
  `;

  private _syncArchiveCheckboxFromContent(content: string) {
    // Simple string-based check for "archive" in AI-tagging section
    // Look for AI-tagging: followed by - archive
    const hasArchiveTag = /AI-tagging:\s*\n\s*-\s*archive\b/.test(content);
    this.archiveChecked = hasArchiveTag;
  }

  private async _handleCountTokens() {
    // Count the tokens in the content we already have
    await updateTokenCount(this.currentContent);
  }

  private _handleAddTags() {
    if (!this.vscode) {
      this.taggingStatus = 'error';
      this.taggingMessage = 'VS Code API unavailable';
      return;
    }

    const trimmedTag = this.tagInput.trim();
    if (!this.archiveChecked && !trimmedTag) {
      this.taggingStatus = 'error';
      this.taggingMessage = 'Enter a tag or enable archive';
      return;
    }

    this.taggingStatus = 'working';
    this.taggingMessage = 'Adding tag(s)...';
    this.vscode.postMessage({
      command: 'addTags',
      tag: trimmedTag,
      includeArchive: this.archiveChecked
    });
  }

  private _onTagInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.tagInput = target.value ?? '';
  }

  private _onTagKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this._handleAddTags();
    }
  }

  private _onDeleteToggle(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLInputElement;
    // Always uncheck immediately (acts like a button)
    target.checked = false;

    if (!this.vscode) {
      this.taggingStatus = 'error';
      this.taggingMessage = 'VS Code API unavailable';
      return;
    }

    // Trigger delete workflow
    this.vscode.postMessage({
      command: 'deleteFile'
    });
  }

  private _onArchiveToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.archiveChecked = target.checked;
    // Trigger tagging on checkbox change
    this._handleAddTags();
  }

  override render() {
    const state = markdownTokensState.get() as MarkdownTokensState;
    const isError = state.status === 'error';
    const isLoading = state.status === 'counting';
    const isButtonDisabled = isLoading || this.isDirty;

    return html`
      <div class="container">
        <div class="file-info">
          <div class="tag-form">
            <md-outlined-text-field
              label="Tag (optional)"
              .value=${this.tagInput}
              @input=${this._onTagInput}
              @keydown=${this._onTagKeydown}
              ?disabled=${this.isDirty}>
            </md-outlined-text-field>
            <div class="checkbox-row">
              <md-checkbox
                .checked=${false}
                @change=${this._onDeleteToggle}
                ?disabled=${this.isDirty}>
              </md-checkbox>
              <span @click=${this._onDeleteToggle}>delete</span>
            </div>
            <div class="checkbox-row">
              <md-checkbox
                .checked=${this.archiveChecked}
                @change=${this._onArchiveToggle}
                ?disabled=${this.isDirty}>
              </md-checkbox>
              <span @click=${this._onArchiveToggle}>archive</span>
            </div>
          </div>

          ${this.isDirty ? html`
            <p class="status" style="opacity: 0.7; color: var(--vscode-editorWarning-foreground, #dcdcaa);">
              ℹ️ Save your changes first
            </p>
          ` : isError ? html`
            <p class="status error">
              ❌ ${state.errorMessage}
            </p>
          ` : ''}

          ${this.taggingStatus === 'error' ? html`
            <p class="status error">
              ❌ ${this.taggingMessage}
            </p>
          ` : ''}
        </div>

        <div class="footer">
          <span class="file-name">${this.fileName}</span>
          ${!this.isDirty ? html`
            <span class="saved-indicator">● saved</span>
          ` : ''}
          <button
            @click=${this._handleCountTokens}
            ?disabled=${isButtonDisabled}>
            ${isLoading ? 'counting...' : 'count tokens'}
          </button>
          ${state.tokenCount > 0 ? html`
            <span class="token-result">${state.tokenCount}</span>
          ` : ''}
        </div>
      </div>
    `;
  }
}
