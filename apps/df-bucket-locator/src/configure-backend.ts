const configuredBackendOrigin = import.meta.env.VITE_BUCKET_LOCATOR_BACKEND_ORIGIN;

window.__DF_BUCKET_LOCATOR_CONFIG__ = {
  backendOrigin: configuredBackendOrigin || window.location.origin,
};