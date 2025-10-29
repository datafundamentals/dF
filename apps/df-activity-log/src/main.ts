import '@df/ui-lit';
import '@df/ui-lit/df-auth-wrapper';
import {initializeFirebaseForApp} from '@df/state';
import {EMULATOR_CONFIG, FIREBASE_CONFIG} from './config/firebase.config.js';
import './df-activity-log-app.js';

initializeFirebaseForApp(EMULATOR_CONFIG, FIREBASE_CONFIG);
