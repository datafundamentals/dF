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
export type ElasticStatus = 'idle' | 'indexing' | 'success' | 'error';

/**
 * State for Elasticsearch store
 */
export interface ElasticState {
  status: ElasticStatus;
  lastIndexedPath: string | null;
  errorMessage: string | null;
}

/**
 * Elasticsearch configuration
 */
export interface ElasticConfig {
  endpoint: string;
  index: string;
  apiKey: string;
}
