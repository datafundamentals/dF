import './df-firebase-teaching-app.js';

// Always include the Firestore demo so integration tests can exercise CRUD flows
void import('./df-firestore-demo.js');

// Only load auth demo in dev/production mode, not during tests
if (import.meta.env.MODE !== 'test') {
  void import('./df-auth-demo.js');
}
