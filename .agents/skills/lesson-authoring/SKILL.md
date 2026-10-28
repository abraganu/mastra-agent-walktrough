---
name: lesson-authoring
description: Author or review lessons in this Mastra playground, including executable baselines, guide exercises, learner experiments, and curriculum registration.
---

Read the root AGENTS.md and the lesson's current guide/code before changes. Preserve existing student status. Keep guide and code under their matching NN-subject directories; shared operational helpers belong under src/mastra/shared.

Use the local mastra skill to verify APIs against installed docs and types. Preserve shared NaN chat configuration and TypeScript 6. Check new dependencies' peer ranges before installation. Do not automatically submit external feedback during report-only work.

For a lesson change, make the baseline and every cumulative exercise agree. Name prerequisite edits or supply a reset checkpoint when variants cannot compose. Keep snippets executable in this repository's ESM/tsx mode. Register global primitives only in the lesson fragment, with lesson-prefixed IDs; workflow-local step IDs may be local.

Teach the transferable concept behind each Mastra API: goal, observations, actions, state, termination, budget, failure and evidence. Include a prediction, controlled experiment, observable outcome, cost label and reset procedure. Distinguish schema validity from truth, tool errors from terminal failures, and resource identity from authorization. Treat nondeterministic results as hypotheses to compare across trials.

Keep model-free activities available for exploring fixtures, contracts, chunking and recorded scoring. Never imply a fixture is live data. Preserve cancellation and bounded I/O. Retain owning resource references; shut down applications and disconnect clients in finally. Do not connect at import time.

Run pnpm typecheck and relevant pnpm verify checks. Paid demos and Studio remain human-run unless authorized under AGENTS.md. Report what was checked and what needs the human Studio checklist. A draft's availability can become ready only after a human confirms that checklist; never mark learner status done.
