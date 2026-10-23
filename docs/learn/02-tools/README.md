---
lesson: 2
subject: tools
status: todo
prereqs: [1]
primitives: [createTool, inputSchema, outputSchema]
code: src/mastra/lessons/02-tools
docs:
  - https://mastra.ai/docs/agents/tools
  - https://mastra.ai/reference/tools/create-tool
updated: 2026-10-22
---

# 02 · Tools

**Subject:** giving the model actions, and getting the contract right so it calls them reliably.
**Prereqs:** 01 — you need to be able to read a tool-call span before debugging one.

## What you'll be able to do

- Write a tool with `createTool()` whose schema does most of the prompting for you.
- Predict which of two tools the model picks, from their descriptions alone.
- Tell apart a tool that throws, a tool that returns an error string, and a tool whose output fails its own schema — and decide which one you want.

## Why here

Lesson 01 showed the model emitting a tool call that Mastra then executes. This lesson is about the contract around that call. Everything later — retrieval, MCP, subagents — is exposed to the model through tools, so the schema habits you build here carry the rest of the path.

## Exercise sketch

1. Add a second tool next to `l01-get-weather` — air quality for a city is a good pairing, since it shares an input shape and competes for the same user phrasing.
2. Ask a question only the new tool can answer. Read the trace: what did the model see that made it choose correctly?
3. Make `inputSchema` stricter (an enum of supported cities). Ask about an unsupported one and watch validation fail before `execute` runs.
4. Break `outputSchema` — omit a required field from the return value — and note whether the model sees the failure or a retry.
5. Compare throwing inside `execute` with returning `{ output: 'could not fetch...' }`. Only one of them lets the model recover and explain itself.
6. Rewrite one `description` to be deliberately vague, then precise, and watch tool choice change without touching the instructions.

## Studio checklist (draft)

- [ ] Two tools compete for one prompt, and you can explain the winner from the trace.
- [ ] A schema violation is visible in the trace and `execute` never ran.
- [ ] A recoverable failure produced a useful answer, a thrown error did not.
- [ ] You changed behavior by editing a description only.

## Docs

- Tools — https://mastra.ai/docs/agents/tools
- `createTool` — https://mastra.ai/reference/tools/create-tool
