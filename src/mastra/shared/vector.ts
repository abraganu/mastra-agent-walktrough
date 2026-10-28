import { LibSQLVector } from '@mastra/libsql';
import { rootPath } from './local-paths';

// Vector store for anything that searches by meaning: semantic recall in
// lesson 04, RAG indexes in lesson 07. Lives here (not in a lesson) because a
// lesson never constructs its own storage — see AGENTS.md.
//
// It shares the libSQL file with `storage.ts`; vectors get their own tables, so
// the two don't collide. Delete mastra-playground.db to reset both.
//
// Absolute, for the same reason as storage.ts: `mastra dev` and `pnpm lesson`
// have different working directories, and a relative path puts the index in a
// file the other entry point never opens.
// Docs: https://mastra.ai/reference/vectors/libsql
export const vector = new LibSQLVector({
  id: 'mastra-playground-vector',
  url: `file:${rootPath('mastra-playground.db')}`,
});
