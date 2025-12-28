/**
 * Elasticsearch document structure
 * Based on the schema defined in tools/elastic-loader/load_elastic_batch.py
 */
export interface ElasticDocument {
  path: string;
  filename: string;
  extension: string;
  size: number;
  modified: string; // ISO 8601 date string
  content: string;
}

/**
 * Status for Elasticsearch operations
 */
export type ElasticStatus = 'idle' | 'indexing' | 'searching' | 'success' | 'error';

/**
 * Search result from Elasticsearch
 */
export interface ElasticSearchResult {
  id: string;
  score: number;
  source: ElasticDocument;
}

/**
 * State for Elasticsearch store
 */
export interface ElasticState {
  status: ElasticStatus;
  lastIndexedPath: string | null;
  errorMessage: string | null;
  searchResults: ElasticSearchResult[];
  searchQuery: string;
  isMigrating: boolean;
  isSearching: boolean;
}

/**
 * Elasticsearch configuration
 */
export interface ElasticConfig {
  endpoint: string;
  index: string;
  apiKey: string;
}
