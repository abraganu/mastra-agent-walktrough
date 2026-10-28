import { getWeather } from '../../shared/weather';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Lesson 04 subject: memory — what the model remembers, where it lives, and
// how it re-enters the context.
// Guide: docs/learn/04-memory/README.md
//
// Same weather tool as lessons 01–03 (lessons cannot import each other — see
// AGENTS.md). It stays here so the memory agent has a real tool in the loop:
// tool calls and results are memory too — they count against `lastMessages`
// and they are saved to the thread like any other message.
// Docs: https://mastra.ai/docs/agents/tools
export const weatherTool = createTool({
  id: 'l04-get-weather',
  description: 'Get current weather (temperature, wind, humidity) for a city',
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
