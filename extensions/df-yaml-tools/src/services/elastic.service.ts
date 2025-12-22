import * as path from 'path';
import * as crypto from 'crypto';

/**
 * Elasticsearch configuration options
 */
export interface ElasticIndexOptions {
    endpoint?: string;
    index?: string;
}

/**
 * Elasticsearch document structure
 */
export interface ElasticDocument {
    path: string;
    filename: string;
    extension: string;
    size: number;
    modified: string;
    content: string;
}

/**
 * Result of indexing operation
 */
export interface IndexResult {
    success: boolean;
    docId: string;
    response?: unknown;
    error?: string;
}

/**
 * Verify that a document exists in Elasticsearch
 *
 * @param docId - The document ID to verify
 * @param apiKey - Elasticsearch API key
 * @param options - Optional endpoint and index configuration
 * @returns Promise<boolean> - true if document exists
 */
export async function verifyDocument(
    docId: string,
    apiKey: string,
    options: ElasticIndexOptions = {}
): Promise<boolean> {
    const endpoint = options.endpoint || process.env.ELASTIC_ENDPOINT || 'http://localhost:9200';
    const index = options.index || process.env.ELASTIC_INDEX || 'daily-batch';

    try {
        const url = `${endpoint}/${index}/_doc/${docId}`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `ApiKey ${apiKey}`,
            },
        });

        // Document exists if we get 200 OK
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Index a document to Elasticsearch
 *
 * @param filePath - The file path (used for document ID and metadata)
 * @param content - The file content
 * @param apiKey - Elasticsearch API key
 * @param options - Optional endpoint and index configuration
 * @returns Promise<IndexResult>
 *
 * @example
 * ```typescript
 * const result = await indexDocument(
 *   '/path/to/file.yaml',
 *   'file content',
 *   'your-api-key',
 *   { endpoint: 'http://localhost:9200', index: 'daily-batch' }
 * );
 * ```
 */
export async function indexDocument(
    filePath: string,
    content: string,
    apiKey: string,
    options: ElasticIndexOptions = {}
): Promise<IndexResult> {
    const endpoint = options.endpoint || process.env.ELASTIC_ENDPOINT || 'http://localhost:9200';
    const index = options.index || process.env.ELASTIC_INDEX || 'daily-batch';

    try {
        // Extract filename and extension
        const fileName = path.basename(filePath);
        const extensionMatch = fileName.match(/\.([^.]+)$/);
        const extension = extensionMatch ? extensionMatch[1] : '';

        // Generate document ID using SHA-1 hash (matching Python implementation)
        const docId = crypto.createHash('sha1').update(filePath).digest('hex');

        // Construct the document
        const doc: ElasticDocument = {
            path: filePath,
            filename: fileName,
            extension: extension,
            size: content.length,
            modified: new Date().toISOString(),
            content: content
        };

        // Make the PUT request to Elasticsearch
        const url = `${endpoint}/${index}/_doc/${docId}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `ApiKey ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(doc)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            return {
                success: false,
                docId,
                error: `Elasticsearch indexing failed (${response.status}): ${errorBody}`
            };
        }

        const result = await response.json();
        return {
            success: true,
            docId,
            response: result
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
            success: false,
            docId: '',
            error: errorMessage
        };
    }
}
