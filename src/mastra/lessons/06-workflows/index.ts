import type { Lesson } from '../registry';

// Guide: docs/learn/06-workflows/README.md
// Planned: createStep/createWorkflow, then/branch/foreach/parallel, workflow
// state, suspend/resume, snapshots and time travel, agents inside steps.
export const lesson: Lesson = {
  id: '06-workflows',
  number: 6,
  subject: 'workflows',
  docs: [
    'https://mastra.ai/docs/workflows/overview',
    'https://mastra.ai/docs/workflows/control-flow',
    'https://mastra.ai/docs/workflows/suspend-and-resume',
    'https://mastra.ai/docs/workflows/time-travel',
  ],
  register: {},
};
