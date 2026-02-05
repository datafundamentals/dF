import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {updateSiteAppTarget} from '../dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function makeTempYaml(content) {
  const tmpPath = path.join(
    os.tmpdir(),
    `node-utils-sites-test-${Date.now()}-${Math.random().toString(16).slice(2)}.yaml`,
  );
  fs.writeFileSync(tmpPath, content, 'utf8');
  return tmpPath;
}

test('roundtrip add/remove preserves SITES.yaml byte-for-byte', () => {
  const sourcePath = path.resolve(__dirname, '../../../SITES.yaml');
  const original = fs.readFileSync(sourcePath, 'utf8');
  const tmpPath = makeTempYaml(original);

  try {
    const addResult = updateSiteAppTarget({
      sitesYamlPath: tmpPath,
      siteId: 'aspieautomator',
      appName: 'df-chat',
      mode: 'add',
    });
    assert.equal(addResult.errorMessage, undefined);

    const removeResult = updateSiteAppTarget({
      sitesYamlPath: tmpPath,
      siteId: 'aspieautomator',
      appName: 'df-chat',
      mode: 'remove',
    });
    assert.equal(removeResult.errorMessage, undefined);

    const after = fs.readFileSync(tmpPath, 'utf8');
    assert.equal(after, original);
  } finally {
    fs.unlinkSync(tmpPath);
  }
});

test('inserts apps key when missing in a site block', () => {
  const yamlText = [
    'sites:',
    '  alpha:',
    '    host: firebase',
    '    status:',
    '    - needs work',
    '  beta:',
    '    host: netlify',
    '',
  ].join('\n');
  const tmpPath = makeTempYaml(yamlText);

  try {
    const result = updateSiteAppTarget({
      sitesYamlPath: tmpPath,
      siteId: 'alpha',
      appName: 'df-chat',
      mode: 'add',
    });
    assert.equal(result.errorMessage, undefined);

    const updated = fs.readFileSync(tmpPath, 'utf8');
    assert.match(updated, /  alpha:\n    host: firebase\n    apps: \[ df-chat \]\n    status:/);
  } finally {
    fs.unlinkSync(tmpPath);
  }
});

test('normalizes block-list apps format to inline list on update', () => {
  const yamlText = [
    'sites:',
    '  alpha:',
    '    host: firebase',
    '    apps:',
    '      - df-chat',
    '    status:',
    '    - needs work',
    '',
  ].join('\n');
  const tmpPath = makeTempYaml(yamlText);

  try {
    const result = updateSiteAppTarget({
      sitesYamlPath: tmpPath,
      siteId: 'alpha',
      appName: 'df-activity-log',
      mode: 'add',
    });
    assert.equal(result.errorMessage, undefined);

    const updated = fs.readFileSync(tmpPath, 'utf8');
    assert.match(updated, /  alpha:\n    host: firebase\n    apps: \[ df-chat, df-activity-log \]\n    status:/);
    assert.doesNotMatch(updated, /\n\s{4}apps:\s*\n\s{6}-\s+/);
  } finally {
    fs.unlinkSync(tmpPath);
  }
});
