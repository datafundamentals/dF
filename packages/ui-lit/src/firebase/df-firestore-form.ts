/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 * 
 * This component MUST use Material Design 3 web components from @material/web.
 * 
 * ✅ ALLOWED:
 * - <md-filled-button>, <md-outlined-button>, <md-text-button>
 * - <md-outlined-text-field>, <md-filled-text-field>
 * - <md-filled-select>, <md-outlined-select> with <md-select-option>
 * 
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 * 
 * See: /guides/STANDARDS_STYLES.md#material-design-3
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {TodoDocument, TodoDraft, TodoPriority} from '@df/types';

// MD3 Component Imports
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/select/filled-select.js';
import '@material/web/select/select-option.js';

type FirestoreFormMode = 'create' | 'edit';

export interface FirestoreFormSubmitDetail {
  mode: FirestoreFormMode;
  todoId?: string;
  draft: TodoDraft & {title: string};
}

@customElement('df-firestore-form')
export class DfFirestoreForm extends LitElement {
  static override styles = css`
    :host {
      display: block;
      padding: var(--df-spacing-5, 1.5rem);
      background: var(--md-sys-color-surface, #fff);
      border-radius: 16px;
      border: 1px solid var(--md-sys-color-outline-variant, rgba(15, 23, 42, 0.1));
      box-shadow: 0 15px 45px rgba(15, 23, 42, 0.12);
      max-width: 520px;
    }

    h2 {
      margin: 0 0 1.5rem;
      font-size: 1.4rem;
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    md-outlined-text-field {
      width: 100%;
    }

    md-filled-select {
      width: 100%;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .error {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      background: var(--md-sys-color-error-container, rgba(220, 38, 38, 0.14));
      color: var(--md-sys-color-on-error-container, #b91c1c);
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
  `;

  @property({type: String}) mode: FirestoreFormMode = 'create';
  @property({attribute: false}) todo: TodoDocument | null = null;

  @state() private _title = '';
  @state() private _description = '';
  @state() private _priority: TodoPriority = 'medium';
  @state() private _tagsInput = '';
  @state() private _dueDateValue = '';
  @state() private _error: string | null = null;

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('todo')) {
      this.syncFromTodo();
    }

    if (changed.has('mode') && this.mode === 'create' && changed.get('mode') !== 'create') {
      this.reset();
    }
  }

  override firstUpdated(): void {
    this.syncFromTodo();
  }

  override render() {
    return html`
      <h2>${this.mode === 'create' ? 'Create todo' : 'Edit todo'}</h2>
      ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
      <form @submit=${this.handleSubmit}>
        <md-outlined-text-field
          label="Title"
          required
          name="title"
          .value=${this._title}
          @input=${(event: Event) => (this._title = (event.target as HTMLInputElement).value)}
          supporting-text="Describe the task succinctly">
        </md-outlined-text-field>

        <md-outlined-text-field
          label="Description"
          type="textarea"
          rows="4"
          required
          name="description"
          .value=${this._description}
          @input=${(event: Event) => (this._description = (event.target as HTMLInputElement).value)}
          supporting-text="Explain the purpose or teaching prompt">
        </md-outlined-text-field>

        <md-filled-select
          label="Priority"
          name="priority"
          .value=${this._priority}
          @change=${(event: Event) => (this._priority = (event.target as HTMLSelectElement).value as TodoPriority)}>
          <md-select-option value="low">
            <div slot="headline">Low</div>
          </md-select-option>
          <md-select-option value="medium" selected>
            <div slot="headline">Medium</div>
          </md-select-option>
          <md-select-option value="high">
            <div slot="headline">High</div>
          </md-select-option>
        </md-filled-select>

        <md-outlined-text-field
          label="Tags"
          name="tags"
          .value=${this._tagsInput}
          @input=${(event: Event) => (this._tagsInput = (event.target as HTMLInputElement).value)}
          supporting-text="Comma separated, e.g. teaching, realtime">
        </md-outlined-text-field>

        <md-outlined-text-field
          label="Due date"
          type="date"
          name="due"
          .value=${this._dueDateValue}
          @input=${(event: Event) => (this._dueDateValue = (event.target as HTMLInputElement).value)}
          supporting-text="Optional">
        </md-outlined-text-field>

        <div class="actions">
          <md-outlined-button type="button" @click=${this.handleCancel}>
            Cancel
          </md-outlined-button>
          <md-filled-button type="submit">
            ${this.mode === 'create' ? 'Create todo' : 'Save changes'}
          </md-filled-button>
        </div>
      </form>
    `;
  }

  private handleSubmit(event: Event) {
    event.preventDefault();
    this._error = null;

    if (!this._title.trim()) {
      this._error = 'Title is required.';
      return;
    }

    if (!this._description.trim()) {
      this._error = 'Description is required.';
      return;
    }

    const tags = this._tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    const detail: FirestoreFormSubmitDetail = {
      mode: this.mode,
      todoId: this.todo?.id,
      draft: {
        title: this._title.trim(),
        description: this._description.trim(),
        priority: this._priority,
        tags,
        dueDate: this._dueDateValue ? new Date(this._dueDateValue) : null,
      },
    };

    this.dispatchEvent(
      new CustomEvent<FirestoreFormSubmitDetail>('df-firestore-form-submit', {
        bubbles: true,
        composed: true,
        detail,
      })
    );

    if (this.mode === 'create') {
      this.reset();
    }
  }

  private handleCancel() {
    this.dispatchEvent(
      new CustomEvent('df-firestore-form-cancel', {
        bubbles: true,
        composed: true,
      })
    );
    if (this.mode === 'create') {
      this.reset();
    }
  }

  private reset() {
    this._title = '';
    this._description = '';
    this._priority = 'medium';
    this._tagsInput = '';
    this._dueDateValue = '';
    this._error = null;
  }

  private syncFromTodo() {
    if (!this.todo || this.mode !== 'edit') {
      return;
    }

    this._title = this.todo.title;
    this._description = this.todo.description;
    this._priority = this.todo.priority;
    this._tagsInput = this.todo.tags.join(', ');
    this._dueDateValue = this.todo.dueDate ? this.formatDateInput(this.todo.dueDate) : '';
  }

  private formatDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-firestore-form': DfFirestoreForm;
  }
}
