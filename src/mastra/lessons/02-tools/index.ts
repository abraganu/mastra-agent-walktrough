import type { Lesson } from '../registry';

// Guide: docs/learn/02-tools/README.md
// Planned: a second tool with strict input/output schemas, zod validation
// failures, tool errors, and tool choice once an agent has more than one tool.
export const lesson: Lesson = {
  id: '02-tools',
  number: 2,
  subject: 'tools',
  docs: ['https://mastra.ai/docs/agents/tools'],
  register: {},
};
