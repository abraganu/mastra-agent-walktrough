---
lesson: 8
subject: mcp
status: todo
prereqs: [2]
primitives: [MCPServer, MCPClient]
code: src/mastra/lessons/08-mcp
docs:
  - https://mastra.ai/docs/connections/mcp
  - https://mastra.ai/reference/tools/mcp-server
  - https://mastra.ai/reference/tools/mcp-client
updated: 2026-10-22
---

# 08 · MCP

**Subject:** the boundary between your agent and everyone else's tools.

## What you'll be able to do

- Expose your tools as an MCP server over stdio and from anywhere else that speaks MCP.
- Consume an external MCP server inside a Mastra agent, with a tool filter.
- Decide when a tool should be MCP rather than a local `createTool`.

## Why here

Lesson 02 built tools, lesson 07 turned one into a retrieval tool. MCP is the same tool contract, moved across a process boundary. The baseline already exists in `scripts/mcp-server-example.ts`; per the curriculum rules it moves into this lesson folder once the lesson is written.

## Exercise sketch

1. Run `pnpm mcp:example` and connect a client you already have (an editor, a desktop MCP client) to it. List its tools.
2. Move the script into this lesson folder and register it as an `mcpServer` on the instance rather than a standalone script.
3. Add an `MCPClient` to a second lesson agent, pointing at that server, with a filter that exposes only one tool.
4. Point the client at an external public MCP server and add one of its tools to an agent. Watch the descriptions in the trace — that is where tool quality now comes from.

## Studio checklist (draft)

- [ ] A real MCP client listed your tools.
- [ ] An agent used a tool that lives in another process.
- [ ] A tool filter changed what the model could see.
- [ ] You can say when MCP is worth the extra hop.

## Docs

- MCP connections — https://mastra.ai/docs/connections/mcp
- MCP server — https://mastra.ai/reference/tools/mcp-server
- MCP client — https://mastra.ai/reference/tools/mcp-client
