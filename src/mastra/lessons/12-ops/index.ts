import type { Lesson } from '../registry';

// Guide: docs/learn/12-ops/README.md
// Planned: editor with source 'code' + versioning, auth, build and deploy,
// tracing exporters and logging, storage retention.
export const lesson: Lesson = {
  id: '12-ops',
  number: 12,
  subject: 'ops',
  docs: [
    'https://mastra.ai/docs/studio/editor',
    'https://mastra.ai/docs/observability/tracing/overview',
    'https://mastra.ai/docs/deployment/overview',
  ],
  register: {},
};
