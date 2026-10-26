import { z } from 'zod';

// Lesson 03 subject: the shape of a typed answer — what the model must
// produce instead of prose.
// Guide: docs/learn/03-structured-output/README.md
//
// Starting schema: three fields, all satisfiable from the weather tool's
// return string. The .describe() strings are prompt material, same as tool
// input schemas — they are how the model knows what belongs in each field.
// The guide's exercise adds a confidence field, forces a mismatch, and
// explores agent-level defaults.
export const reportSchema = z.object({
  location: z.string().describe('The city the report is about, as the user asked it'),
  temperatureC: z.number().describe('Current temperature in degrees Celsius, from the tool'),
  conditions: z.string().describe('Short weather description, e.g. "Partly cloudy"'),
});

export type WeatherReport = z.infer<typeof reportSchema>;
