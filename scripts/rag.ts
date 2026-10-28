import { loadEnv } from './load-env';
import { requireModelEnvironment } from '../src/mastra/shared/environment';

loadEnv();
const stage = process.argv[2] ?? 'chunk';
if (!['chunk', 'ingest', 'query', 'ask'].includes(stage)) throw new Error('Usage: pnpm rag <chunk|ingest|query|ask> [question]');
if (stage !== 'chunk') requireModelEnvironment();
const { chunkHandbook, ingestHandbook } = await import('../src/mastra/lessons/07-rag/ingest');
const { vector } = await import('../src/mastra/shared/vector');
try {
  if (stage === 'chunk') console.log(JSON.stringify(await chunkHandbook(), null, 2));
  if (stage === 'ingest') {
    const { chunks, dimension } = await ingestHandbook();
    console.log(`Stored ${chunks.length} chunks, ${dimension} dimensions. Embedding API used; no chat call.`);
  }
  const question = process.argv.slice(3).join(' ') || 'What is the refund window?';
  if (stage === 'query') {
    const { searchChunks } = await import('../src/mastra/lessons/07-rag/retrieval-tool');
    console.log(JSON.stringify(await searchChunks(question), null, 2));
  }
  if (stage === 'ask') {
    process.env.MASTRA_LESSONS = '07';
    const { mastra } = await import('../src/mastra/index');
    try { console.log((await mastra.getAgentById('l07-rag-agent').generate(question)).text); }
    finally { await mastra.shutdown(); }
  }
} finally { await vector.close(); }
