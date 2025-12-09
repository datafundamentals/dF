import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { markdownTokensState, updateTokenCount } from '@df/state';
import type { MarkdownTokensState } from '@df/types';
import '@material/web/button/filled-button.js';

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
      }

      if (message.command === 'taggingResult') {
        this.taggingStatus = message.status;
        this.taggingMessage = message.message;
      }
    });
  }

  static styles = css`
    :host {
      display: block;
      padding: 16px;
      font-family: var(--vscode-font-family, sans-serif);
      color: var(--vscode-foreground);
    }
    .container {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    h2 {
      margin: 0;
      font-size: 1.2rem;
    }
    .file-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      background-color: var(--vscode-editor-background);
      border-radius: 4px;
    }
    .file-name {
      margin: 0;
      opacity: 0.8;
      font-size: 0.9rem;
    }
    .token-count {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--vscode-foreground);
    }
    .token-count strong {
      color: var(--vscode-symbolIcon-numberForeground, #b5cea8);
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
    .button-container {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    md-filled-button {
      flex: 1;
    }
    .tag-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 16px;
    }
    .tag-input {
      width: 100%;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid var(--vscode-input-border, rgba(255, 255, 255, 0.1));
      background: var(--vscode-input-background, #1e1e1e);
      color: var(--vscode-foreground);
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
    }
  `;

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
    this.tagInput = (event.target as HTMLInputElement).value ?? '';
  }

  private _onArchiveToggle(event: Event) {
    this.archiveChecked = (event.target as HTMLInputElement).checked;
  }

  override render() {
    const state = markdownTokensState.get() as MarkdownTokensState;
    const isError = state.status === 'error';
    const isLoading = state.status === 'counting';
    const isButtonDisabled = isLoading || this.isDirty;
    const isTagButtonDisabled = this.isDirty || this.taggingStatus === 'working';

    return html`
      <div class="container">
        <h2>YAML Tools</h2>

        <div class="file-info">
          <p class="file-name">File: <strong>${this.fileName}</strong></p>

          <!-- Debug: Show isDirty state visibly -->
          <p style="font-size: 0.75rem; opacity: 0.5; margin: 0;">
            ${this.isDirty ? '🔴 File has unsaved changes' : '🟢 File is saved'}
          </p>

          ${state.tokenCount > 0 ? html`
            <p class="token-count">
              Token Count: <strong>${state.tokenCount}</strong>
            </p>
          ` : html`
            <p class="token-count" style="opacity: 0.5;">
              Click to count tokens
            </p>
          `}

          <div class="button-container">
            <md-filled-button
              @click=${this._handleCountTokens}
              ?disabled=${isButtonDisabled}>
              ${isLoading ? '⏳ Counting...' : this.isDirty ? '💾 Save first' : 'Count Tokens'}
            </md-filled-button>

            <md-filled-button
              @click=${this._handleAddTags}
              ?disabled=${isTagButtonDisabled}>
              ${this.taggingStatus === 'working' ? '⏳ Tagging...' : this.isDirty ? '💾 Save first' : 'Add Tag(s)'}
            </md-filled-button>
          </div>

          <div class="tag-form">
            <input
              class="tag-input"
              type="text"
              placeholder="Enter a tag (optional)"
              .value=${this.tagInput}
              @input=${this._onTagInput}
            />
            <label class="checkbox-row">
              <input
                type="checkbox"
                .checked=${this.archiveChecked}
                @change=${this._onArchiveToggle}
              />
              Include "archive"
            </label>
          </div>

          ${this.isDirty ? html`
            <p class="status" style="opacity: 0.7; color: var(--vscode-editorWarning-foreground, #dcdcaa);">
              ℹ️ Save your changes before counting tokens
            </p>
          ` : state.status !== 'idle' ? html`
            <p class="status ${isError ? 'error' : ''}">
              ${isLoading ? '⏳ Counting...' : isError ? `❌ ${state.errorMessage}` : '✓ Complete'}
            </p>
          ` : ''}

          ${this.taggingStatus !== 'idle' ? html`
            <p class="status ${this.taggingStatus === 'error' ? 'error' : ''}">
              ${this.taggingStatus === 'working' ? '⏳ Tagging...' : this.taggingMessage || 'Tagging complete'}
            </p>
          ` : ''}
        </div>
      </div>
    `;
  }
}
