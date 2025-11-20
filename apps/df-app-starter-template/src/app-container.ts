import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('app-container')
export class AppContainer extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }

    .content {
      padding: 1.5rem;
    }
  `;

  override render() {
    return html`
      <div class="content">
        <remove-replace-me></remove-replace-me>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-container': AppContainer;
  }
}
