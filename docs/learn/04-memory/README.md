---
lesson: 4
subject: memory
status: todo
prereqs: [1, 2]
primitives: [Memory, resource, thread, workingMemory, semanticRecall, observationalMemory]
code: src/mastra/lessons/04-memory
docs:
  - https://mastra.ai/docs/memory/overview
  - https://mastra.ai/docs/memory/working-memory
  - https://mastra.ai/docs/memory/semantic-recall
  - https://mastra.ai/docs/memory/observational-memory
updated: 2026-10-22
---

# 04 · Memory

**Subject:** what the model remembers, where it is stored, and exactly how it re-enters the context.

## What you'll be able to do

- Use `resource` and `thread` deliberately: one thread per conversation, one resource per user or entity.
- Choose between message history, working memory, semantic recall, and observational memory instead of enabling everything.
- Read a trace and say which memory feature contributed which message.

## Why here

The weather agent already has `Memory` with `lastMessages: 20` — you have been using memory since lesson 01 without seeing it. This lesson makes it visible. Everything after this point assumes you can tell "the agent forgot" apart from "the agent never received it".

## Exercise sketch

1. Send two messages in one thread and confirm the second turn has the first in context. Then start a new thread with the same resource and confirm history did not follow.
2. Add working memory with a small schema (name, units preference) and check where it appears in the model context: a system message, not a conversation message.
3. Enable semantic recall and craft a follow-up whose answer is only in an early, unquoted message. Watch recall bring it back by meaning rather than position.
4. Turn on observational memory for a long thread and compare context size with and without it. This is the feature the docs recommend as the default for long conversations.
5. Point Studio at the memory panel in the sidebar while doing the above.

## Studio checklist (draft)

- [ ] Same thread remembers; new thread with the same resource does not.
- [ ] Working memory shows up as a system message in the trace.
- [ ] Semantic recall retrieved a message that had scrolled out of history.
- [ ] You can state the trade-off between raw history and observational memory in one sentence.

## Docs

- Memory overview — https://mastra.ai/docs/memory/overview
- Working memory — https://mastra.ai/docs/memory/working-memory
- Semantic recall — https://mastra.ai/docs/memory/semantic-recall
- Observational memory — https://mastra.ai/docs/memory/observational-memory
