import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

// Lesson 02 subject: the tool contract — what the model sees, what gets
// validated, and what happens when each part fails.
// Guide: docs/learn/02-tools/README.md
//
// Mirrors lesson 01's weather tool (lessons cannot import each other — see
// AGENTS.md), but this copy is the one the exercises operate on: stricter
// input schema, broken output schema, throw vs error string.
// Docs: https://mastra.ai/docs/agents/tools
export const weatherTool = createTool({
  id: 'l02-get-weather',
  // The description is the model's primary signal for *when* to call the tool.
  // Exercise: rewrite it vague, then precise, and watch tool choice change.
  description: 'Get current weather (temperature, wind, humidity) for a city',
  // Validated before execute runs — a mismatch never reaches your code. The
  // .describe() strings are prompt material for the model's arguments.
  inputSchema: z.object({
    location: z.string().describe('City name, e.g. "Madrid" or "Austin, TX"'),
  }),
  // Validated after execute returns.
  outputSchema: z.object({
    output: z.string(),
  }),
  // Returns an error string instead of throwing — the model can recover from
  // this. Exercise: make it throw and compare what the trace shows.
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
