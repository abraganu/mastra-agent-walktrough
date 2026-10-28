import { getWeather } from '../../shared/weather';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Example tool: live weather lookup via wttr.in (free, no API key).
// This is where you'd call any real API. Tools MUST be created with
// createTool() — plain objects silently fail to execute.
// Docs: https://mastra.ai/docs/agents/tools
export const weatherTool = createTool({
  id: 'l01-get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name, e.g. "Madrid" or "Austin, TX"'),
  }),
  outputSchema: z.object({
    output: z.string(),
  }),
  execute: async ({ location }, context) => {
    try {
      return { output: await getWeather(location, context?.abortSignal) };
    } catch (error) {
      // Propagate caller cancellation; ordinary upstream failures remain a
      // successful error-shaped value for the lesson's throw/return comparison.
      context?.abortSignal?.throwIfAborted();
      return { output: `Could not fetch weather for ${location}: ${error instanceof Error ? error.message : String(error)}` };
    }
  },
});
