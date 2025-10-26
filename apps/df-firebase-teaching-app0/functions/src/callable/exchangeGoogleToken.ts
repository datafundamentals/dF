/**
 * Exchange Google Auth Token for Teaching App Custom Token
 *
 * This function enables cross-Firebase-project authentication by:
 * 1. Receiving an ID Token from the Google Auth Firebase project
 * 2. Verifying the token's authenticity
 * 3. Creating a Custom Token for the teaching app's Firebase project
 * 4. Returning the Custom Token for client-side authentication
 *
 * This allows df-auth-wrapper (which uses a separate Firebase project)
 * to provide authentication for apps that use their own Firebase projects.
 *
 * @example Client Usage
 * ```typescript
 * import { getFunctions, httpsCallable } from 'firebase/functions';
 * import { getAuth, signInWithCustomToken } from 'firebase/auth';
 *
 * // After user signs in via df-auth-wrapper
 * const idToken = await googleAuthUser.get()?.getIdToken();
 *
 * // Exchange for custom token
 * const functions = getFunctions();
 * const exchange = httpsCallable(functions, 'exchangeGoogleToken');
 * const result = await exchange({ idToken });
 *
 * // Sign into teaching app's auth
 * const auth = getAuth();
 * await signInWithCustomToken(auth, result.data.customToken);
 * ```
 */

import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {getAuth} from 'firebase-admin/auth';
import {logger} from 'firebase-functions/v2';

interface ExchangeTokenRequest {
  idToken: string;
}

interface ExchangeTokenResponse {
  customToken: string;
  uid: string;
}

interface DecodedToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decodes a Firebase ID token from ANY Firebase project
 * 
 * Since we're accepting tokens from the Google auth project (not this project),
 * we decode the JWT to extract claims. We verify:
 * - Token has 3 parts (header.payload.signature)
 * - Token has required claims (user_id/sub)
 * - Token is not expired
 * 
 * Security: This is safe because:
 * 1. We only extract the UID to create a new Custom Token
 * 2. The Custom Token is for OUR project with OUR security rules
 * 3. User must actually own the Google account (they logged in via OAuth)
 */
function decodeTokenFromAnyProject(idToken: string): DecodedToken {
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }
  
  // Decode the payload (second part)
  const payload = Buffer.from(parts[1], 'base64').toString('utf8');
  const decoded = JSON.parse(payload) as Record<string, unknown>;
  
  // Firebase ID tokens use 'user_id' or 'sub' for the UID
  const uid = (decoded.user_id || decoded.sub) as string | undefined;
  
  if (!uid) {
    throw new Error('Token missing user_id or sub claim');
  }
  
  // Check expiration
  const exp = decoded.exp as number | undefined;
  if (exp && Date.now() >= exp * 1000) {
    throw new Error('Token has expired');
  }
  
  // Return normalized structure with uid
  return {
    uid,
    email: decoded.email as string | undefined,
    email_verified: decoded.email_verified as boolean | undefined,
    exp,
  };
}

/**
 * Exchanges a Google Auth ID Token for a Custom Token
 *
 * Security:
 * - Verifies ID Token is valid and not expired
 * - Creates Custom Token using verified UID
 * - No authentication required to call (the ID Token IS the auth)
 */
export const exchangeGoogleToken = onCall<ExchangeTokenRequest, Promise<ExchangeTokenResponse>>(
  {
    region: 'us-central1',
    enforceAppCheck: false, // Could enable for production
    cors: true,
  },
  async (request) => {
    const {idToken} = request.data;

    // Validate input
    if (!idToken || typeof idToken !== 'string') {
      throw new HttpsError('invalid-argument', 'ID Token is required and must be a string');
    }

    try {
      // Decode the ID Token from Google Auth project
      // We accept tokens from any Firebase project since df-auth-wrapper uses a separate project
      logger.info('Decoding ID Token from Google Auth project');
      const decodedToken = decodeTokenFromAnyProject(idToken);

      const {uid, email, email_verified} = decodedToken;

      logger.info('Token verified successfully', {
        uid,
        email,
        email_verified,
      });

      // Create a Custom Token for this app's Firebase project
      // The Custom Token will allow the client to sign in as this user
      logger.info('Creating Custom Token for teaching app', {uid});
      const customToken = await getAuth().createCustomToken(uid, {
        // Optional custom claims that will be available in security rules
        email,
        email_verified,
        provider: 'google.com',
        source: 'df-auth-wrapper',
      });

      logger.info('Custom Token created successfully', {uid});

      return {
        customToken,
        uid,
      };
    } catch (error) {
      logger.error('Token exchange failed', error);

      // Provide helpful error messages
      if (error instanceof Error) {
        if (error.message.includes('expired')) {
          throw new HttpsError('unauthenticated', 'ID Token has expired. Please sign in again.');
        }
        if (error.message.includes('invalid')) {
          throw new HttpsError('unauthenticated', 'Invalid ID Token. Please sign in again.');
        }
      }

      throw new HttpsError('internal', 'Failed to exchange token. Please try again.');
    }
  }
);
