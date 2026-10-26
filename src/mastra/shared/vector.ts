import { LibSQLVector } from '@mastra/libsql';

// Vector store for anything that searches by meaning: semantic recall in
// lesson 04, RAG indexes in lesson 07. Lives here (not in a lesson) because a
// lesson never constructs its own storage — see AGENTS.md.
//
// It shares the libSQL file with `storage.ts`; vectors get their own tables, so
// the two don't collide. Delete mastra-playground.db to reset both.
// Docs: https://mastra.ai/reference/vectors/libsql
export const vector = new LibSQLVector({
  id: 'mastra-playground-vector',
  url: 'file:./mastra-playground.db',
});
