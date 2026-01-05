# Security Testing Guide

This guide provides step-by-step manual testing procedures for validating Firebase security rules in the teaching app. Use this guide to complement automated tests and verify security in real-world scenarios.

## Overview

**When to Use This Guide:**
- After modifying security rules
- Before deploying to production
- When automated tests don't cover specific scenarios
- For teaching demonstrations of security concepts

**Prerequisites:**
- Firebase Emulator Suite running (`pnpm emulators:start`)
- Seed data loaded (`pnpm seed`)
- Teaching app running (`pnpm dev`)
- Access to Firebase Emulator UI (http://127.0.0.1:5400)

## Table of Contents

1. [Authentication Testing](#authentication-testing)
2. [Firestore Security Testing](#firestore-security-testing)
3. [Storage Security Testing](#storage-security-testing)
4. [Common Security Issues](#common-security-issues)
5. [Testing Checklist](#testing-checklist)

---

## Authentication Testing

### Test 1: Verify Unauthenticated Access is Blocked

**Objective:** Confirm that unauthenticated users cannot access protected resources.

**Steps:**
1. Open the teaching app at http://127.0.0.1:4173
2. Ensure you are NOT signed in (sign out if needed)
3. Open browser DevTools Console
4. Try to access Firestore directly:
   ```javascript
   const db = firebase.firestore();
   db.collection('todos').get()
     .then(docs => console.log('SUCCESS - Should not happen!', docs))
     .catch(err => console.log('EXPECTED: Permission denied', err.code));
   ```
5. **Expected Result:** Error with code `permission-denied`

**Pass Criteria:** ✅ All unauthenticated Firestore/Storage operations fail with permission denied

---

### Test 2: Verify Authenticated Access Works

**Objective:** Confirm that authenticated users can access their resources.

**Steps:**
1. Sign in with test user: `alice.anderson@example.com` / `password123`
2. Navigate to the Firestore demo section
3. Verify you can see the todos list
4. Try creating a new todo
5. Try updating an existing todo
6. Try deleting a todo

**Pass Criteria:** ✅ All CRUD operations succeed for authenticated users

---

## Firestore Security Testing

### Test 3: Validate Todo Field Requirements

**Objective:** Verify that Firestore rules enforce field validation.

**Steps:**
1. Sign in as `alice.anderson@example.com`
2. Open browser DevTools Console
3. Try to create a todo missing required fields:
   ```javascript
   const db = firebase.firestore();
   db.collection('todos').add({
     title: 'Test Todo',
     // Missing: titleLower, description, completed, priority, tags, timestamps
   })
     .then(() => console.log('SUCCESS - Should not happen!'))
     .catch(err => console.log('EXPECTED: Permission denied', err.code));
   ```
4. **Expected Result:** Permission denied error

**Test Cases to Try:**
- Missing `titleLower` field
- Missing `description` field
- Invalid `priority` value (not 'low', 'medium', or 'high')
- Too many tags (> 10)
- Title exceeding 200 characters
- Description exceeding 2000 characters
- Extra unexpected fields
- Wrong field types (e.g., `completed: "true"` instead of boolean)

**Pass Criteria:** ✅ All invalid documents are rejected with permission denied

---

### Test 4: Verify Reference Data is Read-Only

**Objective:** Confirm that reference collections (flowers, continents, etc.) are read-only.

**Steps:**
1. Sign in as any user
2. Navigate to any demo that displays reference data (flowers, continents, etc.)
3. Verify you can read the data
4. Open browser DevTools Console
5. Try to modify reference data:
   ```javascript
   const db = firebase.firestore();
   db.collection('flowers').doc('rose').update({
     name: 'Modified Rose'
   })
     .then(() => console.log('SUCCESS - Should not happen!'))
     .catch(err => console.log('EXPECTED: Permission denied', err.code));
   ```
6. **Expected Result:** Permission denied error

**Pass Criteria:** ✅ Regular users cannot modify reference collections

---

### Test 5: Verify Title/TitleLower Consistency

**Objective:** Ensure titleLower must match title.toLowerCase().

**Steps:**
1. Sign in as any user
2. Open browser DevTools Console
3. Try to create a todo with mismatched titleLower:
   ```javascript
   const db = firebase.firestore();
   const Timestamp = firebase.firestore.Timestamp;
   db.collection('todos').add({
     title: 'My Test Todo',
     titleLower: 'WRONG VALUE',
     description: 'Test description',
     completed: false,
     priority: 'medium',
     tags: ['test'],
     createdAt: Timestamp.now(),
     updatedAt: Timestamp.now(),
   })
     .then(() => console.log('SUCCESS - Should not happen!'))
     .catch(err => console.log('EXPECTED: Permission denied', err.code));
   ```
4. **Expected Result:** Permission denied error

**Pass Criteria:** ✅ Documents with mismatched titleLower are rejected

---

## Storage Security Testing

### Test 6: Verify Image Upload Restrictions

**Objective:** Confirm that only authenticated users can upload images with proper validation.

**Steps:**
1. Sign out (verify unauthenticated access)
2. Try to upload an image using the df-upload-link component
3. **Expected Result:** Upload fails or returns unauthorized error
4. Sign in as `alice.anderson@example.com`
5. Try to upload a valid image (< 5MB, jpg/png/gif/webp/svg)
6. **Expected Result:** Upload succeeds
7. Try to upload a non-image file (e.g., .pdf)
8. **Expected Result:** Upload fails with permission denied
9. Try to upload an oversized image (> 5MB)
10. **Expected Result:** Upload fails with permission denied

**Pass Criteria:** 
- ✅ Unauthenticated users cannot upload
- ✅ Authenticated users can upload valid images
- ✅ Non-image files are rejected
- ✅ Oversized files are rejected

---

### Test 7: Verify Document Upload Restrictions

**Objective:** Confirm document uploads enforce type and size limits.

**Steps:**
1. Sign in as any user
2. Navigate to Storage demo with document uploads
3. Upload a valid document (< 10MB, .pdf/.doc/.txt/.md/.json)
4. **Expected Result:** Upload succeeds
5. Try to upload an image file to the documents path
6. **Expected Result:** Upload fails (wrong content type)
7. Try to upload a large document (> 10MB)
8. **Expected Result:** Upload fails (exceeds size limit)

**Pass Criteria:**
- ✅ Valid documents upload successfully
- ✅ Wrong content types are rejected
- ✅ Oversized documents are rejected

---

### Test 8: Verify Avatar Ownership Rules

**Objective:** Ensure users can only upload their own avatars.

**Steps:**
1. Sign in as `alice.anderson@example.com` (user ID will be the Firebase auth UID)
2. Find your user ID in Firebase Emulator UI > Authentication
3. Try to upload an avatar to path `/avatars/{your-uid}`
4. **Expected Result:** Upload succeeds
5. Try to upload an avatar to path `/avatars/someone-else-uid`
6. **Expected Result:** Upload fails with permission denied
7. Sign out and try to read an avatar at `/avatars/{any-uid}`
8. **Expected Result:** Read succeeds (avatars are publicly readable)

**Pass Criteria:**
- ✅ Users can upload their own avatars
- ✅ Users cannot upload other users' avatars
- ✅ Avatars are publicly readable

---

### Test 9: Verify Storage Path Restrictions

**Objective:** Confirm that undefined storage paths are blocked.

**Steps:**
1. Sign in as any user
2. Open browser DevTools Console
3. Try to upload to an undefined path:
   ```javascript
   const storage = firebase.storage();
   const ref = storage.ref('undefined/path/file.txt');
   const uploadTask = ref.putString('test content');
   uploadTask.then(() => {
     console.log('SUCCESS - Should not happen!');
   }).catch(err => {
     console.log('EXPECTED: Unauthorized', err.code);
   });
   ```
4. **Expected Result:** Unauthorized error

**Pass Criteria:** ✅ Uploads to undefined paths are rejected

---

## Common Security Issues

### Issue 1: Wide-Open Development Rules

**Symptom:** Rules allow all operations without authentication checks.

**Check:**
```javascript
// BAD - Never use in production
match /{document=**} {
  allow read, write: if true;
}
```

**Resolution:** Ensure all rules require authentication and validate data.

---

### Issue 2: Missing Field Validation

**Symptom:** Invalid data can be written to Firestore.

**Check:** Try creating documents with:
- Missing required fields
- Extra unexpected fields
- Invalid field types
- Out-of-range values

**Resolution:** Add comprehensive `isValidTodo()` style validation functions.

---

### Issue 3: Inadequate Size Limits

**Symptom:** Users can upload very large files.

**Check:** Try uploading files exceeding defined limits.

**Resolution:** Enforce `isWithinSizeLimit()` checks in storage rules.

---

### Issue 4: Missing Content Type Validation

**Symptom:** Users can upload any file type to any path.

**Check:** Try uploading .exe, .sh, or other executable files.

**Resolution:** Enforce `isImageFile()`, `isDocumentFile()` checks.

---

## Testing Checklist

Use this checklist for comprehensive security testing:

### Authentication
- [ ] Unauthenticated users cannot read Firestore data
- [ ] Unauthenticated users cannot write Firestore data
- [ ] Unauthenticated users cannot upload to Storage
- [ ] Authenticated users can access appropriate resources
- [ ] Sign-out properly clears authentication state

### Firestore - Todos Collection
- [ ] Cannot create todos without all required fields
- [ ] Cannot create todos with invalid priority values
- [ ] Cannot create todos with too many tags (> 10)
- [ ] Cannot create todos with titles > 200 chars
- [ ] Cannot create todos with descriptions > 2000 chars
- [ ] Cannot create todos with mismatched titleLower
- [ ] Cannot add unexpected fields to todos
- [ ] Can create valid todos when authenticated
- [ ] Can update valid todos when authenticated
- [ ] Can delete todos when authenticated

### Firestore - Reference Collections
- [ ] Can read reference collections when authenticated
- [ ] Cannot read reference collections when unauthenticated
- [ ] Cannot write to reference collections as regular user
- [ ] Cannot delete from reference collections as regular user

### Storage - Images Path
- [ ] Anyone can read images
- [ ] Authenticated users can upload valid images
- [ ] Unauthenticated users cannot upload images
- [ ] Cannot upload non-image files to images path
- [ ] Cannot upload images > 5MB

### Storage - Documents Path
- [ ] Authenticated users can read documents
- [ ] Unauthenticated users cannot read documents
- [ ] Authenticated users can upload valid documents
- [ ] Cannot upload non-document files to documents path
- [ ] Cannot upload documents > 10MB

### Storage - Avatars Path
- [ ] Anyone can read avatars
- [ ] Users can upload their own avatar
- [ ] Users cannot upload other users' avatars
- [ ] Cannot upload non-image files as avatars
- [ ] Cannot upload avatars > 2MB

### Storage - Uploads Path
- [ ] Authenticated users can upload to uploads/storage/image
- [ ] Unauthenticated users cannot upload to uploads paths
- [ ] Image type validation works on uploads/storage/image
- [ ] Size limits enforced on uploads/storage/image
- [ ] Generic uploads path works for authenticated users

### Edge Cases
- [ ] Cannot access undefined Firestore collections
- [ ] Cannot access undefined Storage paths
- [ ] Rules handle null/undefined field values correctly
- [ ] Rules handle array and object field types correctly
- [ ] Concurrent writes don't bypass validation

---

## Reporting Issues

If you discover a security issue during manual testing:

1. **Document the issue:**
   - Exact steps to reproduce
   - Expected vs actual behavior
   - Browser console errors
   - Firebase Emulator logs

2. **Check automated tests:**
   - Run `pnpm test:rules` to see if issue is caught
   - If not, add a new test case

3. **Fix the rules:**
   - Update `firestore.rules` or `storage.rules`
   - Add corresponding test in `tests/security-rules/`
   - Verify fix with both automated and manual tests

4. **Deploy:**
   - Deploy updated rules: `pnpm deploy:rules`
   - Re-run manual testing to confirm fix

---

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules Guide](https://firebase.google.com/docs/storage/security)
- [Security Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests)
- Project automated tests: `tests/security-rules/`
- Project security rules: `firestore.rules`, `storage.rules`
