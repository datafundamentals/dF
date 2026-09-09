import {computed, signal} from '@lit-labs/signals';
import type {PositionScaleConfig, PositionScaleValue} from '@df/types';

const MIN_VALUE = 1;
const MAX_VALUE = 5;
const DEFAULT_VALUE: PositionScaleValue = 3;

const valueSignal = signal<PositionScaleValue>(DEFAULT_VALUE);

/** Bounds of the scale, exported so components never hard-code them. */
export const POSITION_SCALE_MIN = MIN_VALUE;
export const POSITION_SCALE_MAX = MAX_VALUE;
export const POSITION_SCALE_DEFAULT = DEFAULT_VALUE;

export const positionScaleState = computed<PositionScaleConfig>(() => ({
  value: valueSignal.get(),
}));

function isValidValue(candidate: number): candidate is PositionScaleValue {
  return (
    Number.isInteger(candidate) &&
    candidate >= MIN_VALUE &&
    candidate <= MAX_VALUE
  );
}

/**
 * Move the scale to a stop. Non-integer or out-of-range input is ignored rather
 * than clamped, so a caller bug surfaces as "nothing happened" instead of a
 * silently wrong position being recorded.
 */
export function setPositionScaleValue(next: number) {
  if (!isValidValue(next)) {
    return;
  }
  valueSignal.set(next);
}

/** Return the scale to its neutral midpoint. */
export function resetPositionScale() {
  valueSignal.set(DEFAULT_VALUE);
}
