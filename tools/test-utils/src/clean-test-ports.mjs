#!/usr/bin/env node
/**
 * Clean up lingering processes on test ports
 *
 * When test servers don't shut down cleanly, they can leave processes listening on ports.
 * This script kills any processes listening on the test server ports before running tests.
 */

import {execSync} from 'child_process';
import {existsSync} from 'fs';

// Ports used by test servers
const TEST_PORTS = [
  4173, // df-npm-info-app
  4174, // df-teaching-app
  4175, // df-lit-starter
  4176, // df-firebase-teaching-app
  4177, // df-app-starter-template
  4180, // df-activity-log
  4181, // df-chat-app
  4182, // df-openclaw-chat
  4183, // df-goldilocks-host
  4184, // df-user-admin-app
  4186, // df-auth-trigd-func-tool
];

console.log('Cleaning up test ports...');

for (const port of TEST_PORTS) {
  try {
    // Use lsof to find the process listening on the port
    const output = execSync(`lsof -ti :${port} 2>/dev/null`, {encoding: 'utf8'}).trim();

    if (output) {
      for (const pid of output.split('\n')) {
        console.log(`  Killing process ${pid} on port ${port}`);
        execSync(`kill -9 ${pid} 2>/dev/null`, {stdio: 'ignore'});
      }
    }
  } catch (error) {
    // Port is likely not in use, which is fine
  }
}

// Give processes time to die
await new Promise(resolve => setTimeout(resolve, 500));

console.log('Test ports cleaned up');
