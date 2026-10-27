# Mastra learning path

Twelve lessons, in dependency order. Each lesson is one subject, one guide, one folder of code.

- The guide: `docs/learn/<slug>/README.md` (this tree)
- The code: `src/mastra/lessons/<slug>/` (mirrored, same slug)
- The slug is `NN-kebab-subject`; the number is the order you should read them in.

The contract that keeps the two trees in sync is in [`AGENTS.md`](../../AGENTS.md) and enforced by `pnpm lessons:check`.

## Commands

```bash
pnpm lessons              # the curriculum, with each guide's status
pnpm lesson 01            # run lesson 01's headless demo (only that lesson mounted)
pnpm dev                  # Studio at http://localhost:4111
MASTRA_LESSONS=01,04 pnpm dev   # mount only some lessons
pnpm typecheck            # tsc + lessons:check
```

## The path

| # | Slug | After it you can | New primitives |
| --- | --- | --- | --- |
| 01 | `01-agent-loop` | Read a run as a trace and change behavior without touching code | `Agent`, traces, Studio Editor |
| 02 | `02-tools` | Give an agent callable functions it actually calls correctly | `createTool`, zod schemas |
| 03 | `03-structured-output` | Get typed data back instead of prose | `outputSchema`, `defaultOptions`, `stream` |
| 04 | `04-memory` | Keep context across turns, threads, and users | `Memory`, threads, working memory |
| 05 | `05-processors` | Rewrite or block input and output around the model call | processors, guardrails |
| 06 | `06-workflows` | Put agents inside deterministic, resumable processes | `createStep`, `createWorkflow`, `branch`, `suspend`, `timeTravel` |
| 07 | `07-rag` | Answer from your own documents | `MDocument`, embeddings, `LibSQLVector` |
| 08 | `08-mcp` | Share tools with other agents, and consume theirs | `MCPServer`, `MCPClient` |
| 09 | `09-evals` | Measure whether a change made the agent better | scorers, datasets |
| 10 | `10-multi-agent` | Split one big agent into specialists + a supervisor | subagents, delegation |
| 11 | `11-server-client` | Serve the agent over HTTP and stream it into a UI | routes, `RequestContext`, client |
| 12 | `12-ops` | Ship it: versioned config, tracing, deploys, retention | editor source, exporters, deployers |

## How to work through a lesson

1. Read the guide in full before editing anything.
2. Run the example as-is. `pnpm lesson <n>` for the headless path, `pnpm dev` for Studio.
3. Read the trace. Predict what the spans should look like, then check. This is the habit the whole path is built around.
4. Break it on purpose — drop a schema field, remove an instruction line, pass a bad ID. Note how it fails.
5. Write three to five lines under `Notes` in the guide, then set `status` to `done`.

Status lives in each guide's front-matter only, so `pnpm lessons` is always the truth about where you are.

## Not in the path

Sandbox/workspace (filesystem and shell access), skills, voice, channels, signals and schedules, harness/durable agents, auth providers. All of them are real Mastra features, none of them are needed to be productive with the core. Add them as lessons 13+ when a project asks for them.
