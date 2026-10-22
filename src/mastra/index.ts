import { Mastra } from '@mastra/core';
import { MastraEditor } from '@mastra/editor';
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

  // Editor = a CMS for agents. In Studio, open Agents -> <agent> -> Editor to
  // change instructions and tools without touching code, save a draft, test it,
  // then publish. Overrides live in the storage above (default `source: 'db'`),
  // so agent `id`, `name`, and `model` still come from code.
  // Docs: https://mastra.ai/docs/studio/editor
  //
  // To keep overrides as reviewable JSON files in the repo instead, swap in:
  //   new MastraEditor({ source: 'code', codePath: './mastra/editor' })
  editor: new MastraEditor(),
});
