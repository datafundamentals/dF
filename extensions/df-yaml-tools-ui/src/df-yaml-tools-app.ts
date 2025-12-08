import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { markdownTokensState, updateTokenCount } from '@df/state';
import type { MarkdownTokensState } from '@df/types';
import '@material/web/button/filled-button.js';

@customElement('df-yaml-tools-app')
export class DfYamlToolsApp extends SignalWatcher(LitElement) {
  @property({ type: String }) declare fileName: string;
  @state() private currentContent = '';
  @state() private isDirty = false;

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
  `;

  private async _handleCountTokens() {
    // Count the tokens in the content we already have
    await updateTokenCount(this.currentContent);
  }

  override render() {
    const state = markdownTokensState.get() as MarkdownTokensState;
    const isError = state.status === 'error';
    const isLoading = state.status === 'counting';
    const isButtonDisabled = isLoading || this.isDirty;

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
        </div>
      </div>
    `;
  }
}
