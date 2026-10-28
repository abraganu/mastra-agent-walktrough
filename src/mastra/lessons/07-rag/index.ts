import type { Lesson } from '../registry';
import { HANDBOOK_INDEX, ingestHandbook } from './ingest';
import { ragAgent } from './rag-agent';
import { searchChunks, searchHandbook } from './retrieval-tool';

// Lesson 07 subject: RAG — answer from your own documents instead of the
// model's memory.
// Guide: docs/learn/07-rag/README.md
//
// Baseline only: chunk -> embed -> store -> retrieve -> one agent with the
// retrieval tool. The guide's exercise changes the chunking, filters by
// metadata, adds reranking, and swaps the embedding model to see what the
// index dimension costs.
export const lesson: Lesson = {
  id: '07-rag',
  number: 7,
  subject: 'rag',
  docs: [
    'https://mastra.ai/reference/rag/overview',
    'https://mastra.ai/reference/rag/chunking-and-embedding',
    'https://mastra.ai/reference/rag/retrieval',
    'https://mastra.ai/reference/rag/rerank',
  ],
  register: {
    agents: { ragAgent },
    tools: { [searchHandbook.id]: searchHandbook },
  },

  // `pnpm lesson 07` — the pipeline in order, so you can see where an answer
  // comes from before the model is asked to produce one.
  async demo(mastra) {
    const question = 'How long do I have to ask for a refund on a subscription charge?';

    // 1. Ingest. Embedding the corpus is the only expensive step, and it does
    // not happen on the request path.
    const { chunks, dimension } = await ingestHandbook();
    console.log(`index ${HANDBOOK_INDEX}: ${chunks.length} chunks, ${dimension} dimensions each`);

    // 2. Look at what is in the index. Retrieval can only return what
    // ingestion put there — no amount of prompting fixes a missing chunk.
    console.log('\n--- chunks ---');
    for (const chunk of chunks) {
      console.log(`- ${chunk.source}#${chunk.chunkIndex} [${chunk.topic}] ${preview(chunk.text)}`);
    }

    // 3. Retrieve without a model. This is the step that decides whether the
    // answer will be right; the model only phrases it.
    console.log(`\n--- retrieval, no model ---\n"${question}"`);
    for (const match of await searchChunks(question, 3)) {
      console.log(`  ${match.score.toFixed(3)}  ${match.source}  ${preview(match.text)}`);
    }

    // 4. Ask the agent. Same question, but now the model decides when to call
    // the tool — and cites what came back.
    const agent = mastra.getAgentById('l07-rag-agent');
    const response = await agent.generate(question);

    console.log('\n--- answer ---');
    const calls = response.toolCalls.map((call) => call.payload.toolName).join(', ');
    console.log(`tool calls: ${calls || '(none)'}`);
    console.log(response.text);

    console.log(
      '\n--- what to conclude ---' +
        '\nRill Coffee is fictional, so the model could not have known any of' +
        '\nthat. Two things made the answer possible: each chunk carried its' +
        '\nsource into the index, and the query was embedded with the same' +
        '\nmodel as the corpus. Break either one and you get a confident' +
        '\nanswer with nothing behind it.',
    );
    console.log(
      '\nThe guide picks up from here: chunk size and overlap, metadata' +
        '\nfilters, reranking, and what happens when you change the embedding' +
        '\nmodel after the index already exists.',
    );
    console.log(
      '\nOpen `pnpm dev` -> Agents -> L07 · Handbook Agent, ask something the' +
        '\nhandbook does not cover, and read the trace: the tool span holds the' +
        '\nexact chunks the model was given. That is the only honest way to' +
        '\naudit a RAG answer.',
    );
  },
};

/** One line per chunk in the demo, without the newlines the split left behind. */
function preview(text: string, length = 62): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  return flat.length > length ? `${flat.slice(0, length)}…` : flat;
}
