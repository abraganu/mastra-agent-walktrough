/**
 * Minimal RAG pipeline: chunk → embed (local, no API) → store → query.
 * Run with: pnpm rag:example
 *
 * Embeddings are generated on your machine with @mastra/fastembed (no key,
 * no quota). The first run downloads the embedding model (~30 MB). To use
 * NaN's embedding API instead, swap `fastembed` for
 * `new ModelRouterEmbeddingModel('openai/qwen3-embedding')` from
 * '@mastra/core/llm' (4096-dim vectors).
 */
import { embedMany } from 'ai';
import { MDocument } from '@mastra/rag';
import { LibSQLVector } from '@mastra/libsql';
import { fastembed } from '@mastra/fastembed';

const INDEX_NAME = 'playground_docs';

const sampleDoc = `
Mastra is a TypeScript framework for building AI agents. It gives you agents,
tools, workflows, memory, RAG, and evals out of the box, all registered in a
single Mastra instance that also serves a local dev studio.

Agents are LLMs with instructions that can call tools. Tools are typed
functions created with createTool(), described by zod schemas, and executed
server-side when the model decides to call them.

Workflows are graph-based multi-step processes with explicit control flow:
then() for sequences, branch() for conditionals, parallel() for fan-out, and
suspend()/resume() for human-in-the-loop approval.

Memory persists conversation history, working memory, and semantic recall.
Storage adapters like LibSQL (a local SQLite-compatible database) keep all of
this durable across restarts.
`;

async function main() {
  // 1. Chunk the document
  const doc = MDocument.fromText(sampleDoc.trim());
  const chunks = await doc.chunk({ strategy: 'recursive', maxSize: 256, overlap: 30 });
  console.log(`Chunked into ${chunks.length} pieces`);

  // 2. Embed locally with fastembed
  const { embeddings } = await embedMany({
    model: fastembed,
    values: chunks.map((chunk) => chunk.text),
  });
  console.log(`Embedded ${embeddings.length} chunks (${embeddings[0].length} dims each)`);

  // 3. Store in a local vector database (separate from the agent's storage db)
  const vectorStore = new LibSQLVector({ id: 'playground-vector', url: 'file:./rag-demo.db' });
  if (!(await vectorStore.listIndexes()).includes(INDEX_NAME)) {
    await vectorStore.createIndex({ indexName: INDEX_NAME, dimension: embeddings[0].length });
  }
  await vectorStore.upsert({
    indexName: INDEX_NAME,
    vectors: embeddings,
    metadata: chunks.map((chunk, i) => ({ text: chunk.text, chunkIndex: i })),
  });

  // 4. Query by meaning
  const question = 'How do agents call tools?';
  const { embeddings: [queryVector] } = await embedMany({ model: fastembed, values: [question] });
  const results = await vectorStore.query({ indexName: INDEX_NAME, queryVector, topK: 3 });

  console.log(`\nQuery: "${question}"\nTop matches:`);
  for (const result of results) {
    console.log(`  score=${result.score.toFixed(3)} → ${result.metadata?.text ?? '(no metadata)'}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
