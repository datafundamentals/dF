const DEFAULT_EMULATOR_UI_URL = 'http://127.0.0.1:5400';

const emulatorUiUrl = import.meta.env.VITE_FIREBASE_EMULATOR_UI ?? DEFAULT_EMULATOR_UI_URL;
const emulatorEnabled = import.meta.env.VITE_USE_EMULATOR !== 'false';

async function pingEmulator(): Promise<boolean> {
  try {
    await fetch(emulatorUiUrl, {
      mode: 'no-cors',
      cache: 'no-store',
    });
    return true;
  } catch (error) {
    console.warn(
      '[firebase-emulators] Expected Firebase Emulator Suite on',
      emulatorUiUrl,
      'but it does not appear to be running. Run `pnpm --filter @df/df-firebase-teaching-app3 emulators:start` in another terminal.'
    );
    console.debug('[firebase-emulators] ping error', error);
    return false;
  }
}

export function ensureEmulatorRunning(): void {
  if (import.meta.env.PROD || !emulatorEnabled) {
    return;
  }

  void pingEmulator();
}

export async function checkEmulatorConnection(): Promise<boolean> {
  if (import.meta.env.PROD || !emulatorEnabled) {
    return true;
  }

  return pingEmulator();
}
