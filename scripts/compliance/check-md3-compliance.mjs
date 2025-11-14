#!/usr/bin/env node
import {execSync} from 'node:child_process';
import {readFileSync, existsSync, writeFileSync} from 'node:fs';
import {resolve, relative} from 'node:path';
import readline from 'node:readline/promises';
import {stdin as input, stdout as output} from 'node:process';

const PROJECT_ROOT = resolve(process.cwd());
const TARGET_DIRECTORIES = [
  'packages/ui-lit/src/',
  'apps/df-activity-log/src/',
  'apps/df-app-starter-template/src/',
  'apps/df-auth-trigd-func-tool/src/',
  'df-chat-app/src/',
  'apps/df-firebase-teaching-app/src/',
  'apps/df-firebase-teaching-app2/src/',
  'apps/df-firebase-teaching-app3/src/',
  'apps/df-firebase-teaching-app4/src/',
  'apps/df-firebase-teaching-app5/src/',
];
const EXCLUDED_GLOBS = ['.spec.ts', '.test.ts', '.stories.ts', '.testing-guide.ts', '.md.ts'];

const PATTERNS = [
  {
    tag: 'button',
    regex: /<\s*button\b/gi,
    message: 'Native <button> detected. Use Material Design 3 buttons.',
    suggestion: 'Replace with <md-filled-button>, <md-outlined-button>, or <md-text-button>.',
    fix(line) {
      return line.replace(/<\s*button\b/g, (match) => match.replace('button', 'md-filled-button'));
    },
    fixClose(line) {
      return line.replace(/<\s*\/\s*button\s*>/g, '</md-filled-button>');
    },
  },
  {
    tag: 'input',
    regex: /<\s*input\b/gi,
    message: 'Native <input> detected. Use Material Design 3 text fields or checkbox components.',
    suggestionResolver(content) {
      if (/type\s*=\s*["']checkbox["']/i.test(content)) {
        return 'Replace with <md-checkbox>.';
      }
      if (/type\s*=\s*["']radio["']/i.test(content)) {
        return 'Replace with <md-radio> (Material Web radio).';
      }
      if (/type\s*=\s*["']file["']/i.test(content)) {
        return 'Use Material upload patterns (button + input hidden) instead of native file input.';
      }
      return 'Replace with <md-outlined-text-field> or <md-filled-text-field>.';
    },
  },
  {
    tag: 'select',
    regex: /<\s*select\b/gi,
    message: 'Native <select> detected. Use Material Design 3 selects.',
    suggestion: 'Replace with <md-filled-select> or <md-outlined-select> (with <md-select-option>).',
  },
  {
    tag: 'textarea',
    regex: /<\s*textarea\b/gi,
    message: 'Native <textarea> detected. Use Material Design 3 text fields.',
    suggestion: 'Replace with <md-filled-text-field type="textarea"> or <md-outlined-text-field>.',
  },
];

function parseArgs(argv) {
  const options = {
    staged: false,
    json: false,
    interactive: false,
    quiet: false,
  };

  for (const arg of argv) {
    switch (arg) {
      case '--staged':
        options.staged = true;
        break;
      case '--json':
        options.json = true;
        break;
      case '--interactive':
        options.interactive = true;
        break;
      case '--quiet':
        options.quiet = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        if (!options.targetFiles) {
          options.targetFiles = [];
        }
        options.targetFiles.push(arg);
        break;
    }
  }

  return options;
}

function printHelp() {
  console.log(`MD3 Compliance Scanner\n\n` +
    `Usage: node scripts/compliance/check-md3-compliance.mjs [options]\n\n` +
    `Options:\n` +
    `  --staged         Scan only staged files (pre-commit).\n` +
    `  --json           Output violations as JSON.\n` +
    `  --interactive    Interactive review mode (prompts for each violation).\n` +
    `  --quiet          Suppress console output (useful for tests).\n` +
    `  --help           Show this help message.\n`);
}

function getTrackedFiles() {
  const output = execSync('git ls-files', {encoding: 'utf8'});
  return output.split('\n').filter(Boolean);
}

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {encoding: 'utf8'});
  return output.split('\n').filter(Boolean);
}

function filterTargetFiles(files) {
  return files.filter((file) => {
    if (!file.endsWith('.ts')) return false;
    if (EXCLUDED_GLOBS.some((fragment) => file.endsWith(fragment))) {
      return false;
    }
    return TARGET_DIRECTORIES.some((dir) => file.startsWith(dir));
  });
}

function collectFiles(options) {
  if (options.targetFiles && options.targetFiles.length) {
    const explicit = options.targetFiles.filter((file) => existsSync(resolve(PROJECT_ROOT, file)));
    return filterTargetFiles(explicit);
  }

  const files = options.staged ? getStagedFiles() : getTrackedFiles();
  return filterTargetFiles(files);
}

function findViolationsInLine(line, patterns) {
  const trimmed = line.trim();
  if (!trimmed) return [];
  const isCommentLine =
    trimmed.startsWith('//') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('*/');
  if (isCommentLine) return [];
  if (/type\s*=\s*['\"]file['\"]/i.test(trimmed)) {
    return [];
  }

  const violations = [];
  for (const pattern of patterns) {
    const regex = new RegExp(pattern.regex);
    let match;
    while ((match = regex.exec(line)) !== null) {
      const contextWindow = line.slice(match.index, match.index + 120);
      const suggestion =
        typeof pattern.suggestionResolver === 'function'
          ? pattern.suggestionResolver(contextWindow)
          : pattern.suggestion;

      violations.push({
        tag: pattern.tag,
        column: match.index + 1,
        message: pattern.message,
        suggestion,
        snippet: line.trim(),
      });
    }
  }
  return violations;
}

function scanFile(filePath) {
  const absolutePath = resolve(PROJECT_ROOT, filePath);
  const content = readFileSync(absolutePath, 'utf8');
  const lines = content.split(/\r?\n/);

  const violations = [];
  lines.forEach((line, index) => {
    const windowStart = Math.max(0, index - 3);
    const contextWindow = lines.slice(windowStart, index).map((entry) => entry.trim());
    if (contextWindow.some((entry) => entry.includes('@df/md3/enforce-md3') || entry.includes('md3-gap'))) {
      return;
    }

    const lookAhead = lines.slice(index, index + 4).map((entry) => entry.trim()).join(' ');

    const lineViolations = findViolationsInLine(line, PATTERNS).filter((violation) => {
      if (violation.tag === 'input' && /type\s*=\s*['"]file['"]/i.test(lookAhead)) {
        return false;
      }
      if (/md3-gap/.test(lookAhead) || contextWindow.some((entry) => entry.includes('md3-gap'))) {
        return false;
      }
      return true;
    });

    lineViolations.forEach((violation) => {
      violations.push({
        file: filePath,
        line: index + 1,
        ...violation,
      });
    });
  });

  return violations;
}

function scanFiles(files) {
  let violations = [];
  files.forEach((file) => {
    violations = violations.concat(scanFile(file));
  });
  return violations;
}

function printViolations(violations) {
  if (!violations.length) {
    console.log('✅ No MD3 violations detected.');
    return;
  }

  console.log('❌ MD3 violations detected:\n');
  const grouped = violations.reduce((acc, violation) => {
    acc[violation.file] = acc[violation.file] || [];
    acc[violation.file].push(violation);
    return acc;
  }, {});

  Object.entries(grouped).forEach(([file, entries]) => {
    console.log(`${file}`);
    entries.forEach((entry) => {
      console.log(
        `  Line ${entry.line}, Col ${entry.column}: ${entry.message}\n    Suggestion: ${entry.suggestion}\n    Snippet: ${entry.snippet}`,
      );
    });
    console.log('');
  });

  console.log('See guides/STANDARDS_STYLES.md and compliant examples in packages/ui-lit/src/df-upload-link.ts.');
  console.log('Add `// eslint-disable-next-line @df/md3/enforce-md3 -- reason` above a line only if an exemption is absolutely necessary.');
}

function applySimpleFixes(files) {
  const updatedFiles = [];

  files.forEach((file) => {
    const absolutePath = resolve(PROJECT_ROOT, file);
    const original = readFileSync(absolutePath, 'utf8');
    const lines = original.split(/\r?\n/);

    let didChange = false;
    const updatedLines = lines.map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed.startsWith('*/')) {
        return line;
      }

      let newLine = line;
      const buttonPattern = PATTERNS.find((pattern) => pattern.tag === 'button');
      if (buttonPattern) {
        const replacedOpen = buttonPattern.fix ? buttonPattern.fix(newLine) : newLine;
        const replacedBoth = buttonPattern.fixClose ? buttonPattern.fixClose(replacedOpen) : replacedOpen;
        if (replacedBoth !== newLine) {
          didChange = true;
          newLine = replacedBoth;
        }
      }

      return newLine;
    });

    if (didChange) {
      writeFileSync(absolutePath, updatedLines.join('\n'));
      updatedFiles.push(file);
    }
  });

  if (updatedFiles.length) {
    console.log(`🛠️  Applied button auto-fix to ${updatedFiles.length} file(s):`);
    updatedFiles.forEach((file) => console.log(`   - ${file}`));
  } else {
    console.log('ℹ️  No simple auto-fixes were applied.');
  }

  return updatedFiles.length > 0;
}

async function runInteractive(files, violations) {
  console.log('🔍 MD3 violations detected. Entering interactive mode.');
  const rl = readline.createInterface({input, output});

  console.log(`Found ${violations.length} violation(s) across ${files.length} file(s).`);
  const answer = (await rl.question('Apply auto-fix for simple <button> replacements? [y/N]: ')).trim().toLowerCase();

  let applied = false;
  if (answer === 'y' || answer === 'yes') {
    applied = applySimpleFixes(files);
  }

  rl.close();

  if (applied) {
    const rescanned = scanFiles(files);
    return rescanned;
  }

  return violations;
}

function run() {
  const options = parseArgs(process.argv.slice(2));
  const files = collectFiles(options);

  if (!files.length) {
    if (!options.quiet) {
      console.log('No files to scan.');
    }
    process.exit(0);
  }

  let violations = scanFiles(files);

  const uniqueFiles = Array.from(new Set(violations.map((violation) => violation.file)));

  if (options.interactive && violations.length) {
    runInteractive(uniqueFiles, violations)
      .then((nextViolations) => {
        violations = nextViolations;
        if (options.json) {
          console.log(JSON.stringify({violations}, null, 2));
        } else if (!options.quiet) {
          printViolations(violations);
        }
        if (violations.length) {
          process.exit(1);
        }
        process.exit(0);
      })
      .catch((error) => {
        console.error('Interactive mode failed:', error);
        process.exit(1);
      });
    return;
  }

  if (options.json) {
    console.log(JSON.stringify({violations}, null, 2));
  } else if (!options.quiet) {
    printViolations(violations);
  }

  if (violations.length) {
    process.exit(1);
  }
}

run();
