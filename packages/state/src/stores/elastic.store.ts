import {computed, signal} from '@lit-labs/signals';
import type {ElasticDocument, ElasticState, ElasticStatus, ElasticConfig, ElasticSearchResult} from '@df/types';

// Internal signals for tracking state
const statusSignal = signal<ElasticStatus>('idle');
const lastIndexedPathSignal = signal<string | null>(null);
const errorSignal = signal<string | null>(null);
const searchQuerySignal = signal<string>('');
const searchResultsSignal = signal<ElasticSearchResult[]>([]);

/**
 * Computed state that combines all elastic signals
 */
export const elasticState = computed<ElasticState>(() => ({
  status: statusSignal.get(),
  lastIndexedPath: lastIndexedPathSignal.get(),
  errorMessage: errorSignal.get(),
  searchQuery: searchQuerySignal.get(),
  searchResults: searchResultsSignal.get(),
  isMigrating: statusSignal.get() === 'indexing',
  isSearching: statusSignal.get() === 'searching',
}));

/**
 * Default Elasticsearch configuration
 * Can be overridden by passing config to indexDocument
 */
const DEFAULT_CONFIG: ElasticConfig = {
  endpoint: 'http://localhost:9200',
  index: 'daily-batch',
  apiKey: '', // Should be provided via config parameter
};

/**
 * Extract filename and extension from a file path
 */
function parseFilePath(filePath: string): {filename: string; extension: string} {
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1] || '';
  const extensionMatch = filename.match(/\.([^.]+)$/);
  const extension = extensionMatch ? extensionMatch[1] : '';

  return {filename, extension};
}

/**
 * Generate a document ID from the file path (matching Python implementation)
 * Uses SHA-1 hash for consistency with load_elastic_batch.py
 */
async function generateDocumentId(filePath: string): Promise<string> {
  // Simple hash using Web Crypto API (browser-compatible)
  const encoder = new TextEncoder();
  const data = encoder.encode(filePath);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Index a document to Elasticsearch
 *
 * @param path - The file path (relative or absolute)
 * @param content - The file content as a string
 * @param config - Optional Elasticsearch configuration (endpoint, index, apiKey)
 *
 * @example
 * ```typescript
 * await indexDocument(
 *   'daily/batch/my-file.yaml',
 *   'file content here',
 *   { apiKey: 'my-api-key' }
 * );
 * ```
 */
export async function indexDocument(
  path: string,
  content: string,
  config?: Partial<ElasticConfig>
): Promise<void> {
  const finalConfig: ElasticConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Validate required config
  if (!finalConfig.apiKey) {
    const error = 'Elasticsearch API key is required';
    statusSignal.set('error');
    errorSignal.set(error);
    throw new Error(error);
  }

  // Update state to indexing
  statusSignal.set('indexing');
  errorSignal.set(null);

  try {
    const {filename, extension} = parseFilePath(path);
    const docId = await generateDocumentId(path);

    // Construct the document matching the Elasticsearch schema
    const doc: Omit<ElasticDocument, 'id'> = {
      path,
      filename,
      extension,
      size: content.length,
      modified: new Date().toISOString(),
      content,
    };

    // POST to Elasticsearch using the index API
    const url = `${finalConfig.endpoint}/${finalConfig.index}/_doc/${docId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `ApiKey ${finalConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doc),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Elasticsearch indexing failed (${response.status}): ${errorBody}`);
    }

    // Success
    statusSignal.set('success');
    lastIndexedPathSignal.set(path);

  } catch (error) {
    statusSignal.set('error');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    errorSignal.set(errorMessage);
    throw error;
  }
}

/**
 * Update search state manually (used when search is performed externally, e.g. by VS Code extension host)
 */
export function updateSearchState(
  status: ElasticStatus,
  results: ElasticSearchResult[] = [],
  error: string | null = null
): void {
  statusSignal.set(status);
  searchResultsSignal.set(results);
  errorSignal.set(error);
}

/**
 * Update migration status manually
 */
export function setMigrationStatus(status: ElasticStatus, error: string | null = null): void {
  statusSignal.set(status);
  errorSignal.set(error);
}

/**
 * Set the search query
 */
export function setSearchQuery(query: string): void {
  searchQuerySignal.set(query);
}

/**
 * Search for documents in Elasticsearch
 *
 * @param query - The search query string
 * @param config - Optional Elasticsearch configuration
 */
export async function performSearch(
  query: string,
  config?: Partial<ElasticConfig>
): Promise<void> {
  const finalConfig: ElasticConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Validate required config
  if (!finalConfig.apiKey) {
    const error = 'Elasticsearch API key is required';
    statusSignal.set('error');
    errorSignal.set(error);
    throw new Error(error);
  }

  searchQuerySignal.set(query);
  statusSignal.set('searching');
  errorSignal.set(null);
  searchResultsSignal.set([]);

  try {
    const url = `${finalConfig.endpoint}/${finalConfig.index}/_search`;
    const searchBody = {
      query: {
        multi_match: {
          query: query,
          fields: ['content', 'filename', 'path'],
          fuzziness: 'AUTO'
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `ApiKey ${finalConfig.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Elasticsearch search failed (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hits = data.hits.hits.map((hit: any) => ({
      id: hit._id,
      score: hit._score,
      source: hit._source as ElasticDocument
    }));

    searchResultsSignal.set(hits);
    statusSignal.set('success');

  } catch (error) {
    statusSignal.set('error');
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    errorSignal.set(errorMessage);
    throw error;
  }
}

/**
 * Reset the elastic store state to initial values
 */
export function resetElasticState(): void {
  statusSignal.set('idle');
  lastIndexedPathSignal.set(null);
  errorSignal.set(null);
  searchQuerySignal.set('');
  searchResultsSignal.set([]);
}
