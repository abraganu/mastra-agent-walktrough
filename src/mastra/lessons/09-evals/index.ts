import type { Lesson } from '../registry';

// Guide: docs/learn/09-evals/README.md
// Planned: scorers, live scoring with sampling, datasets + runEvals, CI.
// @mastra/evals is installed; recorded-check.ts demonstrates model-free scoring.
export const lesson: Lesson = {
  id: '09-evals',
  number: 9,
  subject: 'evals',
  docs: [
    'https://mastra.ai/docs/evals/overview',
    'https://mastra.ai/docs/evals/datasets',
    'https://mastra.ai/docs/evals/running-in-ci',
  ],
  register: {},
};
