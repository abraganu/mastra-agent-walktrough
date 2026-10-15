import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { weatherAgent } from './agents/weather-agent';

// Central Mastra entry point. Everything registered here shows up in Studio.
// Docs: https://mastra.ai/en/docs
export const mastra = new Mastra({
  agents: { weatherAgent },

  // Local file-backed storage (LibSQL/SQLite). Powers memory persistence,
  // workflow state, evals, and traces in Studio. Delete mastra-playground.db
  // to reset all state.
  storage: new LibSQLStore({
    id: 'mastra-playground-storage',
    url: 'file:./mastra-playground.db',
  }),
});
