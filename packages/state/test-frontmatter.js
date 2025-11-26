#!/usr/bin/env node

/**
 * Quick test to verify frontmatter validation and extraction
 * Run this to debug token counting issues
 *
 * Usage: node packages/state/test-frontmatter.js
 */

// Simulate validation function
function validateFrontmatter(markdownText) {
  // Check if there's any attempt at frontmatter (starts with optional spaces then ---)
  const hasFrontmatterAttempt = /^\s*---/.test(markdownText);

  if (!hasFrontmatterAttempt) {
    // No frontmatter attempt - entire file is content
    return { valid: true };
  }

  // Check for leading whitespace (before main checks)
  if (markdownText.match(/^\s+---/)) {
    return {
      valid: false,
      error: 'Frontmatter cannot have leading whitespace. Remove spaces before the opening ---'
    };
  }

  // Check for blank line before closing delimiter (before main checks)
  if (markdownText.match(/\n\n---\s*[\r\n]/)) {
    return {
      valid: false,
      error: 'Frontmatter has invalid structure (blank lines before closing ---). Remove blank lines within frontmatter'
    };
  }

  const validFrontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/;

  if (!validFrontmatterRegex.test(markdownText)) {
    return {
      valid: false,
      error: 'Frontmatter is not properly structured. Ensure opening and closing --- are on their own lines'
    };
  }

  return { valid: true };
}

// Simulate the extraction function
function extractContentWithoutFrontmatter(markdownText) {
  if (!markdownText || typeof markdownText !== 'string') {
    return '';
  }

  // Validate first
  const validation = validateFrontmatter(markdownText);
  if (!validation.valid) {
    return null;
  }

  // No frontmatter
  if (!markdownText.startsWith('---')) {
    return markdownText;
  }

  const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/;
  const match = markdownText.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  return match[2];
}

// Simulate the token counter
function countTokens(content) {
  if (!content || typeof content !== 'string') {
    return 0;
  }

  const tokens = content
    .split(/[\s\n\r\t.,!?;:(){}[\]"'`~@#$%^&*+=|\\<>/]+/)
    .filter(token => token.length > 0);

  return tokens.length;
}

// Test cases that match what the user might be testing
const tests = [
  {
    name: 'VALID: Small frontmatter + body',
    markdown: `---
title: Test Doc
---
This is the body.`,
    shouldPass: true
  },
  {
    name: 'VALID: Large frontmatter + same body',
    markdown: `---
title: Test Doc
description: This is a longer description with many more words
author: John Doe
date: 2025-11-25
tags: one, two, three, four, five
keywords: markdown, test, example
---
This is the body.`,
    shouldPass: true
  },
  {
    name: 'VALID: No frontmatter',
    markdown: `This is just content without frontmatter.`,
    shouldPass: true
  },
  {
    name: 'VALID: Multiple paragraphs in body',
    markdown: `---
title: Multi Paragraph
---
This is the first paragraph.

This is the second paragraph.`,
    shouldPass: true
  },
  {
    name: 'INVALID: Leading whitespace before opening ---',
    markdown: `  ---
title: Test
---
This is the body.`,
    shouldPass: false,
    expectError: 'leading whitespace'
  },
  {
    name: 'INVALID: Blank line before closing ---',
    markdown: `---
title: Test

---
This is the body.`,
    shouldPass: false,
    expectError: 'blank lines'
  },
  {
    name: 'INVALID: No newline after closing ---',
    markdown: `---
title: Test
---This is the body.`,
    shouldPass: false,
    expectError: 'properly structured'
  }
];

console.log('🧪 Frontmatter Validation & Extraction Test Suite\n');

let allPassed = true;
let validTests = 0;
let invalidTests = 0;

tests.forEach((test, i) => {
  console.log(`\n${i + 1}. ${test.name}`);
  console.log('─'.repeat(60));

  const validation = validateFrontmatter(test.markdown);
  const extracted = extractContentWithoutFrontmatter(test.markdown);
  const isValid = validation.valid && extracted !== null;

  if (test.shouldPass) {
    // Should be valid
    if (isValid) {
      const tokens = countTokens(extracted);
      const totalTokens = countTokens(test.markdown);
      console.log(`✅ PASS: Frontmatter is valid`);
      console.log(`   Total tokens (with FM): ${totalTokens}`);
      console.log(`   Extracted tokens:       ${tokens}`);
      validTests++;
    } else {
      console.log(`❌ FAIL: Should be valid, but got error: ${validation.error}`);
      allPassed = false;
    }
  } else {
    // Should be invalid
    if (!isValid && validation.error) {
      console.log(`✅ PASS: Correctly rejected invalid frontmatter`);
      console.log(`   Error: ${validation.error}`);
      invalidTests++;
    } else {
      console.log(`❌ FAIL: Should have rejected as invalid`);
      allPassed = false;
    }
  }
});

console.log('\n' + '═'.repeat(60));
console.log(`\nResults:`);
console.log(`  ✓ Valid cases passed:   ${validTests}/${tests.filter(t => t.shouldPass).length}`);
console.log(`  ✓ Invalid cases caught: ${invalidTests}/${tests.filter(t => !t.shouldPass).length}`);

if (allPassed) {
  console.log('\n✅ All validation tests passed!');
  console.log('\nThe extension will now:');
  console.log('  1. Check if frontmatter is present');
  console.log('  2. If present, validate its structure');
  console.log('  3. If valid, count tokens in body only');
  console.log('  4. If invalid, show helpful error message to user');
} else {
  console.log('\n❌ Some tests failed!');
}
