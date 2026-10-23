import type { Lesson } from '../registry';

// Guide: docs/learn/07-rag/README.md
// Planned: chunk -> embed (fastembed locally or NaN's qwen3-embedding) ->
// LibSQLVector -> retrieve -> rerank, then expose retrieval as a tool.
export const lesson: Lesson = {
  id: '07-rag',
  number: 7,
  subject: 'rag',
  docs: [
    'https://mastra.ai/reference/rag/overview',
    'https://mastra.ai/reference/rag/chunking-and-embedding',
    'https://mastra.ai/reference/rag/retrieval',
    'https://mastra.ai/reference/rag/rerank',
  ],
  register: {},
};
