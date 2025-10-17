/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * This component MUST use Material Design 3 web components from @material/web.
 *
 * ✅ ALLOWED:
 * - <md-filled-button>, <md-outlined-button>, <md-text-button>
 * - <md-outlined-select> with <md-select-option>
 * - <md-checkbox>
 *
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 *
 * See:
 * - /guides/STANDARDS_STYLES.md#material-design-3
 * - /packages/ui-lit/templates/md3-component-template.ts
 * - /packages/ui-lit/src/df-upload-link.ts (compliant example)
 *
 * Build will FAIL if native HTML elements are detected.
 */

import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import type {PropertyValues} from 'lit';
import {
  PRACTICE_TOPICS,
  loadPracticeTasks,
  practiceWidgetState,
  setPracticeTopic,
  startAutoRefresh,
  stopAutoRefresh,
} from '@df/state';
import type {PracticeTopic, PracticeWidgetStatus} from '@df/types';

import '@material/web/button/filled-button.js';
import '@material/web/checkbox/checkbox.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import type {MdOutlinedSelect} from '@material/web/select/outlined-select.js';
import type {MdCheckbox} from '@material/web/checkbox/checkbox.js';

@customElement('df-practice-widget')
export class DfPracticeWidget extends SignalWatcher(LitElement) {
  static override styles = css`
    :host {
      display: block;
      max-width: 480px;
      border-radius: 16px;
      border: 1px solid var(--df-practice-outline-color, rgba(31, 41, 55, 0.15));
      padding: 24px;
      box-shadow: var(--df-practice-shadow, 0 10px 30px rgba(15, 23, 42, 0.08));
      background: var(--df-practice-surface, #ffffff);
      color: var(--df-practice-text, #111827);
      font-family: var(--df-font-family, 'Roboto', sans-serif);
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      gap: 12px;
    }

    h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    md-outlined-select {
      min-width: 210px;
    }

    .auto-refresh {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: rgba(55, 65, 81, 0.9);
      margin-bottom: 16px;
    }

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: var(--df-practice-primary, #2563eb);
      animation: pulse 1.2s ease-in-out infinite;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 12px;
    }

    li {
      border: 1px solid rgba(148, 163, 184, 0.6);
      border-radius: 12px;
      padding: 12px 16px;
      background: rgba(248, 250, 252, 0.75);
    }

    .task-title {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .difficulty {
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(37, 99, 235, 0.12);
      color: rgba(37, 99, 235, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .error {
      border-radius: 8px;
      padding: 10px 12px;
      background: rgba(239, 68, 68, 0.12);
      color: #b91c1c;
    }

    footer {
      margin-top: 16px;
      font-size: 0.8rem;
      color: rgba(100, 116, 139, 0.9);
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 0.2;
      }
      50% {
        opacity: 1;
      }
    }
  `;

  @property({type: Number, attribute: 'refresh-interval'})
  declare refreshInterval: number;

  constructor() {
    super();
    this.refreshInterval = 15000;
  }

  @property({type: Boolean, attribute: 'auto-refresh'})
  set autoRefresh(value: boolean) {
    if (value) {
      startAutoRefresh(this.refreshInterval);
    } else {
      stopAutoRefresh();
    }
  }

  get autoRefresh(): boolean {
    return practiceWidgetState.get().isAutoRefreshing;
  }

  @property({type: String})
  set topic(value: PracticeTopic) {
    if (!value) {
      return;
    }
    const changed = setPracticeTopic(value);
    if (changed) {
      void loadPracticeTasks(value);
    }
  }

  get topic(): PracticeTopic {
    return practiceWidgetState.get().topic;
  }

  override connectedCallback() {
    super.connectedCallback();
    if (practiceWidgetState.get().status === 'idle') {
      void loadPracticeTasks();
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.autoRefresh) {
      stopAutoRefresh();
    }
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has('refreshInterval') && this.autoRefresh) {
      startAutoRefresh(this.refreshInterval);
    }
  }

  override render() {
    const state = practiceWidgetState.get();
    const {status, tasks, errorMessage, lastUpdated, isAutoRefreshing, topic} = state;

    return html`
      <header>
        <h2>Practice planner</h2>
        <md-outlined-select
          label="Practice topic"
          .value=${topic}
          @change=${this.handleTopicChange}
        >
          ${PRACTICE_TOPICS.map(
            (option) => html`
              <md-select-option value=${option}>
                <div slot="headline">${this.formatTopic(option)}</div>
              </md-select-option>
            `,
          )}
        </md-outlined-select>
      </header>

      <div class="actions">
        <md-filled-button @click=${this.handleRefresh} ?disabled=${status === 'loading'}>
          Refresh tasks
        </md-filled-button>
        <div class="auto-refresh">
          <md-checkbox
            @change=${this.handleAutoRefreshToggle}
            .checked=${isAutoRefreshing}
            aria-label="Auto refresh tasks"
          ></md-checkbox>
          <span>Auto refresh</span>
        </div>
      </div>

      ${this.renderStatus(status, errorMessage)}

      ${status === 'error'
        ? nothing
        : html`
            <ul>
              ${tasks.map(
                (task) => html`
                  <li>
                    <div class="task-title">
                      <span>${task.title}</span>
                      <span class="difficulty">${task.difficulty}</span>
                    </div>
                    <p>${task.summary}</p>
                  </li>
                `,
              )}
            </ul>
          `}

      <footer>
        ${lastUpdated
          ? html`Last updated ${this.formatTimestamp(lastUpdated)}${isAutoRefreshing
              ? ' • auto refresh on'
              : ''}`
          : 'No tasks loaded yet'}
      </footer>
    `;
  }

  private renderStatus(status: PracticeWidgetStatus, errorMessage: string | null) {
    switch (status) {
      case 'loading':
        return html`<div class="status"><span class="dot" aria-hidden="true"></span>Loading tasks…</div>`;
      case 'error':
        return html`<div class="error" role="alert">${errorMessage ?? 'Unable to load practice tasks.'}</div>`;
      case 'ready':
        return nothing;
      default:
        return html`<div class="status">Select a topic to generate practice ideas.</div>`;
    }
  }

  private handleRefresh() {
    void loadPracticeTasks();
  }

  private handleTopicChange(event: Event) {
    const select = event.target as MdOutlinedSelect;
    const nextTopic = (select.value ?? '') as PracticeTopic;
    setPracticeTopic(nextTopic);
    void loadPracticeTasks(nextTopic);
    this.dispatchEvent(
      new CustomEvent('df-practice-topic-change', {
        detail: {topic: nextTopic},
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleAutoRefreshToggle(event: Event) {
    const checkbox = event.target as MdCheckbox;
    if (checkbox.checked) {
      startAutoRefresh(this.refreshInterval);
    } else {
      stopAutoRefresh();
    }
  }

  private formatTopic(topic: PracticeTopic) {
    return topic
      .split('-')
      .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
      .join(' ');
  }

  private formatTimestamp(value: number) {
    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    return formatter.format(value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-practice-widget': DfPracticeWidget;
  }
}
