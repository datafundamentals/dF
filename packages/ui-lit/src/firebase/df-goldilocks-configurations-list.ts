/**
 * ✅ MD3-Compliant Component
 * Goldilocks Configurations List - Displays saved configurations in a table
 */

import {LitElement, html, css, nothing} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {
  goldilocksConfigurationCollectionState,
  deleteGoldilocksConfiguration,
  refreshGoldilocksConfigurations,
} from '@df/state';

@customElement('df-goldilocks-configurations-list')
export class DfGoldilocksConfigurationsList extends SignalWatcher(LitElement) {
  @state() private deleteMessage: {variant: 'success' | 'error'; text: string} | null = null;

  static override styles = css`
    :host {
      display: block;
    }

    .controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .message {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.9rem;
      margin-bottom: 1rem;
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

    .configs-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .configs-table th {
      text-align: left;
      padding: 0.5rem 0.75rem;
      color: var(--md-sys-color-on-surface-variant, #475569);
      font-weight: 500;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.2));
    }

    .configs-table td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--md-sys-color-outline-variant, rgba(148, 163, 184, 0.1));
    }

    .configs-table tr:last-child td {
      border-bottom: none;
    }

    .actions-cell {
      white-space: nowrap;
      text-align: right;
    }

    .selection-badge {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      margin: 0.15rem;
      background: rgba(59, 130, 246, 0.15);
      color: #1e40af;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .date-cell {
      color: var(--md-sys-color-on-surface-variant, #64748b);
      font-size: 0.85rem;
    }
  `;

  override render() {
    const state = goldilocksConfigurationCollectionState.get();
    const configurations = state.documents;

    return html`
      <div>
        <div class="controls">
          <span>${configurations.length} configuration${configurations.length !== 1 ? 's' : ''}</span>
          <md-text-button @click=${this.handleRefresh}> Refresh </md-text-button>
        </div>

        ${this.deleteMessage
          ? html`<div class="message ${this.deleteMessage.variant}">${this.deleteMessage.text}</div>`
          : nothing}

        <div class="table-wrapper">
          <table class="configs-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Selected Pair</th>
                <th>Note</th>
                <th>Created</th>
                <th class="actions-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${configurations.map(
                (config) => html`
                  <tr>
                    <td>${config.goldilocksTypeName}</td>
                    <td>
                      ${config.selectedOptions.map(
                        (option) => html`<span class="selection-badge">${option}</span>`
                      )}
                    </td>
                    <td>${config.note || '—'}</td>
                    <td class="date-cell">${this.formatDate(config.createdAt)}</td>
                    <td class="actions-cell">
                      <md-text-button @click=${() => this.handleDelete(config.id)}>Delete</md-text-button>
                    </td>
                  </tr>
                `
              )}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private async handleDelete(id: string): Promise<void> {
    if (!confirm('Delete this configuration? This cannot be undone.')) {
      return;
    }

    try {
      await deleteGoldilocksConfiguration(id);
      this.deleteMessage = {variant: 'success', text: 'Configuration deleted.'};
      setTimeout(() => (this.deleteMessage = null), 3000);
    } catch (error) {
      console.error('[df-goldilocks-configurations-list] Delete error', error);
      this.deleteMessage = {
        variant: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete configuration.',
      };
    }
  }

  private async handleRefresh(): Promise<void> {
    try {
      await refreshGoldilocksConfigurations();
    } catch (error) {
      console.error('[df-goldilocks-configurations-list] Refresh error', error);
      this.deleteMessage = {
        variant: 'error',
        text: 'Failed to refresh configurations.',
      };
    }
  }

  private formatDate(date: Date | null): string {
    if (!date) {
      return 'Not set';
    }
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(date);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-goldilocks-configurations-list': DfGoldilocksConfigurationsList;
  }
}
