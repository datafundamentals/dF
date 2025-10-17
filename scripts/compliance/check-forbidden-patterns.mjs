#!/usr/bin/env node
import {execSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const PROJECT_ROOT = resolve(process.cwd());
const TARGET_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const EXCLUDED_PATHS = ['/dist/', '/node_modules/', '/.husky/'];

function getTrackedFiles() {
  const output = execSync('git ls-files', {encoding: 'utf8'});
  return output
    .split('\n')
    .filter(Boolean)
    .filter((file) =>
      TARGET_EXTENSIONS.some((ext) => file.endsWith(ext)) &&
      !EXCLUDED_PATHS.some((excluded) => file.includes(excluded)),
    );
}

function isComment(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('*/');
}

function detectForbiddenPatterns(file) {
  const absolute = resolve(PROJECT_ROOT, file);
  const content = readFileSync(absolute, 'utf8');
  const lines = content.split(/\r?\n/);
  const issues = [];

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.includes('console.log') && !trimmed.startsWith('//')) {
      issues.push({file, line: lineNumber, rule: 'console.log', message: 'Replace with logger or remove diagnostic output.'});
    }

    if (/TODO|FIXME/.test(trimmed)) {
      const hasTicket = /#\d+|https?:\/\//.test(trimmed);
      if (!hasTicket) {
        issues.push({file, line: lineNumber, rule: 'todo-without-ticket', message: 'Add linked ticket (e.g., TODO #1234) or resolve.'});
      }
    }

    if (trimmed.includes('@ts-ignore')) {
      const nextLine = lines[index + 1] ?? '';
      const hasJustification = nextLine.includes('reason:') || trimmed.includes('--');
      if (!hasJustification) {
        issues.push({file, line: lineNumber, rule: 'ts-ignore-without-justification', message: 'Provide justification comment after @ts-ignore (e.g., -- reason).'});
      }
    }

    if (trimmed.startsWith('//') && /<\w|return\b|const\b|let\b|if\b/.test(trimmed.slice(2))) {
      issues.push({file, line: lineNumber, rule: 'commented-out-code', message: 'Remove commented-out code or convert into documentation.'});
    }
  }

  return issues;
}

const allFiles = getTrackedFiles();
let violations = [];
allFiles.forEach((file) => {
  violations = violations.concat(detectForbiddenPatterns(file));
});

if (violations.length) {
  console.error('❌ Forbidden patterns detected:');
  violations.forEach((violation) => {
    console.error(
      `- ${violation.file}:${violation.line} [${violation.rule}] ${violation.message}`,
    );
  });
  process.exit(1);
}

console.log('✅ Forbidden pattern check passed.');
