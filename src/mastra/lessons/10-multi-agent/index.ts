import type { Lesson } from '../registry';

// Guide: docs/learn/10-multi-agent/README.md
// Planned: a supervisor delegating to subagents, delegation routing via each
// subagent's description, and how memory is scoped per delegation.
export const lesson: Lesson = {
  id: '10-multi-agent',
  number: 10,
  subject: 'multi-agent',
  docs: [
    'https://mastra.ai/docs/subagents',
    'https://mastra.ai/docs/guides/multi-agent-systems',
  ],
  register: {},
};
