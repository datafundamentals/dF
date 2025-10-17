/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * This component implements the Material Design 3 segmented button pattern. The
 * Material Web library does not provide an out-of-the-box segmented button, so
 * we follow the official MD3 spec with custom rendering while keeping native
 * semantics for keyboard accessibility.
 *
 * ✅ ALLOWED: Custom MD3 implementations when no Material Web component exists.
 * ❌ FORBIDDEN: Diverging from MD3 typography, color, and interaction specs.
 *
 * See:
 * - https://m3.material.io/components/segmented-buttons/specs
 * - /guides/STANDARDS_STYLES.md#material-design-3
 */

import {css, html, LitElement} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {customElement, property} from 'lit/decorators.js';

@customElement('df-segmented-button')
export class DfSegmentedButton extends LitElement {
  @property({ type: String })
  declare selected: string;
  
  @property({ type: Array })
  declare disabledOptions: string[];

  constructor() {
    super();
    this.selected = '0';
    this.disabledOptions = [];
  }

  static override styles = css`
    :host {
      display: block;
      font-family: 'Roboto', sans-serif;
    }

    .container {
      display: flex;
      border: 1px solid var(--md-sys-color-outline, #c6c6c6);
      border-radius: 12px;
      overflow: hidden;
    }

    .button {
      flex: 1;
      padding: 2px 8px;
      text-align: center;
      cursor: pointer;
      background-color: var(--md-sys-color-surface, #ffffff);
      color: var(--md-sys-color-on-surface, #000000);
      border: none;
      outline: none;
      font-size: 14px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .button.selected {
      background-color: var(--md-sys-color-primary, #6200ea);
      color: var(--md-sys-color-on-primary, #ffffff);
    }

    .button:not(.selected):hover {
      background-color: var(--md-sys-color-surface-variant, #f5f5f5);
    }

    .button:not(:last-child) {
      border-right: 1px solid var(--md-sys-color-outline, #c6c6c6);
    }

    svg {
      width: 20px;
      height: 20px;
      fill: currentColor;
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  private handleSelect(option: string) {
    this.selected = option;
    this.dispatchEvent(new CustomEvent('df-segmented-button-change', { 
      detail: { id: option }, 
      bubbles: true,
      composed: true 
    }));
  }

  override render() {
    const options = [
      {
        value: '0',
        label: '',
        icon: html`
          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960">
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        `,
      },
      {
        value: 'Upload',
        label: '',
        icon: html`
          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960">
            <path
              d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z"
            />
          </svg>
        `,
      },
      {
        value: 'Site',
        label: '',
        icon: html`
          <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960">
            <path
              d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"
            />
          </svg>
        `,
      },
      {
        value: 'Add',
        label: '',
        icon: html`
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
          </svg>
        `,
      },
    ];

    return html`
      <div class="container">
        ${options
          .filter(({value}) => !this.disabledOptions.includes(value))
          .map(({value, label, icon}) => {
            // md3-gap: segmented button spec https://m3.material.io/components/segmented-buttons/specs
            return html`
              <button
                class=${classMap({button: true, selected: this.selected === value})}
                type="button"
                role="radio"
                aria-checked=${this.selected === value}
                @click=${() => this.handleSelect(value)}
              >
                ${icon ? html`<span class="icon">${icon}</span>` : ''} ${label}
              </button>
            `;
          })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-segmented-button': DfSegmentedButton;
  }
}
