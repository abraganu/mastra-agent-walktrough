import { createHash } from 'node:crypto';
import { MDocument } from '@mastra/rag';
import { embedMany } from 'ai';
import { models } from '../../shared/models';
import { vector } from '../../shared/vector';
import { handbook } from './handbook';

// Lesson 07 subject: RAG — chunk, embed, store, retrieve, in that order.
// Guide: docs/learn/07-rag/README.md
// Docs: https://mastra.ai/reference/rag/chunking-and-embedding
//
// Ingestion is offline and idempotent: it runs once, and every query after it
// is a lookup. That split matters — embedding the corpus is the expensive part
// of RAG, and it never happens on the request path.

/**
 * One index per lesson, so lesson 07 can be rebuilt without touching anyone
 * else's vectors.
 *
 * Underscores, not hyphens: the store turns this into a SQL identifier, and
 * `l07-handbook` is rejected. The rule is letters, numbers, and underscores,
 * starting with a letter, up to 63 characters. It is the first failure you hit
 * and the least interesting one.
 */
export const HANDBOOK_INDEX = 'l07_handbook';

// Chunk size is a decision, not a default: it is the largest amount of text a
// retrieved result can carry, and the smallest unit a citation can point at.
// Lesson exercise 2 changes both numbers and measures the effect.
export const CHUNK_MAX_SIZE = 400;
export const CHUNK_OVERLAP = 60;
export const HANDBOOK_VERSION = createHash('sha256').update(JSON.stringify({ handbook, maxSize: CHUNK_MAX_SIZE, overlap: CHUNK_OVERLAP, embedding: models.embedding.modelId })).digest('hex');

/** What gets stored beside each vector. `text` is what the agent reads; the rest is what it cites and filters on. */
export type HandbookChunk = {
  text: string;
  source: string;
  topic: string;
  chunkIndex: number;
  corpusVersion: string;
};

/**
 * Split every handbook document and carry the metadata forward.
 *
 * The metadata is the part people skip. A vector is not readable — the only
 * way an answer can cite `billing.md` is if the source travelled with the
 * chunk into the index.
 */
export async function chunkHandbook(): Promise<HandbookChunk[]> {
  const chunks: HandbookChunk[] = [];

  for (const document of handbook) {
    // `fromText` accepts metadata too; it lands on the document, and `chunk`
    // copies it onto every chunk it produces.
    const parsed = MDocument.fromText(document.text, {
      source: document.source,
      topic: document.topic,
    });

    const pieces = await parsed.chunk({
      strategy: 'recursive', // split on paragraphs, then lines, then characters
      maxSize: CHUNK_MAX_SIZE,
      overlap: CHUNK_OVERLAP, // repeat the tail so a sentence cut in half still retrieves
    });

    pieces.forEach((piece, index) => {
      chunks.push({
        text: piece.text,
        source: document.source,
        topic: document.topic,
        chunkIndex: index,
        corpusVersion: HANDBOOK_VERSION,
      });
    });
  }

  return chunks;
}

/**
 * Chunk -> embed -> store.
 *
 * Returns the two numbers worth watching: how many chunks the corpus became,
 * and how many dimensions each vector has. The second one is not cosmetic —
 * an index is created with a fixed dimension, so changing the embedding model
 * later means recreating it (exercise step 5).
 */
export async function ingestHandbook(): Promise<{
  chunks: HandbookChunk[];
  dimension: number;
}> {
  const chunks = await chunkHandbook();

  // One call for the whole corpus. The model is shared with the rest of the
  // repo (`models.embedding`) — a different model here would produce vectors
  // that cannot be compared with the query vector later.
  const { embeddings } = await embedMany({
    model: models.embedding,
    values: chunks.map((chunk) => chunk.text),
  });

  const dimension = embeddings[0]?.length ?? 0;
  if (!dimension || embeddings.length !== chunks.length || embeddings.some((embedding) => embedding.length !== dimension || embedding.some((n) => !Number.isFinite(n)))) {
    throw new Error('Invalid embedding batch; the existing index has not been replaced.');
  }

  // Rebuild rather than append: this demo re-ingests the same three documents
  // every run, and upserting without clearing would leave stale chunks from an
  // older chunk size behind. Real ingestion replaces per source instead —
  // `upsert({ deleteFilter: { source } })`.
  if ((await vector.listIndexes()).includes(HANDBOOK_INDEX)) {
    await vector.deleteIndex({ indexName: HANDBOOK_INDEX });
  }
  await vector.createIndex({ indexName: HANDBOOK_INDEX, dimension });

  await vector.upsert({
    indexName: HANDBOOK_INDEX,
    vectors: embeddings,
    metadata: chunks,
  });

  // Returning the chunks is for the demo: it prints what went in, so the
  // retrieval output below has something to be compared against.
  return { chunks, dimension };
}
