---
lesson: 9
subject: evals
status: todo
availability: planned
prereqs: [4, 6]
primitives: [scorers, runEvals, datasets, sampling]
code: src/mastra/lessons/09-evals
docs:
  - https://mastra.ai/docs/evals/overview
  - https://mastra.ai/docs/evals/datasets
  - https://mastra.ai/docs/evals/running-in-ci
updated: 2026-10-28
---

# 09 · Evals

**Subject:** replacing "looks good to me" with a number you can regress against.

> Needs `pnpm add @mastra/evals` before this lesson can be written. That is deliberate: don't install it until you get here.

## What you'll be able to do

- Attach scorers to an agent so every response is graded asynchronously, with sampling that you control.
- Assemble a small dataset of cases and run it against an agent, before and after a change.
- Read scores in Studio and decide whether an instructions edit helped or just felt better.

## Why here

You have changed instructions (01), tools (02, 07), and memory (04) by feel. Scoring needs something stable to score, which is why it comes after memory and workflows rather than before them. This is also the lesson that makes every earlier lesson testable.

## Exercise sketch

1. Attach an answer-relevancy scorer at `rate: 1` to a lesson agent and confirm scores land in storage.
2. Create a dataset with five cases: three normal, one adversarial, one out-of-scope. Run `runEvals` and record the baseline.
3. Change the agent's instructions deliberately (tighten scope) and re-run the same dataset. Compare per-case scores, not the average alone.
4. Add a tool-call check — did it call the right tool? — because relevancy alone will happily approve a wrong-but-plausible answer.
5. Add the eval run to CI so the baseline becomes a gate.

## Studio checklist (draft)

- [ ] Scores persisted and are visible per run in Studio.
- [ ] A deliberate regression showed up as a lower score, not noise.
- [ ] You have a baseline you could defend in a review.
- [ ] The eval run passes or fails a CI command.

## Docs

- Evals overview — https://mastra.ai/docs/evals/overview
- Datasets — https://mastra.ai/docs/evals/datasets
- Running in CI — https://mastra.ai/docs/evals/running-in-ci
