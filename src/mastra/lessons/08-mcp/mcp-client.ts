import { MCPClient } from '@mastra/mcp';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { rootPath } from '../../shared/local-paths';

// Lesson 08 subject: MCP — the *consume* half.
//
// Set cwd explicitly and resolve the loader absolutely: external clients may
// start outside the checkout. Environment forwarding is not sandboxing.
// The client connects lazily: constructing it spawns nothing. Tools come back
// from `listTools()` / `listToolsets()`, and `disconnect()` shuts the child
// down. Never connect at module import — `mastra dev` re-imports on every
// reload, and a stray child per reload is how a demo hangs.
const STDIO_ENTRY = rootPath('src/mastra/lessons/08-mcp/stdio.ts');

export const dispatchClient = new MCPClient({
  id: 'l08-dispatch-client',
  servers: {
    // The key is the namespace prefix you will see on every tool name:
    // `dispatch_l08-dispatch-status` from listTools(), and
    // `dispatch.l08-dispatch-status` from listToolsets().
    dispatch: {
      command: process.execPath,
      args: ['--import', pathToFileURL(createRequire(import.meta.url).resolve('tsx')).href, STDIO_ENTRY],
      cwd: rootPath('.'),
    },
  },
});

/**
 * Tool names as an agent would see them if you attached `listTools()` to it.
 * Namespaced `server_tool`, so two servers that both export `search` cannot
 * collide.
 */
export async function listNamespacedTools(): Promise<string[]> {
  const tools = await dispatchClient.listTools();
  return Object.keys(tools).sort();
}

/**
 * Tools grouped by server, the shape `agent.generate(prompt, { toolsets })`
 * takes at runtime — no import, no attach, decided per call.
 */
export async function listServerToolsets() {
  return dispatchClient.listToolsets();
}
