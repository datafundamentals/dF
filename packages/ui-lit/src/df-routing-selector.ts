/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * This component MUST use Material Design 3 web components from @material/web.
 *
 * ✅ ALLOWED:
 * - <md-text-button> for the tertiary "change" action
 * - composed df- components, which carry their own compliance
 *
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 *
 * See:
 * - /guides/STANDARDS_STYLES.md#material-design-3
 * - /guides/WC_NEW_V_EXISTING.md
 *
 * Build will FAIL if native HTML elements are detected.
 */

import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {forkState, positionScaleState, resetFork, resetPositionScale} from '@df/state';
import type {
  ForkAnchors,
  ForkOption,
  PositionScaleValue,
  RoutingSelectorChangeDetail,
} from '@df/types';

import './df-fork-toggle.js';
import './df-position-scale.js';
import '@material/web/button/text-button.js';

/**
 * Join a door and a position into the identifier downstream systems persist.
 *
 * Exported as a pure function so the composition rule is testable without a DOM, and so
 * consumers can reproduce it without duplicating the format string.
 */
export function routingCategory(forkId: string, position: PositionScaleValue): string {
  return `${forkId}-${position}`;
}

/**
 * Two-step self-placement: choose a door, then place yourself within it. The steps are
 * deliberately sequential and never shown together.
 *
 * Presentation only — both halves of the answer live in `@df/state` and this component
 * persists nothing. A consumer listens for the change event and decides what to do,
 * including where to navigate.
 *
 * @fires df-routing-selector-change - A position was chosen within a door.
 *   Detail: `{forkId, position, category}`.
 * @fires df-routing-selector-reset - The selection was withdrawn and step one is showing
 *   again. Consumers must treat any previously reported category as no longer valid.
 */
@customElement('df-routing-selector')
export class DfRoutingSelector extends SignalWatcher(LitElement) {
  /** The doors offered in step one. */
  @property({type: Array}) declare options: ForkOption[];

  /** Scale anchors per door id. A door with no entry gets empty anchors. */
  @property({type: Object}) declare anchors: Record<string, ForkAnchors>;

  /** Accessible name for the fork group. */
  @property({type: String}) declare forkLabel: string;

  /** Accessible name for the scale. */
  @property({type: String}) declare scaleLabel: string;

  /** Label for the action that returns to step one. */
  @property({type: String}) declare changeLabel: string;

  /** Screen-reader orientation for the scale's unnamed stops 1, 3 and 5. */
  @property({type: Array}) declare scaleWords: string[];

  /** Axis direction words for the scale. Shared across doors; the axis never flips. */
  @property({type: String}) declare lessLabel: string;
  @property({type: String}) declare moreLabel: string;

  constructor() {
    super();
    this.options = [];
    this.anchors = {};
    this.forkLabel = '';
    this.scaleLabel = '';
    this.changeLabel = 'Change';
    this.scaleWords = ['least', 'middle', 'most'];
    this.lessLabel = '';
    this.moreLabel = '';
  }

  static override styles = css`
    /* Sizes are in px, not rem, deliberately. rem resolves against the HOST page's root
     * font-size, which a shared component cannot control — the consuming 11ty site sets
     * html{font-size:12px}, which silently shrank every rem here by 25%. */
    :host {
      display: block;
      font-family: var(--df-routing-selector-font, 'Roboto', sans-serif);
    }

    .selector__step {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .selector__footer {
      display: flex;
      justify-content: flex-start;
    }
  `;

  private handleReset() {
    resetFork();
    resetPositionScale();

    // Announcing this is not optional. A consumer that acted on the previous selection —
    // stored it, revealed a destination — has no other way to learn the answer was
    // withdrawn, and would go on offering a route the visitor has just backed out of.
    this.dispatchEvent(
      new CustomEvent('df-routing-selector-reset', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleScaleChange() {
    const {selectedId} = forkState.get();
    if (selectedId === null) {
      return;
    }
    const {value} = positionScaleState.get();
    this.dispatchEvent(
      new CustomEvent<RoutingSelectorChangeDetail>('df-routing-selector-change', {
        detail: {
          forkId: selectedId,
          position: value,
          category: routingCategory(selectedId, value),
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private renderFork() {
    return html`
      <div class="selector__step">
        <df-fork-toggle
          .options=${this.options}
          .label=${this.forkLabel}></df-fork-toggle>
      </div>
    `;
  }

  private renderScale(selectedId: string) {
    const anchors = this.anchors[selectedId] ?? {low: '', high: ''};
    return html`
      <div class="selector__step">
        <df-position-scale
          .anchorLow=${anchors.low}
          .anchorHigh=${anchors.high}
          .label=${this.scaleLabel}
          .scaleWords=${this.scaleWords}
          .lessLabel=${this.lessLabel}
          .moreLabel=${this.moreLabel}
          @df-position-scale-change=${this.handleScaleChange}></df-position-scale>
        <div class="selector__footer">
          <md-text-button @click=${this.handleReset}>${this.changeLabel}</md-text-button>
        </div>
      </div>
    `;
  }

  override render() {
    const {selectedId} = forkState.get();
    if (this.options.length === 0) {
      return nothing;
    }
    return selectedId === null ? this.renderFork() : this.renderScale(selectedId);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-routing-selector': DfRoutingSelector;
  }
}
