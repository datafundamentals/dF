import * as functions from 'firebase-functions/v2';
import {FieldPath, getFirestore} from 'firebase-admin/firestore';
import {getStorage} from 'firebase-admin/storage';

const WORK_REQUESTS_COLLECTION = 'agentWorkRequests';
const MESSAGES_SUBCOLLECTION = 'messages';
const DELETE_BATCH_SIZE = 200;

export interface DeleteAgenticConversationRequest {
  requestId: string;
}

export interface DeleteAgenticConversationResponse {
  success: true;
  requestId: string;
  deletedMessageCount: number;
}

export const deleteAgenticConversation = functions.https.onCall<
  DeleteAgenticConversationRequest,
  Promise<DeleteAgenticConversationResponse>
>(
  {
    region: 'us-central1',
    cors: true,
  },
  async (request) => {
    if (!request.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be signed in');
    }

    const requestId = request.data.requestId?.trim();
    if (!requestId) {
      throw new functions.https.HttpsError('invalid-argument', 'requestId is required');
    }

    const db = getFirestore();
    const conversationRef = db.collection(WORK_REQUESTS_COLLECTION).doc(requestId);
    const conversationSnap = await conversationRef.get();

    if (!conversationSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Conversation not found');
    }

    const ownerUserId = conversationSnap.get('userId');
    if (ownerUserId !== request.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Cannot delete another user\'s conversation');
    }

    const deletedMessageCount = await deleteMessagesSubcollection(conversationRef);
    const deletedFileCount = await deleteConversationStorageFiles(requestId);
    await conversationRef.delete();

    functions.logger.info('Deleted Agentic conversation', {
      requestId,
      userId: request.auth.uid,
      deletedMessageCount,
      deletedFileCount,
    });

    return {
      success: true,
      requestId,
      deletedMessageCount,
    };
  }
);

async function deleteConversationStorageFiles(requestId: string): Promise<number> {
  try {
    const bucket = getStorage().bucket();
    const prefix = `uploads/agentic/${requestId}/`;
    const [files] = await bucket.getFiles({prefix});
    if (files.length === 0) return 0;
    await Promise.all(files.map((file) => file.delete()));
    return files.length;
  } catch (error) {
    // Log but don't fail the delete — orphaned files are recoverable, a failed delete is confusing
    functions.logger.warn('Failed to delete storage files for conversation', {requestId, error});
    return 0;
  }
}

async function deleteMessagesSubcollection(
  conversationRef: FirebaseFirestore.DocumentReference
): Promise<number> {
  let deletedCount = 0;

  while (true) {
    const snapshot = await conversationRef
      .collection(MESSAGES_SUBCOLLECTION)
      .orderBy(FieldPath.documentId())
      .limit(DELETE_BATCH_SIZE)
      .get();

    if (snapshot.empty) {
      return deletedCount;
    }

    const batch = conversationRef.firestore.batch();
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
    }

    await batch.commit();
    deletedCount += snapshot.size;
  }
}
