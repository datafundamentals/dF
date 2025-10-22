/**
 * Firestore Security Rules Tests
 *
 * These tests validate that Firestore security rules correctly enforce:
 * - Authentication requirements
 * - Field validation
 * - CRUD permissions
 * - Data integrity
 *
 * Uses @firebase/rules-unit-testing to test rules in isolation without
 * requiring a running emulator or integration test harness.
 *
 * Run: pnpm test:rules
 *
 * @see firestore.rules for rule definitions
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

const PROJECT_ID = 'demo-firebase-teaching-app';
const FIRESTORE_RULES_PATH = resolve(__dirname, '../../firestore.rules');

let testEnv: RulesTestEnvironment;

/**
 * Initialize test environment before all tests
 */
async function setup() {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(FIRESTORE_RULES_PATH, 'utf8'),
      host: '127.0.0.1',
      port: 8280,
    },
  });
}

/**
 * Clean up after each test
 */
async function afterEachTest() {
  await testEnv.clearFirestore();
}

/**
 * Clean up test environment after all tests
 */
async function cleanup() {
  await testEnv.cleanup();
}

// =============================================================================
// TEST HELPERS
// =============================================================================

/**
 * Get Firestore instance for authenticated user
 */
function getAuthenticatedFirestore(userId: string) {
  return testEnv.authenticatedContext(userId).firestore();
}

/**
 * Get Firestore instance for unauthenticated user
 */
function getUnauthenticatedFirestore() {
  return testEnv.unauthenticatedContext().firestore();
}

/**
 * Create a valid todo document for testing
 */
function createValidTodo(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Test Todo',
    titleLower: 'test todo',
    description: 'Test description',
    completed: false,
    priority: 'medium',
    tags: ['test'],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    dueDate: null,
    ...overrides,
  };
}

// =============================================================================
// TESTS EXPORT
// =============================================================================

export const firestoreTests = {
  setup,
  afterEachTest,
  cleanup,

  // =============================================================================
  // TODOS COLLECTION - AUTHENTICATION TESTS
  // =============================================================================

  async testUnauthenticatedCannotReadTodos() {
    const db = getUnauthenticatedFirestore();
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertFails(getDoc(todoRef));
  },

  async testUnauthenticatedCannotQueryTodos() {
    const db = getUnauthenticatedFirestore();
    const todosRef = collection(db, 'todos');
    await assertFails(getDocs(todosRef));
  },

  async testUnauthenticatedCannotCreateTodos() {
    const db = getUnauthenticatedFirestore();
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertFails(setDoc(todoRef, createValidTodo()));
  },

  async testUnauthenticatedCannotUpdateTodos() {
    const db = getUnauthenticatedFirestore();
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertFails(updateDoc(todoRef, {completed: true}));
  },

  async testUnauthenticatedCannotDeleteTodos() {
    const db = getUnauthenticatedFirestore();
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertFails(deleteDoc(todoRef));
  },

  async testAuthenticatedCanReadTodos() {
    const adminDb = testEnv.authenticatedContext('admin', {admin: true}).firestore();
    const todoRef = doc(adminDb, 'todos', 'test-todo-1');
    await setDoc(todoRef, createValidTodo());

    const db = getAuthenticatedFirestore('user1');
    const userTodoRef = doc(db, 'todos', 'test-todo-1');
    await assertSucceeds(getDoc(userTodoRef));
  },

  async testAuthenticatedCanQueryTodos() {
    const db = getAuthenticatedFirestore('user1');
    const todosRef = collection(db, 'todos');
    await assertSucceeds(getDocs(todosRef));
  },

  // =============================================================================
  // TODOS COLLECTION - FIELD VALIDATION TESTS
  // =============================================================================

  async testCreateTodoWithAllFieldsSucceeds() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertSucceeds(setDoc(todoRef, createValidTodo()));
  },

  async testCreateTodoWithoutTitleFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    const invalidTodo = createValidTodo();
    delete (invalidTodo as {title?: string}).title;
    await assertFails(setDoc(todoRef, invalidTodo));
  },

  async testCreateTodoWithoutTitleLowerFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    const invalidTodo = createValidTodo();
    delete (invalidTodo as {titleLower?: string}).titleLower;
    await assertFails(setDoc(todoRef, invalidTodo));
  },

  async testCreateTodoWithMismatchedTitleLowerFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertFails(
      setDoc(
        todoRef,
        createValidTodo({
          title: 'Test Todo',
          titleLower: 'WRONG VALUE',
        })
      )
    );
  },

  async testCreateTodoWithoutDescriptionFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    const invalidTodo = createValidTodo();
    delete (invalidTodo as {description?: string}).description;
    await assertFails(setDoc(todoRef, invalidTodo));
  },

  async testCreateTodoWithoutCompletedFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    const invalidTodo = createValidTodo();
    delete (invalidTodo as {completed?: boolean}).completed;
    await assertFails(setDoc(todoRef, invalidTodo));
  },

  async testCreateTodoWithoutPriorityFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    const invalidTodo = createValidTodo();
    delete (invalidTodo as {priority?: string}).priority;
    await assertFails(setDoc(todoRef, invalidTodo));
  },

  async testCreateTodoWithInvalidPriorityFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertFails(setDoc(todoRef, createValidTodo({priority: 'critical'})));
  },

  async testCreateTodoWithoutTagsFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    const invalidTodo = createValidTodo();
    delete (invalidTodo as {tags?: string[]}).tags;
    await assertFails(setDoc(todoRef, invalidTodo));
  },

  async testCreateTodoWithTooManyTagsFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    const tooManyTags = Array.from({length: 11}, (_, i) => `tag${i}`);
    await assertFails(setDoc(todoRef, createValidTodo({tags: tooManyTags})));
  },

  async testCreateTodoWithEmptyTitleFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertFails(setDoc(todoRef, createValidTodo({title: '', titleLower: ''})));
  },

  async testCreateTodoWithLongTitleFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    const longTitle = 'a'.repeat(201);
    await assertFails(
      setDoc(todoRef, createValidTodo({title: longTitle, titleLower: longTitle.toLowerCase()}))
    );
  },

  async testCreateTodoWithLongDescriptionFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    const longDescription = 'a'.repeat(2001);
    await assertFails(setDoc(todoRef, createValidTodo({description: longDescription})));
  },

  async testCreateTodoWithUnexpectedFieldsFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertFails(setDoc(todoRef, createValidTodo({unexpectedField: 'value'})));
  },

  async testCreateTodoWithWrongCompletedTypeFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertFails(setDoc(todoRef, createValidTodo({completed: 'true'})));
  },

  async testCreateTodoWithWrongTagsTypeFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-2');
    await assertFails(setDoc(todoRef, createValidTodo({tags: 'not-an-array'})));
  },

  // =============================================================================
  // TODOS COLLECTION - CRUD OPERATION TESTS
  // =============================================================================

  async testAuthenticatedCanCreateTodos() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await assertSucceeds(setDoc(todoRef, createValidTodo()));
  },

  async testAuthenticatedCanUpdateTodos() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await setDoc(todoRef, createValidTodo());
    await assertSucceeds(
      updateDoc(todoRef, {
        completed: true,
        updatedAt: Timestamp.now(),
      })
    );
  },

  async testAuthenticatedCanDeleteTodos() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await setDoc(todoRef, createValidTodo());
    await assertSucceeds(deleteDoc(todoRef));
  },

  async testUpdateWithInvalidPriorityFails() {
    const db = getAuthenticatedFirestore('user1');
    const todoRef = doc(db, 'todos', 'test-todo-1');
    await setDoc(todoRef, createValidTodo());
    await assertFails(
      updateDoc(todoRef, {
        priority: 'invalid-priority',
      })
    );
  },

  // =============================================================================
  // REFERENCE DATA COLLECTIONS - READ-ONLY TESTS
  // =============================================================================

  async testAuthenticatedCanReadFlowers() {
    const adminDb = testEnv.authenticatedContext('admin', {admin: true}).firestore();
    const docRef = doc(adminDb, 'flowers', 'test-doc');
    await setDoc(docRef, {name: 'Test Flower'});

    const db = getAuthenticatedFirestore('user1');
    const userDocRef = doc(db, 'flowers', 'test-doc');
    await assertSucceeds(getDoc(userDocRef));
  },

  async testUnauthenticatedCannotReadFlowers() {
    const db = getUnauthenticatedFirestore();
    const docRef = doc(db, 'flowers', 'test-doc');
    await assertFails(getDoc(docRef));
  },

  async testAuthenticatedCannotWriteFlowers() {
    const db = getAuthenticatedFirestore('user1');
    const docRef = doc(db, 'flowers', 'test-doc');
    await assertFails(setDoc(docRef, {name: 'Test Flower'}));
  },

  async testAuthenticatedCannotDeleteFlowers() {
    const db = getAuthenticatedFirestore('user1');
    const docRef = doc(db, 'flowers', 'test-doc');
    await assertFails(deleteDoc(docRef));
  },

  // =============================================================================
  // DEFAULT DENY TESTS
  // =============================================================================

  async testAuthenticatedCannotAccessUnknownCollection() {
    const db = getAuthenticatedFirestore('user1');
    const unknownRef = doc(db, 'unknown-collection', 'test-doc');
    await assertFails(getDoc(unknownRef));
    await assertFails(setDoc(unknownRef, {data: 'test'}));
  },

  async testUnauthenticatedCannotAccessUnknownCollection() {
    const db = getUnauthenticatedFirestore();
    const unknownRef = doc(db, 'unknown-collection', 'test-doc');
    await assertFails(getDoc(unknownRef));
    await assertFails(setDoc(unknownRef, {data: 'test'}));
  },
};
