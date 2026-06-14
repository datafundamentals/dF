import { css, html, LitElement, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { marked } from 'marked';
import { countTokens, parseMarkdown } from './file-processing.js';

@customElement('df-work-request-preview')
export class DfWorkRequestPreview extends LitElement {
  @property({ type: String })
  declare markdownContent: string;

  @state()
  declare private showEditor: boolean;

  // Derived values — computed in willUpdate(), not @state to avoid update loops
  private tokenCount = 0;
  private renderedHtml = '';

  constructor() {
    super();
    this.markdownContent = '';
    this.showEditor = false;
  }

  private editorView: EditorView | null = null;

  static override styles = css`
    :host {
      display: block;
      font-family: 'Roboto', sans-serif;
    }

    .container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .preview {
      padding: 24px;
      background-color: #ffffff;
      border: 1px solid var(--md-sys-color-outline-variant, #c7c5d0);
      border-radius: 16px;
      color: var(--md-sys-color-on-surface, #1c1b1f);
      font-family: var(--md-sys-typescale-body-medium-font, 'Roboto', sans-serif);
      line-height: var(--md-sys-typescale-body-medium-line-height, 20px);
      box-shadow: var(--md-sys-elevation-level1, 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15));
    }

    .preview h1,
    .preview h2,
    .preview h3,
    .preview h4,
    .preview h5,
    .preview h6 {
      margin-top: 24px;
      margin-bottom: 16px;
      font-weight: var(--md-sys-typescale-title-medium-weight, 500);
      color: var(--md-sys-color-on-surface, #1c1b1f);
    }

    .preview p {
      margin-bottom: 16px;
      color: var(--md-sys-color-on-surface, #1c1b1f);
    }

    .preview pre {
      background-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
      border: 1px solid var(--md-sys-color-outline-variant, #c7c5d0);
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
    }

    .preview code {
      background-color: var(--md-sys-color-surface-container-high, #ece6f0);
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .preview blockquote {
      border-left: 4px solid var(--md-sys-color-primary, #6750a4);
      margin: 16px 0;
      padding: 8px 16px;
      background-color: var(--md-sys-color-surface-container-low, #f7f2fa);
      font-style: italic;
    }

    .token-display {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .token-count {
      font-family: 'Courier New', monospace;
      font-weight: bold;
      font-size: 16px;
      padding: 4px 12px;
      border-radius: 8px;
      min-width: 60px;
      text-align: center;
    }

    .token-good {
      background-color: var(--md-sys-color-tertiary-container, #d8e5d8);
      color: var(--md-sys-color-on-tertiary-container, #0d3818);
      border: 1px solid var(--md-sys-color-tertiary, #5e795f);
    }

    .token-approaching {
      background-color: var(--md-sys-color-secondary-container, #e6e1ff);
      color: var(--md-sys-color-on-secondary-container, #1d1b20);
      border: 1px solid var(--md-sys-color-secondary, #9a91c4);
    }

    .token-warning {
      background-color: #ffeaa7;
      color: #d63031;
      border: 1px solid #fdcb6e;
    }

    .token-over-limit {
      background-color: #ff7675;
      color: #ffffff;
      border: 1px solid #d63031;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .token-label {
      font-size: 14px;
      color: var(--md-sys-color-on-surface-variant, #49454f);
    }

    .editor-wrapper {
      border: 1px solid var(--md-sys-color-outline-variant, #c7c5d0);
      border-radius: 8px;
      overflow: hidden;
    }
  `;

  override willUpdate(_changedProperties: Map<PropertyKey, unknown>) {
    const content = this.markdownContent || '';
    this.renderedHtml = String(marked.parse(content));
    const parsed = parseMarkdown(content);
    this.tokenCount = countTokens(parsed.content || '');
  }

  override updated() {
    if (this.showEditor) {
      this.initEditorIfNeeded();
    }
  }

  private initEditorIfNeeded() {
    const editorElement = this.shadowRoot?.getElementById('editor');
    if (!editorElement || this.editorView) return;

    this.editorView = new EditorView({
      state: EditorState.create({
        doc: this.markdownContent,
        extensions: [
          basicSetup,
          markdown(),
          keymap.of(defaultKeymap),
          EditorView.editable.of(false),
          EditorState.readOnly.of(true),
        ],
      }),
      parent: editorElement,
    });
  }

  private toggleEditor() {
    this.showEditor = !this.showEditor;
    if (!this.showEditor && this.editorView) {
      this.editorView.destroy();
      this.editorView = null;
    }
  }

  private getTokenColorClass(): string {
    if (this.tokenCount > 500) return 'token-over-limit';
    if (this.tokenCount > 300) return 'token-warning';
    if (this.tokenCount > 250) return 'token-approaching';
    return 'token-good';
  }

  override render() {
    return html`
      <div class="container">
        <div class="preview">${unsafeHTML(this.renderedHtml)}</div>

        <div class="token-display">
          <span class="token-count ${this.getTokenColorClass()}">${this.tokenCount}</span>
          <span class="token-label">tokens</span>
        </div>

        <md-filled-tonal-button @click=${this.toggleEditor}>
          ${this.showEditor ? 'Hide Editor' : 'Show Editor'}
        </md-filled-tonal-button>

        ${this.showEditor
          ? html`<div class="editor-wrapper"><div id="editor"></div></div>`
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-work-request-preview': DfWorkRequestPreview;
  }
}
