#!/usr/bin/env node

/**
 * ⚠️ ADMIN OPERATIONS UTILITY - Use sparingly
 *
 * Sets custom claims on a Firebase Auth user (role + permissions)
 * This is an OFFLINE TOOL - it does NOT deploy or affect production auth-functions
 *
 * PURPOSE:
 * - Bootstrap: Promote the first user to admin before auth-functions are deployed
 * - Recovery: Fix user claims if auth-functions trigger fails or gets rolled back
 * - Testing: Manually set test user roles during development
 *
 * WHEN TO USE:
 * ✓ First user needs admin role to set up other users
 * ✓ Auth trigger failed and user has no profile/claims
 * ✓ Local testing with Firebase emulator
 * ✗ Regular operations (use Cloud Functions in df-user-admin-app instead)
 * ✗ Automated scripts (use admin SDK in service code instead)
 *
 * USAGE:
 * node set-custom-claims.js <email> <role> [permissions...]
 *
 * EXAMPLE:
 * node set-custom-claims.js pete.carapetyan@gmail.com admin user-admin-app:view user:list user:changeRole
 *
 * REQUIRES:
 * - service-account-key.json in this directory
 * - Get from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
 *
 * For detailed bootstrap instructions, see: guides/RBAC_SETUP.md#First-Admin-Initialization
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'peg-2035'
});

const auth = admin.auth();

async function setCustomClaims() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node set-custom-claims.js <email> <role> [permission1 permission2 ...]');
    console.error('Example: node set-custom-claims.js pete.carapetyan@gmail.com admin user-admin-app:view user:list user:changeRole');
    process.exit(1);
  }

  const email = args[0];
  const role = args[1];
  const permissions = args.slice(2);

  try {
    // Get user by email
    const user = await auth.getUserByEmail(email);
    console.log(`Found user: ${user.uid}`);

    // Set custom claims
    const claims = {
      role,
      permissions
    };

    await auth.setCustomUserClaims(user.uid, claims);
    console.log(`✓ Custom claims set successfully!`);
    console.log(`  Email: ${email}`);
    console.log(`  Role: ${role}`);
    console.log(`  Permissions: ${permissions.join(', ')}`);

    await admin.app().delete();
  } catch (error) {
    console.error(`✗ Error: ${error.message}`);
    process.exit(1);
  }
}

setCustomClaims();
