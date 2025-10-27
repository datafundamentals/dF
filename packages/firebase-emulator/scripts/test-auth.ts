/**
 * Quick Authentication Test Script
 * 
 * Tests logging in with all seeded users to verify credentials work.
 * 
 * Usage:
 *   pnpm tsx scripts/test-auth.ts
 * 
 * Prerequisites:
 *   - Emulators must be running
 *   - Seed data must be loaded
 */

import {initializeApp} from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

// Firebase configuration (matches .env.emulator)
const firebaseConfig = {
  apiKey: 'demo-api-key',
  authDomain: 'demo-firebase-teaching-app.firebaseapp.com',
  projectId: 'demo-firebase-teaching-app',
  storageBucket: 'demo-firebase-teaching-app.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:abc123def456789',
};

// Test users (matching seed data)
const testUsers = [
  {email: 'alice.anderson@example.com', password: 'password123', name: 'Alice Anderson'},
  {email: 'bob.builder@example.com', password: 'password123', name: 'Bob Builder'},
  {email: 'carol.chen@example.com', password: 'password123', name: 'Carol Chen'},
  {email: 'david.davis@example.com', password: 'password123', name: 'David Davis'},
  {email: 'emma.evans@example.com', password: 'password123', name: 'Emma Evans'},
  {email: 'frank.fisher@example.com', password: 'password123', name: 'Frank Fisher'},
  {email: 'grace.garcia@example.com', password: 'password123', name: 'Grace Garcia'},
  {email: 'henry.harris@example.com', password: 'password123', name: 'Henry Harris'},
  {email: 'iris.ikeda@example.com', password: 'password123', name: 'Iris Ikeda'},
  {email: 'jack.johnson@example.com', password: 'password123', name: 'Jack Johnson'},
];

async function testAuthentication(): Promise<void> {
  console.log('🔐 Testing Firebase Authentication with Emulators\n');
  console.log('Prerequisites:');
  console.log('  - Emulators running on port 9155');
  console.log('  - Seed data loaded (pnpm seed)\n');

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // Connect to Auth emulator
  connectAuthEmulator(auth, 'http://127.0.0.1:9155', {
    disableWarnings: true,
  });

  console.log('✓ Connected to Auth emulator (port 9155)\n');

  let successCount = 0;
  let failCount = 0;

  // Test each user
  for (const user of testUsers) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      console.log(`✅ ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   UID: ${userCredential.user.uid}`);
      console.log(`   Email Verified: ${userCredential.user.emailVerified}`);
      console.log(`   Display Name: ${userCredential.user.displayName}`);
      
      if (userCredential.user.photoURL) {
        console.log(`   Photo URL: ${userCredential.user.photoURL}`);
      }
      
      console.log('');

      // Sign out to test next user
      await signOut(auth);
      
      successCount++;
    } catch (error: unknown) {
      console.error(`❌ ${user.name} - Login failed`);
      if (error && typeof error === 'object' && 'message' in error) {
        console.error(`   Error: ${(error as {message: string}).message}`);
      }
      console.log('');
      failCount++;
    }
  }

  // Summary
  console.log('═'.repeat(60));
  console.log(`\n📊 Test Summary:`);
  console.log(`   ✅ Successful logins: ${successCount}/${testUsers.length}`);
  console.log(`   ❌ Failed logins: ${failCount}/${testUsers.length}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All authentication tests passed!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some authentication tests failed.\n');
    console.log('Troubleshooting:');
    console.log('  1. Verify emulators are running: pnpm emulators:start');
    console.log('  2. Check seed data loaded: pnpm seed');
    console.log('  3. Check Auth emulator port: http://127.0.0.1:9155\n');
    process.exit(1);
  }
}

// Run the tests
testAuthentication().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
