# Markdown Processing Feature Patterns

**Last Updated:** 2025-11-25
**Based on:** Token counting feature with frontmatter validation (#1124)
**Applies to:** Similar markdown processing features (analysis, formatting, validation, etc.)
**Audience:** Coding agents building markdown-related features

## Overview

This guide documents patterns for building markdown processing features that integrate with the VS Code extension and central state management. The token counting feature serves as the reference implementation.

---

## 1. Feature Architecture

### Layers
```
VS Code Editor (user edits markdown)
    ↓
Extension Host (detects changes, gets content)
    ↓
Webview UI (displays results, triggers actions)
    ↓
State Store (@df/state) (processes content, updates signals)
    ↓
Cloud Function (optional: calls Claude API)
    ↓
Results back through same path
```

### Code Organization
```
packages/
├── types/src/
│   └── markdown-*.ts          # Type definitions for feature
└── state/src/
    ├── stores/
    │   └── markdown-*.store.ts # Business logic (React/signals-first)
    └── index.ts               # Export public API

extensions/
├── df-markdown-tools-ui/src/
│   └── df-markdown-tools-app.ts  # Lit component (UI/presentation)
└── df-markdown-tools/src/
    └── extension.ts           # Extension host (orchestration)
```

---

## 2. Type Definition Pattern

### File: `packages/types/src/markdown-*.ts`

```typescript
// Define status states
export type MarkdownFeatureStatus =
  | 'idle'       // Initial state
  | 'processing' // Feature is working
  | 'ready'      // Results available
  | 'error';     // Error occurred

// Define state shape
export interface MarkdownFeatureState {
  status: MarkdownFeatureStatus;
  result?: any;           // Feature-specific result
  errorMessage?: string;  // If status === 'error'
  timestamp?: number;     // When last processed
}
```

### Key Points
- Status enum makes state explicit and testable
- `result` is feature-specific (tokens, analysis, etc.)
- Always include error message for debugging
- Consider timestamp for cache invalidation

---

## 3. State Store Pattern (Signals-First)

### File: `packages/state/src/stores/markdown-*.store.ts`

**Structure:**
```typescript
import { signal } from '@lit-labs/signals';
import type { MarkdownFeatureState } from '@df/types';

// 1. Create signals (reactive state)
const featureState = signal<MarkdownFeatureState>({
  status: 'idle',
  result: undefined,
  errorMessage: undefined
});

// 2. Business logic functions
export function processMarkdown(content: string): Promise<void> {
  featureState.value = { ...featureState.value, status: 'processing' };
  try {
    // Do the work
    const result = doWork(content);
    featureState.value = {
      status: 'ready',
      result,
      errorMessage: undefined
    };
  } catch (error) {
    featureState.value = {
      status: 'error',
      result: undefined,
      errorMessage: error.message
    };
  }
}

// 3. Getter functions
export function getFeatureState(): MarkdownFeatureState {
  return featureState.value;
}

// 4. Reset functions
export function resetFeatureState(): void {
  featureState.value = {
    status: 'idle',
    result: undefined,
    errorMessage: undefined
  };
}

// 5. Export signal for reactive components
export { featureState };
```

### Key Points
- ✅ Signals-first: Use `signal()` for reactive state
- ✅ State immutability: Create new object, don't mutate
- ✅ Async handling: Proper try/catch with status transitions
- ✅ Public API: Export getter functions, not raw signals (can expose signals for Lit reactivity)
- ✅ No component logic: Store is pure business logic, no UI concerns

---

## 4. Content Processing Pipeline

### Pattern: Extract → Validate → Process → Return

```typescript
export async function processDocumentContent(content: string): Promise<ProcessingResult> {
  // Step 1: Extract relevant content (e.g., remove frontmatter)
  const extracted = extractContentBody(content);

  // Step 2: Validate structure
  const validation = validateStructure(extracted);
  if (!validation.valid) {
    throw new Error(validation.errorMessage);
  }

  // Step 3: Process (e.g., count tokens, analyze, format)
  const result = performProcessing(validation.content);

  // Step 4: Return result
  return result;
}
```

### Example: Frontmatter Extraction

```typescript
export function extractContentBody(content: string): string {
  // Check if content starts with frontmatter
  const match = content.match(/^---[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);

  if (!match) {
    // No frontmatter, return all content
    return content;
  }

  // Return everything after closing ---
  return match[1];
}
```

### Validation Pattern

```typescript
interface ValidationResult {
  valid: boolean;
  content?: string;
  errorMessage?: string;
}

export function validateStructure(content: string): ValidationResult {
  // Check 1: Specific error condition
  if (content.startsWith('  ---')) {
    return {
      valid: false,
      errorMessage: 'Frontmatter cannot have leading whitespace. Remove spaces before the opening ---'
    };
  }

  // Check 2: Another specific condition
  const badPattern = /^---[\s\S]*?\n\n---/;
  if (badPattern.test(content)) {
    return {
      valid: false,
      errorMessage: 'Frontmatter has invalid structure (blank lines before closing ---). Remove blank lines within frontmatter'
    };
  }

  // Check 3: General validation
  const mainPattern = /^---[\s\S]*?\r?\n---\r?\n([\s\S]*)$/;
  if (content.startsWith('---') && !mainPattern.test(content)) {
    return {
      valid: false,
      errorMessage: 'Frontmatter is not properly structured. Ensure opening and closing --- are on their own lines with content between them'
    };
  }

  // Valid
  return {
    valid: true,
    content
  };
}
```

### Key Points
- ✅ Specific error messages (help user fix the problem)
- ✅ Validation before processing (fail fast)
- ✅ Clear return structure (ValidationResult pattern)
- ✅ Test each validation rule independently

---

## 5. Lit Component Pattern

### File: `extensions/df-markdown-tools-ui/src/df-markdown-tools-app.ts`

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { featureState, processContent } from '@df/state';

@customElement('df-markdown-tools-app')
export class MarkdownToolsApp extends SignalWatcher(LitElement) {
  // 1. Properties (from extension host)
  @property({ type: String }) declare fileName: string;
  @state() private currentContent = '';

  // 2. Message handler
  constructor() {
    super();
    window.addEventListener('message', event => {
      const message = event.data;
      if (message.command === 'updateContent') {
        this.fileName = message.data.fileName;
        this.currentContent = message.data.content;
      }
    });
  }

  // 3. Action handler
  private async _handleProcessContent() {
    await processContent(this.currentContent);
  }

  // 4. Render
  override render() {
    const state = featureState.get();
    const isProcessing = state.status === 'processing';
    const isError = state.status === 'error';

    return html`
      <div class="container">
        <h2>Markdown Tools</h2>

        <button
          @click=${this._handleProcessContent}
          ?disabled=${isProcessing}>
          ${isProcessing ? '⏳ Processing...' : 'Process Content'}
        </button>

        ${state.status === 'ready' ? html`
          <p class="result">Result: ${state.result}</p>
        ` : ''}

        ${isError ? html`
          <p class="error">❌ ${state.errorMessage}</p>
        ` : ''}
      </div>
    `;
  }

  static styles = css`
    /* Component styles */
  `;
}
```

### Key Points
- ✅ Extends `SignalWatcher(LitElement)` for signal reactivity
- ✅ Message handler in constructor (runs once)
- ✅ Action handlers (prefix with `_` to indicate private)
- ✅ Get state on render, not in constructor (always fresh)
- ✅ Conditional rendering based on status
- ✅ Button disabled during processing

---

## 6. Extension Host Integration

### File: `extensions/df-markdown-tools/src/extension.ts`

**Pattern for new features:**
```typescript
// Listen for document changes
context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(_event => {
        if (_event.document.uri.scheme !== 'file') return;

        // Send updated content to webview for feature to process
        if (currentPanel && currentPanel.visible) {
            updateWebviewContext(currentPanel);
        }
    })
);

// Send content to webview
function updateWebviewContext(panel: vscode.WebviewPanel) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const fileName = path.basename(editor.document.fileName);
    const content = editor.document.getText();

    // Send FULL content - state store will extract what it needs
    panel.webview.postMessage({
        command: 'updateContent',
        data: { fileName, content }
    });
}
```

### Key Points
- ✅ Send FULL content to webview (not processed)
- ✅ Let state store handle extraction and validation
- ✅ Filter by URI scheme to avoid infinite loops
- ✅ Register listeners at activation, not in commands

---

## 7. Testing Pattern

### File: `packages/state/test-feature.js`

```javascript
// Node.js test file (no build required, can run directly)

const {
  processContent,
  extractContentBody,
  validateStructure
} = require('./src/stores/markdown-feature.store.ts');

function testExtraction() {
  console.log('Testing extraction...');

  const testCases = [
    {
      name: 'With frontmatter',
      input: '---\ntitle: Test\n---\nBody content',
      expected: 'Body content'
    },
    {
      name: 'Without frontmatter',
      input: 'Just body',
      expected: 'Just body'
    }
  ];

  testCases.forEach(test => {
    const result = extractContentBody(test.input);
    const pass = result === test.expected;
    console.log(`  ${pass ? '✓' : '✗'} ${test.name}`);
    if (!pass) {
      console.log(`    Expected: ${test.expected}`);
      console.log(`    Got: ${result}`);
    }
  });
}

function testValidation() {
  console.log('Testing validation...');

  const validCases = [
    '---\ntitle: Test\n---\nBody',
    'No frontmatter here'
  ];

  validCases.forEach(content => {
    const result = validateStructure(content);
    console.log(`  ${result.valid ? '✓' : '✗'} Valid: ${content.substring(0, 20)}...`);
  });

  const invalidCases = [
    '  ---\ntitle: Test\n---\nBody' // Leading spaces
  ];

  invalidCases.forEach(content => {
    const result = validateStructure(content);
    console.log(`  ${!result.valid ? '✓' : '✗'} Invalid: ${content.substring(0, 20)}...`);
  });
}

testExtraction();
testValidation();
```

### Key Points
- ✅ Test business logic in isolation
- ✅ Use Node.js test files (no build cycle)
- ✅ Test both valid and invalid cases
- ✅ Clear test names describe what's being tested

---

## 8. Error Handling Strategy

### Validation-Level Errors
```typescript
// User's input is wrong
throw new Error('Frontmatter is not properly formatted. Please ensure...');
```

### Processing-Level Errors
```typescript
// Something went wrong in the algorithm
throw new Error('Failed to count tokens: content too large');
```

### API-Level Errors
```typescript
// External service failed
if (!apiResponse.ok) {
  throw new Error(`API error: ${apiResponse.status}`);
}
```

### User Feedback Flow
```
Error thrown in state store
  ↓
Caught in try/catch
  ↓
Set state.status = 'error'
  ↓
Set state.errorMessage = error.message
  ↓
Component reads state and renders error UI
  ↓
User sees clear message explaining what went wrong
```

---

## 9. Performance Considerations

### Debouncing Updates
Don't process on every keystroke:
```typescript
// Bad: processes constantly
vscode.workspace.onDidChangeTextDocument(() => {
  processContent(content); // Spam!
});

// Good: process only on save
vscode.workspace.onDidSaveTextDocument(() => {
  processContent(content); // Only when user saves
});
```

### Content Size Checks
```typescript
if (content.length > 1000000) {
  throw new Error('Content too large (>1MB). Please split into smaller files.');
}
```

### Caching Results
```typescript
// Store timestamp when processing
featureState.value = {
  status: 'ready',
  result,
  timestamp: Date.now()
};

// Skip reprocessing if content unchanged
if (lastProcessed.content === currentContent && !isStale) {
  return featureState.value.result;
}
```

---

## 10. Common Patterns by Feature Type

### Token Counting
```typescript
// Extract body → validate structure → count tokens
// Events: onDidSaveTextDocument (not on every keystroke)
// Result: Single number
// Error: Invalid frontmatter
```

### Content Formatting
```typescript
// Extract body → validate structure → apply rules → return formatted
// Events: onSaveTextDocument (batch format)
// Result: Formatted markdown string
// Error: Invalid syntax
```

### Content Analysis
```typescript
// Extract body → validate structure → analyze → return metrics
// Events: onDidSaveTextDocument
// Result: Object with analysis results
// Error: Content type mismatch
```

### Real-Time Preview
```typescript
// Full content → convert/preview → render in panel
// Events: onDidChangeTextDocument (debounced)
// Result: HTML for preview
// Error: Render failure
```

---

## 11. Checklist for New Markdown Features

- [ ] Created `packages/types/src/markdown-*.ts` with types
- [ ] Created `packages/state/src/stores/markdown-*.store.ts` with signals
- [ ] Added getter and reset functions to state store
- [ ] Exported from `packages/state/src/index.ts`
- [ ] Created UI component or extended existing one
- [ ] Component subscribes to signal for reactivity
- [ ] Component sends messages to extension when needed
- [ ] Extension sends full content to webview
- [ ] State store validates before processing
- [ ] State store provides specific error messages
- [ ] Created test file with valid/invalid cases
- [ ] All tests pass locally
- [ ] Build succeeds: `pnpm build`
- [ ] Tested in VS Code with real content
- [ ] Verified logs show correct state transitions
- [ ] Tested error handling with invalid content

---

## 12. Example: Adding a New Feature

### Step 1: Define Types
```typescript
// packages/types/src/markdown-analysis.ts
export type AnalysisStatus = 'idle' | 'analyzing' | 'ready' | 'error';

export interface AnalysisResult {
  paragraphs: number;
  sentences: number;
  words: number;
  readingTime: number;
}

export interface AnalysisState {
  status: AnalysisStatus;
  result?: AnalysisResult;
  errorMessage?: string;
}
```

### Step 2: Create State Store
```typescript
// packages/state/src/stores/markdown-analysis.store.ts
import { signal } from '@lit-labs/signals';
import type { AnalysisState } from '@df/types';

const analysisState = signal<AnalysisState>({ status: 'idle' });

export async function analyzeContent(content: string) {
  analysisState.value = { status: 'analyzing' };
  try {
    const body = extractContentBody(content);
    const result = performAnalysis(body);
    analysisState.value = { status: 'ready', result };
  } catch (error) {
    analysisState.value = {
      status: 'error',
      errorMessage: error.message
    };
  }
}
```

### Step 3: Add UI Component Logic
```typescript
// In df-markdown-tools-app.ts
import { analysisState, analyzeContent } from '@df/state';

private async _handleAnalyze() {
  await analyzeContent(this.currentContent);
}

// In render
const analysis = analysisState.get();
if (analysis.status === 'ready') {
  return html`
    <div>
      <p>Paragraphs: ${analysis.result?.paragraphs}</p>
      <p>Words: ${analysis.result?.words}</p>
    </div>
  `;
}
```

---

## Summary

Building markdown processing features:

1. ✅ Define types clearly (status + result)
2. ✅ Use signals-first state management
3. ✅ Follow extract → validate → process pattern
4. ✅ Provide specific error messages
5. ✅ Test business logic independently
6. ✅ Send full content from extension, let store process it
7. ✅ Use component reactivity (SignalWatcher) for UI updates
8. ✅ Debounce expensive operations
9. ✅ Document patterns as you discover variations
10. ✅ Test with real VS Code workflows, not just unit tests

These patterns are reusable across different markdown processing features and accelerate development significantly.
