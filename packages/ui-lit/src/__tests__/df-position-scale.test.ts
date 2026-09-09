/**
 * Unit tests for df-position-scale.
 *
 * Covers the stop-to-announcement mapping, which is the component's only real logic.
 * The rule under test is a design requirement: stops 2 and 4 carry the caller's anchor
 * labels, and stops 1, 3 and 5 stay visually unnamed while still announcing an
 * orientation word so a screen reader is not left with a bare number.
 */

import {describe, it, expect} from 'vitest';
import {positionScaleValueText} from '../position-scale-text.js';
import type {PositionScaleValue} from '@df/types';

const labels = {
  anchorLow: 'still evaluating',
  anchorHigh: 'ready to scope',
  scaleWords: ['least', 'middle', 'most'],
};

describe('positionScaleValueText', () => {
  it('announces the caller anchor at stop 2', () => {
    expect(positionScaleValueText(2, labels)).toBe('still evaluating');
  });

  it('announces the caller anchor at stop 4', () => {
    expect(positionScaleValueText(4, labels)).toBe('ready to scope');
  });

  it('announces orientation words at the unnamed stops', () => {
    expect(positionScaleValueText(1, labels)).toBe('least');
    expect(positionScaleValueText(3, labels)).toBe('middle');
    expect(positionScaleValueText(5, labels)).toBe('most');
  });

  it('never returns an anchor label for an unnamed stop', () => {
    const unnamed: PositionScaleValue[] = [1, 3, 5];
    for (const stop of unnamed) {
      const text = positionScaleValueText(stop, labels);
      expect(text).not.toBe(labels.anchorLow);
      expect(text).not.toBe(labels.anchorHigh);
    }
  });

  it('returns empty text when a caller supplies no anchor, rather than substituting one', () => {
    const bare = {anchorLow: '', anchorHigh: '', scaleWords: ['least', 'middle', 'most']};
    expect(positionScaleValueText(2, bare)).toBe('');
    expect(positionScaleValueText(4, bare)).toBe('');
    expect(positionScaleValueText(3, bare)).toBe('middle');
  });

  it('uses the supplied scale words rather than hard-coded English', () => {
    const translated = {...labels, scaleWords: ['moins', 'milieu', 'plus']};
    expect(positionScaleValueText(1, translated)).toBe('moins');
    expect(positionScaleValueText(3, translated)).toBe('milieu');
    expect(positionScaleValueText(5, translated)).toBe('plus');
  });
});
