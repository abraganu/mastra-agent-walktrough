/**
 * Minimal MCP (Model Context Protocol) server exposing the weather tool
 * over stdio. Run with: pnpm mcp:example
 *
 * Point any MCP client at it, e.g. in a client config:
 *   { "command": "pnpm", "args": ["--dir", "/absolute/path/to/mastra-playground", "mcp:example"] }
 *
 * Docs: https://mastra.ai/docs/connections/mcp
 */
import { MCPServer } from '@mastra/mcp';
import { weatherTool } from '../src/mastra/lessons/01-agent-loop/weather-tool';

const server = new MCPServer({
  name: 'mastra-playground-mcp',
  version: '1.0.0',
  tools: { weatherTool },
});

server.startStdio().catch((error) => {
  console.error('Error running MCP server:', error);
  process.exit(1);
});
