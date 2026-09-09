/**
 * ⚠️ CRITICAL STANDARDS COMPLIANCE ⚠️
 *
 * This component MUST use Material Design 3 web components from @material/web.
 *
 * ✅ ALLOWED:
 * - <md-slider> for selecting a value on a discrete range
 *
 * ❌ FORBIDDEN:
 * - Native <button>, <input>, <select>, <textarea>
 *
 * No exemption is claimed here. Material Web ships an MD3 slider, so the discrete
 * five-stop scale is built on it rather than hand-rolled. See:
 * - https://m3.material.io/components/sliders/specs
 * - /guides/STANDARDS_STYLES.md#material-design-3
 * - /packages/ui-lit/templates/md3-component-template.ts
 *
 * Build will FAIL if native HTML elements are detected.
 */

import {SignalWatcher} from '@lit-labs/signals';
import {css, html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {
  POSITION_SCALE_MAX,
  POSITION_SCALE_MIN,
  positionScaleState,
  setPositionScaleValue,
} from '@df/state';
import type {PositionScaleChangeDetail} from '@df/types';

import {positionScaleValueText} from './position-scale-text.js';

import '@material/web/slider/slider.js';
import type {MdSlider} from '@material/web/slider/slider.js';

/**
 * A five-stop scale on which a visitor places themselves. Only stops 2 and 4 carry
 * visible labels — see `PositionScaleValue` in `@df/types` for why.
 *
 * Presentation only: the value lives in `@df/state` and this component persists nothing.
 *
 * @fires df-position-scale-change - A stop was chosen. Detail: `{value}`.
 */
@customElement('df-position-scale')
export class DfPositionScale extends SignalWatcher(LitElement) {
  /** Visible label for stop 2. */
  @property({type: String}) declare anchorLow: string;

  /** Visible label for stop 4. */
  @property({type: String}) declare anchorHigh: string;

  /** Accessible name for the control as a whole. */
  @property({type: String}) declare label: string;

  /** Screen-reader orientation for the unnamed stops 1, 3 and 5, in that order. */
  @property({type: Array}) declare scaleWords: string[];

  /**
   * Words describing the direction of the axis, shown at its ends with arrows.
   *
   * These are NOT labels for stops 1 and 5. The arrows are what makes the difference:
   * "← less" at the left end says the axis decreases that way, whereas the bare word
   * sitting beneath the first stop would name that stop and undo the point of leaving
   * the extremes unnamed. The component supplies the arrows so they cannot be pointed
   * the wrong way by a caller.
   */
  @property({type: String}) declare lessLabel: string;
  @property({type: String}) declare moreLabel: string;

  @property({type: Boolean, reflect: true}) declare disabled: boolean;

  constructor() {
    super();
    this.anchorLow = '';
    this.anchorHigh = '';
    this.label = '';
    this.scaleWords = ['least', 'middle', 'most'];
    this.lessLabel = '';
    this.moreLabel = '';
    this.disabled = false;
  }

  static override styles = css`
    /* Sizes are in px, not rem, deliberately. rem resolves against the HOST page's root
     * font-size, which a shared component cannot control — the consuming 11ty site sets
     * html{font-size:12px}, which silently shrank every rem here by 25%. */
    :host {
      display: block;
      font-family: var(--df-position-scale-font, 'Roboto', sans-serif);
      color: var(--df-position-scale-text, #1f1f1f);
    }

    .scale__axis {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
      font-size: 13px;
      color: var(--df-position-scale-axis-text, #49454f);
    }

    .scale__slider {
      display: block;
      width: 100%;
      --md-slider-active-track-color: var(--df-position-scale-track, #6750a4);
      --md-slider-handle-color: var(--df-position-scale-handle, #6750a4);
    }

    .scale__anchors {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      margin-top: 4px;
    }

    .scale__anchor {
      font-size: 13px;
      line-height: 1.3;
      text-align: center;
      color: var(--df-position-scale-anchor-text, #49454f);
    }

    .scale__anchor--low {
      grid-column: 2;
    }

    .scale__anchor--high {
      grid-column: 4;
    }
  `;

  private handleChange(event: Event) {
    const slider = event.target as MdSlider;
    const previous = positionScaleState.get().value;
    setPositionScaleValue(Number(slider.value));
    const {value} = positionScaleState.get();

    // The store may have rejected the input. Lit dirty-checks the .value binding, so an
    // unchanged store value means no re-render and the slider would keep displaying the
    // rejected number — the control silently disagreeing with the source of truth. Push
    // the authoritative value back rather than trusting the binding to correct it.
    if (Number(slider.value) !== value) {
      slider.value = value;
    }

    if (value === previous) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent<PositionScaleChangeDetail>('df-position-scale-change', {
        detail: {value},
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render() {
    const {value} = positionScaleState.get();
    return html`
      ${this.lessLabel || this.moreLabel
        ? html`<div class="scale__axis">
            <span class="scale__axis-end scale__axis-end--less">&#8592; ${this.lessLabel}</span>
            <span class="scale__axis-end scale__axis-end--more">${this.moreLabel} &#8594;</span>
          </div>`
        : nothing}
      <md-slider
        class="scale__slider"
        min=${POSITION_SCALE_MIN}
        max=${POSITION_SCALE_MAX}
        step="1"
        ticks
        .value=${value}
        ?disabled=${this.disabled}
        aria-label=${this.label}
        aria-valuetext=${positionScaleValueText(value, {
          anchorLow: this.anchorLow,
          anchorHigh: this.anchorHigh,
          scaleWords: this.scaleWords,
        })}
        @change=${this.handleChange}></md-slider>
      <div class="scale__anchors">
        <span class="scale__anchor scale__anchor--low">${this.anchorLow}</span>
        <span class="scale__anchor scale__anchor--high">${this.anchorHigh}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'df-position-scale': DfPositionScale;
  }
}
