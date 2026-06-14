/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPERUSER_EMAIL: string;
  readonly VITE_OPENCLAW_AGENTS: string;
  readonly VITE_USE_EMULATOR: string;
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
