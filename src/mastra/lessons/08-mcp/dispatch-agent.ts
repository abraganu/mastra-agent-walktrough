import { Agent } from '@mastra/core/agent';
import { models } from '../../shared/models';
import { dispatchStatusTool } from './dispatch-tool';

// The agent attaches the tool *in process*. That is deliberate: it is what an
// agent looks like before MCP exists, and it is what Studio needs to answer an
// order question without spawning a child process on every chat turn.
//
// The demo mounts tools over MCP for one call instead — same tool, different
// process, nothing about the agent changes. Guide, Walkthrough A.
// Memory is omitted for the baseline. The guide's optional memory exercise
// adds message history and compares follow-ups with explicit thread/resource IDs.
export const dispatchAgent = new Agent({
  id: 'l08-dispatch-agent',
  name: 'L08 · Dispatch Agent',
  description: 'Answers questions about Kestrel Freight orders from the dispatch board.',
  instructions: `You answer questions about Kestrel Freight orders using the dispatch board.

Call the dispatch-status tool for every order id in the question, even if the
customer sounds sure of the answer. Report the status, the courier, and the ETA
in hours. If the tool says the order is not on the board, say so and list the
ids it returned — do not guess a status.`,
  model: models.default,
  tools: { [dispatchStatusTool.id]: dispatchStatusTool },
});
