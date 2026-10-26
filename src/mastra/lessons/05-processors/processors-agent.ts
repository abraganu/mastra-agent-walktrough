import { Agent } from '@mastra/core/agent';
import { RegexFilterProcessor } from '@mastra/core/processors';
import { Memory } from '@mastra/memory';
import { models } from '../../shared/models';
import { weatherTool } from './weather-tool';

// Lesson 05 subject: processors — the code that runs between the caller and
// the model, in both directions.
// Guide: docs/learn/05-processors/README.md
//
// Baseline only: one input processor and one output processor, both zero-cost
// and deterministic, so the demo looks the same every run. The guide's
// exercise adds the model-backed guardrails, a blocking tripwire, and a
// hand-written processor.
// Docs: https://mastra.ai/docs/agents/processors

// Input side: rewrite a message on its way to the model. No LLM call — this is
// a regex pass over the text parts of the messages, run after memory has
// loaded the thread. These hooks mutate the live message list, so the rewrite
// is also what memory saves: the model and the transcript end up agreeing.
// If you need the original kept, rewrite the provider prompt instead
// (processLLMRequest) — that is exercise step 1 in the guide.
// Docs: https://mastra.ai/docs/agents/guardrails
export const internalIdFilter = new RegexFilterProcessor({
  rules: [
    {
      name: 'internal-id',
      pattern: /INTERNAL-\d{6}/g,
      replacement: '[INTERNAL_ID]',
    },
  ],
  strategy: 'redact',
  phase: 'input',
});

// Output side: strip the routing tag the agent is told to write. Same class,
// different array — a processor is not "an input processor" or "an output
// processor"; the array it sits in decides which hooks run and when.
// The tag is a stand-in for any annotation the model produces for your system
// and the caller should never see.
export const internalTagFilter = new RegexFilterProcessor({
  rules: [
    {
      name: 'internal-tag',
      pattern: /\[L05-INTERNAL\]/g,
      replacement: '',
    },
  ],
  strategy: 'redact',
  phase: 'output',
});

export const processorsAgent = new Agent({
  id: 'l05-processors-agent',
  name: 'L05 · Processors Agent',

  // The last line exists so the output processor has something to remove.
  instructions: `
      You are a helpful assistant for a small weather team.

      Use the weather tool for weather questions. For everything else, answer
      in two short sentences — no lists, no headings.

      End every reply with the literal token [L05-INTERNAL] on its own line.
      Never omit that token.
`,
  model: models.default,
  tools: { [weatherTool.id]: weatherTool },

  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),

  // Run in array order: input processors after memory loads, output
  // processors before memory saves.
  inputProcessors: [internalIdFilter],
  outputProcessors: [internalTagFilter],
});
