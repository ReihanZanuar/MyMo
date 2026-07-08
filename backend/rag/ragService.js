const fs = require('fs').promises;
const path = require('path');
const { generateEmbedding } = require('./embeddings');
const { search } = require('./vectorStore');

const DOCUMENTS_PATH = path.join(__dirname, 'documents');

/**
 * Split text into chunks with overlap
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Max characters per chunk
 * @param {number} overlap - Overlap between chunks
 */
function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end);

    // Only add non-empty chunks
    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }

    // Move start position with overlap
    start = end - overlap;

    // Prevent infinite loop on last chunk
    if (start >= text.length - overlap) {
      break;
    }
  }

  return chunks;
}

/**
 * Load and parse a markdown document
 * @param {string} filePath - Path to markdown file
 */
async function loadDocument(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const filename = path.basename(filePath);

  return {
    filename,
    content,
    metadata: {
      source: filename,
      path: filePath,
      size: content.length
    }
  };
}

/**
 * Load all documents from the documents directory
 */
async function loadAllDocuments() {
  const files = await fs.readdir(DOCUMENTS_PATH);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  const documents = [];
  for (const file of mdFiles) {
    const filePath = path.join(DOCUMENTS_PATH, file);
    const doc = await loadDocument(filePath);
    documents.push(doc);
  }

  console.log(`Loaded ${documents.length} documents`);
  return documents;
}

/**
 * Process documents into chunks with metadata
 * @param {Array} documents - Array of document objects
 */
function processDocuments(documents, chunkSize = 1000, overlap = 200) {
  const allChunks = [];

  for (const doc of documents) {
    const chunks = chunkText(doc.content, chunkSize, overlap);

    chunks.forEach((chunk, index) => {
      allChunks.push({
        text: chunk,
        metadata: {
          source: doc.metadata.source,
          chunkIndex: index,
          totalChunks: chunks.length
        }
      });
    });
  }

  console.log(`Created ${allChunks.length} chunks from ${documents.length} documents`);
  return allChunks;
}

/**
 * Retrieve relevant context for a query
 * @param {string} query - User query
 * @param {number} topK - Number of chunks to retrieve
 * @param {number} threshold - Minimum similarity threshold
 */
async function retrieveContext(query, topK = 5, threshold = 0.5) {
  try {
    // Generate embedding for query
    console.log('Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);

    // Search vector store
    console.log('Searching vector store...');
    const results = await search(queryEmbedding, topK, threshold);

    console.log(`Retrieved ${results.length} relevant chunks`);
    return results;
  } catch (error) {
    console.error('Error retrieving context:', error);
    throw error;
  }
}

/**
 * Format retrieved chunks into context string for LLM
 * @param {Array} chunks - Retrieved chunks from vector search
 */
function formatContext(chunks) {
  if (chunks.length === 0) {
    return null;
  }

  let context = '=== RELEVANT DOCUMENTATION ===\n\n';

  chunks.forEach((chunk, index) => {
    context += `[Source: ${chunk.metadata.source}]\n`;
    context += `${chunk.text}\n\n`;

    if (index < chunks.length - 1) {
      context += '---\n\n';
    }
  });

  context += '=== END DOCUMENTATION ===\n';

  return context;
}

/**
 * Get answer using RAG
 * @param {string} query - User query
 * @param {Object} options - Options for retrieval
 */
async function getRAGContext(query, options = {}) {
  const {
    topK = 5,
    threshold = 0.5,
    includeMetadata = false
  } = options;

  try {
    // Retrieve relevant chunks
    const chunks = await retrieveContext(query, topK, threshold);

    if (chunks.length === 0) {
      console.log('No relevant context found');
      return null;
    }

    // Format context
    const context = formatContext(chunks);

    if (includeMetadata) {
      return {
        context,
        chunks,
        sources: [...new Set(chunks.map(c => c.metadata.source))]
      };
    }

    return context;
  } catch (error) {
    console.error('Error getting RAG context:', error);
    return null;
  }
}

module.exports = {
  chunkText,
  loadDocument,
  loadAllDocuments,
  processDocuments,
  retrieveContext,
  formatContext,
  getRAGContext
};
