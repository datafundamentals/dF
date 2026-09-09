/**
 * Unit tests for position-scale.store
 *
 * The store holds the only reactive state behind df-position-scale, so the
 * validation rules live here rather than in the component.
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {
  POSITION_SCALE_DEFAULT,
  POSITION_SCALE_MAX,
  POSITION_SCALE_MIN,
  positionScaleState,
  resetPositionScale,
  setPositionScaleValue,
} from '../position-scale.store';

describe('position-scale.store', () => {
  beforeEach(() => {
    resetPositionScale();
  });

  it('starts at the neutral midpoint', () => {
    expect(positionScaleState.get().value).toBe(POSITION_SCALE_DEFAULT);
    expect(POSITION_SCALE_DEFAULT).toBe(3);
  });

  it('accepts every valid stop', () => {
    for (let stop = POSITION_SCALE_MIN; stop <= POSITION_SCALE_MAX; stop += 1) {
      setPositionScaleValue(stop);
      expect(positionScaleState.get().value).toBe(stop);
    }
  });

  it('ignores values below the minimum', () => {
    setPositionScaleValue(4);
    setPositionScaleValue(0);
    expect(positionScaleState.get().value).toBe(4);
  });

  it('ignores values above the maximum', () => {
    setPositionScaleValue(2);
    setPositionScaleValue(6);
    expect(positionScaleState.get().value).toBe(2);
  });

  it('ignores non-integer values rather than rounding them', () => {
    setPositionScaleValue(2);
    setPositionScaleValue(3.5);
    expect(positionScaleState.get().value).toBe(2);
  });

  it('ignores NaN', () => {
    setPositionScaleValue(5);
    setPositionScaleValue(Number.NaN);
    expect(positionScaleState.get().value).toBe(5);
  });

  it('returns to the midpoint on reset', () => {
    setPositionScaleValue(1);
    resetPositionScale();
    expect(positionScaleState.get().value).toBe(POSITION_SCALE_DEFAULT);
  });
});
