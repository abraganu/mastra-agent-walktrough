import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { models } from '../../shared/models';
import { weatherTool } from './weather-tool';

// Lesson 01 subject: the agent execution loop, observed through a trace.
// Guide: docs/learn/01-agent-loop/README.md
//
// `models.default` is a chat configuration from shared/models.ts, not a router
// string — see that file for why.
// Docs: https://mastra.ai/docs/agents/overview
export const weatherAgent = new Agent({
  id: 'l01-weather-agent',
  name: 'L01 · Weather Agent',
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn't in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model: models.default,
  tools: { weatherTool },

  // Leaving `editor` unset gives Studio's Editor the most to work with: stored
  // overrides may replace these instructions and edit the descriptions of the
  // tools above (membership stays in code, and model/memory always stay in code).
  // This agent can still override `editor` to lock things down, e.g.:
  //   editor: { tools: { description: true } } // instructions locked in code
  //   editor: false                            // fully read-only in Studio
  // Not to be confused with the `editor` field's `instructions: true` form,
  // which hands instructions *entirely* to Studio and forbids defining them here.
  // Docs: https://mastra.ai/docs/studio/editor#decide-what-collaborators-can-edit

  // Conversation history persisted via the Mastra instance storage.
  // Docs: https://mastra.ai/docs/memory/overview
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),
});
