/**
 * ✅ MD3-Compliant Component
 * Goldilocks Types CRUD - Manage goldilocks type definitions
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {
  goldilocksTypeCollectionState,
  addGoldilocksType,
  deleteGoldilocksType,
  updateGoldilocksType,
} from '@df/state';
import type {GoldilocksTypeDocument} from '@df/types';

@customElement('df-goldilocks-types-crud')
export class DfGoldilocksTypesCrud extends SignalWatcher(LitElement) {
  @state() private editingId: string | null = null;
  @state() private isSubmitting = false;
  @state() private formMessage: {variant: 'success' | 'error'; text: string} | null = null;

  @state() private name = '';
  @state() private first = '';
  @state() private second = '';
  @state() private third = '';

  static override styles = css`
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
      border-radius: 24px;
      padding: clamp(1.25rem, 3vw, 2rem);
      background: var(--md-sys-color-surface, #ffffff);
      color: var(--md-sys-color-on-surface, #0f172a);
      border: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.35));
      box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
    }

    .container {
      display: grid;
      gap: 1.25rem;
    }

    h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--md-sys-color-on-surface, #0f172a);
    }

    .subtitle {
      margin: 0;
      color: var(--md-sys-color-on-surface-variant, #475569);
      line-height: 1.5;
    }

    form {
      display: grid;
      gap: 0.9rem;
    }

    .form-grid {
      display: grid;
      gap: 0.9rem;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }

    .form-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .message {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.9rem;
    }

    .message.success {
      background: rgba(16, 185, 129, 0.15);
      color: #047857;
    }

    .message.error {
      background: rgba(248, 113, 113, 0.18);
      color: #b91c1c;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .types-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .types-table th {
      text-align: left;
      padding: 0.5rem 0.75rem;
      color: var(--md-sys-color-on-surface-variant, #475569);
      font-weight: 500;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.2));
    }

    .types-table td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.1));
    }

    .types-table tr:last-child td {
      border-bottom: none;
    }

    .actions-cell {
      white-space: nowrap;
      text-align: right;
    }

    .empty-state {
      padding: 2rem;
      text-align: center;
      color: var(--md-sys-color-on-surface-variant, #64748b);
      border: 1px dashed rgba(148, 163, 184, 0.5);
      border-radius: 12px;
    }
  `;

  override render() {
    const state = goldilocksTypeCollectionState.get();
    const types = state.documents;

    return html`
      <div class="container">
        <header>
          <h2>Goldilocks Types</h2>
          <p class="subtitle">
            Define goldilocks scenarios with three options where users "pick 2"
          </p>
        </header>

        ${this.formMessage
          ? html`<div class="message ${this.formMessage.variant}">${this.formMessage.text}</div>`
          : nothing}

        <form @submit=${this.handleSubmit}>
          <md-outlined-text-field
            label="Type Name"
            .value=${this.name}
            @input=${(e: Event) => (this.name = (e.target as HTMLInputElement).value)}
            ?disabled=${this.isSubmitting}
            required
          >
          </md-outlined-text-field>

          <div class="form-grid">
            <md-outlined-text-field
              label="First Option"
              .value=${this.first}
              @input=${(e: Event) => (this.first = (e.target as HTMLInputElement).value)}
              ?disabled=${this.isSubmitting}
              required
            >
            </md-outlined-text-field>

            <md-outlined-text-field
              label="Second Option"
              .value=${this.second}
              @input=${(e: Event) => (this.second = (e.target as HTMLInputElement).value)}
              ?disabled=${this.isSubmitting}
              required
            >
            </md-outlined-text-field>

            <md-outlined-text-field
              label="Third Option"
              .value=${this.third}
              @input=${(e: Event) => (this.third = (e.target as HTMLInputElement).value)}
              ?disabled=${this.isSubmitting}
              required
            >
            </md-outlined-text-field>
          </div>

          <div class="form-actions">
            ${this.editingId
              ? html`
                  <md-filled-button type="submit" ?disabled=${this.isSubmitting}>
                    Update Type
                  </md-filled-button>
                  <md-text-button @click=${this.cancelEdit} ?disabled=${this.isSubmitting}>
                    Cancel
                  </md-text-button>
                `
              : html`
                  <md-filled-button type="submit" ?disabled=${this.isSubmitting}> Add Type </md-filled-button>
                `}
          </div>
        </form>

        ${types.length === 0
          ? html`<div class="empty-state">No goldilocks types defined yet. Add one above!</div>`
          : html`
              <div class="table-wrapper">
                <table class="types-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Option 1</th>
                      <th>Option 2</th>
                      <th>Option 3</th>
                      <th class="actions-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${types.map(
                      (type) => html`
                        <tr>
                          <td>${type.name}</td>
                          <td>${type.first}</td>
                          <td>${type.second}</td>
                          <td>${type.third}</td>
                          <td class="actions-cell">
                            <md-text-button @click=${() => this.startEdit(type)}>Edit</md-text-button>
                            <md-text-button @click=${() => this.handleDelete(type.id)}>Delete</md-text-button>
                          </td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `}
      </div>
    `;
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    if (!this.name.trim() || !this.first.trim() || !this.second.trim() || !this.third.trim()) {
      this.formMessage = {variant: 'error', text: 'All fields are required.'};
      return;
    }

    this.isSubmitting = true;
    this.formMessage = null;

    try {
      if (this.editingId) {
        await updateGoldilocksType(this.editingId, {
          name: this.name,
          first: this.first,
          second: this.second,
          third: this.third,
        });
        this.formMessage = {variant: 'success', text: 'Type updated successfully!'};
        this.editingId = null;
      } else {
        await addGoldilocksType({
          name: this.name,
          first: this.first,
          second: this.second,
          third: this.third,
        });
        this.formMessage = {variant: 'success', text: 'Type added successfully!'};
      }

      this.clearForm();
      setTimeout(() => (this.formMessage = null), 3000);
    } catch (error) {
      console.error('[df-goldilocks-types-crud] Submit error', error);
      this.formMessage = {
        variant: 'error',
        text: error instanceof Error ? error.message : 'Failed to save type.',
      };
    } finally {
      this.isSubmitting = false;
    }
  }

  private startEdit(type: GoldilocksTypeDocument): void {
    this.editingId = type.id;
    this.name = type.name;
    this.first = type.first;
    this.second = type.second;
    this.third = type.third;
    this.formMessage = null;
  }

  private cancelEdit(): void {
    this.editingId = null;
    this.clearForm();
    this.formMessage = null;
  }

  private clearForm(): void {
    this.name = '';
    this.first = '';
    this.second = '';
    this.third = '';
  }

  private async handleDelete(id: string): Promise<void> {
    if (!confirm('Delete this goldilocks type? This cannot be undone.')) {
      return;
    }

    try {
      await deleteGoldilocksType(id);
      this.formMessage = {variant: 'success', text: 'Type deleted successfully.'};
      setTimeout(() => (this.formMessage = null), 3000);
    } catch (error) {
      console.error('[df-goldilocks-types-crud] Delete error', error);
      this.formMessage = {
        variant: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete type.',
      };
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-goldilocks-types-crud': DfGoldilocksTypesCrud;
  }
}
