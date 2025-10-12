import type { FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';
import { type FirebaseStorage } from 'firebase/storage';
import { type Functions } from 'firebase/functions';
import type { EmulatorConfig, EmulatorHostConfig } from '@df/types/firebase.types';
type ConnectedServices = {
    auth?: Auth;
    firestore?: Firestore;
    storage?: FirebaseStorage;
    functions?: Functions;
};
export interface ConnectEmulatorOptions {
    /**
     * Suppress the auth emulator warning banner in development tooling. Defaults
     * to true for a cleaner teaching experience.
     */
    suppressAuthWarnings?: boolean;
    /** Optional logger invoked when a connection succeeds. */
    log?: (message: string, ...details: unknown[]) => void;
}
/**
 * Determines whether emulator connections should be attempted based on the
 * provided configuration and optional override flag.
 */
export declare function shouldUseEmulators(config?: EmulatorConfig | null, override?: boolean): boolean;
/**
 * Connects available Firebase services to their emulator counterparts. Safe to
 * call multiple times—each service is connected at most once per app.
 */
export declare function connectFirebaseEmulators(app: FirebaseApp, config: EmulatorConfig, options?: ConnectEmulatorOptions): ConnectedServices;
/**
 * Performs a lightweight health check against the Emulator UI. Returns `true`
 * when the request resolves without throwing, even if the response is opaque
 * due to `no-cors` mode.
 */
export declare function checkEmulatorUi(url: string, fetchImpl?: typeof fetch | undefined): Promise<boolean>;
/** Formats an emulator host/port pair into an origin string. */
export declare function formatEmulatorOrigin(config: EmulatorHostConfig): string;
/** Exported helper for consumers that only need the parsed host string. */
export declare function getEmulatorHost(config: EmulatorHostConfig): string;
/** Exported helper for consumers that only need the parsed port number. */
export declare function getEmulatorPort(config: EmulatorHostConfig): number;
export type { ConnectedServices };
//# sourceMappingURL=emulator-detection.d.ts.map