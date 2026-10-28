---
lesson: 10
subject: multi-agent
status: todo
availability: planned
prereqs: [1, 4]
primitives: [subagents, delegation, supervisor]
code: src/mastra/lessons/10-multi-agent
docs:
  - https://mastra.ai/docs/subagents
  - https://mastra.ai/docs/guides/multi-agent-systems
updated: 2026-10-28
---

# 10 · Multi-agent systems

**Subject:** splitting one overloaded agent into specialists with a supervisor.

## What you'll be able to do

- Register subagents on a supervisor and understand that delegation routing runs on each subagent's `description`.
- Read a delegation in the trace: it looks like a tool call, but each hop is a full agent loop.
- Predict how memory is scoped per delegation — a fresh thread, a resource derived from the parent — and share memory on purpose when you need to.
- Decide when one agent with more tools is actually the better design.

## Why here

This lesson combines everything before it: tools (the subagent is exposed as one), memory (scoping rules), traces (delegation spans), and, once lesson 09 is done, evals to check that the split actually helped.

## Exercise sketch

1. Split the weather capability into two specialists: current conditions, and air quality. Give each a `description` that says exactly when to use it.
2. Add both as subagents of a supervisor and ask a question that requires both. Watch two delegations in one trace.
3. Make one `description` vague and observe delegation go to the wrong specialist. Then fix the description and nothing else.
4. Inspect memory: a subagent starts with an empty thread each delegation but a stable resource. Confirm that with a follow-up that relies on a remembered fact.
5. Compare against a single agent with both tools. Write down, in the guide, the case where you would pick each design.

## Studio checklist (draft)

- [ ] Two delegations appear as separate loops inside one trace.
- [ ] A description change rerouted delegation.
- [ ] You can state the subagent thread/resource rule without looking it up.
- [ ] You have a defensible answer to "one agent or several?".

## Docs

- Subagents — https://mastra.ai/docs/subagents
- Multi-agent systems — https://mastra.ai/docs/guides/multi-agent-systems
