import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { models } from '../../shared/models';
import { weatherTool } from './weather-tool';

// Lesson 03 subject: the same loop as lessons 01–02, but the answer comes
// back as a typed object, and the loop's termination is explicit.
// Guide: docs/learn/03-structured-output/README.md
//
// `models.default` is a model instance from shared/models.ts, not a router
// string — see that file for why.
// Docs: https://mastra.ai/docs/agents/structured-output
export const reportAgent = new Agent({
  id: 'l03-report-agent',
  name: 'L03 · Report Agent',
  instructions: `
      You are a weather reporting agent.

      Fetch live data with the weather tool before answering — never guess
      values that a tool could provide.

      When a request asks for a structured report, fill every field of the
      requested shape with real fetched values. When it doesn't, answer in
      plain prose.
`,
  model: models.default,

  // Keyed by the tool's id, as in lesson 02: the object key is the toolName
  // the model and the traces report.
  tools: { [weatherTool.id]: weatherTool },

  // Conversation history persisted via the Mastra instance storage.
  // Docs: https://mastra.ai/docs/memory/overview
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),
});
