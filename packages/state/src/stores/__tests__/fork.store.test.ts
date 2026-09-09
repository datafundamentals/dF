/**
 * Unit tests for fork.store
 *
 * The store deliberately starts unselected — a default would nudge the visitor — and
 * validates only structurally, because legitimate option ids are static configuration
 * held by the component rather than by the store.
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {forkState, resetFork, selectFork} from '../fork.store';

describe('fork.store', () => {
  beforeEach(() => {
    resetFork();
  });

  it('starts with nothing selected', () => {
    expect(forkState.get().selectedId).toBeNull();
  });

  it('records a chosen id verbatim', () => {
    selectFork('dev');
    expect(forkState.get().selectedId).toBe('dev');
  });

  it('allows switching doors', () => {
    selectFork('dev');
    selectFork('business');
    expect(forkState.get().selectedId).toBe('business');
  });

  it('ignores an empty id', () => {
    selectFork('dev');
    selectFork('');
    expect(forkState.get().selectedId).toBe('dev');
  });

  it('ignores a whitespace-only id', () => {
    selectFork('dev');
    selectFork('   ');
    expect(forkState.get().selectedId).toBe('dev');
  });

  it('returns to unselected on reset, rather than to a default door', () => {
    selectFork('business');
    resetFork();
    expect(forkState.get().selectedId).toBeNull();
  });
});
