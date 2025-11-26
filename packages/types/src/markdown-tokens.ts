/**
 * Markdown token counting types
 * Used by VS Code markdown tools extension to track document token counts
 */

export type MarkdownTokensStatus = 'idle' | 'counting' | 'ready' | 'error';

export interface MarkdownTokensState {
  tokenCount: number;
  documentContent: string;
  status: MarkdownTokensStatus;
  lastUpdated: number | null;
  errorMessage: string | null;
}
