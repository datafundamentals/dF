/** Resolve a Bucket Locator backend path using same-origin Access cookies. */
export function resolveBackendUrl(path: string): string {
  const configuredOrigin = window.__DF_BUCKET_LOCATOR_CONFIG__?.backendOrigin;
  const backendUrl = new URL(configuredOrigin || window.location.origin, window.location.origin);

  if (backendUrl.origin !== window.location.origin) {
    throw new Error(
      `Bucket Locator requires its backend to share the page origin (${window.location.origin}); received ${backendUrl.origin}`
    );
  }

  return new URL(path, `${backendUrl.origin}/`).toString();
}