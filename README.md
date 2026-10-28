# Mastra Playground

Local playground for building AI agents with [Mastra](https://mastra.ai), powered by the [NaN gateway](https://nan.builders) (OpenAI-compatible). The application and databases run locally; prompts and embeddings go to the NaN gateway, and live weather requests go to wttr.in.

## Quickstart

Use Node 24 (see `.node-version`) and pnpm 12.14.0. The core scripts work on macOS, Linux, and Windows; examples below use a POSIX shell. In PowerShell, set environment variables with `$env:NAME="value"` before running a command. Portless is optional.

1. Install dependencies and create your environment file:
   ```bash
   pnpm install --frozen-lockfile
   cp .env.example .env
   ```
   On PowerShell, use `Copy-Item .env.example .env`. Paste your NaN API key into `.env`:
   ```
   OPENAI_API_KEY=<your-nan-key>
   OPENAI_BASE_URL=https://api.nan.builders/v1
   ```
2. Check setup without making API calls:
   ```bash
   pnpm doctor
   pnpm typecheck
   pnpm verify
   ```
3. Start the dev server + Studio:
   ```bash
   pnpm dev
   ```
4. Open **http://localhost:4111**, pick **L01 · Weather Agent**, and chat. Ask *"What's the weather in Madrid?"* to watch it call the tool.

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
| `pnpm doctor` | Check setup without displaying credentials or calling APIs |
| `pnpm verify` | Model-free regression checks for contracts, fixtures, and lesson isolation |
| `pnpm rag <chunk|ingest|query|ask>` | Inspect RAG stages separately; only chunk is API-free |
| `pnpm typecheck` | Type-check everything, then verify the lesson structure |
| `pnpm lessons:check` | Verify lesson invariants (mirrored folders, front-matter, imports) |
| `pnpm build` | Production build (Hono server in `.mastra/output`) |
| `pnpm start` | Run the production build |

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
  README.md                 ← curriculum index; learner status is in each guide
  01-agent-loop/README.md   ← the guide for lesson 01
  02-tools/README.md        ← ...one folder per subject
src/mastra/
  index.ts                  ← merges lesson registries + shared services
  shared/
    storage.ts              ← LibSQL store used by every lesson
    editor.ts               ← Studio Editor (agent CMS)
    models.ts               ← NaN chat configurations + embedding instance
  lessons/
    registry.ts             ← Lesson type, MASTRA_LESSONS filter, merge
    index.ts                ← imports every lesson in order
    01-agent-loop/          ← index.ts (registry) + weather agent + tool
    02-tools/ ...           ← implemented baselines through 08; 09–12 are planned
scripts/
  lesson.ts                 ← pnpm lesson / pnpm lessons
  check-lessons.ts          ← pnpm lessons:check
```

To add a lesson: create `docs/learn/<slug>/README.md` and `src/mastra/lessons/<slug>/index.ts`, then import it in `src/mastra/lessons/index.ts`. The full contract is in [`AGENTS.md`](AGENTS.md), and `pnpm lessons:check` enforces it.

## NaN models

These are project defaults, not a permanent provider capability guarantee. Check the [gateway documentation](https://nan.builders) when changing models; validate tool-calling and structured-output behavior with the lesson experiments.

`src/mastra/shared/models.ts` exports Mastra-native chat configurations (`api: 'chat'`) and an AI SDK embedding instance pointed at `OPENAI_BASE_URL` (`models.default`, `models.cheap`, `models.embedding`). Pass the instance straight to an agent:

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

## Classroom workflow

Use `WEATHER_MODE=fixture pnpm dev` for fictional, deterministic weather. `WEATHER_MODE=timeout` and `WEATHER_MODE=malformed` exercise failures without calling wttr.in. The default `live` mode uses a 10-second timeout and propagates cancellation. Agent runs still use NaN quota in every mode.

Stop Studio before running `pnpm lesson NN`; restart it afterward to inspect saved traces. Each CLI run shuts down storage and tracing. Lessons 01–03 use fresh threads by default; supply `LESSON_THREAD` to deliberately replay history. `LESSON_PROMPT` changes the single-question demos (01–03, 07–08); lessons 04–06 have multi-turn/workflow inputs described in their guides.

See [project tooling](docs/tooling.md) for optional client, evaluation, MCP Inspector, and authoring skills. Follow [the curriculum](docs/learn/README.md) for objectives and experiment worksheets. Draft availability means revised teaching material awaits a human Studio checklist; it does not change learner progress.

## Notes

- **Storage**: `mastra-playground.db` (LibSQL/SQLite) and `mastra-observability.duckdb` sit at the repo root and hold memory, vectors, workflow state, and traces. Both are addressed by absolute path (`src/mastra/shared/local-paths.ts`) so the dev server and the lesson scripts open the same files — stop Studio and all CLI processes before deleting them to reset everything. Run CLI demos while Studio is stopped, then restart Studio to inspect persisted traces; DuckDB has a single writable process owner.
- **One embedder**: `models.embedding` (NaN's `qwen3-embedding`, 4096 dims) is the only embedding model in the repo, used by semantic recall and by lesson 07's index. Vectors from two different models are not comparable, so an index built with one cannot be queried with another.
- **TypeScript**: pinned to v6 (the Mastra CLI's tooling doesn't support v7 yet). Do not upgrade `typescript` past 6 for now.
- **Docs**: https://mastra.ai/en/docs — the model catalog is at https://mastra.ai/models
