import { dispatchServer } from './server';

// Lesson 08 subject: MCP — the *server process*.
//
// Nothing registers this file with Mastra. It is not part of the playground's
// registry fragment; it is a program. `MCPClient` spawns it as a child process
// and talks to it over stdin/stdout, which is why it must be started with a
// command an MCP client can build — see mcp-client.ts:
//
//   node --import tsx src/mastra/lessons/08-mcp/stdio.ts
//
// A stdio server owns stdin and stdout for its whole life. Anything else that
// writes to stdout corrupts the JSON-RPC stream, so diagnostics go to stderr
// and nothing else in this file may log.
dispatchServer.startStdio().catch((error: unknown) => {
  console.error('l08 stdio server failed:', error);
  process.exit(1);
});
