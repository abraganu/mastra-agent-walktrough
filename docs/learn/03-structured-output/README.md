---
lesson: 3
subject: structured-output
status: todo
prereqs: [1, 2]
primitives: [outputSchema, defaultOptions, maxSteps, stream]
code: src/mastra/lessons/03-structured-output
docs:
  - https://mastra.ai/docs/agents/structured-output
  - https://mastra.ai/reference/agents/generate
  - https://mastra.ai/reference/streaming/agents/stream
updated: 2026-10-22
---

# 03 · Structured output and generation options

**Subject:** getting objects instead of prose, and controlling how the loop terminates.

## What you'll be able to do

- Return a typed object from an agent call and handle the case where the model's output does not validate.
- Set defaults once on the agent instead of on every call.
- Explain when the tool loop stops, and see it stop.
- Consume `stream()` chunks without losing the final structured result.

## Why here

So far the agent's output was text you read. Real applications branch on it, store it, and render it. This is also where the loop's termination becomes explicit: `maxSteps` and stop conditions decide how many times it goes around.

## Exercise sketch

1. Give the weather agent a call-level `outputSchema` and ask for a typed report (temperature, conditions, humidity, a confidence field).
2. Force a schema mismatch — a required field the prompt cannot satisfy — and observe the retry or failure.
3. Set `defaultOptions` on the agent so the schema applies without repeating it on every call.
4. Set `maxSteps: 1` and ask a question that needs two tool calls. Watch the loop get cut off mid-flight in the trace; write down what the user sees.
5. Call `stream()` for the same prompt and compare with `generate()`: same result, different arrival order.

## Studio checklist (draft)

- [ ] A typed object came back and typechecked at the call site.
- [ ] You saw an invalid output handled, not silently accepted.
- [ ] You can point at the span where `maxSteps` cut the loop.
- [ ] Streaming and non-streaming produced the same structured result.

## Docs

- Structured output — https://mastra.ai/docs/agents/structured-output
- `generate()` — https://mastra.ai/reference/agents/generate
- `stream()` — https://mastra.ai/reference/streaming/agents/stream
