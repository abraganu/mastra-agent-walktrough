import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { weatherTool } from '../tools/weather-tool';

// The model string uses Mastra's model router format "provider/model".
// With OPENAI_BASE_URL + OPENAI_API_KEY set in .env, every "openai/*"
// model is routed to the NaN gateway (nan.builders).
//
// Good agent models on NaN (standard function calling):
//   openai/deepseek-v4-flash   3B tokens/mo · 1M ctx  (default)
//   openai/glm5.3-flash        2B tokens/mo · 1M ctx
//   openai/mimo-v2.6-flash     1B tokens/mo · omnimodal
export const weatherAgent = new Agent({
  id: 'weather-agent',
  name: 'Weather Agent',
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
  model: 'openai/deepseek-v4-flash',
  tools: { weatherTool },

  // Conversation history persisted via the Mastra instance storage.
  // Docs: https://mastra.ai/en/docs/memory/overview
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),
});
