import { createTool } from '@mastra/core/tools';
import { embed } from 'ai';
import { z } from 'zod';
import { models } from '../../shared/models';
import { vector } from '../../shared/vector';
import { HANDBOOK_INDEX, HANDBOOK_VERSION } from './ingest';

// Lesson 07 subject: RAG — retrieval is a function first and a tool second.
// Guide: docs/learn/07-rag/README.md
// Docs: https://mastra.ai/reference/rag/retrieval
//
// The split below is the lesson. `searchChunks` is a plain async function you
// can call from a script, a workflow step, or a test. `searchHandbook` is the
// thin schema wrapper that lets a model call it. Every capability in this repo
// follows the same path: script, then function, then tool.

export type HandbookMatch = {
  text: string;
  source: string;
  topic: string;
  score: number;
};

/**
 * Embed the question and return the closest chunks.
 *
 * The query is embedded with the same model that embedded the corpus. Mix the
 * two and you get vectors in unrelated spaces: no error, just nonsense
 * rankings — the failure mode with no error message.
 */
export async function searchChunks(question: string, topK = 3): Promise<HandbookMatch[]> {
  const { embedding } = await embed({ model: models.embedding, value: question });

  const results = await vector.query({
    indexName: HANDBOOK_INDEX,
    queryVector: embedding,
    topK,
  });

  if (results.some((result) => result.metadata?.corpusVersion !== HANDBOOK_VERSION)) {
    throw new Error('Handbook index is stale. Run pnpm rag ingest with the current corpus and embedding model.');
  }

  // Metadata is `Record<string, any>` coming out of the store, so it is
  // narrowed here rather than trusted. A chunk without a source is still
  // answerable; it just cannot be cited.
  return results.map((result) => ({
    text: String(result.metadata?.text ?? ''),
    source: String(result.metadata?.source ?? 'unknown'),
    topic: String(result.metadata?.topic ?? 'unknown'),
    score: result.score,
  }));
}

// This is the hand-written version on purpose: `createVectorQueryTool` from
// `@mastra/rag` does the same thing in one line, and the guide shows it. Doing
// it by hand once is how you learn that the citation only exists because the
// metadata travelled with the vector.
export const searchHandbook = createTool({
  id: 'l07-search-handbook',
  // The description is what the model reads when deciding to call this at all.
  // "Search the Rill Coffee internal handbook" is the signal; "query vectors"
  // is not.
  description:
    'Search the Rill Coffee internal handbook (billing, shipping, support). Use it for any question about plans, refunds, deliveries, or who to contact.',
  inputSchema: z.object({
    question: z
      .string()
      .min(1)
      .describe('The question to look up, phrased the way a customer would ask it'),
    topK: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .describe('How many chunks to return; 3 is a good default'),
  }),
  // The output schema is also the contract with the model: it sees exactly
  // this shape, so `source` is there to cite and `score` is there to ignore.
  outputSchema: z.object({
    matches: z.array(
      z.object({
        text: z.string(),
        source: z.string(),
        topic: z.string(),
        score: z.number(),
      }),
    ),
  }),
  execute: async ({ question, topK }) => ({
    matches: await searchChunks(question, topK ?? 3),
  }),
});
