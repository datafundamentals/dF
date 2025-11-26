/**
 * Markdown Token Counting Store
 * Manages token counting state for markdown documents
 * Used by VS Code markdown tools extension
 */

import { signal, computed } from '@lit-labs/signals';
import type { MarkdownTokensState, MarkdownTokensStatus } from '@df/types';

/**
 * Individual signals for token counting state
 */
const tokenCountSignal = signal<number>(0);
const documentContentSignal = signal<string>('');
const statusSignal = signal<MarkdownTokensStatus>('idle');
const lastUpdatedSignal = signal<number | null>(null);
const errorSignal = signal<string | null>(null);

/**
 * Computed state - single source of truth for token counting UI
 */
export const markdownTokensState = computed<MarkdownTokensState>(() => ({
  tokenCount: tokenCountSignal.get(),
  documentContent: documentContentSignal.get(),
  status: statusSignal.get(),
  lastUpdated: lastUpdatedSignal.get(),
  errorMessage: errorSignal.get(),
}));

/**
 * Validates frontmatter structure
 * Returns validation result with details about any issues
 */
function validateFrontmatter(markdownText: string): { valid: boolean; error?: string } {
  // Check if there's any attempt at frontmatter (starts with optional spaces then ---)
  const hasFrontmatterAttempt = /^\s*---/.test(markdownText);

  if (!hasFrontmatterAttempt) {
    // No frontmatter attempt - entire file is content
    return { valid: true };
  }

  // Check for improperly indented opening delimiter (before other checks)
  if (markdownText.match(/^\s+---/)) {
    return {
      valid: false,
      error: 'Frontmatter cannot have leading whitespace. Remove spaces before the opening ---'
    };
  }

  // Check for empty line before closing delimiter (before main regex check)
  // This is a common mistake that should be caught early
  if (markdownText.match(/\n\n---\s*[\r\n]/)) {
    return {
      valid: false,
      error: 'Frontmatter has invalid structure (blank lines before closing ---). Remove blank lines within frontmatter'
    };
  }

  // If there's a frontmatter attempt, it must be properly structured
  // Proper structure: --- at start, content, --- on own line, then body
  const validFrontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/;

  if (!validFrontmatterRegex.test(markdownText)) {
    // Generic error for other cases
    return {
      valid: false,
      error: 'Frontmatter is not properly structured. Ensure opening and closing --- are on their own lines with content between them'
    };
  }

  return { valid: true };
}

/**
 * Extract frontmatter from markdown text
 * Returns the content without frontmatter, or null if frontmatter is invalid
 *
 * Matches YAML frontmatter delimited by --- at start and end.
 * Handles both Unix (\n) and Windows (\r\n) line endings.
 */
function extractContentWithoutFrontmatter(markdownText: string): string | null {
  if (!markdownText || typeof markdownText !== 'string') {
    return '';
  }

  // First validate frontmatter structure
  const validation = validateFrontmatter(markdownText);
  if (!validation.valid) {
    // Return null to signal invalid frontmatter
    return null;
  }

  // No frontmatter found - return entire content as-is
  if (!markdownText.startsWith('---')) {
    return markdownText;
  }

  // Match valid YAML frontmatter between --- delimiters
  const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+([\s\S]*)$/;
  const match = markdownText.match(frontmatterRegex);

  if (!match) {
    // Should not reach here due to validation, but handle gracefully
    return null;
  }

  // Return only the content part (after frontmatter)
  return match[2];
}

/**
 * Count tokens in content
 * Simple approximation: split by whitespace and punctuation, filter empty strings
 */
function countTokens(content: string): number {
  if (!content || typeof content !== 'string') {
    return 0;
  }

  // Simple token counting approximation
  // Split on whitespace and common punctuation, filter empty strings
  const tokens = content
    .split(/[\s\n\r\t.,!?;:(){}[\]"'`~@#$%^&*+=|\\<>/]+/)
    .filter(token => token.length > 0);

  return tokens.length;
}

/**
 * Count tokens in markdown document, excluding frontmatter
 * @param markdownText - Raw markdown content including frontmatter
 * @returns Token count, or throws error if frontmatter is invalid
 */
export function countDocumentTokens(markdownText: string): number {
  const content = extractContentWithoutFrontmatter(markdownText);

  // If content is null, extraction failed due to invalid frontmatter
  if (content === null) {
    const validation = validateFrontmatter(markdownText);
    throw new Error(validation.error || 'Invalid frontmatter structure');
  }

  return countTokens(content);
}

/**
 * Update token count from markdown content
 * Called by the UI when new document content is provided
 */
export async function updateTokenCount(markdownContent: string): Promise<void> {
  try {
    statusSignal.set('counting');
    errorSignal.set(null);

    // Store the raw content
    documentContentSignal.set(markdownContent);

    // Count tokens excluding frontmatter
    const count = countDocumentTokens(markdownContent);
    tokenCountSignal.set(count);

    statusSignal.set('ready');
    lastUpdatedSignal.set(Date.now());
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    statusSignal.set('error');
    errorSignal.set(errorMessage);
    tokenCountSignal.set(0);
  }
}

/**
 * Reset token counting state to initial values
 */
export function resetMarkdownTokens(): void {
  tokenCountSignal.set(0);
  documentContentSignal.set('');
  statusSignal.set('idle');
  lastUpdatedSignal.set(null);
  errorSignal.set(null);
}
