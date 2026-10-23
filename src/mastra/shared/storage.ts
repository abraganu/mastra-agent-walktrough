import { LibSQLStore } from '@mastra/libsql';

// Local file-backed storage (LibSQL/SQLite). Powers memory persistence,
// workflow state, evals, and traces in Studio. Delete mastra-playground.db
// to reset all state.
// Docs: https://mastra.ai/docs/storage
export const storage = new LibSQLStore({
  id: 'mastra-playground-storage',
  url: 'file:./mastra-playground.db',
});
