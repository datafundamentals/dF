/**
 * ✅ TEMPLATE: MD3-Compliant Component
 *
 * Copy this file when creating a new UI component. All required Material Web
 * imports are scaffolded for you and an inline warning ensures standards stay
 * front-of-mind. Delete any imports you do not need.
 */

import {LitElement, html, css} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';

// ✅ Required MD3 imports (trim what you don't need).
// Prefer Material Web components whenever they exist. If the MD3 spec does not
// provide an official component, implement it manually using MD3 tokens and add
// an inline eslint-disable note with a link to the spec (see
// guides/STANDARDS_STYLES.md#md3-gaps).
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/radio/radio.js';

/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * This component MUST use Material Design 3 web components from @material/web.
 *
 * ✅ ALLOWED:
 * - <md-filled-button>, <md-outlined-button>, <md-text-button>
 * - <md-outlined-text-field>, <md-filled-text-field>
 * - <md-filled-select>, <md-outlined-select> with <md-select-option>
 * - <md-checkbox>, <md-radio>
 *
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 *
 * See:
 * - /guides/STANDARDS_STYLES.md#material-design-3
 * - /packages/ui-lit/README.md
 * - /packages/ui-lit/src/df-upload-link.ts (compliant example)
 *
 * Build will FAIL if native HTML elements are detected.
 */
@customElement('df-example-component')
export class DfExampleComponent extends SignalWatcher(LitElement) {
  @property({type: Boolean}) declare disabled: boolean;
  @state() private counter = 0;

  constructor() {
    super();
    this.disabled = false;
  }

  static override styles = css`
    :host {
      display: block;
      padding: 1.5rem;
      border-radius: 1rem;
      background: var(--md-sys-color-surface, #fff);
      color: var(--md-sys-color-on-surface, #1f1f1f);
      box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
    }
  `;

  override render() {
    return html`
      <!-- ✅ Example: MD3 button -->
      <md-filled-button @click=${this.handleIncrement} ?disabled=${this.disabled}>
        Increment (${this.counter})
      </md-filled-button>

      <!-- ✅ Example: MD3 text field -->
      <md-outlined-text-field
        label="Example text"
        @input=${this.handleInput}
        supporting-text="Use MD3 text fields for all inputs">
      </md-outlined-text-field>

      <!-- ❌ NEVER DO THIS -->
      <!-- <button>Do not use native buttons</button> -->
      <!-- <input type="text">Do not use native inputs</input> -->
    `;
  }

  private handleIncrement() {
    this.counter += 1;
  }

  private handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.dispatchEvent(
      new CustomEvent('df-example-input', {
        detail: {value: target.value},
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-example-component': DfExampleComponent;
  }
}
