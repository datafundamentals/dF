/**
 * MD3 COMPLIANCE WARNING - STANDARDS_STYLES.md
 * 
 * This component MUST use Material Design 3 (MD3) components exclusively.
 * 
 * ✅ ALLOWED:
 * - @material/web components (md-filled-button, md-outlined-button, etc.)
 * - Semantic HTML for structure (<div>, <span>, <section>, <header>, etc.)
 * 
 * ❌ STRICTLY FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 * 
 * See STANDARDS_STYLES.md § "Material Design 3 (MD3) Components" for full requirements.
 */

import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';

@customElement('df-firestore-delete')
export class DfFirestoreDelete extends LitElement {
  static override styles = css`
    :host {
      display: block;
      background: var(--md-sys-color-surface, #fff);
      border-radius: 16px;
      border: 1px solid var(--md-sys-color-error, rgba(185, 28, 28, 0.3));
      padding: 1.25rem;
      max-width: 420px;
      box-shadow: 0 16px 40px rgba(185, 28, 28, 0.15);
    }

    h3 {
      margin: 0 0 0.6rem;
      color: var(--md-sys-color-error, #991b1b);
    }

    p {
      margin: 0 0 1rem;
      color: var(--md-sys-color-on-surface-variant, #475569);
      line-height: 1.5;
    }

    footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    /* MD3 buttons handle their own styling */
  `;

  @property({type: String}) todoId = '';
  @property({type: String}) todoTitle = '';

  override render() {
    return html`
      <h3>Delete todo</h3>
      <p>
        Are you sure you want to delete <strong>${this.todoTitle || 'this todo'}</strong>? This action cannot be
        undone.
      </p>
      <footer>
        <md-outlined-button @click=${this.handleCancel}>Cancel</md-outlined-button>
        <md-filled-button @click=${this.handleConfirm}>Delete</md-filled-button>
      </footer>
    `;
  }

  private handleConfirm() {
    this.dispatchEvent(
      new CustomEvent<{id: string}>(
        'df-firestore-delete-confirm',
        {
          detail: {id: this.todoId},
          bubbles: true,
          composed: true,
        }
      )
    );
  }

  private handleCancel() {
    this.dispatchEvent(
      new CustomEvent('df-firestore-delete-cancel', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-firestore-delete': DfFirestoreDelete;
  }
}

