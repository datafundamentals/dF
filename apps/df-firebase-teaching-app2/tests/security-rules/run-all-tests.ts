#!/usr/bin/env tsx
/**
 * Security Rules Test Runner
 *
 * This script runs all security rules tests for both Firestore and Storage.
 * It uses @firebase/rules-unit-testing to validate rules without requiring
 * a running emulator or full integration test setup.
 *
 * Usage:
 *   pnpm test:rules
 *
 * Requirements:
 *   - firestore.rules must exist in project root
 *   - storage.rules must exist in project root
 *   - Firebase emulator must be available (but not necessarily running)
 *
 * @see tests/security-rules/firestore.rules.test.ts
 * @see tests/security-rules/storage.rules.test.ts
 */

import {firestoreTests} from './firestore.rules.test.js';
import {storageTests} from './storage.rules.test.js';

// =============================================================================
// TEST RUNNER
// =============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: Error;
  duration: number;
}

interface TestSuiteResult {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

/**
 * Run a single test and return the result
 */
async function runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
  const startTime = Date.now();
  try {
    await testFn();
    return {
      name,
      passed: true,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      name,
      passed: false,
      error: error as Error,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Run a test suite (collection of tests)
 */
async function runTestSuite(
  name: string,
  tests: Record<string, () => Promise<void>>,
  setup: () => Promise<void>,
  cleanup: () => Promise<void>,
  afterEach: () => Promise<void>
): Promise<TestSuiteResult> {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Running: ${name}`);
  console.log('='.repeat(80));

  const startTime = Date.now();
  const results: TestResult[] = [];

  try {
    // Setup
    await setup();

    // Run each test
    for (const [testName, testFn] of Object.entries(tests)) {
      // Skip setup/cleanup/utility functions
      if (testName === 'setup' || testName === 'cleanup' || testName === 'afterEachTest') {
        continue;
      }

      const testDisplayName = testName.replace(/^test/, '').replace(/([A-Z])/g, ' $1').trim();
      process.stdout.write(`  • ${testDisplayName}...`);

      const result = await runTest(testName, testFn);
      results.push(result);

      if (result.passed) {
        console.log(` ✓ (${result.duration}ms)`);
      } else {
        console.log(` ✗ (${result.duration}ms)`);
        console.error(`    Error: ${result.error?.message || 'Unknown error'}`);
      }

      // Clean up after each test
      await afterEach();
    }

    // Cleanup
    await cleanup();
  } catch (error) {
    console.error(`\n❌ Test suite setup/cleanup failed:`, error);
  }

  const duration = Date.now() - startTime;
  const passedTests = results.filter((r) => r.passed).length;
  const failedTests = results.filter((r) => !r.passed).length;

  return {
    name,
    tests: results,
    totalTests: results.length,
    passedTests,
    failedTests,
    duration,
  };
}

/**
 * Print test suite summary
 */
function printSummary(suiteResults: TestSuiteResult[]) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalDuration = 0;

  for (const suite of suiteResults) {
    console.log(`\n${suite.name}:`);
    console.log(`  Total: ${suite.totalTests}`);
    console.log(`  Passed: ${suite.passedTests} ✓`);
    console.log(`  Failed: ${suite.failedTests} ✗`);
    console.log(`  Duration: ${suite.duration}ms`);

    totalTests += suite.totalTests;
    totalPassed += suite.passedTests;
    totalFailed += suite.failedTests;
    totalDuration += suite.duration;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log(`OVERALL RESULTS:`);
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  Passed: ${totalPassed} ✓`);
  console.log(`  Failed: ${totalFailed} ✗`);
  console.log(`  Duration: ${totalDuration}ms`);
  console.log('='.repeat(80));

  if (totalFailed === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log(`\n❌ ${totalFailed} test(s) failed.`);
  }
}

/**
 * Print failed tests details
 */
function printFailures(suiteResults: TestSuiteResult[]) {
  const failures = suiteResults.flatMap((suite) =>
    suite.tests.filter((t) => !t.passed).map((t) => ({suite: suite.name, test: t}))
  );

  if (failures.length === 0) {
    return;
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('FAILED TESTS:');
  console.log('='.repeat(80));

  for (const failure of failures) {
    console.log(`\n${failure.suite} > ${failure.test.name}`);
    console.error(`  ${failure.test.error?.message || 'Unknown error'}`);
    if (failure.test.error?.stack) {
      console.error(`  ${failure.test.error.stack.split('\n').slice(1, 3).join('\n  ')}`);
    }
  }
}

/**
 * Main test runner
 */
async function main() {
  console.log('🔒 Security Rules Test Suite');
  console.log('Running comprehensive tests for Firestore and Storage rules...\n');

  const suiteResults: TestSuiteResult[] = [];

  try {
    // Run Firestore tests
    const firestoreResult = await runTestSuite(
      'Firestore Security Rules',
      firestoreTests,
      firestoreTests.setup,
      firestoreTests.cleanup,
      firestoreTests.afterEachTest
    );
    suiteResults.push(firestoreResult);

    // Run Storage tests
    const storageResult = await runTestSuite(
      'Storage Security Rules',
      storageTests,
      storageTests.setup,
      storageTests.cleanup,
      storageTests.afterEachTest
    );
    suiteResults.push(storageResult);

    // Print summary
    printSummary(suiteResults);
    printFailures(suiteResults);

    // Exit with appropriate code
    const totalFailed = suiteResults.reduce((sum, suite) => sum + suite.failedTests, 0);
    process.exit(totalFailed === 0 ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Test runner failed:', error);
    process.exit(1);
  }
}

// Run the tests
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
