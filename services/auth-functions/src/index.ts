import * as functions from 'firebase-functions';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import type {Role, UserProfileDocument, UserRoleClaims} from '@df/types';

initializeApp();

const firestore = getFirestore();
const auth = getAuth();
const USER_PROFILE_COLLECTION = 'userProfiles';
const DEFAULT_ROLE: Role = 'viewer';

export const authUserCreated = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const timestamp = new Date().toISOString();
  const profileDoc: UserProfileDocument = {
    userId: uid,
    role: DEFAULT_ROLE,
    permissions: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  try {
    await firestore.collection(USER_PROFILE_COLLECTION).doc(uid).set(profileDoc);
    const claims: UserRoleClaims = {
      role: DEFAULT_ROLE,
      permissions: profileDoc.permissions,
    };
    await auth.setCustomUserClaims(uid, claims);
    functions.logger.info('RBAC profile initialized', {uid, role: DEFAULT_ROLE});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    functions.logger.error('Failed to initialize RBAC profile', {uid, error: errorMessage});
    throw error;
  }
});

export const authUserDeleted = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;
  try {
    await firestore.collection(USER_PROFILE_COLLECTION).doc(uid).delete();
    functions.logger.info('RBAC profile deleted', {uid});
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : error;
    functions.logger.error('Failed to delete RBAC profile', {uid, error: errorMessage});
    throw error;
  }
});
