import { Mastra } from '@mastra/core';
import { MastraStorageExporter, Observability } from '@mastra/observability';
import { lessons } from './lessons';
import { activeLessons, mergeLessons } from './lessons/registry';
import { editor } from './shared/editor';
import { storage } from './shared/storage';
import { vector } from './shared/vector';

// Central Mastra entry point. Everything registered here shows up in Studio.
//
// Structure: one lesson = one subject = one folder, mirrored between
// `docs/learn/<slug>/` (the guide) and `src/mastra/lessons/<slug>/` (the code).
// Nested imports mean a lesson mounts itself; this file only merges fragments.
//
// Narrow the instance to a few lessons with:
//   MASTRA_LESSONS=01,04 pnpm dev
export const mastra = new Mastra({
  ...mergeLessons(activeLessons(lessons)),

  // Local file-backed storage (LibSQL/SQLite) for memory, workflow state, and
  // evals; its observability domain (traces, logs, metrics) lives in DuckDB.
  storage,

  // Vector stores for search by meaning: semantic recall (lesson 04) and RAG
  // indexes (lesson 07). Registered here so lessons reuse one store.
  vectors: { default: vector },

  // Editor = a CMS for agents: change instructions and tools from Studio
  // without touching code, save a draft, test it, then publish.
  // Docs: https://mastra.ai/docs/studio/editor
  editor,

  // Explicit observability: without it, the default tracer does not persist
  // spans when storage is a composite whose observability domain is separate
  // (DuckDB here). MastraStorageExporter writes spans, logs, and metrics to
  // the storage's observability domain, which is what Studio reads.
  // Docs: https://mastra.ai/docs/studio/observability
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'mastra-playground',
        exporters: [new MastraStorageExporter()],
      },
    },
  }),
});
