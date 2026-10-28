# Project development tools

Use Node 24 and pnpm 12.14.0. `pnpm install --frozen-lockfile` reproduces the lockfile. `pnpm doctor` validates configuration without printing credentials or using APIs; `pnpm typecheck` checks code and curriculum structure; `pnpm verify` exercises model-free contracts and a local fixture MCP child process. CI runs the last two without a gateway key. There is no linter or test framework.

## Authoring skills

Project-local skills are in `.agents/skills/`, with external sources recorded in `skills-lock.json`:

- `mastra`: installed-version API lookup, types and CLI discovery.
- `lesson-authoring`: this curriculum's baselines, experiments, costs and reset contract.
- `writing-for-agents`: maintaining agent instructions and skills.
- `doc-coauthoring`: reader testing and iterative document writing.
- `mastra-factory`: optional operational tooling; it is not a prerequisite for lessons 1–8.

Use individual skills rather than installing whole collections with unrelated architecture, test or commit requirements. Root AGENTS.md remains the repository contract.

## Evaluations

`@mastra/evals` is installed without Vitest. `src/mastra/lessons/09-evals/recorded-check.ts` scores a recorded answer with a deterministic keyword check; `pnpm verify` exercises it. Scoring this fixture uses no model. Keyword presence is not proof of truth. Later experiments can combine tool-call checks and source-grounded criteria; generating responses and model-based judges consume API quota.

## Application clients

`@mastra/client-js` is installed. `src/mastra/lessons/11-server-client/client.ts` constructs a client with a configurable URL, cancellation and no automatic retry. Construction is network-free. Actual calls need a human-started server and appropriate authentication; identities supplied in memory/request context are not authorization checks. Lesson 11 remains planned.

## MCP Inspector

`@modelcontextprotocol/inspector` is pinned as a dev dependency. Its source-checkout-only postinstall is explicitly disabled: packaged clients are already built. Its bundled agent skills are not enabled automatically.

After a human starts Studio, inspect HTTP transport with:

```bash
pnpm exec mcp-inspector --cli --protocol-era modern http://localhost:4111/api/mcp/l08-dispatch/mcp --transport http --method tools/list
```

Or run a fixture-only stdio server from the checkout, without Studio or an API key:

```bash
pnpm exec mcp-inspector --cli --protocol-era modern node --import tsx src/mastra/lessons/08-mcp/stdio.ts --method tools/list
```

The installed Inspector defaults to legacy for ad-hoc targets; this server uses the modern revision, so `--protocol-era modern` is required. Use `pnpm exec mcp-inspector --cli --help` for the installed client's options. Stdio tools run as your OS user. A filtered environment does not isolate files or network access.

## Optional next capabilities

Core already provides request context, tool approval and workspace APIs. Expand these deliberately in later lessons before adding providers. Configure authenticated request context server-side, exercise approval rejection and repeated resume, and distinguish a local workspace from an isolated container. No third-party service credentials or external MCP servers are required for the first eight lessons.
