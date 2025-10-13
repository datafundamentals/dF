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
} from 'firebase/storage';
import {readFile, readdir, writeFile, mkdir} from 'fs/promises';
import {resolve, join} from 'path';
import {fileURLToPath} from 'url';

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
const EMULATOR_CONFIG = {
  auth: {host: '127.0.0.1', port: 9155},
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
    
    // Extract filename from email (e.g., alice.anderson@example.com -> alice-anderson.svg)
    const emailName = user.email.split('@')[0];
    const fileName = `${emailName}.svg`;
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
async function seedAuthUsers(auth: Auth): Promise<void> {
  console.log('\n📧 Seeding authentication users...');

  const usersFile = resolve(SEED_DATA_DIR, 'auth-users.json');
  const users = await loadJsonFile<AuthUser[]>(usersFile);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      // Update profile with display name and photo
      await updateProfile(userCredential.user, {
        displayName: user.displayName,
        photoURL: user.photoURL || null,
      });

      console.log(`  ✓ Created user: ${user.email}`);
      created++;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as {code: string};
        if (firebaseError.code === 'auth/email-already-in-use') {
          console.log(`  - User already exists: ${user.email}`);
          skipped++;
        } else {
          console.error(`  ✗ Error creating user ${user.email}:`, error);
        }
      } else {
        console.error(`  ✗ Error creating user ${user.email}:`, error);
      }
    }
  }

  console.log(`  Summary: ${created} created, ${skipped} skipped`);
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
      await uploadBytes(storageRef, fileBuffer);

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
async function seedStorage(storage: FirebaseStorage, users: AuthUser[]): Promise<void> {
  console.log('\n🗄️  Seeding storage files...');
  
  // Ensure files exist (generate if missing)
  await ensureStorageFiles(users);

  await seedStorageFiles(storage, 'images', 'images');
  await seedStorageFiles(storage, 'documents', 'documents');
  await seedStorageFiles(storage, 'avatars', 'avatars');
}

// --- Main Script ---

async function main(): Promise<void> {
  console.log('🌱 Firebase Emulator Seed Script');
  console.log('================================\n');

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
    // Load auth users for avatar generation
    const usersFile = resolve(SEED_DATA_DIR, 'auth-users.json');
    const users = await loadJsonFile<AuthUser[]>(usersFile);
    
    await seedAuthUsers(auth);
    await seedFirestoreCollections(db);
    await seedStorage(storage, users);

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

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
