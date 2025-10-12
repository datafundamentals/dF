import './df-firebase-teaching-app.js';

// Only load auth demo in dev/production mode, not during tests
if (import.meta.env.MODE !== 'test') {
  import('./df-auth-demo.js');
}
