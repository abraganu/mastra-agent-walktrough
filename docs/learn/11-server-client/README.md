---
lesson: 11
subject: server-client
status: todo
availability: planned
prereqs: [1]
primitives: [server, apiRoutes, RequestContext, MastraClient]
code: src/mastra/lessons/11-server-client
docs:
  - https://mastra.ai/docs/server/overview
  - https://mastra.ai/docs/server/custom-api-routes
  - https://mastra.ai/docs/server/request-context
updated: 2026-10-28
---

# 11 · Server and client

**Subject:** getting the agent out of Studio and into something that calls it over HTTP.

## What you'll be able to do

- Add a custom API route to the Mastra server and call it with curl.
- Pass per-request values through `RequestContext` and use them to switch model or memory configuration.
- Call the running server with the Mastra Client, including streaming, instead of importing the instance.
- Explain why anything file-discovered only works under `mastra dev` / `mastra build`, not when you import `mastra` directly.

## Why here

Earlier lessons used in-process calls; lesson 08 introduced stdio and HTTP MCP boundaries. This lesson introduces an application client calling the Mastra server. It is also where you learn the constraint that shaped the folder structure — code-registered primitives travel anywhere; `agents/<name>/config.ts` discovery does not.

## Exercise sketch

1. Add a `/api/report` route that runs an agent and returns JSON. Call it with curl while `pnpm dev` is running.
2. Read `RequestContext` in the route, put a `plan` value in it, and use it in an agent callback to pick a model or a memory instance.
3. Use `MastraClient` from a scratch script to call an agent and stream the response to the terminal.
4. Try the same client call with the server stopped and confirm the failure mode is a connection error, not a model error.

## Studio checklist (draft)

- [ ] curl against your own route returns the expected payload.
- [ ] The same agent behaved differently for two `plan` values in one server run.
- [ ] Streaming arrived incrementally, not all at once.
- [ ] You can explain what breaks when the instance is imported instead of served.

## Docs

- Server overview — https://mastra.ai/docs/server/overview
- Custom API routes — https://mastra.ai/docs/server/custom-api-routes
- Request context — https://mastra.ai/docs/server/request-context
- Mastra Client — https://mastra.ai/docs/server/mastra-client
