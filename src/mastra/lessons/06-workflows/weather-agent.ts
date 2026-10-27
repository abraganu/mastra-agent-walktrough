import { Agent } from '@mastra/core/agent';
import { models } from '../../shared/models';
import { weatherTool } from './weather-tool';

// Lesson 06 subject: workflows — this agent is one step's worth of work, not a
// conversation. It has no memory on purpose: a workflow step gets an input and
// returns an output, so there is no thread to attach history to. (If you want
// history, pass `memory: { resource, thread }` from inside the step.)
// Guide: docs/learn/06-workflows/README.md
// Docs: https://mastra.ai/docs/workflows/agents-and-tools
export const weatherAgent = new Agent({
  id: 'l06-weather-agent',
  name: 'L06 · Weather Agent',

  // Note what is missing: no "ask a follow-up question" instruction. The
  // workflow decides what happens when the location is unusable, not the model.
  instructions: `
      You write one-sentence weather briefs for a small weather team.

      Use the weather tool for the city you are given. If the tool says it
      could not fetch data, say exactly that — never invent a temperature,
      wind speed, or humidity.

      One sentence, no lists, no headings, no preamble.
`,
  model: models.default,
  tools: { [weatherTool.id]: weatherTool },
});
