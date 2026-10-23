import { MastraEditor } from '@mastra/editor';

// Editor = a CMS for agents. In Studio, open Agents -> <agent> -> Editor to
// change instructions and tools without touching code, save a draft, test it,
// then publish. Overrides live in the storage configured in `storage.ts`
// (default `source: 'db'`), so agent `id`, `name`, and `model` still come from
// code.
// Docs: https://mastra.ai/docs/studio/editor
//
// To keep overrides as reviewable JSON files in the repo instead, swap in:
//   new MastraEditor({ source: 'code', codePath: './mastra/editor' })
export const editor = new MastraEditor();
