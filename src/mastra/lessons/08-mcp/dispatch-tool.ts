import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Lesson 08 subject: MCP — the same tool contract, across a process boundary.
// Guide: docs/learn/08-mcp/README.md
// Docs: https://mastra.ai/docs/connections/mcp
//
// The tool is deliberately ordinary: a lookup in a map that lives in this
// module. Nothing about it knows whether the caller is an agent in this
// process or an MCP client in another one. `servedBy` is how you prove which
// process actually answered — compare it with the PID that printed the demo.

type DispatchOrder = {
  orderId: string;
  status: string;
  courier: string;
  etaHours: number;
};

const BOARD: Record<string, DispatchOrder> = {
  'KF-1042': { orderId: 'KF-1042', status: 'on the van', courier: 'Mira', etaHours: 3 },
  'KF-1043': { orderId: 'KF-1043', status: 'waiting for a courier', courier: 'unassigned', etaHours: 26 },
  'KF-1044': { orderId: 'KF-1044', status: 'delivered', courier: 'Tomas', etaHours: 0 },
};

export const dispatchStatusTool = createTool({
  id: 'l08-dispatch-status',
  // This description is the only thing a model on the other side of the
  // boundary will ever see. Same rule as lesson 02, harder consequence: when
  // you did not write the tool, the description is all the quality there is.
  description:
    'Look up a Kestrel Freight order on the dispatch board. Returns the status, the courier, and the ETA in hours.',
  inputSchema: z.object({
    orderId: z.string().min(1).describe('Order id, for example KF-1042'),
  }),
  outputSchema: z.object({
    orderId: z.string(),
    status: z.string(),
    courier: z.string(),
    etaHours: z.number(),
    servedBy: z.number().describe('PID of the process that answered'),
  }),
  execute: async ({ orderId }) => {
    const order = BOARD[orderId.trim().toUpperCase()];

    // A throw, not a null: the MCP client turns an in-band error into a failed
    // tool call by default, and the model sees the message. Guide, Notes.
    if (!order) {
      throw new Error(
        `Order ${orderId} is not on the dispatch board. Known ids: ${Object.keys(BOARD).join(', ')}.`,
      );
    }

    return { ...order, servedBy: process.pid };
  },
});

export const listDispatchOrdersTool = createTool({
  id: 'l08-list-dispatch-orders',
  description: 'List known dispatch order ids before looking up a status.',
  inputSchema: z.object({}),
  outputSchema: z.object({ orderIds: z.array(z.string()), servedBy: z.number() }),
  execute: async () => ({ orderIds: Object.keys(BOARD), servedBy: process.pid }),
});
