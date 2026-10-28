import { z } from 'zod';

// Fixture mode isolates agent/tool learning from a public service's availability.
// Only live mode performs an HTTP request. Never report fixtures as live weather.
export const weatherModes = ['live', 'fixture', 'timeout', 'malformed'] as const;
const conditionSchema = z.object({
  temp_C: z.string(), FeelsLikeC: z.string(), humidity: z.string(),
  winddir16Point: z.string(), windspeedKmph: z.string(),
  weatherDesc: z.array(z.object({ value: z.string() })).min(1),
});
const responseSchema = z.object({ current_condition: z.array(conditionSchema).min(1) });

export async function getWeather(location: string, abortSignal?: AbortSignal): Promise<string> {
  const mode = process.env.WEATHER_MODE ?? 'live';
  if (!weatherModes.includes(mode as typeof weatherModes[number])) throw new Error(`Unknown WEATHER_MODE: ${mode}`);
  abortSignal?.throwIfAborted();
  if (mode === 'timeout') throw new Error('Fixture: weather request timed out');
  const raw = mode === 'live'
    ? await fetchWeather(location, abortSignal)
    : mode === 'malformed' ? { current_condition: [{}] }
    : { current_condition: [{ temp_C: '21', FeelsLikeC: '20', humidity: '50', winddir16Point: 'NW', windspeedKmph: '8', weatherDesc: [{ value: 'Clear (fictional fixture)' }] }] };
  const current = responseSchema.parse(raw).current_condition[0]!;
  return `${mode === 'live' ? '' : '[FIXTURE] '}Current weather in ${location}: ${current.weatherDesc[0]!.value}, ` +
    `${current.temp_C}°C (feels like ${current.FeelsLikeC}°C), humidity ${current.humidity}%, ` +
    `wind ${current.winddir16Point} at ${current.windspeedKmph} km/h`;
}

async function fetchWeather(location: string, abortSignal?: AbortSignal): Promise<unknown> {
  const signal = abortSignal ? AbortSignal.any([abortSignal, AbortSignal.timeout(10_000)]) : AbortSignal.timeout(10_000);
  const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`, {
    headers: { 'User-Agent': 'mastra-playground' }, signal,
  });
  if (!response.ok) throw new Error(`Weather service returned HTTP ${response.status}`);
  return response.json();
}
