import '@df/ui-lit';
import {initializeFirebaseForApp} from '@df/state';
import {EMULATOR_CONFIG} from './config/firebase.config.js';
import './df-activity-log-app.js';

initializeFirebaseForApp(EMULATOR_CONFIG);
