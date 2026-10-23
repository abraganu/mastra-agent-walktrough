# AGENTS.md

Instructions for coding agents working in this repo. The human-facing overview is `README.md`; the curriculum is `docs/learn/README.md`.

## What this repo is

A personal Mastra playground. Every feature is taught as a **lesson** rather than added as a stray example. The structure exists so that any file's subject is obvious from its path.

## One slug = one subject

A lesson is identified by a slug: `NN-kebab-subject`, for example `04-memory`. The number is curriculum order, not creation order.

The slug joins two mirrored trees:

```
docs/learn/<slug>/README.md   ← the guide; front-matter is the source of truth for status
src/mastra/lessons/<slug>/    ← the code; index.ts is the registry fragment
```

Nothing else defines a lesson. Do not create a third location.

## Rules

1. A lesson directory contains exactly one registry fragment, `src/mastra/lessons/<slug>/index.ts`, exporting a `Lesson` (see `src/mastra/lessons/registry.ts`). Its `register` field is the only place that lesson's primitives are declared.
2. A lesson may import from `src/mastra/shared/` and from its own folder. Imports that cross into another lesson are rejected by `pnpm lessons:check`.
3. Namespace primitives with the lesson number: `id: 'l04-memory-agent'`, `name: 'L04 · Memory Agent'`. Studio orders and labels by that prefix.
4. Do not use Mastra's file-based `agents/<name>/config.ts` discovery. File discovery only runs under `mastra dev` / `mastra build`, so lesson code would behave differently when imported as a library. Register in code.
5. Shared services (storage, editor, model ids) live in `src/mastra/shared/` and are wired once in `src/mastra/index.ts`. A lesson never constructs its own storage.
6. Each code folder must be imported in `src/mastra/lessons/index.ts`.

## Guide front-matter

Every `docs/learn/<slug>/README.md` starts with these keys:

```yaml
---
lesson: 4
subject: memory
status: todo            # todo | in-progress | done
prereqs: [1, 2, 3]      # earlier lesson numbers only
primitives: [Memory, LibSQLStore]
code: src/mastra/lessons/04-memory
docs:
  - https://mastra.ai/docs/memory/overview
updated: 2026-10-22
---
```

`lesson` must match the folder's numeric prefix, `subject` must match the rest of the slug, and `status` is the only place progress is tracked. Never mark a lesson `done` on the human's behalf — they run the Studio checklist at the end of each guide and report back.

## Commands

```bash
pnpm dev                 # Mastra dev server + Studio on http://localhost:4111
pnpm dev:portless        # same, at https://mastra-playground.localhost (portless)
pnpm lessons             # list lessons with status and primitives
pnpm lesson <slug|NN>    # mount one lesson and run its demo()
pnpm lessons:check       # verify the structure invariants
pnpm typecheck           # tsc --noEmit && lessons:check
pnpm build / pnpm start  # production build and run
```

`MASTRA_LESSONS=01,04 pnpm dev` narrows the running instance to those lessons.

## Adding a lesson

1. Create `docs/learn/<slug>/README.md` with the front-matter above, then: why this lesson is here, exercise sketch, Studio checklist, Notes, docs links.
2. Create `src/mastra/lessons/<slug>/index.ts` exporting the `Lesson`, even if `register` is `{}` while the lesson is still a stub.
3. Add the import to `src/mastra/lessons/index.ts`.
4. Add the row to the table in `docs/learn/README.md`.
5. Run `pnpm typecheck`.

## Writing Mastra code here

Do not trust model knowledge of Mastra APIs — they change between versions. Prefer, in order:

1. Embedded docs for the installed version: `node_modules/@mastra/core/dist/docs/references/` (and the same path under `@mastra/memory`, `@mastra/rag`, `@mastra/mcp`).
2. The installed type definitions.
3. `https://mastra.ai/llms.txt` for the current page index.

The `mastra` skill in `.agents/skills/mastra/` documents this workflow.

Models come from `src/mastra/shared/models.ts`, which builds an `@ai-sdk/openai-compatible` provider against `OPENAI_BASE_URL` (NaN) and exports model instances (`models.default`, `models.cheap`, `models.embedding`). Do not switch these back to `openai/*` router strings: the router calls OpenAI's Responses API, which NaN rejects (`item_reference` not supported) as soon as an agent replays history.
