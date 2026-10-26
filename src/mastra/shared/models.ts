// Models in one place.
//
// The NaN gateway (nan.builders) is OpenAI-compatible, but only for the Chat
// Completions API. Mastra's model router sends every "openai/*" string to
// OpenAI's Responses API (`.responses()`), and NaN rejects the replayed
// history items there with:
//   "Input items of type 'item_reference' are not supported."
// So chat models use Mastra's native OpenAICompatibleConfig with `api: 'chat'`
// — same constraint as before, pinned in the type instead of worked around
// with a hand-built provider. Embeddings keep the AI SDK provider instance.
//
// OpenAICompatibleConfig: exported from `@mastra/core/llm`
// AI SDK provider: https://ai-sdk.dev/providers/openai-compatible-providers
//
// Good agent models on NaN (standard function calling):
//   deepseek-v4-flash   3B tokens/mo · 1M ctx  (default)
//   glm5.3-flash        2B tokens/mo · 1M ctx
//   mimo-v2.6-flash     1B tokens/mo · omnimodal
//
// ⚠️ qwen*/gemma* chat models use XML-style tool calling — avoid them for
// agents with tools.
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { OpenAICompatibleConfig } from '@mastra/core/llm';

const NAN_URL = process.env.OPENAI_BASE_URL ?? 'https://api.nan.builders/v1';

// Chat models: Mastra-native config, pinned to Chat Completions.
const chatModel = (modelId: string): OpenAICompatibleConfig => ({
  id: `nan/${modelId}`,
  url: NAN_URL,
  apiKey: process.env.OPENAI_API_KEY,
  api: 'chat',
});

// Embedding models: Mastra accepts AI SDK instances for vector work.
const nan = createOpenAICompatible({
  name: 'nan',
  baseURL: NAN_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

export const models = {
  default: chatModel('deepseek-v4-flash'),
  cheap: chatModel('glm5.3-flash'),
  embedding: nan.embeddingModel('qwen3-embedding'),
} as const;
