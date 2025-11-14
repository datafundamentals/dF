/**
 * ⚠️⚠️⚠️ MONOREPO EXCEPTION: BUNDLED TYPES ⚠️⚠️⚠️
 *
 * THIS FILE VIOLATES THE CORE MONOREPO PRINCIPLE: "NO COPY-PASTE"
 *
 * These types are COPIED from packages/types/src/ and duplicated here.
 * This is a DELIBERATE EXCEPTION due to platform constraints.
 *
 * 📚 READ THIS FIRST: ../guides/CLOUD_FUNCTIONS_BUNDLING.md
 *
 * WHY THIS EXISTS:
 * ---------------
 * Google Cloud Build (where Firebase Functions deploy) does NOT support
 * pnpm workspace protocol ("workspace:*"). Attempting to use @df/types
 * fails with EUNSUPPORTEDPROTOCOL error.
 *
 * ALTERNATIVES CONSIDERED:
 * -----------------------
 * ❌ file:../../packages/types - Still fails in Cloud Build
 * ❌ Publish to npm - Overkill for teaching app
 * ❌ Keep emulator-only - Doesn't demonstrate production deployment
 * ✅ Minimal bundling - Pragmatic exception (THIS APPROACH)
 *
 * MAINTENANCE REQUIREMENT:
 * -----------------------
 * When packages/types/src/ changes, you MUST manually sync this file.
 * Only include types actually used by Cloud Functions (minimize duplication).
 *
 * TEACHING VALUE:
 * --------------
 * This demonstrates that architectural principles sometimes yield to
 * platform constraints. Documenting exceptions clearly is more valuable
 * than hiding pragmatic compromises.
 *
 * LAST SYNCED: 2025-10-16
 * SOURCE: packages/types/src/firebase-todos.types.ts
 * TYPES COPIED: TodoPriority, TodoFirestoreData
 *
 * @packageDocumentation
 * @module functions/types/bundled
 */
export {};
// ============================================================================
// SYNCHRONIZATION CHECKLIST
// ============================================================================
// 
// When packages/types/src/firebase-todos.types.ts changes:
// 
// [ ] Copy updated TodoFirestoreData type to this file
// [ ] Update LAST SYNCED date above
// [ ] Note: Cloud Functions receive plain objects, not Timestamp instances
// [ ] Test functions locally with emulators
// [ ] Deploy and test in production
// 
// Only include types ACTUALLY USED by Cloud Functions to minimize duplication.
// Currently using: TodoPriority, TodoFirestoreData
// 
// ============================================================================
