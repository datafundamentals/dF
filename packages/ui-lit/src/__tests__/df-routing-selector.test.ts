/**
 * Unit tests for df-routing-selector.
 *
 * Covers the composition rule that turns a door and a position into the identifier
 * downstream systems persist. The format is load-bearing: consumers store it, so a
 * change here silently invalidates whatever they already recorded.
 */

import {describe, it, expect} from 'vitest';
import {routingCategory} from '../df-routing-selector.js';

describe('routingCategory', () => {
  it('joins a door and a position with a single hyphen', () => {
    expect(routingCategory('dev', 4)).toBe('dev-4');
    expect(routingCategory('business', 2)).toBe('business-2');
  });

  it('covers every stop', () => {
    expect(routingCategory('dev', 1)).toBe('dev-1');
    expect(routingCategory('dev', 2)).toBe('dev-2');
    expect(routingCategory('dev', 3)).toBe('dev-3');
    expect(routingCategory('dev', 4)).toBe('dev-4');
    expect(routingCategory('dev', 5)).toBe('dev-5');
  });

  it('echoes the caller id verbatim rather than normalising it', () => {
    expect(routingCategory('Dev_Side', 3)).toBe('Dev_Side-3');
  });

  it('produces distinct identifiers for every door and stop pairing', () => {
    const doors = ['dev', 'business'];
    const stops = [1, 2, 3, 4, 5] as const;
    const all = doors.flatMap((door) => stops.map((stop) => routingCategory(door, stop)));
    expect(new Set(all).size).toBe(doors.length * stops.length);
  });
});
