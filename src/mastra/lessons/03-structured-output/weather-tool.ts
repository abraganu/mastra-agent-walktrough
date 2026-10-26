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
