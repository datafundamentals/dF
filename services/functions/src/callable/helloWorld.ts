/**
 * Minimal test callable function
 *
 * RUNTIME: Firebase Cloud Functions v2 (2nd Generation)
 *
 * Deployed to Cloud Run with explicit region and CORS configuration
 * to ensure IAM permissions can be configured via Google Cloud Console.
 *
 * This function is used as a minimal test case to verify callable functions work
 * without authentication, authorization, or database dependencies.
 *
 * See: guides/FUNCTIONS_PLACEMENT.md for architecture decisions
 */

import * as functions from 'firebase-functions/v2';

interface HelloWorldResponse {
  hello: string;
  timestamp: string;
}

export const helloWorld = functions.https.onCall<
  Record<string, unknown>,
  Promise<HelloWorldResponse>
>(
  {
    region: 'us-central1',
    cors: true, // Allow all origins - Cloud Run will handle CORS
  },
  async () => {
    return {hello: 'world', timestamp: new Date().toISOString()};
  }
);
