/**
 * Placeholder component for starter template.
 * Replace this with your shared web components.
 */

import {LitElement, html, css} from 'lit';
import {customElement} from 'lit/decorators.js';

@customElement('remove-replace-me')
export class RemoveReplaceMe extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: 2rem;
      background: var(--md-sys-color-surface-variant, #f5f5f5);
      border-radius: 0.5rem;
      border: 1px solid var(--md-sys-color-outline, #ccc);
      font-family: var(--md-sys-typescale-body-large-font, system-ui, sans-serif);
      color: var(--md-sys-color-on-surface, #1f1f1f);
    }
  `;

  override render() {
    return html`
      <p>placeholder - your shared web components go here</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'remove-replace-me': RemoveReplaceMe;
  }
}
