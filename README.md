# Mastra Playground

Local playground for building AI agents with [Mastra](https://mastra.ai), powered by the [NaN gateway](https://nan.builders) (OpenAI-compatible). Runs entirely on your machine.

## Quickstart

1. Paste your NaN API key into `.env` (already created, just replace the placeholder):
   ```
   OPENAI_API_KEY=<your-nan-key>
   OPENAI_BASE_URL=https://api.nan.builders/v1
   ```
2. Start the dev server + Studio:
   ```bash
   pnpm dev
   ```
3. Open **http://localhost:4111**, pick **Weather Agent**, and chat. Ask *"What's the weather in Madrid?"* to watch it call the tool.

Hot reload is on — edit anything under `src/mastra/` and the server restarts itself.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Mastra dev server + Studio at `localhost:4111` |
| `pnpm typecheck` | Type-check everything |
| `pnpm build` | Production build (Hono server in `.mastra/output`) |
| `pnpm start` | Run the production build |
| `pnpm rag:example` | Run the RAG pipeline demo (local fastembed embeddings) |
| `pnpm mcp:example` | Run the MCP stdio server demo |

## Project structure

```
src/mastra/
  index.ts                  ← registers agents + storage; shows up in Studio
  agents/weather-agent.ts   ← example agent (deepseek-v4-flash via NaN)
  tools/weather-tool.ts     ← example tool (live wttr.in lookup)
scripts/
  rag-example.ts            ← chunk → embed (local) → store → query
  mcp-server-example.ts     ← expose tools as an MCP server
```

To add an agent: create `src/mastra/agents/my-agent.ts` exporting `new Agent({...})`, then register it in `index.ts` (`agents: { weatherAgent, myAgent }`). Workflows go in `src/mastra/workflows/`, scorers in `src/mastra/scorers/`.

## NaN models

The model router format is `openai/<model>`; with `OPENAI_BASE_URL` set, requests go to NaN.

| Model | Quota | Notes |
| --- | --- | --- |
| `openai/deepseek-v4-flash` | 3B tok/mo | function calling · 1M ctx · **default** |
| `openai/glm5.3-flash` | 2B tok/mo | function calling · 1M ctx · MIT |
| `openai/mimo-v2.6-flash` | 1B tok/mo | function calling · omnimodal |
| `openai/glm5.3` | premium tier | needs a premium key |
| `openai/qwen3-embedding` | — | embeddings (4096 dims) for RAG via API |

⚠️ qwen*/gemma* chat models use XML-style tool calling — avoid them for agents with tools.

## Notes

- **Storage**: `mastra-playground.db` (LibSQL/SQLite) holds memory, traces, workflow state. Delete it to reset. `rag-demo.db` holds the RAG demo vectors.
- **Fastembed**: first `rag:example` run downloads the embedding model (~30 MB) locally; embeddings run on your CPU with no API usage.
- **TypeScript**: pinned to v6 (the Mastra CLI's tooling doesn't support v7 yet). Do not upgrade `typescript` past 6 for now.
- **Docs**: https://mastra.ai/en/docs — the model catalog is at https://mastra.ai/models
