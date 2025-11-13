import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('rename-me-app-container')
export class RenameMeAppContainer extends LitElement {
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
    'rename-me-app-container': RenameMeAppContainer;
  }
}
