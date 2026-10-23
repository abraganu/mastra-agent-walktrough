import type { Lesson } from '../registry';

// Guide: docs/learn/11-server-client/README.md
// Planned: custom API routes, RequestContext for per-request configuration,
// and calling the running server with the Mastra Client (including streaming).
export const lesson: Lesson = {
  id: '11-server-client',
  number: 11,
  subject: 'server-client',
  docs: [
    'https://mastra.ai/docs/server/overview',
    'https://mastra.ai/docs/server/custom-api-routes',
    'https://mastra.ai/docs/server/request-context',
  ],
  register: {},
};
