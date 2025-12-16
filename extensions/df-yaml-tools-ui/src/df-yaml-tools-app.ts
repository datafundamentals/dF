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
  @state() private betterologyChecked = false;
  @state() private marketingChecked = false;
  @state() private contentChecked = false;
  @state() private devChecked = false;
  @state() private nbtrgChecked = false;
  @state() private yamlFiles: string[] = [];

  private vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined;
  private _messageHandler = this._handleMessage.bind(this);

  constructor() {
    super();
    this.fileName = '...';
  }

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener('message', this._messageHandler);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('message', this._messageHandler);
  }

  private _handleMessage(event: MessageEvent) {
    const message = event.data;
    if (message.command === 'updateContent') {
      this.fileName = message.data.fileName;
      this.currentContent = message.data.content;
      this.isDirty = message.data.isDirty ?? false;
      this.yamlFiles = message.data.yamlFiles ?? [];
      // reset tagging status on new content to reduce stale state
      this.taggingStatus = 'idle';
      this.taggingMessage = '';
      // Sync checkbox state with actual file content
      this._syncCheckboxesFromContent(message.data.content);
    }

    if (message.command === 'taggingResult') {
      this.taggingStatus = message.status;
      this.taggingMessage = message.message;
      // Clear tag input on successful tagging
      if (message.status === 'success') {
        this.tagInput = '';
      }
    }
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
    df-yaml-nav {
      margin-bottom: 6px;
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

  private _syncCheckboxesFromContent(content: string) {
    // Check for tags in AI-tagging section
    // Match "- tagname" anywhere after "AI-tagging:"
    const aiTaggingMatch = /AI-tagging:([\s\S]*?)(?=\n[^\s-]|\n\n|$)/.exec(content);
    const aiTaggingSection = aiTaggingMatch ? aiTaggingMatch[1] : '';

    this.archiveChecked = /^\s*-\s*archive\b/m.test(aiTaggingSection);
    this.betterologyChecked = /^\s*-\s*betterology\b/m.test(aiTaggingSection);
    this.marketingChecked = /^\s*-\s*marketing\b/m.test(aiTaggingSection);
    this.contentChecked = /^\s*-\s*content\b/m.test(aiTaggingSection);
    this.devChecked = /^\s*-\s*dev\b/m.test(aiTaggingSection);
    this.nbtrgChecked = /^\s*-\s*nbtrg\b/m.test(aiTaggingSection);
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

    this.taggingStatus = 'working';
    this.taggingMessage = 'Adding tag(s)...';
    this.vscode.postMessage({
      command: 'addTags',
      tag: trimmedTag,
      includeArchive: this.archiveChecked,
      includeBetterology: this.betterologyChecked,
      includeMarketing: this.marketingChecked,
      includeContent: this.contentChecked,
      includeDev: this.devChecked,
      includeNbtrg: this.nbtrgChecked
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

  private _onBetterologyToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.betterologyChecked = target.checked;
    // Trigger tagging on checkbox change
    this._handleAddTags();
  }

  private _onMarketingToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.marketingChecked = target.checked;
    // Trigger tagging on checkbox change
    this._handleAddTags();
  }

  private _onContentToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.contentChecked = target.checked;
    // Trigger tagging on checkbox change
    this._handleAddTags();
  }

  private _onDevToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.devChecked = target.checked;
    // Trigger tagging on checkbox change
    this._handleAddTags();
  }

  private _onNbtrgToggle(event: Event) {
    const target = event.target as HTMLInputElement;
    this.nbtrgChecked = target.checked;
    // Trigger tagging on checkbox change
    this._handleAddTags();
  }

  private _handleNavigate(event: CustomEvent) {
    if (!this.vscode) {
      return;
    }
    this.vscode.postMessage({
      command: 'navigateToFile',
      fileName: event.detail.fileName
    });
  }

  override render() {
    const state = markdownTokensState.get() as MarkdownTokensState;
    const isError = state.status === 'error';
    const isLoading = state.status === 'counting';
    const isButtonDisabled = isLoading || this.isDirty;

    return html`
      <div class="container">
        <div class="file-info">
          <df-yaml-nav
            .currentFile=${this.fileName}
            .yamlFiles=${this.yamlFiles}
            @navigate=${this._handleNavigate}>
          </df-yaml-nav>
          <div class="tag-form">
            <div class="checkbox-row">
              <md-checkbox
                .checked=${this.betterologyChecked}
                @change=${this._onBetterologyToggle}
                ?disabled=${this.isDirty}>
              </md-checkbox>
              <span @click=${this._onBetterologyToggle}>betterology</span>
            </div>
            <div class="checkbox-row">
              <md-checkbox
                .checked=${this.marketingChecked}
                @change=${this._onMarketingToggle}
                ?disabled=${this.isDirty}>
              </md-checkbox>
              <span @click=${this._onMarketingToggle}>marketing</span>
            </div>
            <div class="checkbox-row">
              <md-checkbox
                .checked=${this.contentChecked}
                @change=${this._onContentToggle}
                ?disabled=${this.isDirty}>
              </md-checkbox>
              <span @click=${this._onContentToggle}>content</span>
            </div>
            <div class="checkbox-row">
              <md-checkbox
                .checked=${this.devChecked}
                @change=${this._onDevToggle}
                ?disabled=${this.isDirty}>
              </md-checkbox>
              <span @click=${this._onDevToggle}>dev</span>
            </div>
            <div class="checkbox-row">
              <md-checkbox
                .checked=${this.nbtrgChecked}
                @change=${this._onNbtrgToggle}
                ?disabled=${this.isDirty}>
              </md-checkbox>
              <span @click=${this._onNbtrgToggle}>nbtrg</span>
            </div>
            <div class="checkbox-row">
              <md-checkbox
                .checked=${this.archiveChecked}
                @change=${this._onArchiveToggle}
                ?disabled=${this.isDirty}>
              </md-checkbox>
              <span @click=${this._onArchiveToggle}>archive</span>
            </div>
            <div class="checkbox-row">
              <md-checkbox
                .checked=${false}
                @change=${this._onDeleteToggle}
                ?disabled=${this.isDirty}>
              </md-checkbox>
              <span @click=${this._onDeleteToggle}>delete</span>
            </div>
            <md-outlined-text-field
              label="Tag (optional)"
              .value=${this.tagInput}
              @input=${this._onTagInput}
              @keydown=${this._onTagKeydown}
              ?disabled=${this.isDirty}>
            </md-outlined-text-field>
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
