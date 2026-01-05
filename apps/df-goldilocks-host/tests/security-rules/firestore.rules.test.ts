/**
 * Firestore Security Rules Tests - Goldilocks Visualizer
 *
 * These tests validate that Firestore security rules correctly enforce:
 * - User-scoped data access (goldilocks/{userId}/...)
 * - Authentication requirements
 * - Field validation for goldilocks types and configurations
 * - CRUD permissions
 *
 * Uses @firebase/rules-unit-testing to test rules in isolation without
 * requiring a running emulator or integration test harness.
 *
 * Run: pnpm test:rules
 *
 * @see ../../firestore.rules (uses monorepo root rules)
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// TEST SETUP
// =============================================================================

const PROJECT_ID = 'demo-goldilocks-visualizer';
const FIRESTORE_RULES_PATH = resolve(__dirname, '../../../../firestore.rules');

let testEnv: RulesTestEnvironment;

/**
 * Load Firestore rules from monorepo root
 */
function loadFirestoreRules(): string {
  try {
    return readFileSync(FIRESTORE_RULES_PATH, 'utf8');
  } catch (error) {
    throw new Error(
      `Failed to load Firestore rules from ${FIRESTORE_RULES_PATH}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: loadFirestoreRules(),
      host: '127.0.0.1',
      port: 8280,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

// =============================================================================
// TEST HELPERS
// =============================================================================

const USER_ID = 'test-user-123';
const OTHER_USER_ID = 'other-user-456';

/**
 * Create a valid goldilocks type document for testing
 */
function createValidGoldilocksType(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Project Management',
    nameLower: 'project management',
    first: 'Fast',
    second: 'Cheap',
    third: 'Good',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ownerId: USER_ID,
    ...overrides,
  };
}

/**
 * Create a valid configuration document for testing
 */
function createValidConfiguration(overrides: Record<string, unknown> = {}) {
  return {
    goldilocksTypeName: 'Project Management',
    first: 'Fast',
    second: 'Cheap',
    third: 'Good',
    selectedOptions: ['Fast', 'Good'],
    note: 'Prioritizing speed and quality',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    ownerId: USER_ID,
    ...overrides,
  };
}

// =============================================================================
// GOLDILOCKS TYPES - AUTHENTICATION & OWNERSHIP TESTS
// =============================================================================

describe('Goldilocks Types - Authentication', () => {
  test('unauthenticated users cannot read types', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await assertFails(getDoc(typeRef));
  });

  test('unauthenticated users cannot create types', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await assertFails(setDoc(typeRef, createValidGoldilocksType()));
  });

  test('authenticated users can read their own types', async () => {
    const adminDb = testEnv.authenticatedContext(USER_ID, {admin: true}).firestore();
    const typeRef = doc(adminDb, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await setDoc(typeRef, createValidGoldilocksType());

    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const userTypeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await assertSucceeds(getDoc(userTypeRef));
  });

  test('users cannot read other users types', async () => {
    const adminDb = testEnv.authenticatedContext(USER_ID, {admin: true}).firestore();
    const typeRef = doc(adminDb, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await setDoc(typeRef, createValidGoldilocksType());

    const otherDb = testEnv.authenticatedContext(OTHER_USER_ID).firestore();
    const otherTypeRef = doc(otherDb, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await assertFails(getDoc(otherTypeRef));
  });

  test('users can create types in their own collection', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await assertSucceeds(setDoc(typeRef, createValidGoldilocksType()));
  });

  test('users cannot create types in other users collection', async () => {
    const db = testEnv.authenticatedContext(OTHER_USER_ID).firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await assertFails(setDoc(typeRef, createValidGoldilocksType({ownerId: OTHER_USER_ID})));
  });
});

// =============================================================================
// GOLDILOCKS TYPES - FIELD VALIDATION TESTS
// =============================================================================

describe('Goldilocks Types - Field Validation', () => {
  test('creating type with all required fields succeeds', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await assertSucceeds(setDoc(typeRef, createValidGoldilocksType()));
  });

  test('creating type without name fails', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    const invalid = createValidGoldilocksType();
    delete (invalid as {name?: string}).name;
    await assertFails(setDoc(typeRef, invalid));
  });

  test('creating type without first option fails', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    const invalid = createValidGoldilocksType();
    delete (invalid as {first?: string}).first;
    await assertFails(setDoc(typeRef, invalid));
  });

  test('creating type without second option fails', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    const invalid = createValidGoldilocksType();
    delete (invalid as {second?: string}).second;
    await assertFails(setDoc(typeRef, invalid));
  });

  test('creating type without third option fails', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    const invalid = createValidGoldilocksType();
    delete (invalid as {third?: string}).third;
    await assertFails(setDoc(typeRef, invalid));
  });

  test('creating type with empty name fails', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await assertFails(setDoc(typeRef, createValidGoldilocksType({name: '', nameLower: ''})));
  });

  test('users can update their own types', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await setDoc(typeRef, createValidGoldilocksType());
    await assertSucceeds(updateDoc(typeRef, {name: 'Updated Name', nameLower: 'updated name'}));
  });

  test('users can delete their own types', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const typeRef = doc(db, `goldilocks/${USER_ID}/goldilocksTypes/type-1`);
    await setDoc(typeRef, createValidGoldilocksType());
    await assertSucceeds(deleteDoc(typeRef));
  });
});

// =============================================================================
// CONFIGURATIONS - AUTHENTICATION & OWNERSHIP TESTS
// =============================================================================

describe('Configurations - Authentication', () => {
  test('unauthenticated users cannot read configurations', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const configRef = doc(db, `goldilocks/${USER_ID}/configurations/config-1`);
    await assertFails(getDoc(configRef));
  });

  test('unauthenticated users cannot create configurations', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    const configRef = doc(db, `goldilocks/${USER_ID}/configurations/config-1`);
    await assertFails(setDoc(configRef, createValidConfiguration()));
  });

  test('authenticated users can read their own configurations', async () => {
    const adminDb = testEnv.authenticatedContext(USER_ID, {admin: true}).firestore();
    const configRef = doc(adminDb, `goldilocks/${USER_ID}/configurations/config-1`);
    await setDoc(configRef, createValidConfiguration());

    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const userConfigRef = doc(db, `goldilocks/${USER_ID}/configurations/config-1`);
    await assertSucceeds(getDoc(userConfigRef));
  });

  test('users cannot read other users configurations', async () => {
    const adminDb = testEnv.authenticatedContext(USER_ID, {admin: true}).firestore();
    const configRef = doc(adminDb, `goldilocks/${USER_ID}/configurations/config-1`);
    await setDoc(configRef, createValidConfiguration());

    const otherDb = testEnv.authenticatedContext(OTHER_USER_ID).firestore();
    const otherConfigRef = doc(otherDb, `goldilocks/${USER_ID}/configurations/config-1`);
    await assertFails(getDoc(otherConfigRef));
  });

  test('users can create configurations in their own collection', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const configRef = doc(db, `goldilocks/${USER_ID}/configurations/config-1`);
    await assertSucceeds(setDoc(configRef, createValidConfiguration()));
  });

  test('users cannot create configurations in other users collection', async () => {
    const db = testEnv.authenticatedContext(OTHER_USER_ID).firestore();
    const configRef = doc(db, `goldilocks/${USER_ID}/configurations/config-1`);
    await assertFails(setDoc(configRef, createValidConfiguration({ownerId: OTHER_USER_ID})));
  });
});

// =============================================================================
// CONFIGURATIONS - FIELD VALIDATION TESTS
// =============================================================================

describe('Configurations - Field Validation', () => {
  test('creating configuration with all required fields succeeds', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const configRef = doc(db, `goldilocks/${USER_ID}/configurations/config-1`);
    await assertSucceeds(setDoc(configRef, createValidConfiguration()));
  });

  test('creating configuration without goldilocksTypeName fails', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const configRef = doc(db, `goldilocks/${USER_ID}/configurations/config-1`);
    const invalid = createValidConfiguration();
    delete (invalid as {goldilocksTypeName?: string}).goldilocksTypeName;
    await assertFails(setDoc(configRef, invalid));
  });

  test('creating configuration without selectedOptions fails', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const configRef = doc(db, `goldilocks/${USER_ID}/configurations/config-1`);
    const invalid = createValidConfiguration();
    delete (invalid as {selectedOptions?: string[]}).selectedOptions;
    await assertFails(setDoc(configRef, invalid));
  });

  test('creating configuration with null note succeeds', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const configRef = doc(db, `goldilocks/${USER_ID}/configurations/config-1`);
    await assertSucceeds(setDoc(configRef, createValidConfiguration({note: null})));
  });

  test('users can delete their own configurations', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const configRef = doc(db, `goldilocks/${USER_ID}/configurations/config-1`);
    await setDoc(configRef, createValidConfiguration());
    await assertSucceeds(deleteDoc(configRef));
  });

  test('users cannot delete other users configurations', async () => {
    const adminDb = testEnv.authenticatedContext(USER_ID, {admin: true}).firestore();
    const configRef = doc(adminDb, `goldilocks/${USER_ID}/configurations/config-1`);
    await setDoc(configRef, createValidConfiguration());

    const otherDb = testEnv.authenticatedContext(OTHER_USER_ID).firestore();
    const otherConfigRef = doc(otherDb, `goldilocks/${USER_ID}/configurations/config-1`);
    await assertFails(deleteDoc(otherConfigRef));
  });
});

// =============================================================================
// QUERY TESTS
// =============================================================================

describe('Collection Queries', () => {
  test('users can query their own types collection', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const typesRef = collection(db, `goldilocks/${USER_ID}/goldilocksTypes`);
    await assertSucceeds(getDocs(typesRef));
  });

  test('users can query their own configurations collection', async () => {
    const db = testEnv.authenticatedContext(USER_ID).firestore();
    const configsRef = collection(db, `goldilocks/${USER_ID}/configurations`);
    await assertSucceeds(getDocs(configsRef));
  });

  test('users cannot query other users types collection', async () => {
    const db = testEnv.authenticatedContext(OTHER_USER_ID).firestore();
    const typesRef = collection(db, `goldilocks/${USER_ID}/goldilocksTypes`);
    await assertFails(getDocs(typesRef));
  });

  test('users cannot query other users configurations collection', async () => {
    const db = testEnv.authenticatedContext(OTHER_USER_ID).firestore();
    const configsRef = collection(db, `goldilocks/${USER_ID}/configurations`);
    await assertFails(getDocs(configsRef));
  });
});
