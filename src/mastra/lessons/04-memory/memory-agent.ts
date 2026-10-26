import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { models } from '../../shared/models';
import { weatherTool } from './weather-tool';

// Lesson 04 subject: memory. Baseline only — message history, the layer every
// earlier lesson has already been using without naming it.
// Guide: docs/learn/04-memory/README.md
//
// The guide's exercise turns on the other three layers one at a time:
// working memory, semantic recall, and observational memory.
// Docs: https://mastra.ai/docs/memory/overview
export const memoryAgent = new Agent({
  id: 'l04-memory-agent',
  name: 'L04 · Memory Agent',
  instructions: `
      You are a helpful assistant with a long conversation to keep track of.

      Use the weather tool for weather questions. For everything else, rely on
      what you have already been told in this conversation.

      When the user tells you something about themselves, use it in later
      answers instead of asking again.
`,
  model: models.default,
  tools: { [weatherTool.id]: weatherTool },

  // Message history: the last N stored messages, in chronological order,
  // loaded from the thread before the model is called. Storage comes from the
  // Mastra instance (src/mastra/shared/storage.ts), never from the agent.
  // Docs: https://mastra.ai/docs/memory/message-history
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),
});
