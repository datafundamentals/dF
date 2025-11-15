/**
 * Firebase Emulator Seed Script
 *
 * This script populates the Firebase Emulator with seed data for development and testing.
 *
 * Features:
 * - Emulator-only operation (fails safely if not connected to emulators)
 * - Idempotent design (can run multiple times without duplicating data)
 * - Uses Firebase Client SDK (teaching client-side patterns)
 * - Comprehensive seed data for Auth, Firestore, and Storage
 *
 * Usage:
 *   pnpm seed        - Populate emulators with seed data
 *   pnpm seed:reset  - Clear and repopulate emulators
 *
 * @see scripts/seed-data/README.md for detailed documentation
 */

import {initializeApp} from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
  getDocs,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadBytes,
  type FirebaseStorage,
  type UploadMetadata,
} from 'firebase/storage';
import {readFile, readdir, writeFile, mkdir} from 'fs/promises';
import {resolve, join} from 'path';
import {fileURLToPath, pathToFileURL} from 'url';

// --- Configuration ---

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SEED_DATA_DIR = __dirname;

// Firebase configuration (placeholder values for emulator)
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-firebase-teaching-app.firebaseapp.com',
  projectId: 'demo-firebase-teaching-app',
  storageBucket: 'demo-firebase-teaching-app.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:abc123def456789',
};

// Emulator configuration
// Note: These match the ports in apps/df-firebase-teaching-app/firebase.json
// For df-auth-trigd-func-tool, the auth port is 9156
const EMULATOR_CONFIG = {
  auth: {host: '127.0.0.1', port: process.env.AUTH_EMULATOR_PORT ? parseInt(process.env.AUTH_EMULATOR_PORT) : 9155},
  firestore: {host: '127.0.0.1', port: 8280},
  storage: {host: '127.0.0.1', port: 9390},
};

// --- Type Definitions ---

interface AuthUser {
  email: string;
  password: string;
  displayName: string;
  emailVerified: boolean;
  photoURL?: string;
}

interface FirestoreDocument {
  id: string;
  [key: string]: unknown;
}

export interface SeededAuthUser extends AuthUser {
  uid: string;
  isAdmin?: boolean;
}

export interface AvatarUploadTask {
  email: string;
  password: string;
  uid: string;
  storagePath: string;
  localFileName: string;
  contentType: string;
}

const CONTENT_TYPE_MAP: Record<string, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  txt: 'text/plain',
  md: 'text/markdown',
  json: 'application/json',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function getContentTypeForFile(fileName: string): string | undefined {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension ? CONTENT_TYPE_MAP[extension] : undefined;
}

export function getUploadMetadata(fileName: string): UploadMetadata | undefined {
  const contentType = getContentTypeForFile(fileName);
  return contentType ? {contentType} : undefined;
}

export function getAvatarFileName(email: string): string {
  return `${email.split('@')[0]}.svg`;
}

export function getAvatarStoragePath(uid: string): string {
  return `avatars/${uid}`;
}

export function buildAvatarUploadTasks(users: SeededAuthUser[]): AvatarUploadTask[] {
  return users.map((user) => {
    const localFileName = getAvatarFileName(user.email);
    const storagePath = getAvatarStoragePath(user.uid);
    const contentType = getContentTypeForFile(localFileName) ?? 'image/svg+xml';

    return {
      email: user.email,
      password: user.password,
      uid: user.uid,
      storagePath,
      localFileName,
      contentType,
    };
  });
}

export function findAdminUser(users: SeededAuthUser[]): SeededAuthUser | undefined {
  return (
    users.find((user) => user.email === ADMIN_USER_EMAIL) ?? users.at(0)
  );
}

// --- Utility Functions ---

/**
 * Checks if we're connected to Firebase emulators
 * This is a safety check to prevent accidentally running against production
 */
function isUsingEmulators(): boolean {
  // In a real implementation, we'd check if emulators are actually running
  // For now, we assume emulators if we're using demo project ID
  return firebaseConfig.projectId.startsWith('demo-');
}

/**
 * Loads JSON data from a file
 */
async function loadJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

/**
 * Gets all files in a directory
 */
async function getFilesInDirectory(dirPath: string): Promise<string[]> {
  try {
    const entries = await readdir(dirPath, {withFileTypes: true});
    return entries
      .filter((entry: {isFile: () => boolean; name: string}) => entry.isFile() && !entry.name.startsWith('.'))
      .map((entry: {name: string}) => entry.name);
  } catch {
    console.warn(`Directory not found or empty: ${dirPath}`);
    return [];
  }
}

// --- File Generation Functions ---

/**
 * Generates a simple PNG image with text
 * Creates a minimal PNG file programmatically without external dependencies
 */
async function generateSimpleImage(
  filePath: string,
  width: number,
  height: number,
  backgroundColor: string,
  text: string
): Promise<void> {
  // Create a simple SVG and save it (browsers and Firebase Storage handle SVG well)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${backgroundColor}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${text}</text>
</svg>`;
  
  await writeFile(filePath, svg, 'utf-8');
}

/**
 * Generates sample images for the images directory
 */
async function generateSampleImages(imagesDir: string, count: number): Promise<void> {
  await mkdir(imagesDir, {recursive: true});
  
  const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
  const themes = ['Flower', 'Landscape', 'Abstract', 'Nature', 'Pattern'];
  
  for (let i = 0; i < count; i++) {
    const fileName = `sample-${i + 1}.svg`;
    const filePath = join(imagesDir, fileName);
    const color = colors[i % colors.length];
    const theme = themes[i % themes.length];
    
    await generateSimpleImage(filePath, 800, 600, color, `${theme} Sample ${i + 1}`);
  }
}

/**
 * Generates sample documents (text files)
 */
async function generateSampleDocuments(documentsDir: string, count: number): Promise<void> {
  await mkdir(documentsDir, {recursive: true});
  
  const documents = [
    {
      name: 'user-guide.txt',
      content: `Firebase Storage User Guide
===========================

Welcome to Firebase Storage!

This is a sample document for teaching Firebase Storage concepts.

Key Features:
- Store and serve user-generated content
- Secure file uploads and downloads
- Integration with Firebase Authentication
- Powerful security rules

For more information, visit the Firebase documentation.
`,
    },
    {
      name: 'terms-of-service.md',
      content: `# Terms of Service

## Sample Document

This is a sample Terms of Service document for teaching purposes.

### 1. Acceptance of Terms

By accessing this application, you agree to these terms.

### 2. User Responsibilities

Users are responsible for:
- Maintaining account security
- Following community guidelines
- Respecting intellectual property

### 3. Data Storage

All data is stored securely using Firebase Storage.

---

*Last updated: ${new Date().toISOString().split('T')[0]}*
`,
    },
    {
      name: 'data-export.json',
      content: JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          version: '1.0',
          description: 'Sample JSON document for Firebase Storage',
          data: {
            records: 42,
            categories: ['flowers', 'continents', 'elements', 'instruments'],
            status: 'active',
          },
        },
        null,
        2
      ),
    },
  ];
  
  for (let i = 0; i < Math.min(count, documents.length); i++) {
    const filePath = join(documentsDir, documents[i].name);
    await writeFile(filePath, documents[i].content, 'utf-8');
  }
}

/**
 * Generates avatar images for auth users
 */
async function generateAvatars(avatarsDir: string, users: AuthUser[]): Promise<void> {
  await mkdir(avatarsDir, {recursive: true});
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
  ];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const [firstName, lastName] = user.displayName.split(' ');
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
    
    // Extract filename from email (e.g., alice.anderson@example.com -> alice.anderson.svg)
    const fileName = getAvatarFileName(user.email);
    const filePath = join(avatarsDir, fileName);
    
    const color = colors[i % colors.length];
    
    // Create a circular avatar with initials
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="100" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>
</svg>`;
    
    await writeFile(filePath, svg, 'utf-8');
  }
}

/**
 * Ensures storage files exist by generating them if missing
 */
async function ensureStorageFiles(users: AuthUser[]): Promise<void> {
  const storageFilesDir = resolve(SEED_DATA_DIR, 'storage-files');
  const imagesDir = join(storageFilesDir, 'images');
  const documentsDir = join(storageFilesDir, 'documents');
  const avatarsDir = join(storageFilesDir, 'avatars');
  
  // Check and generate images
  const imageFiles = await getFilesInDirectory(imagesDir);
  if (imageFiles.length === 0) {
    console.log('  - Generating sample images...');
    await generateSampleImages(imagesDir, 5);
    console.log('  ✓ Generated 5 sample images');
  }
  
  // Check and generate documents
  const documentFiles = await getFilesInDirectory(documentsDir);
  if (documentFiles.length === 0) {
    console.log('  - Generating sample documents...');
    await generateSampleDocuments(documentsDir, 3);
    console.log('  ✓ Generated 3 sample documents');
  }
  
  // Check and generate avatars
  const avatarFiles = await getFilesInDirectory(avatarsDir);
  if (avatarFiles.length === 0) {
    console.log('  - Generating avatar images...');
    await generateAvatars(avatarsDir, users);
    console.log(`  ✓ Generated ${users.length} avatar images`);
  }
}

// --- Seeding Functions ---

/**
 * Seeds authentication users
 */
async function seedAuthUsers(auth: Auth): Promise<SeededAuthUser[]> {
  console.log('\n📧 Seeding authentication users...');

  const usersFile = resolve(SEED_DATA_DIR, 'auth-users.json');
  const users = await loadJsonFile<AuthUser[]>(usersFile);

  const seededUsers: SeededAuthUser[] = [];
  let created = 0;
  let skipped = 0;

  for (const user of users) {
    let userCredential: Awaited<ReturnType<typeof createUserWithEmailAndPassword>> | null = null;

    try {
      userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      console.log(`  ✓ Created user: ${user.email}`);
      created++;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as {code: string};
        if (firebaseError.code === 'auth/email-already-in-use') {
          try {
            userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
            console.log(`  - User already exists: ${user.email}`);
            skipped++;
          } catch (signInError) {
            console.error(`  ✗ Error signing in existing user ${user.email}:`, signInError);
          }
        } else {
          console.error(`  ✗ Error creating user ${user.email}:`, error);
        }
      } else {
        console.error(`  ✗ Error creating user ${user.email}:`, error);
      }
    }

    if (!userCredential) {
      continue;
    }

    const {user: createdUser} = userCredential;
    const avatarPath = getAvatarStoragePath(createdUser.uid);

    try {
      await updateProfile(createdUser, {
        displayName: user.displayName,
        photoURL: avatarPath,
      });
    } catch (profileError) {
      console.error(`  ✗ Error updating profile for ${user.email}:`, profileError);
    }

    seededUsers.push({
      ...user,
      uid: createdUser.uid,
      isAdmin: user.email === ADMIN_USER_EMAIL,
    });

    try {
      await signOut(auth);
    } catch (signOutError) {
      console.warn(`  Warning: Failed to sign out after processing ${user.email}:`, signOutError);
    }
  }

  console.log(`  Summary: ${created} created, ${skipped} skipped`);

  return seededUsers;
}

async function assignAdminClaim(user: SeededAuthUser | undefined): Promise<void> {
  if (!user) {
    console.warn('  - No admin user available for custom claim assignment');
    return;
  }

  try {
    const response = await fetch(IDENTITY_TOOLKIT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer owner',
      },
      body: JSON.stringify({
        localId: user.uid,
        customAttributes: JSON.stringify({admin: true}),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to set admin claim (status ${response.status}): ${text}`);
    }

    user.isAdmin = true;
    console.log(`  ✓ Assigned admin claim to ${user.email}`);
  } catch (error) {
    console.error(`  ✗ Error assigning admin claim to ${user.email}:`, error);
  }
}

/**
 * Seeds a Firestore collection from a JSON file
 */
function prepareDocumentData(collectionName: string, data: Record<string, unknown>) {
  if (collectionName !== 'todos') {
    return data;
  }

  const normalized = {...data};

  if (typeof normalized.title === 'string') {
    normalized.titleLower = normalized.title.toLowerCase();
  }

  const timestampFields = ['createdAt', 'updatedAt', 'dueDate'] as const;
  for (const field of timestampFields) {
    const value = normalized[field];
    if (typeof value === 'string') {
      normalized[field] = Timestamp.fromDate(new Date(value));
    } else if (value === null || value === undefined) {
      normalized[field] = null;
    }
  }

  if (!Array.isArray(normalized.tags)) {
    normalized.tags = [];
  }

  return normalized;
}

async function seedFirestoreCollection(
  db: Firestore,
  collectionName: string,
  filePath: string
): Promise<void> {
  console.log(`\n📚 Seeding collection: ${collectionName}...`);

  const documents = await loadJsonFile<FirestoreDocument[]>(filePath);
  const collectionRef = collection(db, collectionName);

  let created = 0;
  let updated = 0;

  for (const document of documents) {
    try {
      const {id, ...rawData} = document;
      const data = prepareDocumentData(collectionName, rawData);
      const docRef = doc(collectionRef, id);

      // Check if document already exists
      const existingDocs = await getDocs(collectionRef);
      const exists = existingDocs.docs.some((d) => d.id === id);

      await setDoc(docRef, data, {merge: true});

      if (exists) {
        console.log(`  - Updated document: ${id}`);
        updated++;
      } else {
        console.log(`  ✓ Created document: ${id}`);
        created++;
      }
    } catch (error) {
      console.error(`  ✗ Error seeding document ${document.id}:`, error);
    }
  }

  console.log(`  Summary: ${created} created, ${updated} updated`);
}

/**
 * Seeds all Firestore collections
 */
async function seedFirestoreCollections(db: Firestore): Promise<void> {
  const collectionsDir = resolve(SEED_DATA_DIR, 'firestore-collections');

  const collections = [
    {name: 'flowers', file: 'flowers.json'},
    {name: 'continents', file: 'continents.json'},
    {name: 'chemicalElements', file: 'chemicalElements.json'},
    {name: 'musicalInstruments', file: 'musicalInstruments.json'},
    {name: 'todos', file: 'todos.json'},
  ];

  for (const {name, file} of collections) {
    const filePath = join(collectionsDir, file);
    await seedFirestoreCollection(db, name, filePath);
  }
}

/**
 * Seeds Storage files from a directory
 */
async function seedStorageFiles(
  storage: FirebaseStorage,
  directory: string,
  storagePath: string
): Promise<void> {
  const dirPath = resolve(SEED_DATA_DIR, 'storage-files', directory);
  const files = await getFilesInDirectory(dirPath);

  if (files.length === 0) {
    console.log(`  - No files found in ${directory}/`);
    return;
  }

  let uploaded = 0;

  for (const fileName of files) {
    try {
      const filePath = join(dirPath, fileName);
      const fileBuffer = await readFile(filePath);

      const storageRef = ref(storage, `${storagePath}/${fileName}`);
      const metadata = getUploadMetadata(fileName);

      if (!metadata) {
        console.warn(`  - Skipping ${storagePath}/${fileName}: unsupported file type`);
        continue;
      }

      await uploadBytes(storageRef, fileBuffer, metadata);

      console.log(`  ✓ Uploaded: ${storagePath}/${fileName}`);
      uploaded++;
    } catch (error) {
      console.error(`  ✗ Error uploading ${fileName}:`, error);
    }
  }

  console.log(`  Summary: ${uploaded} files uploaded`);
}

/**
 * Seeds all Storage files
 */
async function seedUserAvatars(
  storage: FirebaseStorage,
  auth: Auth,
  users: SeededAuthUser[]
): Promise<void> {
  console.log('\n👤 Seeding avatar uploads...');

  if (users.length === 0) {
    console.warn('  - Skipping avatar upload: no seeded users available');
    return;
  }

  const avatarsDir = resolve(SEED_DATA_DIR, 'storage-files', 'avatars');
  const uploadTasks = buildAvatarUploadTasks(users);

  let uploaded = 0;

  for (const task of uploadTasks) {
    const avatarPath = join(avatarsDir, task.localFileName);

    try {
      const fileBuffer = await readFile(avatarPath);
      await signInWithEmailAndPassword(auth, task.email, task.password);

      const storageRef = ref(storage, task.storagePath);
      await uploadBytes(storageRef, fileBuffer, {contentType: task.contentType});

      console.log(`  ✓ Uploaded avatar for ${task.email}: ${task.storagePath}`);
      uploaded++;
    } catch (error) {
      console.error(`  ✗ Error uploading avatar for ${task.email}:`, error);
    }
  }

  if (uploaded === 0) {
    console.warn('  - No avatars uploaded. Verify auth credentials and avatar files.');
  } else {
    console.log(`  Summary: ${uploaded} avatars uploaded`);
  }

  try {
    await signOut(auth);
  } catch (signOutError) {
    console.warn('  Warning: Failed to sign out after avatar uploads:', signOutError);
  }
}

async function seedStorage(
  storage: FirebaseStorage,
  auth: Auth,
  users: SeededAuthUser[]
): Promise<void> {
  console.log('\n🗄️  Seeding storage files...');

  if (users.length === 0) {
    console.warn('  - Skipping storage seeding: no users available');
    return;
  }

  // Ensure files exist (generate if missing)
  await ensureStorageFiles(users);

  try {
    await signInWithEmailAndPassword(auth, users[0].email, users[0].password);
  } catch (error) {
    console.error(`  ✗ Failed to sign in for storage uploads using ${users[0].email}:`, error);
    return;
  }

  await seedStorageFiles(storage, 'images', 'images');
  await seedStorageFiles(storage, 'documents', 'documents');

  await seedUserAvatars(storage, auth, users);
}

// --- Main Script ---

async function main(): Promise<void> {
  const skipAuth = process.env.SKIP_AUTH_SEEDING === 'true';
  const authOnly = process.env.AUTH_ONLY_SEEDING === 'true';

  if (authOnly) {
    console.log('🌱 Firebase Emulator Auth-Only Seed Script');
    console.log('==========================================\n');
  } else {
    console.log('🌱 Firebase Emulator Seed Script');
    console.log('================================\n');
  }

  // Safety check: Ensure we're using emulators
  if (!isUsingEmulators()) {
    console.error('❌ ERROR: Not connected to Firebase emulators!');
    console.error('This script can only run against emulators.');
    console.error('Please start the emulators first: pnpm emulators:start');
    process.exit(1);
  }

  console.log('✓ Emulator mode detected');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Connect to emulators
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  connectAuthEmulator(auth, `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}`, {
    disableWarnings: true,
  });

  connectFirestoreEmulator(db, EMULATOR_CONFIG.firestore.host, EMULATOR_CONFIG.firestore.port);

  connectStorageEmulator(storage, EMULATOR_CONFIG.storage.host, EMULATOR_CONFIG.storage.port);

  console.log('✓ Connected to emulators\n');

  // Run seeding operations
  try {
    let users: SeededAuthUser[] = [];

    // Seed auth users (unless explicitly skipped)
    if (!skipAuth) {
      users = await seedAuthUsers(auth);
      const adminUser = findAdminUser(users);
      await assignAdminClaim(adminUser);
    }

    // If auth-only mode, exit after seeding auth
    if (authOnly) {
      console.log('\n✅ Auth seeding completed successfully!');
      console.log('\nNext steps:');
      console.log('  - View data in Emulator UI: http://127.0.0.1:5400');
      console.log('  - Export data: pnpm emulators:export\n');
      process.exit(0);
    }

    // Seed Firestore collections
    if (users.length > 0) {
      const adminUser = findAdminUser(users);
      if (adminUser) {
        try {
          await signInWithEmailAndPassword(auth, adminUser.email, adminUser.password);
        } catch (error) {
          console.error(`  ✗ Failed to sign in admin user ${adminUser.email} for Firestore seeding:`, error);
        }
      }
    }

    await seedFirestoreCollections(db);

    try {
      await signOut(auth);
    } catch (signOutError) {
      console.warn('  Warning: Failed to sign out after Firestore seeding:', signOutError);
    }

    await seedStorage(storage, auth, users);

    console.log('\n✅ Seeding completed successfully!');
    console.log('\nNext steps:');
    console.log('  - View data in Emulator UI: http://127.0.0.1:5400');
    console.log('  - Export data: pnpm emulators:export');
    console.log('  - Reset data: pnpm seed:reset\n');

    // Exit cleanly to avoid Firebase SDK hanging
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the script only when executed directly (not when imported for tests)
const invokedPath = process.argv[1] ? resolve(process.cwd(), process.argv[1]) : null;
const modulePath = fileURLToPath(import.meta.url);

if (invokedPath && pathToFileURL(invokedPath).href === pathToFileURL(modulePath).href) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
const ADMIN_USER_EMAIL = 'alice.anderson@example.com';

const IDENTITY_TOOLKIT_ENDPOINT = `http://${EMULATOR_CONFIG.auth.host}:${EMULATOR_CONFIG.auth.port}/identitytoolkit.googleapis.com/v1/accounts:update?key=${firebaseConfig.apiKey}`;
