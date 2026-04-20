import * as functions from 'firebase-functions/v2';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';

const OPENCLAW_SPAWN_URL = process.env.OPENCLAW_SPAWN_URL ?? '';
const OPENCLAW_API_KEY = process.env.OPENCLAW_API_KEY ?? '';

interface SpawnSessionResponse {
  sessionId: string;
}

interface OpenclawSpawnResult {
  session_key: string;
}

export const spawnOpenclawSession = functions.https.onCall<
  Record<string, unknown>,
  Promise<SpawnSessionResponse>
>(
  {region: 'us-central1', cors: true},
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in.');
    }

    const userId = request.auth.uid;
    const db = getFirestore();
    const userDocRef = db.collection('users').doc(userId);
    const userSnap = await userDocRef.get();

    if (userSnap.exists && userSnap.data()?.openclawSessionId) {
      return {sessionId: userSnap.data()!.openclawSessionId as string};
    }

    const response = await fetch(OPENCLAW_SPAWN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENCLAW_API_KEY}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      functions.logger.error('OpenClaw sessions_spawn failed', {status: response.status});
      throw new functions.https.HttpsError('internal', `OpenClaw spawn failed: ${response.status}`);
    }

    const result = await response.json() as OpenclawSpawnResult;
    const sessionId = result.session_key;

    await userDocRef.set(
      {openclawSessionId: sessionId, openclawSessionCreatedAt: FieldValue.serverTimestamp()},
      {merge: true}
    );

    functions.logger.info('OpenClaw session spawned', {userId, sessionId});
    return {sessionId};
  }
);
