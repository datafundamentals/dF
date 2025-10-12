import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_FUNCTIONS_REGION = 'us-central1';
const connectedServices = new WeakMap();
/**
 * Determines whether emulator connections should be attempted based on the
 * provided configuration and optional override flag.
 */
export function shouldUseEmulators(config, override) {
    if (typeof override === 'boolean') {
        return override;
    }
    if (!config) {
        return false;
    }
    if (typeof config.enabled === 'boolean') {
        return config.enabled;
    }
    return Boolean(config.auth || config.firestore || config.storage || config.functions || config.hosting);
}
/**
 * Connects available Firebase services to their emulator counterparts. Safe to
 * call multiple times—each service is connected at most once per app.
 */
export function connectFirebaseEmulators(app, config, options = {}) {
    if (!shouldUseEmulators(config)) {
        return {};
    }
    const result = {};
    const log = options.log ?? defaultLogger;
    if (config.auth) {
        const auth = getAuth(app);
        if (!isServiceConnected(app, 'auth')) {
            connectAuthEmulator(auth, formatEmulatorOrigin(config.auth), {
                disableWarnings: options.suppressAuthWarnings ?? true,
            });
            markServiceConnected(app, 'auth');
            log('[firebase-emulators] Auth emulator connected', config.auth);
        }
        result.auth = auth;
    }
    if (config.firestore) {
        const firestore = getFirestore(app);
        if (!isServiceConnected(app, 'firestore')) {
            connectFirestoreEmulator(firestore, ensureHost(config.firestore), ensurePort(config.firestore));
            markServiceConnected(app, 'firestore');
            log('[firebase-emulators] Firestore emulator connected', config.firestore);
        }
        result.firestore = firestore;
    }
    if (config.storage) {
        const storage = getStorage(app);
        if (!isServiceConnected(app, 'storage')) {
            connectStorageEmulator(storage, ensureHost(config.storage), ensurePort(config.storage));
            markServiceConnected(app, 'storage');
            log('[firebase-emulators] Storage emulator connected', config.storage);
        }
        result.storage = storage;
    }
    if (config.functions) {
        const region = config.functions.region ?? DEFAULT_FUNCTIONS_REGION;
        const functions = getFunctions(app, region);
        if (!isServiceConnected(app, 'functions')) {
            connectFunctionsEmulator(functions, ensureHost(config.functions), ensurePort(config.functions));
            markServiceConnected(app, 'functions');
            log('[firebase-emulators] Functions emulator connected', { ...config.functions, region });
        }
        result.functions = functions;
    }
    return result;
}
/**
 * Performs a lightweight health check against the Emulator UI. Returns `true`
 * when the request resolves without throwing, even if the response is opaque
 * due to `no-cors` mode.
 */
export async function checkEmulatorUi(url, fetchImpl = globalThis.fetch) {
    if (!url) {
        return false;
    }
    if (!fetchImpl) {
        console.warn('[firebase-emulators] Fetch API unavailable; skipping emulator UI check.');
        return false;
    }
    try {
        await fetchImpl(url, {
            method: 'GET',
            mode: 'no-cors',
            cache: 'no-store',
        });
        return true;
    }
    catch (error) {
        console.warn('[firebase-emulators] Emulator UI unreachable at', url, error);
        return false;
    }
}
/** Formats an emulator host/port pair into an origin string. */
export function formatEmulatorOrigin(config) {
    const protocol = config.secure ? 'https' : 'http';
    return `${protocol}://${ensureHost(config)}:${ensurePort(config)}`;
}
function ensureHost(config) {
    return config?.host ?? DEFAULT_HOST;
}
function ensurePort(config) {
    if (!config || typeof config.port !== 'number') {
        throw new Error('[firebase-emulators] Emulator configuration requires a numeric port.');
    }
    return config.port;
}
/** Exported helper for consumers that only need the parsed host string. */
export function getEmulatorHost(config) {
    return ensureHost(config);
}
/** Exported helper for consumers that only need the parsed port number. */
export function getEmulatorPort(config) {
    return ensurePort(config);
}
function markServiceConnected(app, service) {
    const existing = connectedServices.get(app);
    if (existing) {
        existing.add(service);
        return;
    }
    connectedServices.set(app, new Set([service]));
}
function isServiceConnected(app, service) {
    const connected = connectedServices.get(app);
    return connected?.has(service) ?? false;
}
function defaultLogger(message, ...details) {
    if (details.length) {
        console.info(message, ...details);
    }
    else {
        console.info(message);
    }
}
//# sourceMappingURL=emulator-detection.js.map