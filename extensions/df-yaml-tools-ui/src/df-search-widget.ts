import {LitElement, html, css} from 'lit';
import {customElement, state, property} from 'lit/decorators.js';
import {SignalWatcher} from '@lit-labs/signals';
import {elasticState} from '@df/state';
import '@material/web/button/filled-button.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/progress/circular-progress.js';

@customElement('df-search-widget')
export class DfSearchWidget extends SignalWatcher(LitElement) {
  @property({type: String}) declare apiKey: string;
  @state() private query = '';
  @state() private fuzzy = false;

  constructor() {
    super();
    this.apiKey = '';
  }

  static override styles = css`
    :host {
      display: block;
      padding: 16px;
      background: var(--md-sys-color-surface-container, #f0f0f0);
      border-radius: 8px;
      margin-top: 16px;
    }
    .search-container {
      display: flex;
      gap: 8px;
      align-items: center;
      margin-bottom: 16px;
    }
    md-outlined-text-field {
      flex: 1;
    }
    .results {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .result-item {
      padding: 8px;
      background: var(--md-sys-color-surface, #fff);
      border-radius: 4px;
      cursor: pointer;
    }
    .result-item:hover {
      background: var(--md-sys-color-surface-variant, #e0e0e0);
    }
    .error {
      color: var(--md-sys-color-error, #b00020);
    }
    .no-results {
      color: var(--md-sys-color-on-surface-variant, #444746);
      font-style: italic;
      text-align: center;
      padding: 8px;
    }
  `;

  override render() {
    const state = elasticState.get();

    return html`
      <div class="search-container">
        <md-outlined-text-field
          label="Search Elasticsearch"
          .value=${this.query}
          @input=${this.handleInput}
          @keydown=${this.handleKeydown}>
        </md-outlined-text-field>
        <div style="display: flex; align-items: center; gap: 4px;">
          <md-checkbox
            id="fuzzy-checkbox"
            touch-target="wrapper"
            ?checked=${this.fuzzy}
            @change=${this.handleFuzzyChange}>
          </md-checkbox>
          <label for="fuzzy-checkbox" style="cursor: pointer; user-select: none;">Fuzzy</label>
        </div>
        <md-filled-button
          @click=${this.handleSearch}
          ?disabled=${state.isSearching || !this.query}>
          Search
        </md-filled-button>
      </div>

      ${state.isSearching
        ? html`<md-circular-progress indeterminate></md-circular-progress>`
        : ''}

      ${state.errorMessage
        ? html`<div class="error">${state.errorMessage}</div>`
        : ''}

      ${state.status === 'success' && state.searchResults.length === 0 && this.query
        ? html`<div class="no-results">No results found.</div>`
        : ''}

      <div class="results">
        ${state.searchResults.map(result => html`
          <div class="result-item" @click=${() => this.handleResultClick(result)}>
            <div><strong>${result.source.filename}</strong></div>
            <div style="font-size: 0.8em; color: var(--md-sys-color-on-surface-variant)">
              ${result.source.path} (Score: ${result.score.toFixed(2)})
            </div>
          </div>
        `)}
      </div>
    `;
  }

  private handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.query = target.value;
  }

  private handleFuzzyChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.fuzzy = target.checked;
  }

  private handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.query) {
      this.handleSearch();
    }
  }

  private async handleSearch() {
    if (!this.query) return;
    
    // Dispatch event to parent to handle search via extension host
    this.dispatchEvent(new CustomEvent('df-search', {
      detail: {
        query: this.query,
        fuzzy: this.fuzzy
      },
      bubbles: true,
      composed: true
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleResultClick(result: any) {
    this.dispatchEvent(new CustomEvent('df-search-result-select', {
      detail: {result},
      bubbles: true,
      composed: true
    }));
  }
}
