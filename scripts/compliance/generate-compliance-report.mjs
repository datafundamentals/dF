#!/usr/bin/env node
import {execSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const PROJECT_ROOT = resolve(process.cwd());
const REPORT_PATH = resolve(PROJECT_ROOT, 'COMPLIANCE_REPORT.md');

function runScanner() {
  try {
    const output = execSync('node ./scripts/compliance/check-md3-compliance.mjs --json --quiet', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(output).violations || [];
  } catch (error) {
    const raw = (error.stdout || '') + (error.stderr || '');
    try {
      const parsed = JSON.parse(raw);
      return parsed.violations || [];
    } catch {
      console.error('Unable to parse compliance scanner output. Raw output:');
      console.error(raw);
      process.exit(1);
    }
  }
}

function groupViolations(violations) {
  const grouped = new Map();
  violations.forEach((violation) => {
    if (!grouped.has(violation.file)) {
      grouped.set(violation.file, []);
    }
    grouped.get(violation.file).push(violation);
  });
  return grouped;
}

function buildReport(violations) {
  const grouped = groupViolations(violations);
  const totalFiles = grouped.size;
  const totalViolations = violations.length;
  const now = new Date().toISOString();

  let report = '# Compliance Report\n\n';
  report += `- **Generated:** ${now}\n`;
  report += `- **Violating Files:** ${totalFiles}\n`;
  report += `- **Total Violations:** ${totalViolations}\n\n`;

  if (!totalViolations) {
    report += '✅ All scanned components are MD3 compliant. Keep it up!\n';
    return report;
  }

  report += '## Violations by File\n\n';
  grouped.forEach((entries, file) => {
    report += `### ${file}\n\n`;
    report += '| Line | Column | Tag | Suggestion | Snippet |\n';
    report += '|------|--------|-----|------------|---------|\n';
    entries.forEach((entry) => {
      const sanitizedSnippet = entry.snippet.replace(/\|/g, '\\|');
      report += `| ${entry.line} | ${entry.column} | ${entry.tag} | ${entry.suggestion} | \
${sanitizedSnippet} |\n`;
    });
    report += '\n';
  });

  report += '## Next Steps\n\n';
  report += '1. Replace native HTML elements with Material Web components.\n';
  report += '2. Re-run `pnpm scan:compliance` to confirm a clean state.\n';
  report += '3. Update documentation if new patterns emerge.\n';
  report += '4. Log any deferred work in `.z_/future/`.\n';

  return report;
}

function main() {
  const violations = runScanner();
  const report = buildReport(violations);
  writeFileSync(REPORT_PATH, report);
  console.log(`✅ Compliance report written to ${REPORT_PATH}`);
  if (violations.length) {
    process.exitCode = 1;
  }
}

main();
