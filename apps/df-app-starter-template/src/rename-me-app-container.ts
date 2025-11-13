import {css, html, LitElement} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('rename-me-app-container')
export class RenameMeAppContainer extends LitElement {
  static override styles = css`
    :host {
      display: block;
      width: 100%;
    }
  `;

  override render() {
    return html`<remove-replace-me></remove-replace-me>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rename-me-app-container': RenameMeAppContainer;
  }
}
