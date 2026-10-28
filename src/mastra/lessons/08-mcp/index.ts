import type { Lesson } from '../registry';
import { dispatchAgent } from './dispatch-agent';
import { dispatchStatusTool, listDispatchOrdersTool } from './dispatch-tool';
import { dispatchClient } from './mcp-client';
import { dispatchServer } from './server';

// Lesson 08 subject: MCP — one tool, two processes.
// Guide: docs/learn/08-mcp/README.md
//
// Baseline only: a tool, an MCP server that exposes it, an MCP client that
// consumes it over stdio, and an agent that is unchanged by either direction.
// The guide's exercise builds an agent from MCP tools at startup, filters
// tools, registers a second server, and covers approval.
export const lesson: Lesson = {
  id: '08-mcp',
  number: 8,
  subject: 'mcp',
  docs: [
    'https://mastra.ai/docs/connections/mcp',
    'https://mastra.ai/reference/tools/mcp-server',
    'https://mastra.ai/reference/tools/mcp-client',
  ],
  register: {
    agents: { dispatchAgent },
    tools: { [dispatchStatusTool.id]: dispatchStatusTool, [listDispatchOrdersTool.id]: listDispatchOrdersTool },
    // Mastra mounts this at /api/mcp/l08-dispatch/mcp and lists it in Studio.
    mcpServers: { [dispatchServer.id]: dispatchServer },
  },

  // `pnpm lesson 08` — the same tool, called in two processes. The only thing
  // that changes is who ran it.
  async demo(mastra) {
    try {
      // 1. Expose. What the server says about itself and what it will serve.
      //    Nothing is running yet: a server is a description until a transport
      //    is attached to it.
      const info = dispatchServer.getServerInfo();
      const { tools } = await dispatchServer.getToolListInfo();
      console.log(`server ${info.id} — "${info.name}" v${info.version_detail.version}`);
      console.log(`serving: ${tools.map((tool) => tool.id).join(', ')}`);
      console.log('reached at: /api/mcp/l08-dispatch/mcp (while `pnpm dev` runs)');

      // 2. Consume. The client spawns `node --import tsx stdio.ts` as a child
      //    process and speaks MCP to it over stdin/stdout. This is the first
      //    moment anything is alive.
      const namespaced = Object.keys(await dispatchClient.listTools()).sort();
      console.log(`\n--- client sees ---\n${namespaced.join(', ')}`);

      const { toolsets, errors } = await dispatchClient.listToolsetsWithErrors({ perServerTimeoutMs: 5_000 });
      if (Object.keys(errors).length || !toolsets.dispatch?.[dispatchStatusTool.id]) {
        throw new Error(`MCP discovery failed: ${JSON.stringify(errors)}`);
      }
      const servers = Object.keys(toolsets);
      console.log(
        `toolsets: ${servers
          .map((name) => `${name}(${Object.keys(toolsets[name]!).join(', ')})`)
          .join(', ')}`,
      );

      // 3. Call the tool in this process. `executeTool` is the same entry point
      //    Studio's REST route and the MCP transport use, minus the protocol.
      const direct = await dispatchServer.executeTool(dispatchStatusTool.id, { orderId: 'KF-1042' });
      if (direct.status !== 'completed') throw new Error('The local dispatch call did not complete.');
      console.log('\n--- the same order, twice ---');
      console.log(`in-process : ${describe(direct.output)}`);

      // 4. Call it through the client. The toolset is handed to the agent for
      //    one call, so a tool discovered at runtime needs no import and no
      //    re-registration — and the agent itself never learns that the tool
      //    lives somewhere else.
      const agent = mastra.getAgentById('l08-dispatch-agent');
      const response = await agent.generate(process.env.LESSON_PROMPT ?? 'Where is order KF-1042, and when will it arrive?', {
        toolsets,
      });

      const calls = response.toolCalls.map((call) => call.payload.toolName).join(', ');
      console.log(`\n--- agent, tools passed per call ---\ntool calls: ${calls || '(none)'}`);
      console.log(response.text);

      const viaMcp = response.toolResults
        .map((result) => servedBy(result.payload.result))
        .find((pid) => pid !== undefined);
      console.log(
        `over MCP   : ${viaMcp === undefined ? 'the model answered without the tool' : `answered by pid ${viaMcp}`}`,
      );
      if (viaMcp !== undefined) {
        console.log(
          viaMcp === process.pid
            ? `Same pid — the call never crossed a process boundary.`
            : `Different pid — this process is ${process.pid}; the tool ran in the child.`,
        );
      }

      if (viaMcp === undefined || viaMcp === process.pid) throw new Error('Expected the tool to execute in the MCP child process.');
    } finally {
      // 5. Release the child. Skip this and the process hangs on an open pipe —
      //    the most common way an MCP demo fails, and it fails *after* the work
      //    looks done.
      await dispatchClient.disconnect();
    }
    console.log('\nclient disconnected; the child process is gone.');

    console.log(
      '\n--- what to conclude ---' +
        '\nThe tool is a map lookup in a module. Nothing about it changed when' +
        '\nit crossed the boundary: same schema, same description, same' +
        '\nexecute. What changed is who ran it — and that is the whole point' +
        '\nof MCP. The dispatch board could be another language, another' +
        '\nmachine, or a vendor product, and this agent would not notice.',
    );
    console.log(
      '\nThe guide picks up from here: attaching MCP tools through an explicit async factory,' +
        '\nfiltering a server down to one tool, approval before a write, and' +
        '\nwhat to do when one server of three is down.',
    );
    console.log(
      '\nOpen `pnpm dev` -> MCP -> l08-dispatch and call the tool from Studio.' +
        '\nThat call runs inside the dev server, so its pid differs again.' +
        '\nAny external MCP client can start this server with:' +
        '\n  node --import tsx src/mastra/lessons/08-mcp/stdio.ts',
    );
  },
};

/** One line per order, padded so the two results line up in the terminal. */
function describe(output: unknown): string {
  const order = output as { status: string; courier: string; etaHours: number; servedBy: number };
  return `${order.status}, ${order.courier}, ${order.etaHours}h, pid ${order.servedBy}`;
}

/**
 * The tool result reaches an agent as unknown JSON. Read the one field the
 * demo needs instead of asserting the whole shape.
 */
function servedBy(result: unknown): number | undefined {
  if (typeof result !== 'object' || result === null) return undefined;
  const pid = (result as { servedBy?: unknown }).servedBy;
  return typeof pid === 'number' ? pid : undefined;
}
