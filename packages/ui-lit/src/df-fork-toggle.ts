/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * This component MUST use Material Design 3 web components from @material/web.
 *
 * ✅ ALLOWED:
 * - <md-radio> for an exclusive choice between options
 *
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 *
 * No exemption is claimed. Material Web ships an MD3 radio, so the exclusive choice is
 * built on it rather than hand-rolled. `df-segmented-button` was evaluated for reuse and
 * rejected: its options are hard-coded in render() and it carries no supporting text.
 *
 * See:
 * - https://m3.material.io/components/radio-button/specs
 * - /guides/STANDARDS_STYLES.md#material-design-3
 * - /guides/WC_NEW_V_EXISTING.md
 *
 * Build will FAIL if native HTML elements are detected.
 */

import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {forkState, selectFork} from '@df/state';
import type {ForkChangeDetail, ForkOption} from '@df/types';

import '@material/web/radio/radio.js';

/**
 * An exclusive choice between a small number of doors, each with a label and a
 * supporting line. Nothing is selected initially, on purpose: a default would nudge.
 *
 * Presentation only — the choice lives in `@df/state` and this component persists
 * nothing. Option ids are opaque and echoed back verbatim.
 *
 * @fires df-fork-toggle-change - A door was chosen. Detail: `{id}`.
 */
@customElement('df-fork-toggle')
export class DfForkToggle extends SignalWatcher(LitElement) {
  /** The doors. Static configuration supplied by the caller. */
  @property({type: Array}) declare options: ForkOption[];

  /** Accessible name for the group as a whole. */
  @property({type: String}) declare label: string;

  @property({type: Boolean, reflect: true}) declare disabled: boolean;

  constructor() {
    super();
    this.options = [];
    this.label = '';
    this.disabled = false;
  }

  static override styles = css`
    /* Sizes are in px, not rem, deliberately. rem resolves against the HOST page's root
     * font-size, which a shared component cannot control — the consuming 11ty site sets
     * html{font-size:12px}, which silently shrank every rem here by 25%. */
    :host {
      display: block;
      font-family: var(--df-fork-toggle-font, 'Roboto', sans-serif);
    }

    .fork {
      display: flex;
      flex-wrap: wrap;
      gap: var(--df-fork-toggle-gap, 16px);
    }

    .fork__door {
      flex: 1 1 192px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 18px;
      border: 1px solid var(--df-fork-toggle-outline, var(--md-sys-color-outline, #c6c6c6));
      border-radius: var(--df-fork-toggle-radius, 12px);
      background: var(--df-fork-toggle-surface, var(--md-sys-color-surface, #ffffff));
      cursor: pointer;
    }

    .fork__door--selected {
      border-color: var(--df-fork-toggle-selected-outline, var(--md-sys-color-primary, #6750a4));
    }

    :host([disabled]) .fork__door {
      cursor: default;
      opacity: 0.6;
    }

    .fork__text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .fork__label {
      font-size: 17px;
      font-weight: 500;
      color: var(--df-fork-toggle-text, var(--md-sys-color-on-surface, #1f1f1f));
    }

    .fork__sublabel {
      font-size: 14px;
      color: var(--df-fork-toggle-sublabel-text, var(--md-sys-color-on-surface-variant, #49454f));
    }
  `;

  private handleSelect(option: ForkOption) {
    if (this.disabled) {
      return;
    }
    const previous = forkState.get().selectedId;
    selectFork(option.id);
    const {selectedId} = forkState.get();
    if (selectedId === null || selectedId === previous) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<ForkChangeDetail>('df-fork-toggle-change', {
        detail: {id: selectedId},
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderDoor(option: ForkOption, selectedId: string | null) {
    const isSelected = option.id === selectedId;
    const classes = isSelected ? 'fork__door fork__door--selected' : 'fork__door';
    return html`
      <label class=${classes}>
        <md-radio
          name="df-fork-toggle"
          value=${option.id}
          ?checked=${isSelected}
          ?disabled=${this.disabled}
          @change=${() => this.handleSelect(option)}></md-radio>
        <span class="fork__text">
          <span class="fork__label">${option.label}</span>
          <span class="fork__sublabel">${option.sublabel}</span>
        </span>
      </label>
    `;
  }

  override render() {
    const {selectedId} = forkState.get();
    return html`
      <div class="fork" role="radiogroup" aria-label=${this.label}>
        ${this.options.map((option) => this.renderDoor(option, selectedId))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-fork-toggle': DfForkToggle;
  }
}
