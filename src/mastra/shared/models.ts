// Models in one place.
//
// The NaN gateway (nan.builders) is OpenAI-compatible, but only for the Chat
// Completions API. Mastra's model router sends every "openai/*" string to
// OpenAI's Responses API (`.responses()`), and NaN rejects the replayed
// history items there with:
//   "Input items of type 'item_reference' are not supported."
// So instead of a "provider/model" string we build the provider ourselves and
// hand agents a model instance. Same idea, one layer lower.
//
// Model instance in an Agent: https://mastra.ai/docs/agents/overview
// This provider: https://ai-sdk.dev/providers/openai-compatible-providers
//
// Good agent models on NaN (standard function calling):
//   deepseek-v4-flash   3B tokens/mo · 1M ctx  (default)
//   glm5.3-flash        2B tokens/mo · 1M ctx
//   mimo-v2.6-flash     1B tokens/mo · omnimodal
//
// ⚠️ qwen*/gemma* chat models use XML-style tool calling — avoid them for
// agents with tools.
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const nan = createOpenAICompatible({
  name: 'nan',
  baseURL: process.env.OPENAI_BASE_URL ?? 'https://api.nan.builders/v1',
  apiKey: process.env.OPENAI_API_KEY,
});

export const models = {
  default: nan.chatModel('deepseek-v4-flash'),
  cheap: nan.chatModel('glm5.3-flash'),
  embedding: nan.embeddingModel('qwen3-embedding'),
} as const;
