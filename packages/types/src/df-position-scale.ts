/**
 * Canonical types for the position scale: a five-stop scale on which a visitor
 * places themselves, where only the second and fourth stops carry visible labels.
 *
 * The deliberate absence of labels on stops 1, 3 and 5 is a design requirement, not
 * an omission — naming the extremes forces a self-report, which people resist or game.
 * Screen readers still receive orientation through `aria-valuetext`.
 */

/** The five valid stops. There is no zero and no sixth position. */
export type PositionScaleValue = 1 | 2 | 3 | 4 | 5;

/** Reactive state owned by the position scale store. */
export interface PositionScaleConfig {
  value: PositionScaleValue;
}

/** Payload of the `df-position-scale-change` event. */
export interface PositionScaleChangeDetail {
  value: PositionScaleValue;
}
