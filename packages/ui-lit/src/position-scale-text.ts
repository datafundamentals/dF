/**
 * Announcement text for a stop on a position scale.
 *
 * Kept out of the component so the mapping can be tested without a DOM, and so the
 * component stays focused on rendering. The rule it encodes is a design requirement:
 * stops 2 and 4 carry the caller's anchor labels, and stops 1, 3 and 5 stay visually
 * unnamed while still announcing an orientation word, so a screen reader is never left
 * with a bare number.
 */

import {POSITION_SCALE_MAX, POSITION_SCALE_MIN} from '@df/state';
import type {PositionScaleValue} from '@df/types';

/** Stops that carry a visible label. Everything else is deliberately unnamed. */
export const LOW_ANCHOR_STOP = 2;
export const HIGH_ANCHOR_STOP = 4;

/** Labels a caller supplies for the scale. All visitor-facing, none hard-coded. */
export interface PositionScaleLabels {
  anchorLow: string;
  anchorHigh: string;
  /** Orientation for the unnamed stops 1, 3 and 5, in that order. */
  scaleWords: string[];
}

export function positionScaleValueText(
  value: PositionScaleValue,
  labels: PositionScaleLabels,
): string {
  if (value === LOW_ANCHOR_STOP) {
    return labels.anchorLow;
  }
  if (value === HIGH_ANCHOR_STOP) {
    return labels.anchorHigh;
  }
  const [least, middle, most] = labels.scaleWords;
  if (value === POSITION_SCALE_MIN) {
    return least;
  }
  if (value === POSITION_SCALE_MAX) {
    return most;
  }
  return middle;
}
