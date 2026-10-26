import { MastraCompositeStore } from '@mastra/core/storage';
import { DuckDBStore } from '@mastra/duckdb';
import { LibSQLStore } from '@mastra/libsql';

// Local file-backed storage, composed per domain. LibSQL (SQLite) powers
// memory persistence, workflow state, evals, and the editor; DuckDB adds the
// observability domain (traces, logs, metrics) because LibSQL-backed
// observability cannot serve metrics in Studio. Delete mastra-playground.db
// and mastra-observability.duckdb to reset all state.
// Docs: https://mastra.ai/docs/storage
//       https://mastra.ai/docs/studio/observability
export const storage = new MastraCompositeStore({
  id: 'mastra-playground-storage',
  default: new LibSQLStore({
    id: 'mastra-playground-storage-libsql',
    url: 'file:./mastra-playground.db',
  }),
  domains: {
    observability: new DuckDBStore({
      id: 'mastra-playground-storage-observability',
      path: './mastra-observability.duckdb',
    }).observability,
  },
});
