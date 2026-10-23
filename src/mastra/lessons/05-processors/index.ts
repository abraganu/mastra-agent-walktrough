import type { Lesson } from '../registry';

// Guide: docs/learn/05-processors/README.md
// Planned: input and output processors around the model call (PII, moderation,
// token limits) plus guardrails, and how each one shows up in a trace.
export const lesson: Lesson = {
  id: '05-processors',
  number: 5,
  subject: 'processors',
  docs: [
    'https://mastra.ai/docs/agents/processors',
    'https://mastra.ai/docs/agents/guardrails',
  ],
  register: {},
};
