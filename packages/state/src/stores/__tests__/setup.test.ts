/**
 * Test setup verification
 *
 * This file verifies that the Vitest configuration is working correctly.
 */

import {describe, it, expect} from 'vitest';

describe('Vitest Setup', () => {
  it('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  it('should have access to globals', () => {
    expect(describe).toBeDefined();
    expect(it).toBeDefined();
    expect(expect).toBeDefined();
  });
});
