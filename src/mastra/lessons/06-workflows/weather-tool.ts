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
  execute: async ({ location }) => {
    try {
      const res = await fetch(
        `https://wttr.in/${encodeURIComponent(location)}?format=j1`,
        { headers: { 'User-Agent': 'mastra-playground' } },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const current = data?.current_condition?.[0];
      if (!current) throw new Error('unexpected response from wttr.in');
      const description = current.weatherDesc?.[0]?.value ?? 'unknown';
      return {
        output:
          `Current weather in ${location}: ${description}, ` +
          `${current.temp_C}°C (feels like ${current.FeelsLikeC}°C), ` +
          `humidity ${current.humidity}%, wind ${current.winddir16Point} ` +
          `at ${current.windspeedKmph} km/h`,
      };
    } catch (error) {
      return {
        output: `Could not fetch weather for ${location}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  },
});
