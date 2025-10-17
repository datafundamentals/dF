#!/usr/bin/env node
import {execSync} from 'node:child_process';
import {resolve} from 'node:path';

const PROJECT_ROOT = resolve(process.cwd());

function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {encoding: 'utf8', cwd: PROJECT_ROOT, stdio: ['ignore', 'pipe', 'pipe'], ...options});
    return {success: true, output};
  } catch (error) {
    return {
      success: false,
      output: (error.stdout || '') + (error.stderr || ''),
    };
  }
}

function getComplianceData() {
  const result = runCommand('node ./scripts/compliance/check-md3-compliance.mjs --json --quiet');
  if (!result.output) {
    return {violations: []};
  }

  try {
    const parsed = JSON.parse(result.output);
    return parsed;
  } catch (error) {
    console.error('Failed to parse compliance JSON. Raw output:', result.output);
    return {violations: []};
  }
}

function getFileList() {
  const result = runCommand("git ls-files 'packages/ui-lit/src/**/*.ts'");
  const files = result.output.split('\n').filter(Boolean);
  return files;
}

function runDocCheck() {
  const result = runCommand('./scripts/check-standards-docs.sh');
  return result.success;
}

function runForbiddenCheck() {
  const result = runCommand('./scripts/check-forbidden-patterns.sh');
  return result.success;
}

function printDashboard({violations, totalComponents, docStatus, forbiddenStatus}) {
  const violatingFiles = Array.from(new Set(violations.map((violation) => violation.file)));
  const compliantCount = totalComponents - violatingFiles.length;
  const compliancePercent = totalComponents === 0 ? 100 : Math.round((compliantCount / totalComponents) * 100);

  console.log('📊 Standards Compliance Dashboard');
  console.log('=================================');
  console.log(`MD3 Compliance: ${compliancePercent}% (${compliantCount}/${totalComponents} components clean)`);
  if (violatingFiles.length) {
    console.log('Violating files:');
    violatingFiles.slice(0, 10).forEach((file) => {
      console.log(`  ❌ ${file}`);
    });
    if (violatingFiles.length > 10) {
      console.log(`  …and ${violatingFiles.length - 10} more.`);
    }
  } else {
    console.log('  ✅ All scanned components are MD3 compliant.');
  }

  console.log('\nDocumentation Status: ' + (docStatus ? '✅ Up to date' : '❌ Missing required sections (run ./scripts/check-standards-docs.sh)'));
  console.log('Forbidden Patterns: ' + (forbiddenStatus ? '✅ Clean' : '❌ Violations present (run ./scripts/check-forbidden-patterns.sh)'));
  console.log('\nNext Actions:');
  if (violatingFiles.length) {
    console.log('  1. Replace native elements in violating files with MD3 components.');
  } else {
    console.log('  1. Keep enforcing MD3 patterns in new components.');
  }
  if (!docStatus) {
    console.log('  2. Fix missing documentation snippets (`guides/*`).');
  }
  if (!forbiddenStatus) {
    console.log('  3. Remove console.log / TODO / commented-out code flagged by forbidden patterns script.');
  }
  console.log('  4. Regenerate report: pnpm generate:compliance-report');
}

function main() {
  const compliance = getComplianceData();
  const files = getFileList();
  const docStatus = runDocCheck();
  const forbiddenStatus = runForbiddenCheck();

  printDashboard({
    violations: compliance.violations || [],
    totalComponents: files.length,
    docStatus,
    forbiddenStatus,
  });

  if ((compliance.violations || []).length || !docStatus || !forbiddenStatus) {
    process.exitCode = 1;
  }
}

main();
