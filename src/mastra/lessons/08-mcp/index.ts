import type { Lesson } from '../registry';

// Guide: docs/learn/08-mcp/README.md
// Planned: MCPServer exposing the lesson tools over stdio, and MCPClient
// consuming an external server inside an agent.
// Current baseline: scripts/mcp-server-example.ts (moves here when written).
export const lesson: Lesson = {
  id: '08-mcp',
  number: 8,
  subject: 'mcp',
  docs: [
    'https://mastra.ai/docs/connections/mcp',
    'https://mastra.ai/reference/tools/mcp-server',
    'https://mastra.ai/reference/tools/mcp-client',
  ],
  register: {},
};
