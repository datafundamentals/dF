import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAvatarUploadTasks,
  findAdminUser,
  getAvatarFileName,
  getAvatarStoragePath,
  getContentTypeForFile,
  getUploadMetadata,
  type SeededAuthUser,
} from './seed.js';

test('getAvatarFileName derives local part with svg extension', () => {
  const fileName = getAvatarFileName('alice.anderson@example.com');
  assert.equal(fileName, 'alice.anderson.svg');
});

test('getAvatarStoragePath prefixes uid with avatars/', () => {
  const path = getAvatarStoragePath('user-123');
  assert.equal(path, 'avatars/user-123');
});

test('getContentTypeForFile returns expected types', () => {
  assert.equal(getContentTypeForFile('avatar.svg'), 'image/svg+xml');
  assert.equal(getContentTypeForFile('document.md'), 'text/markdown');
  assert.equal(getContentTypeForFile('report.pdf'), 'application/pdf');
});

test('getUploadMetadata returns undefined for unknown extensions', () => {
  assert.equal(getUploadMetadata('archive.zip'), undefined);
});

test('buildAvatarUploadTasks maps users to uid-based storage paths', () => {
  const users: SeededAuthUser[] = [
    {
      email: 'alice.anderson@example.com',
      password: 'password123',
      displayName: 'Alice Anderson',
      emailVerified: true,
      uid: 'uid-alice',
    },
    {
      email: 'bob.builder@example.com',
      password: 'password456',
      displayName: 'Bob Builder',
      emailVerified: false,
      uid: 'uid-bob',
    },
  ];

  const tasks = buildAvatarUploadTasks(users);

  assert.equal(tasks.length, 2);
  assert.deepEqual(tasks[0], {
    email: 'alice.anderson@example.com',
    password: 'password123',
    uid: 'uid-alice',
    storagePath: 'avatars/uid-alice',
    localFileName: 'alice.anderson.svg',
    contentType: 'image/svg+xml',
  });
  assert.deepEqual(tasks[1], {
    email: 'bob.builder@example.com',
    password: 'password456',
    uid: 'uid-bob',
    storagePath: 'avatars/uid-bob',
    localFileName: 'bob.builder.svg',
    contentType: 'image/svg+xml',
  });
});

test('findAdminUser prefers configured admin email, falls back to first user', () => {
  const users: SeededAuthUser[] = [
    {
      email: 'alice.anderson@example.com',
      password: 'password123',
      displayName: 'Alice Anderson',
      emailVerified: true,
      uid: 'uid-alice',
    },
    {
      email: 'bob.builder@example.com',
      password: 'password456',
      displayName: 'Bob Builder',
      emailVerified: false,
      uid: 'uid-bob',
    },
  ];

  const admin = findAdminUser(users);
  assert.equal(admin?.email, 'alice.anderson@example.com');

  const fallback = findAdminUser([
    {
      email: 'other.user@example.com',
      password: 'password789',
      displayName: 'Other User',
      emailVerified: false,
      uid: 'uid-other',
    },
  ]);

  assert.equal(fallback?.email, 'other.user@example.com');
});
