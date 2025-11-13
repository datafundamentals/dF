/**
 * Emulator Mode Detection from Environment Variable
 *
 * Determines if the app should connect to local Firebase emulators
 * based on the VITE_USE_EMULATOR environment variable.
 * This replaces the legacy VITE_FIREBASE_ENV switching mechanism.
 *
 * **Key Principle:** Runtime defaults to cloud. Only when VITE_USE_EMULATOR is explicitly
 * set to 'true' will the app connect to emulators. Production builds omit this flag entirely,
 * ensuring zero risk of shipping emulator connections.
 *
 * **Usage:**
 * - In .env.emulator: VITE_USE_EMULATOR=true
 * - In .env.production: VITE_USE_EMULATOR=false (or omitted)
 * - To test cloud while running dev server: VITE_USE_EMULATOR=false pnpm dev
 *
 * @returns true if emulators should be used, false otherwise (defaults to cloud)
 *
 * @example
 * ```typescript
 * import { shouldUseEmulatorsFromEnv } from '@df/firebase';
 *
 * const config = shouldUseEmulatorsFromEnv()
 *   ? getEmulatorConfigForRuntime()
 *   : { auth: false, firestore: false, storage: false, functions: false };
 * ```
 */
export function shouldUseEmulatorsFromEnv(): boolean {
  return import.meta.env.VITE_USE_EMULATOR === 'true';
}
