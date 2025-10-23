#!/usr/bin/env node

/**
 * Build-time configuration generator for Google Auth
 * 
 * Reads packages/state/.env.production and generates google-auth-config.ts
 * This keeps Firebase credentials out of git while baking them into the bundle.
 * 
 * Run as part of the build process: pnpm --filter @df/state run build
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '../.env.production');
const outputPath = join(__dirname, '../src/stores/google-auth-config.ts');

// Check if .env.production exists
if (!existsSync(envPath)) {
  console.error('❌ Missing packages/state/.env.production');
  console.error('');
  console.error('To build @df/state with Google Auth support:');
  console.error('1. Copy .env.production.example to .env.production');
  console.error('2. Fill in your Firebase project credentials');
  console.error('3. Run: pnpm --filter @df/state run build');
  console.error('');
  console.error('See packages/state/.env.production.example for details.');
  process.exit(1);
}

// Parse .env file manually (simple key=value parser)
const envContent = readFileSync(envPath, 'utf-8');
const config = {};

envContent.split('\n').forEach(line => {
  line = line.trim();
  
  // Skip empty lines and comments
  if (!line || line.startsWith('#')) return;
  
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=').trim();
  
  if (key && value) {
    config[key.trim()] = value;
  }
});

// Validate required keys
const required = [
  'GOOGLE_AUTH_API_KEY',
  'GOOGLE_AUTH_AUTH_DOMAIN',
  'GOOGLE_AUTH_PROJECT_ID',
  'GOOGLE_AUTH_STORAGE_BUCKET',
  'GOOGLE_AUTH_MESSAGING_SENDER_ID',
  'GOOGLE_AUTH_APP_ID'
];

const missing = required.filter(key => !config[key] || config[key] === 'your-api-key-here' || config[key].startsWith('your-'));

if (missing.length > 0) {
  console.error('❌ Missing or placeholder values in .env.production:');
  missing.forEach(key => console.error(`   - ${key}`));
  console.error('');
  console.error('Please fill in real Firebase project credentials.');
  process.exit(1);
}

// Generate TypeScript config file
const tsContent = `/**
 * Google Auth Firebase Configuration
 * 
 * THIS FILE IS AUTO-GENERATED - DO NOT EDIT MANUALLY
 * Generated from packages/state/.env.production by scripts/generate-auth-config.mjs
 * 
 * To update this configuration:
 * 1. Edit packages/state/.env.production
 * 2. Run: pnpm --filter @df/state run build
 */

import type { FirebaseConfig } from '@df/types/firebase.types';

export const GOOGLE_AUTH_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: '${config.GOOGLE_AUTH_API_KEY}',
  authDomain: '${config.GOOGLE_AUTH_AUTH_DOMAIN}',
  projectId: '${config.GOOGLE_AUTH_PROJECT_ID}',
  storageBucket: '${config.GOOGLE_AUTH_STORAGE_BUCKET}',
  messagingSenderId: '${config.GOOGLE_AUTH_MESSAGING_SENDER_ID}',
  appId: '${config.GOOGLE_AUTH_APP_ID}',
};
`;

writeFileSync(outputPath, tsContent, 'utf-8');
console.log('✅ Generated google-auth-config.ts from .env.production');
