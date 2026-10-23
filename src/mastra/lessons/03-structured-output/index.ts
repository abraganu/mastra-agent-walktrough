import type { Lesson } from '../registry';

// Guide: docs/learn/03-structured-output/README.md
// Planned: typed results via outputSchema, defaultOptions, maxSteps, stop
// conditions, and the difference between generate() and stream().
export const lesson: Lesson = {
  id: '03-structured-output',
  number: 3,
  subject: 'structured-output',
  docs: [
    'https://mastra.ai/docs/agents/structured-output',
    'https://mastra.ai/reference/agents/generate',
    'https://mastra.ai/reference/streaming/agents/stream',
  ],
  register: {},
};
