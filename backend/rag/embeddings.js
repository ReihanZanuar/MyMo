const axios = require('axios');

// Ollama endpoints - sama dengan chat endpoints
const OLLAMA_ENDPOINTS = [
  'http://10.99.99.116:11434',
  'http://tkjskanesa.my.id:8085',
  'http://100.78.7.86:11434'
];

// Embedding model
const EMBEDDING_MODEL = 'nomic-embed-text:latest';

// Cache working endpoint
let cachedEmbeddingEndpoint = null;

/**
 * Generate embeddings for text using Ollama
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
async function generateEmbedding(text) {
  // Try cached endpoint first
  if (cachedEmbeddingEndpoint) {
    try {
      console.log(`Using cached embedding endpoint: ${cachedEmbeddingEndpoint}`);
      const embedding = await tryEmbedding(cachedEmbeddingEndpoint, text);
      return embedding;
    } catch (error) {
      console.error(`Cached embedding endpoint failed: ${error.message}`);
      cachedEmbeddingEndpoint = null;
    }
  }

  // Try all endpoints
  let lastError = null;
  for (const endpoint of OLLAMA_ENDPOINTS) {
    try {
      console.log(`Trying embedding endpoint: ${endpoint}`);
      const embedding = await tryEmbedding(endpoint, text);

      // Cache successful endpoint
      cachedEmbeddingEndpoint = endpoint;
      console.log(`Cached embedding endpoint: ${endpoint}`);

      return embedding;
    } catch (error) {
      console.error(`Embedding failed at ${endpoint}: ${error.message}`);
      lastError = error;
    }
  }

  throw new Error(`All embedding endpoints failed: ${lastError?.message}`);
}

/**
 * Try to generate embedding from a specific endpoint
 */
async function tryEmbedding(endpoint, text) {
  const response = await axios.post(
    `${endpoint}/api/embeddings`,
    {
      model: EMBEDDING_MODEL,
      prompt: text
    },
    {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.data.embedding) {
    throw new Error('No embedding in response');
  }

  return response.data.embedding;
}

/**
 * Check if embedding model is available on endpoints
 */
async function checkEmbeddingModel() {
  const statuses = [];

  for (const endpoint of OLLAMA_ENDPOINTS) {
    try {
      const response = await axios.get(`${endpoint}/api/tags`, { timeout: 5000 });
      const models = response.data.models || [];
      const hasModel = models.some(m => m.name.includes('nomic-embed-text'));

      statuses.push({
        endpoint,
        status: 'connected',
        hasEmbeddingModel: hasModel
      });
    } catch (error) {
      statuses.push({
        endpoint,
        status: 'disconnected',
        error: error.message
      });
    }
  }

  return statuses;
}

/**
 * Clear cached endpoint
 */
function clearCache() {
  cachedEmbeddingEndpoint = null;
  console.log('Embedding endpoint cache cleared');
}

module.exports = {
  generateEmbedding,
  checkEmbeddingModel,
  clearCache
};
