import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@df/ui-lit/df-chat-widget';

@customElement('df-chat-app')
export class DfChatApp extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: clamp(1.5rem, 4vw, 3rem);
      background: radial-gradient(circle at top, rgba(59, 130, 246, 0.12), transparent 55%),
        var(--md-sys-color-surface, #f8fafc);
      box-sizing: border-box;
    }

    .shell {
      width: min(440px, 100%);
      display: flex;
      justify-content: center;
    }
  `;

  override render() {
    return html`
      <div class="shell">
        <df-chat-widget heading="df chat"></df-chat-widget>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-chat-app': DfChatApp;
  }
}
