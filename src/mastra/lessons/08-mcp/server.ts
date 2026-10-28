import { MCPServer } from '@mastra/mcp';
import { dispatchStatusTool, listDispatchOrdersTool } from './dispatch-tool';

// Lesson 08 subject: MCP — the *expose* half.
//
// An MCPServer is a thin adapter over the primitives you already built. It
// takes the same tools an agent takes, and speaks MCP on the other side. It
// adds no logic of its own: every call lands in the tool's `execute`.
//
// `id` is what Studio's MCP page lists and what the route is named after:
// `/api/mcp/l08-dispatch/mcp`. `name` is what an *external* client sees in
// `getServerInfo()` — which is why it carries the lesson prefix too.
export const dispatchServer = new MCPServer({
  id: 'l08-dispatch',
  name: 'L08 · Dispatch Server',
  version: '1.0.0',
  description: 'The Kestrel Freight dispatch board, exposed over MCP.',
  instructions: 'Ask for a dispatch status by order id. Use the order-listing tool for known ids, then the status tool for details.',
  // The *key* is the tool's name on the wire, not `tool.id`. Register it as
  // `{ dispatchStatusTool }` and the MCP tool is called `dispatchStatusTool`,
  // ignoring the id you gave it — one tool, two names, and the namespaced
  // client name (`dispatch_dispatchStatusTool`) is the one your agent sees.
  // Keying it by the id keeps a single name from schema to Studio.
  tools: { [dispatchStatusTool.id]: dispatchStatusTool, [listDispatchOrdersTool.id]: listDispatchOrdersTool },
});
