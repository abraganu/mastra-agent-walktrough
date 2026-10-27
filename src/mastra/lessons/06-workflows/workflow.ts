import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// Lesson 06 subject: workflows — the steps are yours, the order is yours, and
// every hand-off between them is a schema.
// Guide: docs/learn/06-workflows/README.md
// Docs: https://mastra.ai/docs/workflows/overview
//
// Baseline only: a straight `.then()` line, one LLM call in the middle. The
// guide's exercise adds `.branch`, workflow state, `suspend`, and time travel.
//
// The three rules of the chain (checked by tsc and, at run time, by the
// schemas):
//   first step's inputSchema  = the workflow's inputSchema
//   each step's outputSchema  = the next step's inputSchema
//   last step's outputSchema  = the workflow's outputSchema

// 1. Plain function. No model, no tokens, no way to vary between runs — which
// is the point: put the predictable work in a step you can read.
export const normalizeLocation = createStep({
  id: 'normalize-location',
  description: 'Title-case the location string the schema already trimmed.',
  inputSchema: z.object({ location: z.string().trim().min(1) }),
  outputSchema: z.object({ city: z.string().min(1) }),
  execute: async ({ inputData }) => {
    const city = inputData.location
      .toLowerCase()
      .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());

    return { city };
  },
});

// 2. The only step that costs tokens. `mastra` is handed to every step, so the
// workflow can use a registered agent without importing it — the step stays a
// function of (input, services), and the agent stays replaceable from Studio's
// editor or a test double.
//
// It returns `city` as well as `brief`: a step hands forward everything the
// next step needs, not only the new value.
export const askWeatherAgent = createStep({
  id: 'ask-weather-agent',
  description: 'Ask the weather agent for a one-sentence brief.',
  inputSchema: z.object({ city: z.string().min(1) }),
  outputSchema: z.object({ city: z.string().min(1), brief: z.string() }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra.getAgentById('l06-weather-agent');
    const response = await agent.generate(
      `Write a one-sentence weather brief for ${inputData.city}.`,
    );

    return { city: inputData.city, brief: response.text.trim() };
  },
});

// 3. Plain function again. Formatting is the kind of thing a model will happily
// do differently every run; a step does it the same way every run.
export const formatBrief = createStep({
  id: 'format-brief',
  description: 'Put the city and the sentence into one report line.',
  inputSchema: z.object({ city: z.string().min(1), brief: z.string() }),
  outputSchema: z.object({ city: z.string().min(1), report: z.string() }),
  execute: async ({ inputData }) => ({
    city: inputData.city,
    report: `${inputData.city} — ${inputData.brief}`,
  }),
});

// `.commit()` is not optional: an uncommitted workflow is a builder, not a
// runnable graph. Studio shows the committed graph.
export const weatherBriefWorkflow = createWorkflow({
  id: 'l06-weather-brief',
  description: 'Normalize a location, ask the weather agent, format the answer.',
  inputSchema: z.object({ location: z.string().trim().min(1) }),
  outputSchema: z.object({ city: z.string().min(1), report: z.string() }),
})
  .then(normalizeLocation)
  .then(askWeatherAgent)
  .then(formatBrief)
  .commit();
