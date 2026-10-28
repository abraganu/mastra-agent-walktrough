import { getWeather } from '../../shared/weather';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Lesson 06 subject: workflows — a sequence of typed steps you chose, instead
// of a loop the model chooses.
// Guide: docs/learn/06-workflows/README.md
//
// Same weather tool as lessons 01–05 (lessons cannot import each other — see
// AGENTS.md). It stays here because the workflow's middle step calls an agent,
// and the agent needs a tool: the step is one LLM call with a tool call inside
// it, which is exactly the work a workflow step is good at isolating.
// Docs: https://mastra.ai/docs/workflows/agents-and-tools
export const weatherTool = createTool({
  id: 'l06-get-weather',
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
