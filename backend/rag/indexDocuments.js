const { loadAllDocuments, processDocuments } = require('./ragService');
const { generateEmbedding } = require('./embeddings');
const { addChunks, clearIndex, getStats } = require('./vectorStore');

/**
 * Index all documents in the RAG system
 * This script loads all markdown files, chunks them, generates embeddings,
 * and stores them in the vector database
 */
async function indexDocuments() {
  console.log('=== Starting Document Indexing ===\n');

  try {
    // Step 1: Load all documents
    console.log('Step 1: Loading documents...');
    const documents = await loadAllDocuments();
    console.log(`Loaded ${documents.length} documents\n`);

    if (documents.length === 0) {
      console.log('No documents found to index. Add .md files to rag/documents/');
      return;
    }

    // Step 2: Process documents into chunks
    console.log('Step 2: Chunking documents...');
    const chunks = processDocuments(documents, 1000, 200);
    console.log(`Created ${chunks.length} chunks\n`);

    // Step 3: Generate embeddings for each chunk
    console.log('Step 3: Generating embeddings...');
    console.log('This may take a few minutes depending on the number of chunks and endpoint speed.\n');

    const chunksWithEmbeddings = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      try {
        // Progress indicator
        if ((i + 1) % 10 === 0 || i === 0) {
          console.log(`Processing chunk ${i + 1}/${chunks.length}...`);
        }

        // Generate embedding
        const embedding = await generateEmbedding(chunk.text);

        chunksWithEmbeddings.push({
          text: chunk.text,
          embedding: embedding,
          metadata: chunk.metadata
        });

        successCount++;
      } catch (error) {
        console.error(`Failed to embed chunk ${i + 1}: ${error.message}`);
        failCount++;
      }
    }

    console.log(`\nEmbedding complete: ${successCount} success, ${failCount} failed\n`);

    if (chunksWithEmbeddings.length === 0) {
      console.error('No chunks were successfully embedded. Check Ollama connection.');
      return;
    }

    // Step 4: Clear existing index and save new chunks
    console.log('Step 4: Saving to vector store...');
    await clearIndex();
    await addChunks(chunksWithEmbeddings);

    // Step 5: Display statistics
    console.log('\nStep 5: Indexing complete!\n');
    const stats = await getStats();

    console.log('=== Index Statistics ===');
    console.log(`Total chunks: ${stats.total_chunks}`);
    console.log(`Embedding dimension: ${stats.embedding_dimension}`);
    console.log(`Created at: ${stats.created_at}`);
    console.log(`Updated at: ${stats.updated_at}`);
    console.log('\nChunks by source:');
    Object.entries(stats.chunks_by_source).forEach(([source, count]) => {
      console.log(`  - ${source}: ${count} chunks`);
    });

    console.log('\n=== Indexing Complete ===');
    console.log('RAG system is ready to use!');

  } catch (error) {
    console.error('Error during indexing:', error);
    process.exit(1);
  }
}

// Run indexing if executed directly
if (require.main === module) {
  indexDocuments()
    .then(() => {
      console.log('\nDone!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Indexing failed:', error);
      process.exit(1);
    });
}

module.exports = { indexDocuments };
