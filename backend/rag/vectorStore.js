const fs = require('fs').promises;
const path = require('path');

const VECTOR_INDEX_PATH = path.join(__dirname, 'vectors', 'index.json');

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Load vector index from disk
 */
async function loadIndex() {
  try {
    const data = await fs.readFile(VECTOR_INDEX_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Index doesn't exist yet
      return { chunks: [], metadata: { created_at: null, total_chunks: 0 } };
    }
    throw error;
  }
}

/**
 * Save vector index to disk
 */
async function saveIndex(index) {
  await fs.writeFile(
    VECTOR_INDEX_PATH,
    JSON.stringify(index, null, 2),
    'utf-8'
  );
}

/**
 * Add chunks with embeddings to the index
 * @param {Array} chunks - Array of {text, embedding, metadata}
 */
async function addChunks(chunks) {
  const index = await loadIndex();

  // Add new chunks
  for (const chunk of chunks) {
    index.chunks.push({
      id: `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: chunk.text,
      embedding: chunk.embedding,
      metadata: chunk.metadata || {}
    });
  }

  // Update metadata
  index.metadata = {
    created_at: index.metadata.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    total_chunks: index.chunks.length
  };

  await saveIndex(index);
  console.log(`Added ${chunks.length} chunks to vector store. Total: ${index.metadata.total_chunks}`);

  return index;
}

/**
 * Search for similar chunks
 * @param {Array} queryEmbedding - Query vector
 * @param {number} topK - Number of results to return
 * @param {number} threshold - Minimum similarity threshold (0-1)
 */
async function search(queryEmbedding, topK = 5, threshold = 0.5) {
  const index = await loadIndex();

  if (index.chunks.length === 0) {
    console.warn('Vector index is empty. Run indexing first.');
    return [];
  }

  // Calculate similarities
  const results = index.chunks.map(chunk => ({
    ...chunk,
    similarity: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));

  // Filter by threshold and sort by similarity
  const filtered = results
    .filter(r => r.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  console.log(`Found ${filtered.length} similar chunks (threshold: ${threshold})`);

  return filtered.map(r => ({
    text: r.text,
    similarity: r.similarity,
    metadata: r.metadata
  }));
}

/**
 * Clear the entire vector index
 */
async function clearIndex() {
  const emptyIndex = {
    chunks: [],
    metadata: {
      created_at: null,
      updated_at: null,
      total_chunks: 0
    }
  };

  await saveIndex(emptyIndex);
  console.log('Vector index cleared');
}

/**
 * Get index statistics
 */
async function getStats() {
  const index = await loadIndex();

  const stats = {
    total_chunks: index.chunks.length,
    created_at: index.metadata.created_at,
    updated_at: index.metadata.updated_at
  };

  // Calculate average embedding dimension
  if (index.chunks.length > 0) {
    stats.embedding_dimension = index.chunks[0].embedding.length;
  }

  // Count chunks by source file
  const bySource = {};
  index.chunks.forEach(chunk => {
    const source = chunk.metadata.source || 'unknown';
    bySource[source] = (bySource[source] || 0) + 1;
  });
  stats.chunks_by_source = bySource;

  return stats;
}

module.exports = {
  addChunks,
  search,
  clearIndex,
  getStats,
  loadIndex
};
