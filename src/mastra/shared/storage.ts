import { MastraCompositeStore } from '@mastra/core/storage';
import { DuckDBStore } from '@mastra/duckdb';
import { LibSQLStore } from '@mastra/libsql';
import { rootPath } from './local-paths';

// Local file-backed storage, composed per domain. LibSQL (SQLite) powers
// memory persistence, workflow state, evals, and the editor; DuckDB adds the
// observability domain (traces, logs, metrics) because LibSQL-backed
// observability cannot serve metrics in Studio. Delete mastra-playground.db
// and mastra-observability.duckdb to reset all state.
//
// Both paths are absolute on purpose: `pnpm lesson` and `mastra dev` run with
// different working directories, so a relative path is two databases. See
// ./local-paths.ts.
// Docs: https://mastra.ai/docs/storage
//       https://mastra.ai/docs/studio/observability
export const observabilityStorage = new DuckDBStore({
  id: 'mastra-playground-storage-observability',
  path: rootPath('mastra-observability.duckdb'),
});

class PlaygroundStore extends MastraCompositeStore {
  override async close(): Promise<void> {
    try { await super.close(); } finally { await observabilityStorage.close(); }
  }
}

export const storage = new PlaygroundStore({
  id: 'mastra-playground-storage',
  default: new LibSQLStore({
    id: 'mastra-playground-storage-libsql',
    url: `file:${rootPath('mastra-playground.db')}`,
  }),
  domains: {
    observability: observabilityStorage.observability,
  },
});
