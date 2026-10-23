---
lesson: 5
subject: processors
status: todo
prereqs: [1, 4]
primitives: [processors, guardrails, PIIDetector, TokenLimiter]
code: src/mastra/lessons/05-processors
docs:
  - https://mastra.ai/docs/agents/processors
  - https://mastra.ai/docs/agents/guardrails
updated: 2026-10-22
---

# 05 · Processors and guardrails

**Subject:** the code that runs between the caller and the model, in both directions.

## What you'll be able to do

- Attach an input processor, an output processor, and one that does both.
- Redact PII and cap tokens without touching the agent's instructions.
- Add a guardrail that stops a run instead of politely failing.

## Why here

Lesson 04 added context before the model call. Processors are the general mechanism for that — and for the return trip, which memory never touches. Once you have both, the trace becomes a timeline you can attribute precisely: history, then injected context, then processed input, then the call.

## Exercise sketch

1. Add a PII detector input processor and send a prompt containing an email address. Find the redaction in the LLM call span, not in the user message.
2. Add a token limiter and make the conversation long enough to trigger it. Note what got dropped.
3. Add a moderation or refusal guardrail and try to get past it. Confirm the run stops and where.
4. Write a trivial custom processor that uppercases the input, purely to see the lifecycle hooks in a place you control.

## Studio checklist (draft)

- [ ] Redaction is visible in the LLM span, with the original still in history.
- [ ] The token limiter fired and you can see what it removed.
- [ ] A guardrail blocked a run and the failure surfaced clearly.
- [ ] A hand-written processor ran in the position you expected.

## Docs

- Processors — https://mastra.ai/docs/agents/processors
- Guardrails — https://mastra.ai/docs/agents/guardrails
