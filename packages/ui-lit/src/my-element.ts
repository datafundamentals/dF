/**
 * Example element demonstrating MD3 compliance by using Material Web buttons.
 */

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@material/web/button/filled-button.js';

@customElement('my-element')
export class MyElement extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: solid 1px rgba(148, 163, 184, 0.4);
      padding: 16px;
      max-width: 800px;
      border-radius: 12px;
      background: var(--md-sys-color-surface, #fff);
    }
  `;

  @property()
  declare name: string;

  @property({type: Number})
  declare count: number;

  constructor() {
    super();
    this.name = 'World';
    this.count = 0;
  }

  override render() {
    return html`
      <h1>${this.sayHello(this.name)}!</h1>
      <md-filled-button @click=${this.onClick}>
        Click Count: ${this.count}
      </md-filled-button>
      <slot></slot>
    `;
  }

  private onClick() {
    this.count += 1;
    this.dispatchEvent(new CustomEvent('count-changed'));
  }

  sayHello(name: string): string {
    return `Hello, ${name}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement;
  }
}
