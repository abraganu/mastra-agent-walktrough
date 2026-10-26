import type { Lesson } from '../registry';
import { toolsAgent } from './tools-agent';
import { weatherTool } from './weather-tool';

// Lesson 02 subject: the tool contract — descriptions, zod schemas, and
// failure modes. The guide's exercise adds a second tool (air quality) so
// two tools compete for the same prompt.
// Guide: docs/learn/02-tools/README.md
export const lesson: Lesson = {
  id: '02-tools',
  number: 2,
  subject: 'tools',
  docs: [
    'https://mastra.ai/docs/agents/tools',
    'https://mastra.ai/reference/tools/create-tool',
  ],
  register: {
    agents: { toolsAgent },
    tools: { [weatherTool.id]: weatherTool },
  },

  // `pnpm lesson 02` — the starting state: one agent, one tool, one loop.
  async demo(mastra) {
    const agent = mastra.getAgentById('l02-tools-agent');
    const response = await agent.generate("What's the weather in Madrid?", {
      memory: { resource: 'l02-demo', thread: 'l02-demo' },
    });

    console.log('--- answer ---');
    console.log(response.text);
    console.log('\n--- token usage ---');
    console.log(response.usage);
    console.log(
      '\nOpen `pnpm dev` -> Agents -> L02 · Tools Agent -> Observability to see the tool call and what the model saw when it chose it.',
    );
  },
};
