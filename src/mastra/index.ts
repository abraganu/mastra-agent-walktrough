import { Mastra } from '@mastra/core';
import { lessons } from './lessons';
import { activeLessons, mergeLessons } from './lessons/registry';
import { editor } from './shared/editor';
import { storage } from './shared/storage';

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

  // Local file-backed storage (LibSQL/SQLite). Powers memory persistence,
  // workflow state, evals, and traces in Studio.
  storage,

  // Editor = a CMS for agents: change instructions and tools from Studio
  // without touching code, save a draft, test it, then publish.
  // Docs: https://mastra.ai/docs/studio/editor
  editor,
});
