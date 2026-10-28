import { getWeather } from '../../shared/weather';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Lesson 03 subject: typed answers — the loop from lessons 01–02, but the
// final result is a validated object instead of prose.
// Guide: docs/learn/03-structured-output/README.md
//
// Same weather tool as lessons 01–02 (lessons cannot import each other — see
// AGENTS.md). The model only sees the description and input schema; the
// string this returns is everything the report can be built from. That
// constraint matters when the guide's exercise asks for fields the tool
// cannot provide.
// Docs: https://mastra.ai/docs/agents/tools
export const weatherTool = createTool({
  id: 'l03-get-weather',
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
