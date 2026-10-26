import type { Lesson } from '../registry';
import { memoryAgent } from './memory-agent';
import { weatherTool } from './weather-tool';

// Lesson 04 subject: memory — message history, working memory, semantic
// recall, and observational memory, and who contributes what to the context.
// Guide: docs/learn/04-memory/README.md
export const lesson: Lesson = {
  id: '04-memory',
  number: 4,
  subject: 'memory',
  docs: [
    'https://mastra.ai/docs/memory/overview',
    'https://mastra.ai/docs/memory/message-history',
    'https://mastra.ai/docs/memory/working-memory',
    'https://mastra.ai/docs/memory/semantic-recall',
    'https://mastra.ai/docs/memory/observational-memory',
  ],
  register: {
    agents: { memoryAgent },
    tools: { [weatherTool.id]: weatherTool },
  },

  // `pnpm lesson 04` — the thread/resource distinction, which is the whole
  // baseline of memory. One resource (the user), two threads (conversations):
  // the second turn of thread A remembers, thread B with the same resource
  // does not.
  async demo(mastra) {
    const agent = mastra.getAgentById('l04-memory-agent');

    // Fresh threads per run so the demo is the same every time; re-running
    // with fixed ids would replay old history instead of demonstrating it.
    const run = Date.now().toString(36).slice(-4);
    const resource = `l04-user-${run}`;
    const threadA = `l04-thread-a-${run}`;
    const threadB = `l04-thread-b-${run}`;

    const say = (label: string, text: string) => {
      console.log(`\n--- ${label} ---`);
      console.log(text);
    };

    const first = await agent.generate(
      'My name is Abraham and I only want temperatures in Celsius. Reply in one short sentence.',
      { memory: { resource, thread: threadA } },
    );
    say('thread A, turn 1 (introduces the user)', first.text);

    const second = await agent.generate(
      'What is my name, and which temperature unit do I want? One short sentence.',
      { memory: { resource, thread: threadA } },
    );
    say('thread A, turn 2 (same thread — history is loaded)', second.text);

    const other = await agent.generate(
      'What is my name, and which temperature unit do I want? One short sentence.',
      { memory: { resource, thread: threadB } },
    );
    say('thread B, same resource, new thread (history did not follow)', other.text);

    console.log('\n--- what to conclude ---');
    console.log(
      'Thread = conversation (history). Resource = user (owner of the thread).\n' +
        'Thread B has no history because message history is thread-scoped, even\n' +
        'though both threads belong to the same resource. The guide\'s exercise\n' +
        'turns on working memory, which is resource-scoped, and re-asks thread B.',
    );
    console.log(
      `\nThreads used: ${threadA} / ${threadB} (resource ${resource}).\n` +
        'Open `pnpm dev` -> Agents -> L04 · Memory Agent to browse them in the memory panel.',
    );
  },
};
