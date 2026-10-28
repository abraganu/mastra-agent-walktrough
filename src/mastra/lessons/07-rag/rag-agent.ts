import { Agent } from '@mastra/core/agent';
import { models } from '../../shared/models';
import { searchHandbook } from './retrieval-tool';

// Lesson 07 subject: RAG — the model writes the answer, the index supplies the
// facts, and the instructions decide which one wins.
// Guide: docs/learn/07-rag/README.md
// Docs: https://mastra.ai/reference/rag/retrieval
export const ragAgent = new Agent({
  id: 'l07-rag-agent',
  name: 'L07 · Handbook Agent',

  // Three rules, each closing a different failure:
  //   · "search before answering" — the model is happy to guess, and Rill
  //     Coffee does not exist, so a guess is always wrong
  //   · "only what the results say" — stops it from filling gaps with
  //     plausible subscription-company boilerplate
  //   · "say so when nothing matches" — a confident answer built on an empty
  //     result set is worse than no answer
  instructions: `You answer questions about Rill Coffee using only its internal handbook.

      Call the handbook search tool before answering. Base every claim on the
      text it returns; never fill gaps with what is typical for coffee
      subscriptions.

      Cite the file you used in parentheses at the end, like (billing.md). If
      the results do not cover the question, say the handbook does not cover
      it — do not guess.

      Two sentences, no headings.`,
  model: models.default,
  tools: { [searchHandbook.id]: searchHandbook },

  // No memory on purpose: every question is answered from the same index, and
  // a thread would only add history the corpus should be doing the work for.
});
