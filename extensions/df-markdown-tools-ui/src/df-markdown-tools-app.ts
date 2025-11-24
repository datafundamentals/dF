import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@material/web/button/filled-button.js';

@customElement('df-markdown-tools-app')
export class DfMarkdownToolsApp extends LitElement {
  @property({ type: String }) declare fileName: string;

  constructor() {
    super();
    this.fileName = '...';
    
    // Listen for messages from VS Code
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'updateContext') {
        this.fileName = message.data.fileName;
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
      align-items: flex-start;
    }
    h2 {
      margin: 0;
      font-size: 1.2rem;
    }
    p {
      margin: 0;
      opacity: 0.8;
    }
  `;

  render() {
    return html`
      <div class="container">
        <h2>Markdown Tools</h2>
        <p>You have <strong>${this.fileName}</strong> opened and ready to extend this webView with.</p>
        
        <md-filled-button @click=${this._handleTest}>
          Test Action
        </md-filled-button>
      </div>
    `;
  }

  private _handleTest() {
    console.log('Button clicked');
    // @ts-ignore
    if (window.acquireVsCodeApi) {
      // @ts-ignore
      const vscode = window.acquireVsCodeApi();
      vscode.postMessage({
        command: 'alert',
        text: 'Hello from Lit!'
      });
    }
  }
}
