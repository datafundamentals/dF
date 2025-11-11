/**
 * Storage Security Rules Tests
 *
 * These tests validate that Storage security rules correctly enforce:
 * - Authentication requirements
 * - File type restrictions
 * - Size limits
 * - Path-based permissions
 *
 * Uses @firebase/rules-unit-testing to test rules in isolation without
 * requiring a running emulator or integration test harness.
 *
 * Run: pnpm test:rules
 *
 * @see storage.rules for rule definitions
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {ref, uploadString, getDownloadURL, deleteObject} from 'firebase/storage';
import {readFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// =============================================================================
// TEST SETUP
// =============================================================================

const PROJECT_ID = 'demo-auth-function-tool';
const STORAGE_RULES_PATH = resolve(__dirname, '../../storage.rules');

let testEnv: RulesTestEnvironment;

/**
 * Initialize test environment before all tests
 */
async function setup() {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    storage: {
      rules: readFileSync(STORAGE_RULES_PATH, 'utf8'),
      host: '127.0.0.1',
      port: 9390,
    },
  });
}

/**
 * Clean up after each test
 */
async function afterEachTest() {
  await testEnv.clearStorage();
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
 * Get Storage instance for authenticated user
 */
function getAuthenticatedStorage(userId: string) {
  return testEnv.authenticatedContext(userId).storage();
}

/**
 * Get Storage instance for unauthenticated user
 */
function getUnauthenticatedStorage() {
  return testEnv.unauthenticatedContext().storage();
}

/**
 * Create mock file content with specific size
 */
function createMockFileContent(sizeInBytes: number): string {
  return 'a'.repeat(sizeInBytes);
}

/**
 * Upload a file with metadata
 */
async function uploadFile(
  storage: ReturnType<typeof getAuthenticatedStorage>,
  path: string,
  content: string,
  contentType: string
) {
  const storageRef = ref(storage, path);
  return uploadString(storageRef, content, 'raw', {
    contentType,
    customMetadata: {
      // Simulate file extension in metadata since we can't set actual filename in tests
      filename: path.split('/').pop() || 'test-file',
    },
  });
}

// =============================================================================
// TESTS EXPORT
// =============================================================================

export const storageTests = {
  setup,
  afterEachTest,
  cleanup,

  // =============================================================================
  // IMAGES PATH - AUTHENTICATION AND VALIDATION TESTS
  // =============================================================================

  async testAnyoneCanReadImages() {
    // Upload as authenticated user
    const authStorage = getAuthenticatedStorage('user1');
    await uploadFile(authStorage, 'images/test.jpg', 'test-image', 'image/jpeg');

    // Try to read as unauthenticated
    const unauthStorage = getUnauthenticatedStorage();
    const imageRef = ref(unauthStorage, 'images/test.jpg');
    await assertSucceeds(getDownloadURL(imageRef));
  },

  async testAuthenticatedCanUploadValidImage() {
    const storage = getAuthenticatedStorage('user1');
    await assertSucceeds(uploadFile(storage, 'images/test.jpg', 'test-image', 'image/jpeg'));
  },

  async testUnauthenticatedCannotUploadImage() {
    const storage = getUnauthenticatedStorage();
    await assertFails(uploadFile(storage, 'images/test.jpg', 'test-image', 'image/jpeg'));
  },

  async testCannotUploadNonImageToImagesPath() {
    const storage = getAuthenticatedStorage('user1');
    await assertFails(uploadFile(storage, 'images/test.pdf', 'test-doc', 'application/pdf'));
  },

  async testCannotUploadOversizedImageToImagesPath() {
    const storage = getAuthenticatedStorage('user1');
    const oversizedContent = createMockFileContent(6 * 1024 * 1024); // 6MB
    await assertFails(
      uploadFile(storage, 'images/test.jpg', oversizedContent, 'image/jpeg')
    );
  },

  async testCanUploadValidSizedImageToImagesPath() {
    const storage = getAuthenticatedStorage('user1');
    const validContent = createMockFileContent(4 * 1024 * 1024); // 4MB
    await assertSucceeds(uploadFile(storage, 'images/test.jpg', validContent, 'image/jpeg'));
  },

  async testSupportsVariousImageTypes() {
    const storage = getAuthenticatedStorage('user1');
    await assertSucceeds(uploadFile(storage, 'images/test.png', 'test', 'image/png'));
    await assertSucceeds(uploadFile(storage, 'images/test2.gif', 'test', 'image/gif'));
    await assertSucceeds(uploadFile(storage, 'images/test3.webp', 'test', 'image/webp'));
    await assertSucceeds(uploadFile(storage, 'images/test4.svg', 'test', 'image/svg+xml'));
  },

  // =============================================================================
  // DOCUMENTS PATH - AUTHENTICATION AND VALIDATION TESTS
  // =============================================================================

  async testAuthenticatedCanReadDocuments() {
    const storage1 = getAuthenticatedStorage('user1');
    await uploadFile(storage1, 'documents/test.pdf', 'test-doc', 'application/pdf');

    const storage2 = getAuthenticatedStorage('user2');
    const docRef = ref(storage2, 'documents/test.pdf');
    await assertSucceeds(getDownloadURL(docRef));
  },

  async testUnauthenticatedCannotReadDocuments() {
    const authStorage = getAuthenticatedStorage('user1');
    await uploadFile(authStorage, 'documents/test.pdf', 'test-doc', 'application/pdf');

    const unauthStorage = getUnauthenticatedStorage();
    const docRef = ref(unauthStorage, 'documents/test.pdf');
    await assertFails(getDownloadURL(docRef));
  },

  async testAuthenticatedCanUploadValidDocument() {
    const storage = getAuthenticatedStorage('user1');
    await assertSucceeds(uploadFile(storage, 'documents/test.pdf', 'test-doc', 'application/pdf'));
  },

  async testUnauthenticatedCannotUploadDocument() {
    const storage = getUnauthenticatedStorage();
    await assertFails(uploadFile(storage, 'documents/test.pdf', 'test-doc', 'application/pdf'));
  },

  async testCannotUploadNonDocumentToDocumentsPath() {
    const storage = getAuthenticatedStorage('user1');
    await assertFails(uploadFile(storage, 'documents/test.jpg', 'test-image', 'image/jpeg'));
  },

  async testCannotUploadOversizedDocumentToDocumentsPath() {
    const storage = getAuthenticatedStorage('user1');
    const oversizedContent = createMockFileContent(11 * 1024 * 1024); // 11MB
    await assertFails(
      uploadFile(storage, 'documents/test.pdf', oversizedContent, 'application/pdf')
    );
  },

  async testCanUploadValidSizedDocumentToDocumentsPath() {
    const storage = getAuthenticatedStorage('user1');
    const validContent = createMockFileContent(9 * 1024 * 1024); // 9MB
    await assertSucceeds(
      uploadFile(storage, 'documents/test.pdf', validContent, 'application/pdf')
    );
  },

  async testSupportsVariousDocumentTypes() {
    const storage = getAuthenticatedStorage('user1');
    await assertSucceeds(uploadFile(storage, 'documents/test.txt', 'test', 'text/plain'));
    await assertSucceeds(uploadFile(storage, 'documents/test.md', 'test', 'text/markdown'));
    await assertSucceeds(uploadFile(storage, 'documents/test.json', '{}', 'application/json'));
    await assertSucceeds(uploadFile(storage, 'documents/test.docx', 'test', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'));
  },

  // =============================================================================
  // AVATARS PATH - OWNER-ONLY TESTS
  // =============================================================================

  async testAnyoneCanReadAvatars() {
    const authStorage = getAuthenticatedStorage('user1');
    await uploadFile(authStorage, 'avatars/user1', 'test-avatar', 'image/jpeg');

    const unauthStorage = getUnauthenticatedStorage();
    const avatarRef = ref(unauthStorage, 'avatars/user1');
    await assertSucceeds(getDownloadURL(avatarRef));
  },

  async testOwnerCanUploadOwnAvatar() {
    const storage = getAuthenticatedStorage('user1');
    await assertSucceeds(uploadFile(storage, 'avatars/user1', 'test-avatar', 'image/jpeg'));
  },

  async testNonOwnerCannotUploadAvatar() {
    const storage = getAuthenticatedStorage('user2');
    await assertFails(uploadFile(storage, 'avatars/user1', 'test-avatar', 'image/jpeg'));
  },

  async testUnauthenticatedCannotUploadAvatar() {
    const storage = getUnauthenticatedStorage();
    await assertFails(uploadFile(storage, 'avatars/user1', 'test-avatar', 'image/jpeg'));
  },

  async testCannotUploadNonImageAsAvatar() {
    const storage = getAuthenticatedStorage('user1');
    await assertFails(uploadFile(storage, 'avatars/user1', 'test-doc', 'application/pdf'));
  },

  async testCannotUploadOversizedAvatar() {
    const storage = getAuthenticatedStorage('user1');
    const oversizedContent = createMockFileContent(3 * 1024 * 1024); // 3MB
    await assertFails(uploadFile(storage, 'avatars/user1', oversizedContent, 'image/jpeg'));
  },

  async testCanUploadValidSizedAvatar() {
    const storage = getAuthenticatedStorage('user1');
    const validContent = createMockFileContent(1 * 1024 * 1024); // 1MB
    await assertSucceeds(uploadFile(storage, 'avatars/user1', validContent, 'image/jpeg'));
  },

  // =============================================================================
  // UPLOADS PATH - TEACHING DEMO TESTS
  // =============================================================================

  async testAuthenticatedCanUploadToStorageImagePath() {
    const storage = getAuthenticatedStorage('user1');
    await assertSucceeds(
      uploadFile(storage, 'uploads/storage/image/test.jpg', 'test-image', 'image/jpeg')
    );
  },

  async testUnauthenticatedCannotUploadToStorageImagePath() {
    const storage = getUnauthenticatedStorage();
    await assertFails(
      uploadFile(storage, 'uploads/storage/image/test.jpg', 'test-image', 'image/jpeg')
    );
  },

  async testCannotUploadNonImageToStorageImagePath() {
    const storage = getAuthenticatedStorage('user1');
    await assertFails(
      uploadFile(storage, 'uploads/storage/image/test.pdf', 'test-doc', 'application/pdf')
    );
  },

  async testCannotUploadOversizedImageToStorageImagePath() {
    const storage = getAuthenticatedStorage('user1');
    const oversizedContent = createMockFileContent(6 * 1024 * 1024); // 6MB
    await assertFails(
      uploadFile(storage, 'uploads/storage/image/test.jpg', oversizedContent, 'image/jpeg')
    );
  },

  async testAuthenticatedCanUploadToGenericUploadsPath() {
    const storage = getAuthenticatedStorage('user1');
    await assertSucceeds(uploadFile(storage, 'uploads/test.pdf', 'test-doc', 'application/pdf'));
  },

  async testUnauthenticatedCannotUploadToGenericUploadsPath() {
    const storage = getUnauthenticatedStorage();
    await assertFails(uploadFile(storage, 'uploads/test.pdf', 'test-doc', 'application/pdf'));
  },

  async testCannotUploadOversizedFileToGenericUploadsPath() {
    const storage = getAuthenticatedStorage('user1');
    const oversizedContent = createMockFileContent(11 * 1024 * 1024); // 11MB
    await assertFails(
      uploadFile(storage, 'uploads/test.pdf', oversizedContent, 'application/pdf')
    );
  },

  // =============================================================================
  // DEFAULT DENY TESTS
  // =============================================================================

  async testAuthenticatedCannotAccessUnknownPath() {
    const storage = getAuthenticatedStorage('user1');
    await assertFails(uploadFile(storage, 'unknown/path/test.jpg', 'test', 'image/jpeg'));
  },

  async testUnauthenticatedCannotAccessUnknownPath() {
    const storage = getUnauthenticatedStorage();
    await assertFails(uploadFile(storage, 'unknown/path/test.jpg', 'test', 'image/jpeg'));
  },
};
