import {mkdirSync, rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname, resolve} from 'node:path';

const currentDir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(currentDir, '../emulator-data');

rmSync(dataDir, {recursive: true, force: true});
mkdirSync(dataDir, {recursive: true});

console.log(`[df-chat-app] Emulator data cleared at ${dataDir}`);
