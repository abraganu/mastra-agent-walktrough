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
