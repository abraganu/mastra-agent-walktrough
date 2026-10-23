---
lesson: 6
subject: workflows
status: todo
prereqs: [1, 2]
primitives: [createStep, createWorkflow, then, branch, parallel, workflowState, suspend, resume]
code: src/mastra/lessons/06-workflows
docs:
  - https://mastra.ai/docs/workflows/overview
  - https://mastra.ai/docs/workflows/control-flow
  - https://mastra.ai/docs/workflows/suspend-and-resume
  - https://mastra.ai/docs/workflows/time-travel
updated: 2026-10-22
---

# 06 · Workflows

**Subject:** deterministic multi-step control flow, with agents and tools as steps.

## What you'll be able to do

- Compose `createStep` and `createWorkflow` with typed input/output schemas that actually check each other.
- Choose between `.then`, `.branch`, `.parallel`, and `.foreach` without guessing which schema shape each demands.
- Share values across steps with workflow state instead of threading them through every schema.
- Suspend for a human, resume later, and replay a finished run step by step.

## Why here

An agent decides its own steps; a workflow decides them for it. The weather agent is a good first step to put inside one, because you already know what a single step does. This lesson also gives you the observability payoff from lesson 01: a workflow run is a trace with named steps.

## Exercise sketch

1. Build three steps: normalize a location string, call the weather agent, format the result. Run it from Studio's Workflows tab and read the graph.
2. Add a `.branch`: if the location cannot be resolved, ask the agent for clarification instead of failing.
3. Move a value into workflow state (e.g. the resolved city) and stop passing it through every step's schema.
4. Add a `suspend` before the final formatting step and resume with an approval. Read the snapshot Studio stores.
5. Re-run the finished workflow and use time travel to replay one step with different input.

## Studio checklist (draft)

- [ ] The graph view matches the code you wrote.
- [ ] A branch took the path you predicted, visible in the trace.
- [ ] A suspended run resumed and completed after approval.
- [ ] Time travel replayed a single step without re-running the rest.

## Docs

- Workflows — https://mastra.ai/docs/workflows/overview
- Control flow — https://mastra.ai/docs/workflows/control-flow
- Suspend and resume — https://mastra.ai/docs/workflows/suspend-and-resume
- Time travel — https://mastra.ai/docs/workflows/time-travel
