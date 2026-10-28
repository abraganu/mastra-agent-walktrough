import { checks } from '@mastra/evals/checks';
import type { MastraDBMessage } from '@mastra/core/memory';

// Pure scoring of a recorded answer. No generation or judge-model request.
// Keyword presence proves neither factual correctness nor groundedness.
export async function scoreRecordedAnswer(text: string): Promise<number> {
  const output: MastraDBMessage[] = [{
    id: 'recorded-answer', role: 'assistant', createdAt: new Date(0),
    content: { format: 2, parts: [{ type: 'text', text }] },
  }];
  const result = await checks.includes('14 days').run({ output });
  if (result.score === undefined) throw new Error('Recorded check produced no score');
  return result.score;
}
