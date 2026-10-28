import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { models } from '../../shared/models';
import { weatherTool } from './weather-tool';

// Lesson 02 subject: an agent with tools — and, once the guide's exercise is
// done, two tools competing for the same user phrasing.
// Guide: docs/learn/02-tools/README.md
//
// `models.default` is a chat configuration from shared/models.ts, not a router
// string — see that file for why.
// Docs: https://mastra.ai/docs/agents/tools
export const toolsAgent = new Agent({
  id: 'l02-tools-agent',
  name: 'L02 · Tools Agent',
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get current conditions for specific locations. When responding:
      - Always fetch live data with your tools instead of guessing
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model: models.default,

  // Keyed by the tool's id on purpose: the object key — not the tool's `id`
  // field — is the toolName the model and the traces report. Lesson 01 keyed
  // by the variable name (`weatherTool`); here the two names match.
  tools: { [weatherTool.id]: weatherTool },

  // Conversation history persisted via the Mastra instance storage.
  // Docs: https://mastra.ai/docs/memory/overview
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),
});
