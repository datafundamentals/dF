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
import type {TodoDocument} from '@df/types';

import '@material/web/button/outlined-button.js';

export interface FirestoreItemToggleDetail {
  id: string;
  completed: boolean;
}

@customElement('df-firestore-item')
export class DfFirestoreItem extends LitElement {
  static override styles = css`
    :host {
      display: block;
      border: 1px solid var(--df-border-color, rgba(15, 23, 42, 0.12));
      border-radius: 12px;
      padding: var(--df-spacing-4, 1.25rem);
      background: var(--df-surface-color, #fff);
      box-shadow: var(--df-shadow-md, 0 10px 30px rgba(15, 23, 42, 0.08));
    }

    header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    h3 {
      margin: 0;
      font-size: 1.125rem;
      color: var(--df-text-primary, #0f172a);
    }

    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0.75rem 0;
      color: var(--df-text-secondary, #475569);
      font-size: 0.9rem;
    }

    .tag {
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      background: rgba(99, 102, 241, 0.12);
      color: #4338ca;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .priority[data-priority='high'] {
      color: #b91c1c;
    }

    .priority[data-priority='medium'] {
      color: #b45309;
    }

    .priority[data-priority='low'] {
      color: #0f766e;
    }

    .body {
      margin: 0;
      color: var(--df-text-secondary, #475569);
      line-height: 1.55;
    }

    footer {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1rem;
      align-items: center;
    }

    /* MD3 buttons handle their own styling */

    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.14);
      color: #047857;
      font-size: 0.78rem;
      font-weight: 600;
    }

    .status-pill[data-state='completed'] {
      background: rgba(16, 185, 129, 0.14);
      color: #047857;
    }

    .status-pill[data-state='active'] {
      background: rgba(59, 130, 246, 0.14);
      color: #1d4ed8;
    }

    .status-pill[data-state='overdue'] {
      background: rgba(185, 28, 28, 0.14);
      color: #b91c1c;
    }
  `;

  @property({attribute: false}) todo: TodoDocument | null = null;
  @property({type: Boolean}) actions = true;

  override render() {
    if (!this.todo) {
      return html`<p>Todo data unavailable.</p>`;
    }

    const dueState = this.getDueState();

    return html`
      <header>
        <div>
          <h3>${this.todo.title}</h3>
          <div class="meta">
            <span class="priority" data-priority=${this.todo.priority}>Priority: ${this.todo.priority}</span>
            ${this.todo.dueDate
              ? html`<span class="status-pill" data-state=${dueState}>Due ${this.formatDate(this.todo.dueDate)}</span>`
              : html``}
            <span>Created ${this.formatDate(this.todo.createdAt)}</span>
            ${this.todo.updatedAt ? html`<span>Updated ${this.formatDate(this.todo.updatedAt)}</span>` : html``}
          </div>
        </div>
        <span class="status-pill" data-state=${this.todo.completed ? 'completed' : 'active'}>
          ${this.todo.completed ? 'Completed' : 'In progress'}
        </span>
      </header>

      <p class="body">${this.todo.description}</p>

      ${this.todo.tags.length
        ? html`<div class="meta">${this.todo.tags.map((tag) => html`<span class="tag">${tag}</span>`)}</div>`
        : html``}

      ${this.actions
        ? html`
            <footer>
              <md-outlined-button @click=${this.handleToggle}>
                ${this.todo.completed ? 'Mark incomplete' : 'Mark complete'}
              </md-outlined-button>
              <md-outlined-button @click=${this.handleEdit}>Edit</md-outlined-button>
              <md-outlined-button @click=${this.handleDelete}>Delete</md-outlined-button>
            </footer>
          `
        : html``}
    `;
  }

  private handleToggle() {
    if (!this.todo) return;
    this.dispatchEvent(
      new CustomEvent<FirestoreItemToggleDetail>('df-firestore-item-toggle', {
        detail: {
          id: this.todo.id,
          completed: !this.todo.completed,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleEdit() {
    if (!this.todo) return;
    this.dispatchEvent(
      new CustomEvent<TodoDocument>('df-firestore-item-edit', {
        detail: this.todo,
        bubbles: true,
        composed: true,
      })
    );
  }

  private handleDelete() {
    if (!this.todo) return;
    this.dispatchEvent(
      new CustomEvent<{id: string; title: string}>('df-firestore-item-delete', {
        detail: {id: this.todo.id, title: this.todo.title},
        bubbles: true,
        composed: true,
      })
    );
  }

  private formatDate(value: Date | null): string {
    if (!value) {
      return 'N/A';
    }

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);
  }

  private getDueState(): 'active' | 'completed' | 'overdue' {
    if (!this.todo) {
      return 'active';
    }

    if (this.todo.completed) {
      return 'completed';
    }

    if (!this.todo.dueDate) {
      return 'active';
    }

    return this.todo.dueDate.getTime() < Date.now() ? 'overdue' : 'active';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-firestore-item': DfFirestoreItem;
  }
}

