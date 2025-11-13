/**
 * Type declarations for Vite environment variables
 * These are required for firebase-config.ts to work with import.meta.env
 * 
 * FYI `VITE` prefixes are required by VITE as identifiers saying "OK this is alright to move to the browser"
 */
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  readonly VITE_FIREBASE_ENV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
