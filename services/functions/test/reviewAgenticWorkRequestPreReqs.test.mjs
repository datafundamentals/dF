import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseAgenticPreReqReviewResponse,
  REVIEW_SYSTEM_PROMPT,
} from '../lib/callable/reviewAgenticWorkRequestPreReqs.js';

test('main-agent prompt delegates approval policy to the installed skill', () => {
  assert.match(REVIEW_SYSTEM_PROMPT, /work-request-key-fields skill/);
  assert.match(REVIEW_SYSTEM_PROMPT, /latest contents of that skill as the sole approval policy/);
  assert.doesNotMatch(REVIEW_SYSTEM_PROMPT, /bicycle|non-empty after trimming/i);
});

test('parses a strict JSON approval', () => {
  assert.deepEqual(
    parseAgenticPreReqReviewResponse('{"approved":true,"feedback":"Approved."}'),
    {approved: true, feedback: 'Approved.'}
  );
});

test('parses JSON enclosed in a markdown response', () => {
  assert.deepEqual(
    parseAgenticPreReqReviewResponse('```json\n{"approved":false,"feedback":"Update Summary."}\n```'),
    {approved: false, feedback: 'Update Summary.'}
  );
});

test('rejects a response without the required fields', () => {
  assert.throws(
    () => parseAgenticPreReqReviewResponse('{"approved":"yes"}'),
    /required shape/
  );
});
