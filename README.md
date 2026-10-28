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
3. Open **http://localhost:4111**, pick **L01 · Weather Agent**, and chat. Ask *"What's the weather in Madrid?"* to watch it call the tool.

Hot reload is on — edit anything under `src/mastra/` and the server restarts itself.

## Learning path

The repo is organised as a curriculum: one lesson = one subject = one slug. Start at [`docs/learn/README.md`](docs/learn/README.md) and take them in order; lesson 01 is about reading a run as a trace before changing anything.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Mastra dev server + Studio at `localhost:4111` |
| `pnpm dev:portless` | Same, behind [portless](https://portless.sh) at `https://mastra-playground.localhost` — no port numbers, no collisions |
| `pnpm lessons` | List the curriculum with each guide's status |
| `pnpm lesson <NN>` | Run one lesson's headless demo, with only that lesson mounted |
| `pnpm typecheck` | Type-check everything, then verify the lesson structure |
| `pnpm lessons:check` | Verify lesson invariants (mirrored folders, front-matter, imports) |
| `pnpm build` | Production build (Hono server in `.mastra/output`) |
| `pnpm start` | Run the production build |
| `pnpm mcp:example` | Run the MCP stdio server demo (lesson 08's baseline) |

`MASTRA_LESSONS=01,04 pnpm dev` mounts only some lessons.

## Portless (no port collisions)

Two Mastra projects both want `4111`; `pnpm dev` normally picks the next free port, which means the URL keeps changing. [portless](https://portless.sh) replaces the port with a stable name.

```bash
npm install -g portless   # once; needs Node 24+
pnpm dev:portless         # -> https://mastra-playground.localhost
```

- First run generates a local CA and binds `:443` (it will ask for `sudo` once). `portless trust` re-does the trust step if your state directory was reset.
- The app still binds a random high port; portless sets `PORT` and `mastra dev` honors it. `MASTRA_AUTO_DETECT_URL=true` (set by the script) makes Studio talk to `window.location.origin` instead of the hardcoded host/port, so everything goes back through the proxy over HTTPS.
- Because the script uses `portless run`, a linked git worktree gets its own subdomain: branch `fix-ui` → `https://fix-ui.mastra-playground.localhost`.
- `PORT=4321 pnpm dev` works too if you just want a different port for one run.

## Project structure

```
docs/learn/
  README.md                 ← curriculum index; status per lesson
  01-agent-loop/README.md   ← the guide for lesson 01
  02-tools/README.md        ← ...one folder per subject
src/mastra/
  index.ts                  ← merges lesson registries + shared services
  shared/
    storage.ts              ← LibSQL store used by every lesson
    editor.ts               ← Studio Editor (agent CMS)
    models.ts               ← NaN provider + model instances
  lessons/
    registry.ts             ← Lesson type, MASTRA_LESSONS filter, merge
    index.ts                ← imports every lesson in order
    01-agent-loop/          ← index.ts (registry) + weather agent + tool
    02-tools/ ...           ← stubs until their lesson is written
scripts/
  lesson.ts                 ← pnpm lesson / pnpm lessons
  check-lessons.ts          ← pnpm lessons:check
  mcp-server-example.ts     ← expose tools as an MCP server
```

To add a lesson: create `docs/learn/<slug>/README.md` and `src/mastra/lessons/<slug>/index.ts`, then import it in `src/mastra/lessons/index.ts`. The full contract is in [`AGENTS.md`](AGENTS.md), and `pnpm lessons:check` enforces it.

## NaN models

`src/mastra/shared/models.ts` builds an OpenAI-compatible provider pointed at `OPENAI_BASE_URL` and exports model instances (`models.default`, `models.cheap`, `models.embedding`). Pass the instance straight to an agent:

```ts
model: models.default
```

Why not the router string `openai/<model>`? Mastra's router sends `openai/*` to OpenAI's **Responses** API, and NaN only speaks **Chat Completions** — replayed history fails there with `Input items of type 'item_reference' are not supported`.

| Model | Quota | Notes |
| --- | --- | --- |
| `deepseek-v4-flash` | 3B tok/mo | function calling · 1M ctx · **default** |
| `glm5.3-flash` | 2B tok/mo | function calling · 1M ctx · MIT |
| `mimo-v2.6-flash` | 1B tok/mo | function calling · omnimodal |
| `glm5.3` | premium tier | needs a premium key |
| `qwen3-embedding` | — | embeddings (4096 dims): `models.embedding`, used by lessons 04 and 07 |

⚠️ qwen*/gemma* chat models use XML-style tool calling — avoid them for agents with tools.

## Notes

- **Storage**: `mastra-playground.db` (LibSQL/SQLite) and `mastra-observability.duckdb` sit at the repo root and hold memory, vectors, workflow state, and traces. Both are addressed by absolute path (`src/mastra/shared/local-paths.ts`) so the dev server and the lesson scripts open the same files — delete them to reset everything.
- **One embedder**: `models.embedding` (NaN's `qwen3-embedding`, 4096 dims) is the only embedding model in the repo, used by semantic recall and by lesson 07's index. Vectors from two different models are not comparable, so an index built with one cannot be queried with another.
- **TypeScript**: pinned to v6 (the Mastra CLI's tooling doesn't support v7 yet). Do not upgrade `typescript` past 6 for now.
- **Docs**: https://mastra.ai/en/docs — the model catalog is at https://mastra.ai/models
