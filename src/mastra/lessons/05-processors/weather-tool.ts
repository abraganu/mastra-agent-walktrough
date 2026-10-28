import { getWeather } from '../../shared/weather';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Lesson 05 subject: processors — the code that runs between the caller and
// the model, in both directions.
// Guide: docs/learn/05-processors/README.md
//
// Same weather tool as lessons 01–04 (lessons cannot import each other — see
// AGENTS.md). It stays here because a tool call is a second LLM step: step 0
// picks the tool, step 1 answers with the result. Processors run per step, so
// the trace has more than one place to look.
// Docs: https://mastra.ai/docs/agents/tools
export const weatherTool = createTool({
  id: 'l05-get-weather',
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
