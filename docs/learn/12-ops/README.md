---
lesson: 12
subject: ops
status: todo
prereqs: [1, 9]
primitives: [MastraEditor, exporters, retention, deployer]
code: src/mastra/lessons/12-ops
docs:
  - https://mastra.ai/docs/studio/editor
  - https://mastra.ai/docs/observability/tracing/overview
  - https://mastra.ai/docs/deployment/overview
updated: 2026-10-22
---

# 12 · Operations

**Subject:** what changes when the playground becomes something other people use.

## What you'll be able to do

- Move Editor overrides from the database to reviewable JSON in the repo (`source: 'code'`), and reason about which you want in production.
- Export traces instead of only reading them in Studio, and set retention instead of letting a database grow forever.
- Build for production and explain the difference between `mastra dev` and `mastra start`.
- Add authentication in front of Studio before anyone else can reach it.

## Why here

Last on purpose. Versioning config, exporting traces, and deploying are all decisions you cannot make well until you know what a run, a score, and an override actually are.

## Exercise sketch

1. Switch the editor to `source: 'code'` with a `codePath`, publish a change in Studio, and find the generated file in the repo. Diff it.
2. Add a trace exporter (console first, then OTel if you have a collector) and confirm spans leave the process.
3. Configure storage retention for traces and check what the config actually deletes.
4. Run `pnpm build` and `pnpm start`, then hit the same agent you have been testing in dev. Note anything that behaved differently.
5. Put an auth provider in front of Studio and confirm an unauthenticated browser gets rejected.

## Studio checklist (draft)

- [ ] An Editor change produced a reviewable file in the repo.
- [ ] Traces are visible outside Studio.
- [ ] Retention is configured, not default.
- [ ] The production build serves the same agent.
- [ ] Studio is not open to the world.

## Docs

- Editor — https://mastra.ai/docs/studio/editor
- Tracing — https://mastra.ai/docs/observability/tracing/overview
- Deployment — https://mastra.ai/docs/deployment/overview
- Studio auth — https://mastra.ai/docs/studio/auth
