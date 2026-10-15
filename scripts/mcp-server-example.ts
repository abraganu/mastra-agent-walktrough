/**
 * Minimal MCP (Model Context Protocol) server exposing the weather tool
 * over stdio. Run with: pnpm mcp:example
 *
 * Point any MCP client at it, e.g. in a client config:
 *   { "command": "pnpm", "args": ["--dir", "/absolute/path/to/mastra-playground", "mcp:example"] }
 *
 * Docs: https://mastra.ai/en/docs/mcp/overview
 */
import { MCPServer } from '@mastra/mcp';
import { weatherTool } from '../src/mastra/tools/weather-tool';

const server = new MCPServer({
  name: 'mastra-playground-mcp',
  version: '1.0.0',
  tools: { weatherTool },
});

server.startStdio().catch((error) => {
  console.error('Error running MCP server:', error);
  process.exit(1);
});
